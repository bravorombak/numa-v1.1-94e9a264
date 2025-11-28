/**
 * Google Gemini provider integration
 */

import { createError, ErrorCodes } from '../errors.ts';
import { estimateTokens } from '../interpolate.ts';

type MessageContent = string | Array<{
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}>;

interface CallParams {
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: MessageContent }>;
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
}

export async function callGoogle(
  params: CallParams
): Promise<{ output: string; tokens: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), params.timeoutMs);

  try {
    // Google: text-only for now (strip images)
    const prompt = params.messages.map(m => {
      if (typeof m.content === 'string') {
        return m.content;
      }
      // Extract only text blocks
      return m.content.filter(b => b.type === 'text').map(b => b.text || '').join('\n');
    }).join('\n\n');

    // API key is in URL query param, not header
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${params.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
        generationConfig: {
          maxOutputTokens: params.maxTokens,
          temperature: params.temperature,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401 || response.status === 403) {
        throw createError(
          ErrorCodes.MODEL_AUTH_ERROR,
          'Invalid Google API key'
        );
      }
      
      if (response.status === 429) {
        throw createError(
          ErrorCodes.MODEL_RATE_LIMITED,
          'Google API rate limit exceeded'
        );
      }
      
      if (response.status === 404) {
        throw createError(
          ErrorCodes.MODEL_NOT_FOUND,
          `Model ${params.model} not found at Google`
        );
      }
      
      if (response.status >= 500) {
        throw createError(
          ErrorCodes.MODEL_UNAVAILABLE,
          'Google Gemini service is temporarily unavailable'
        );
      }
      
      throw createError(
        ErrorCodes.PROVIDER_ERROR,
        errorData.error?.message || `Google API error: ${response.status}`
      );
    }

    const data = await response.json();
    const output = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const tokens = data.usageMetadata?.totalTokenCount || estimateTokens(output);

    return { output, tokens };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
      throw createError(
        ErrorCodes.MODEL_TIMEOUT,
        'Google Gemini request timed out after 60 seconds'
      );
    }
    
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }
    
    const errorMessage = error && typeof error === 'object' && 'message' in error
      ? String((error as any).message)
      : 'Unknown error';
    
    throw createError(
      ErrorCodes.PROVIDER_ERROR,
      `Google Gemini request failed: ${errorMessage}`
    );
  }
}
