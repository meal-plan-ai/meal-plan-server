export interface IAiMealPlanResponse {
  days: IAiDayPlan[];
}

export interface IAiDayPlan {
  dayNumber: number;
  date?: string;
  totalNutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  meals: IAiMeal[];
}

export enum EMealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

export interface IAiMeal {
  mealType: EMealType;
  name: string;
  description: string;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  recipe: {
    ingredients: IAiIngredient[];
    instructions: string[];
    preparationTime: number;
    cookingTime: number;
  };
  tags: string[];
}

export interface IAiIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface IAiGeneratedMealPlan {
  id: string;
  mealPlanId: string;
  generatedPlan: IAiMealPlanResponse;
  modelVersion: string;
  createdAt: Date;
  updatedAt: Date;
}
