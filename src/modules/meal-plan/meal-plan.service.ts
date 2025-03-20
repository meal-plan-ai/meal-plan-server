import { Injectable } from '@nestjs/common';
import { OpenAiService } from 'src/modules/integrations/open-ai/open-ai.service';

@Injectable()
export class MealPlanService {
  constructor(private openAiService: OpenAiService) {}

  async getMealPlan(): Promise<any> {
    const testData = 'Say smth good for Oleksandr and Eugeniy.';
    return 'test';
    // return await this.openAiService.sendData(testData);
  }
}
