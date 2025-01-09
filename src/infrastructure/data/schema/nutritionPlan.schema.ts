import { EntitySchema } from 'typeorm';
import { NutritionPlan } from '~/domain';
import { MealPlan } from '~/domain/valueObjects';

export const NutritionPlanEntity = new EntitySchema<NutritionPlan>({
  name: 'nutritionPlans',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: true,
    },
    totalCalories: {
      type: 'int',
    },
    mealPlanData: {
      type: 'json',
      transformer: {
        to: (mealPlan: MealPlan) => mealPlan,
        from: (value: any) => new MealPlan(value),
      },
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'user',
      joinColumn: true,
    },
  },
});
