import { Injectable } from '@nestjs/common';
import { OpenAiService } from '../integrations/open-ai/open-ai.service';

@Injectable()
export class MealPlanService {
  constructor(private openAiService: OpenAiService) {}

  async getMealPlan(): Promise<string> {
    await Promise.resolve();
    return 'test';
    // return await this.openAiService.sendData(testData);
  }
}
