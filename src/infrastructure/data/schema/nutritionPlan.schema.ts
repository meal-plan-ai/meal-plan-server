import { EntitySchema } from 'typeorm';
import { NutritionPlan, MealPlan } from '~/domain';

export const NutritionPlanEntity = new EntitySchema<NutritionPlan>({
  name: 'NutritionPlans',
  target: NutritionPlan,
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    userId: {
      type: 'uuid',
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
    userId: {
      type: 'many-to-one',
      target: 'Users',
      joinColumn: {
        name: 'userId',
      },
      onDelete: 'CASCADE',
    },
  },
});
