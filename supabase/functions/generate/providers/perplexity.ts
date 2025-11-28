/**
 * Perplexity provider integration
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

export async function callPerplexity(
  params: CallParams
): Promise<{ output: string; tokens: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), params.timeoutMs);

  try {
    // Strip images for text-only Perplexity
    const textOnlyMessages = params.messages.map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'string'
        ? msg.content
        : msg.content.filter(b => b.type === 'text').map(b => b.text || '').join('\n'),
    }));

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${params.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        messages: textOnlyMessages,
        max_tokens: params.maxTokens,
        temperature: params.temperature,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw createError(
          ErrorCodes.MODEL_AUTH_ERROR,
          'Invalid Perplexity API key'
        );
      }
      
      if (response.status === 429) {
        throw createError(
          ErrorCodes.MODEL_RATE_LIMITED,
          'Perplexity rate limit exceeded'
        );
      }
      
      if (response.status === 404) {
        throw createError(
          ErrorCodes.MODEL_NOT_FOUND,
          `Model ${params.model} not found at Perplexity`
        );
      }
      
      if (response.status >= 500) {
        throw createError(
          ErrorCodes.MODEL_UNAVAILABLE,
          'Perplexity service is temporarily unavailable'
        );
      }
      
      throw createError(
        ErrorCodes.PROVIDER_ERROR,
        errorData.error?.message || `Perplexity API error: ${response.status}`
      );
    }

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content || '';
    const tokens = data.usage?.total_tokens || estimateTokens(output);

    return { output, tokens };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
      throw createError(
        ErrorCodes.MODEL_TIMEOUT,
        'Perplexity request timed out after 60 seconds'
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
      `Perplexity request failed: ${errorMessage}`
    );
  }
}
