import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { IMealPlan } from '../meal-plan/entities/meal-plan.interface';
import { OpenAiService } from '../integrations/open-ai/open-ai.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiGeneratedMealPlan } from './entities/ai-generated-meal-plan.entity';
import { IAiMealPlanResponse } from './entities/ai-generated-meal-plan.interface';
import { MealPlan } from '../meal-plan/entities/meal-plan.entity';

@Injectable()
export class AiMealGeneratorService {
  constructor(
    private readonly openAiService: OpenAiService,
    @InjectRepository(AiGeneratedMealPlan)
    private readonly aiGeneratedMealPlanRepository: Repository<AiGeneratedMealPlan>,
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
  ) {}

  async generateMealPlan(mealPlan: IMealPlan): Promise<AiGeneratedMealPlan> {
    if (!mealPlan) {
      throw new NotFoundException(`Meal plan with ID not found`);
    }

    if (!mealPlan.mealCharacteristic) {
      throw new NotFoundException(
        'This meal plan does not have any characteristics associated',
      );
    }

    if (!mealPlan.mealCharacteristicId) {
      throw new NotFoundException(
        `Meal characteristic with ID ${mealPlan.mealCharacteristicId} not found`,
      );
    }

    const requestData = {
      days: mealPlan.durationInDays,
      planCharacteristic: mealPlan.mealCharacteristic,
    };

    const prompt = this.createOpenAiPrompt(requestData);

    const openAiResponse = await this.openAiService.sendData(prompt, 'json');

    if (!openAiResponse || !openAiResponse.choices[0]?.message?.content) {
      throw new InternalServerErrorException(
        'Failed to generate meal plan from AI',
      );
    }

    let generatedPlan: IAiMealPlanResponse = {} as IAiMealPlanResponse;
    try {
      generatedPlan = JSON.parse(
        openAiResponse.choices[0].message.content,
      ) as IAiMealPlanResponse;

      const plan = await this.saveGeneratedMealPlan(mealPlan.id, generatedPlan);

      return plan;
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new InternalServerErrorException(
        'Failed to parse AI-generated meal plan',
      );
    }
  }

  private createOpenAiPrompt(requestData: {
    days: number;
    planCharacteristic: any;
  }): string {
    return `
      Generate a detailed meal plan for ${requestData.days} day(s) based on the following characteristics:

      ${JSON.stringify(requestData.planCharacteristic, null, 2)}

      Respond ONLY with a valid JSON object without any markdown formatting, comments, or explanations. Follow this exact structure:
      {
        "days": [
          {
            "dayNumber": 1,
            "date": "2023-06-01",
            "totalNutrition": {
              "calories": 2000,
              "protein": 120,
              "fat": 70,
              "carbs": 180
            },
            "meals": [
              {
                "mealType": "breakfast",
                "name": "Healthy Breakfast Bowl",
                "description": "A nutritious breakfast bowl with oats and fruits",
                "nutrition": {
                  "calories": 450,
                  "protein": 25,
                  "fat": 15,
                  "carbs": 60
                },
                "recipe": {
                  "ingredients": [
                    {
                      "name": "Rolled oats",
                      "amount": 80,
                      "unit": "g"
                    },
                    {
                      "name": "Almond milk",
                      "amount": 200,
                      "unit": "ml"
                    }
                  ],
                  "instructions": [
                    "Combine oats and milk in a bowl",
                    "Let sit for 5 minutes",
                    "Top with fruits and nuts"
                  ],
                  "preparationTime": 10,
                  "cookingTime": 5
                },
                "tags": ["vegetarian", "high-fiber", "breakfast"]
              }
            ]
          }
        ]
      }

      Make sure each meal includes all required properties according to the structure and each meal plan addresses the specific dietary needs and preferences in the characteristics provided.
    `;
  }

  private async saveGeneratedMealPlan(
    mealPlanId: string,
    generatedPlan: IAiMealPlanResponse,
  ): Promise<AiGeneratedMealPlan> {
    const aiGeneratedMealPlan = new AiGeneratedMealPlan();
    aiGeneratedMealPlan.mealPlanId = mealPlanId;
    aiGeneratedMealPlan.generatedPlan = generatedPlan;
    aiGeneratedMealPlan.modelVersion = '';

    const plan =
      await this.aiGeneratedMealPlanRepository.save(aiGeneratedMealPlan);
    await this.mealPlanRepository.update(mealPlanId, {
      aiGeneratedMealPlanId: plan.id,
    });
    return plan;
  }
}
