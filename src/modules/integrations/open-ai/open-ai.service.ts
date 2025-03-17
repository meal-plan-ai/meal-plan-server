import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private openai: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error(
        'The OPENAI_API_KEY environment variable is missing or empty',
      );
    }
    this.openai = new OpenAI({ apiKey });
  }

  async sendData(userMessage): Promise<any> {
    try {
      const response = await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: userMessage }],
        model: 'gpt-3.5-turbo',
      });

      return response;
    } catch (error) {
      console.error('Error while communicating with OpenAI:', error);
      return null;
    }
  }
}
