import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error(
        'The OPENAI_API_KEY environment variable is missing or empty',
      );
    }
    this.openai = new OpenAI({ apiKey });
  }

  async sendData(
    userMessage: string,
    responseFormat?: 'json' | 'text',
  ): Promise<OpenAI.Chat.Completions.ChatCompletion | null> {
    try {
      const options: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
        messages: [{ role: 'user', content: userMessage }],
        model: 'gpt-4o',
      };

      if (responseFormat === 'json') {
        options.response_format = { type: 'json_object' };
      }

      const response = await this.openai.chat.completions.create(options);

      console.log('OpenAI response:', response);

      return response;
    } catch (error) {
      console.error('Error while communicating with OpenAI:', error);
      return null;
    }
  }
}
