// src/openai/chat.ts
import { ChatCompletionMessageParam } from 'openai/resources';
import openai from '../openai/openaiConfig';
import { RetrieveMessage } from 'src/types/retrieveMessage';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const FilesResponse = z.object({
  filename: z.string(),
  code: z.string(),
});
const CodesFomart = z.object({
  files: z.array(FilesResponse),
});

export class ChatOpenAI {
  private messages: ChatCompletionMessageParam[];
  private model: string;

  constructor(model: string) {
    this.messages = [];
    this.model = model || 'gpt-4o';
  }

  public addSystem(content: string): void {
    this.messages.push({ role: 'system', content });
  }

  public addMessage(role: 'user' | 'assistant', content: string): void {
    this.messages.push({ role, content });
  }

  async run(): Promise<RetrieveMessage> {
    const completion = await openai.chat.completions.create({
      messages: this.messages,
      model: this.model,
      response_format: zodResponseFormat(CodesFomart, 'files'),
    });

    const result: RetrieveMessage = {
      text: '',
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };

    result.text = completion.choices[0].message.content;
    result.usage.prompt_tokens = completion.usage.prompt_tokens;
    result.usage.completion_tokens = completion.usage.completion_tokens;
    result.usage.total_tokens = completion.usage.total_tokens;
    return result;
  }
}
