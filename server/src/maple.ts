import type { ChatMessage } from './types.js';

export type MapleClient = {
  createChatCompletion(args: {
    baseUrl: string;
    apiKey: string;
    model: string;
    messages: ChatMessage[];
    stream: boolean;
  }): Promise<Response>;
};

// Assumes Maple AI is OpenAI-compatible.
export const mapleClient: MapleClient = {
  async createChatCompletion({ baseUrl, apiKey, model, messages, stream }) {
    const url = new URL('/chat/completions', baseUrl);

    return fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream,
      }),
    });
  },
};
