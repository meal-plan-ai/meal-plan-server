export interface IMealCharacteristic {
  id: string;
  planName: string;
  gender: string;
  age?: number;
  height?: number;
  weight?: number;
  activityLevel?: string;
  goal?: string;
  targetDailyCalories?: number;
  proteinPercentage?: number;
  fatPercentage?: number;
  carbsPercentage?: number;
  includeSnacks: number;
  mealsPerDay: number;
  medicalConditions?: string[];
  dietType?: string[];
  dietaryRestrictions?: string[];
  vitaminsAndMinerals?: string[];
  nutrientTargets?: Record<string, number>;
  cookingComplexity?: string;
  additionalPreferences?: string[];
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}
