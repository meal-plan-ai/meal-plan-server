import { UUID, randomUUID } from 'crypto';
import { MealPlan } from '../valueObjects';
import { User } from './user.entity';

export class NutritionPlan {
  private _id: UUID = randomUUID();
  private _userId: string;
  private _totalCalories: number;
  private _mealPlanData: MealPlan;

  constructor(
    id: UUID,
    userId: string,
    totalCalories: number,
    mealPlanData: MealPlan,
  ) {
    this._id = id;
    this._userId = userId;
    this._totalCalories = totalCalories;
    this._mealPlanData = mealPlanData;
  }

  public get id(): string {
    return this._id.toString();
  }

  public set userId(user: User) {
    this._userId = user.id;
  }

  public get userId(): string {
    return this._userId.toString();
  }

  public set totalCalories(mealPlan: MealPlan) {
    this._totalCalories = mealPlan.getTotalCalories();
  }

  public get totalCalories(): number {
    return this._totalCalories;
  }

  public set mealPlanData(mealPlan: MealPlan) {
    this._mealPlanData = mealPlan;
  }

  public get mealPlanData(): MealPlan {
    return this._mealPlanData;
  }
}
