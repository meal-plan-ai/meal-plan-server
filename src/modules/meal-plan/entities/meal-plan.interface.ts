import { AiGeneratedMealPlan } from 'src/modules/ai-meal-generator/entities/ai-generated-meal-plan.entity';
import { IMealCharacteristic } from '../../meal-characteristic/entities/meal-characteristic.interface';
import { AiGenerationStatus } from './meal-plan.entity';

export interface IMealPlan {
  id: string;
  name: string;
  userId?: string;
  durationInDays: number;
  createdAt: Date;
  updatedAt: Date;
  mealCharacteristicId?: string;
  mealCharacteristic?: IMealCharacteristic;
  aiGeneratedMealPlanId?: string;
  aiGeneratedMealPlan?: AiGeneratedMealPlan;
  aiGenerationStatus?: AiGenerationStatus;
}
