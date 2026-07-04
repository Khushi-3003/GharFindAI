import { NextResponse } from 'next/server';
import { runMockAgent, runLiveAgent } from '../../../../src/lib/agentEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, preferences, config } = body;

    // Config format: { useLive: boolean, provider: 'gemini' | 'openai', apiKey: string, model: string }
    if (config?.useLive && config?.apiKey) {
      const result = await runLiveAgent(
        config.apiKey,
        config.provider || 'gemini',
        config.model || 'gemini-2.5-flash',
        messages,
        preferences
      );
      return NextResponse.json(result);
    } else {
      // Default to Mock Agent Mode
      const result = runMockAgent(messages, preferences);
      return NextResponse.json(result);
    }
  } catch (error: any) {
    console.error('API Chat Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
