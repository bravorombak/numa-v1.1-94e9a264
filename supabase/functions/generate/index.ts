/**
 * Generate edge function - handles AI generation requests
 * Implements rate limiting, provider routing, and variable interpolation
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { createError, getStatusForErrorCode, ErrorCodes } from './errors.ts';
import { interpolateVariables, validateVariables } from './interpolate.ts';
import { callOpenAI } from './providers/openai.ts';
import { callAnthropic } from './providers/anthropic.ts';
import { callGoogle } from './providers/google.ts';
import { callPerplexity } from './providers/perplexity.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========================================
    // 1. AUTHENTICATION
    // ========================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse(
        createError(ErrorCodes.UNAUTHORIZED, 'Missing authorization header'),
        401
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return jsonResponse(
        createError(ErrorCodes.UNAUTHORIZED, 'Invalid or expired token'),
        401
      );
    }

    // ========================================
    // 2. PARSE REQUEST BODY
    // ========================================
    const body = await req.json();
    let {
      prompt,
      variables = {},
      model_id,
      files = [],
      prompt_draft_id,
      model_override_id,
      conversation = [],
    } = body;

    let draftData: any = null;

    // ========================================
    // 3. NORMALIZE REQUEST (handle prompt_draft_id)
    // ========================================
    if (prompt_draft_id) {
      const { data: draft, error: draftError } = await supabase
        .from('prompt_drafts')
        .select('*')
        .eq('id', prompt_draft_id)
        .maybeSingle();

      if (draftError || !draft) {
        return jsonResponse(
          createError(ErrorCodes.PROMPT_NOT_FOUND, 'Prompt draft not found'),
          404
        );
      }

      draftData = draft;

      // Derive missing fields from draft
      if (!prompt || prompt.trim() === '') {
        prompt = draft.prompt_text;
      }
      if (!model_id) {
        model_id = model_override_id || draft.model_id;
      }
    }

    // ========================================
    // 4. VALIDATE REQUIRED FIELDS
    // ========================================
    if (!prompt || prompt.trim() === '') {
      return jsonResponse(
        createError(ErrorCodes.INVALID_REQUEST, 'prompt is required and cannot be empty'),
        400
      );
    }
    if (!model_id) {
      return jsonResponse(
        createError(ErrorCodes.INVALID_REQUEST, 'model_id is required'),
        400
      );
    }

    // ========================================
    // 5. RATE LIMITING
    // ========================================
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from('generation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', tenMinutesAgo);

    if (countError) {
      console.error('Rate limit check failed:', countError);
    } else if (count !== null && count >= 30) {
      return jsonResponse(
        createError(
          ErrorCodes.RATE_LIMITED,
          'You have reached the generation limit of 30 requests per 10 minutes. Please try again later.'
        ),
        429
      );
    }

    // ========================================
    // 6. LOAD MODEL
    // ========================================
    const { data: model, error: modelError } = await supabase
      .from('models')
      .select('*')
      .eq('id', model_id)
      .maybeSingle();

    if (modelError || !model) {
      return jsonResponse(
        createError(ErrorCodes.MODEL_NOT_FOUND, 'Selected model not found'),
        404
      );
    }

    // ========================================
    // 7. VALIDATE MODEL STATUS
    // ========================================
    if (model.status === 'disabled') {
      return jsonResponse(
        createError(
          ErrorCodes.MODEL_DISABLED,
          `Model \"${model.name}\" is disabled and cannot be used`
        ),
        400
      );
    }

    if (model.status === 'deprecated') {
      console.warn(`Using deprecated model: ${model.name}`);
    }

    if (!model.api_key) {
      return jsonResponse(
        createError(
          ErrorCodes.MODEL_AUTH_ERROR,
          `Model \"${model.name}\" has no API key configured`
        ),
        400
      );
    }

    // ========================================
    // 8. VALIDATE VARIABLES
    // ========================================
    if (draftData) {
      const variableSchema = (draftData.variables || []) as Array<{
        name: string;
        required?: boolean;
      }>;
      
      const validation = validateVariables(variables, variableSchema);
      if (!validation.valid) {
        return jsonResponse(
          createError(
            ErrorCodes.INVALID_VARIABLES,
            `Missing required variables: ${validation.missing.join(', ')}`
          ),
          400
        );
      }
    }

    // ========================================
    // 9. INTERPOLATE VARIABLES
    // ========================================
    const finalPrompt = interpolateVariables(prompt, variables);
    const systemContent = finalPrompt.trim();
    const chatMessage = (variables.chat_message || '').trim();
    const conversationInput = Array.isArray(conversation) ? conversation : [];

    // ========================================
    // 10. BUILD NORMALIZED MESSAGES WITH CONVERSATION HISTORY
    // ========================================
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];

    // 1) System message only if there is content
    if (systemContent.length > 0) {
      messages.push({
        role: 'system',
        content: systemContent,
      });
    }

    // 2) Valid conversation history
    for (const msg of conversationInput) {
      if (!msg || typeof msg.content !== 'string') continue;
      if (msg.role !== 'user' && msg.role !== 'assistant') continue;

      const content = msg.content.trim();
      if (content.length === 0) continue;

      messages.push({
        role: msg.role,
        content,
      });
    }

    // 3) Current user message (normal turns only)
    if (chatMessage.length > 0) {
      messages.push({
        role: 'user',
        content: chatMessage,
      });
    }

    // 4) Guard: never call provider with zero usable messages
    if (messages.length === 0) {
      return jsonResponse(
        createError(
          ErrorCodes.INVALID_REQUEST,
          'No content to send to the model. Both the prompt template and user message resulted in empty content after processing.'
        ),
        400
      );
    }

    const maxTokens = Math.min(model.max_tokens || 2048, 2048);
    const temperature = 0.7;
    const timeoutMs = 60000; // 60 seconds

    // ========================================
    // 11. ROUTE TO PROVIDER
    // ========================================
    let result: { output: string; tokens: number };

    try {
      switch (model.provider) {
        case 'openai':
          result = await callOpenAI({
            apiKey: model.api_key,
            model: model.provider_model,
            messages,
            maxTokens,
            temperature,
            timeoutMs,
          });
          break;

        case 'anthropic':
          result = await callAnthropic({
            apiKey: model.api_key,
            model: model.provider_model,
            messages,
            maxTokens,
            temperature,
            timeoutMs,
          });
          break;

        case 'google':
          result = await callGoogle({
            apiKey: model.api_key,
            model: model.provider_model,
            messages,
            maxTokens,
            temperature,
            timeoutMs,
          });
          break;

        case 'perplexity':
          result = await callPerplexity({
            apiKey: model.api_key,
            model: model.provider_model,
            messages,
            maxTokens,
            temperature,
            timeoutMs,
          });
          break;

        default:
          return jsonResponse(
            createError(
              ErrorCodes.PROVIDER_ERROR,
              `Unsupported provider: ${model.provider}`
            ),
            400
          );
      }
    } catch (error) {
      // Provider functions throw ErrorResponse objects
      if (error && typeof error === 'object' && 'code' in error) {
        return jsonResponse(error, getStatusForErrorCode((error as any).code));
      }
      throw error; // Re-throw unexpected errors
    }

    // ========================================
    // 12. LOG GENERATION (non-blocking)
    // ========================================
    try {
      await supabase.from('generation_logs').insert({
        user_id: user.id,
        prompt_draft_id: prompt_draft_id || null,
        model_id: model.id,
        total_tokens: result.tokens,
        input_tokens: null,
        output_tokens: null,
      });
    } catch (logError) {
      console.error('Failed to log generation:', logError);
      // Don't fail the request if logging fails
    }

    // ========================================
    // 13. RETURN SUCCESS RESPONSE
    // ========================================
    return jsonResponse({
      output: result.output,
      usage: { tokens: result.tokens },
    });

  } catch (error) {
    console.error('Generate error:', error);
    
    // If it's already an error envelope, return it
    if (error && typeof error === 'object' && 'code' in error) {
      return jsonResponse(error, getStatusForErrorCode((error as any).code));
    }

    // Otherwise, wrap as internal error
    return jsonResponse(
      createError(ErrorCodes.INTERNAL_ERROR, 'An unexpected error occurred'),
      500
    );
  }
});
