import { Week, MealTime } from '../enums';

export class MealPlan {
  private _mealPlanData: {
    [day in Week]: {
      meals: {
        [time in MealTime]: string;
      };
      calories: number;
    };
  };

  constructor(mealPlanData: {
    [day in Week]: {
      meals: {
        [time in MealTime]: string;
      };
      calories: number;
    };
  }) {
    this._mealPlanData = mealPlanData;
  }

  public getDayPlan(day: Week): {
    meals: { [time in MealTime]: string };
    calories: number;
  } {
    return this._mealPlanData[day];
  }

  public setDayPlan(
    day: Week,
    meals: { [time in MealTime]: string },
    calories: number,
  ): void {
    this._mealPlanData[day] = { meals, calories };
  }

  public getTotalCalories(): number {
    return Object.values(this._mealPlanData).reduce(
      (total, dayPlan) => total + dayPlan.calories,
      0,
    );
  }
}
