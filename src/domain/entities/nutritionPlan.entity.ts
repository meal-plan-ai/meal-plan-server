import { UUID, randomUUID } from 'crypto';
import { MealPlan } from '../valueObjects';

export class NutritionPlan {
  private _id: UUID = randomUUID();
  private _userId: string;
  private _totalCalories: number;
  private _mealPlanData: MealPlan;
}
