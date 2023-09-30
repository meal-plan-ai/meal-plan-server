import { Injectable } from '@nestjs/common';

@Injectable()
export class OpenAiService {
  async sendData(): Promise<any> {
    const testData = 'there is place to provide test data for open-ai service';
    return testData;
  }
}
