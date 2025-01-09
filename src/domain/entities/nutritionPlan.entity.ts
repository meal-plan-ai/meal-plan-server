import { UUID, randomUUID } from 'crypto';
import { MealPlan } from '../valueObjects';
import { User } from './user.entity';

export class NutritionPlan {
  private _id: UUID = randomUUID();
  private _user: User;
  private _totalCalories: number;
  private _mealPlanData: MealPlan;

  constructor(
    id: UUID,
    user: User,
    totalCalories: number,
    mealPlanData: MealPlan,
  ) {
    this._id = id;
    this._user = user;
    this._totalCalories = totalCalories;
    this._mealPlanData = mealPlanData;
  }

  public get id(): string {
    return this._id.toString();
  }

  public set user(user: User) {
    this._user = user;
  }

  public get user(): User {
    return this._user;
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
