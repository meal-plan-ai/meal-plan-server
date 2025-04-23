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
import { IAiMeal } from './entities/ai-generated-meal-plan.interface';

@Injectable()
export class AiMealGeneratorService {
  constructor(
    private readonly openAiService: OpenAiService,
    @InjectRepository(AiGeneratedMealPlan)
    private readonly aiGeneratedMealPlanRepository: Repository<AiGeneratedMealPlan>,
  ) {}

  async generateMealPlan(mealPlan: IMealPlan): Promise<IAiMeal> {
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

    const openAiResponse = await this.openAiService.sendData(prompt);

    console.log('openAiResponse', openAiResponse);

    if (!openAiResponse || !openAiResponse.choices[0]?.message?.content) {
      throw new InternalServerErrorException(
        'Failed to generate meal plan from AI',
      );
    }

    let generatedPlan: IAiMeal;
    try {
      generatedPlan = JSON.parse(
        openAiResponse.choices[0].message.content,
      ) as IAiMeal;
      console.log('generatedPlan', generatedPlan);

      await this.saveGeneratedMealPlan(mealPlan.id, generatedPlan);

      return generatedPlan;
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
      Generate a detailed meal plan for ${requestData.days} days based on the following characteristics:

      ${JSON.stringify(requestData.planCharacteristic, null, 2)}

      Please respond with a valid JSON object that follows this structure:
      {
        "days": [
          {
            "day": 1,
            "date": "2023-06-01", // optional ISO date string
            "meals": [
              {
                "type": "breakfast", // breakfast, lunch, dinner, snack
                "name": "Meal name",
                "ingredients": [
                  {
                    "name": "Ingredient name",
                    "amount": 100,
                    "unit": "g",
                    "alternatives": ["alternative 1", "alternative 2"] // optional
                  }
                ],
                "portions": 1,
                "preparationTime": 15, // in minutes, optional
                "cookingTime": 30, // in minutes, optional
                "instructions": ["Step 1", "Step 2"], // optional
                "nutritionPerServing": {
                  "calories": 500,
                  "protein": 30,
                  "carbs": 40,
                  "fat": 20
                }
              }
            ],
            "dailyNutrition": {
              "calories": 2000,
              "protein": 120,
              "carbs": 180,
              "fat": 70
            }
          }
        ],
        "nutritionSummary": {
          "calories": 2000,
          "protein": 120,
          "carbs": 180,
          "fat": 70
        },
        "shoppingList": {
          "categories": [
            {
              "name": "Vegetables",
              "items": [
                {
                  "name": "Carrots",
                  "amount": 500,
                  "unit": "g"
                }
              ]
            }
          ]
        },
        "notes": ["Note 1", "Note 2"]
      }

      Ensure the meal plan adheres to the dietary requirements and restrictions specified in the characteristics.
      For each day, include breakfast, lunch, dinner, and snacks as needed based on mealsPerDay.
      Provide detailed ingredients with measurements, cooking instructions, and nutritional information.
    `;
  }

  private async saveGeneratedMealPlan(
    mealPlanId: string,
    generatedPlan: IAiMeal,
  ): Promise<AiGeneratedMealPlan> {
    const aiGeneratedMealPlan = new AiGeneratedMealPlan();
    aiGeneratedMealPlan.mealPlanId = mealPlanId;
    aiGeneratedMealPlan.generatedPlan = generatedPlan;
    aiGeneratedMealPlan.modelVersion = 'gpt-3.5-turbo';

    return this.aiGeneratedMealPlanRepository.save(aiGeneratedMealPlan);
  }
}
