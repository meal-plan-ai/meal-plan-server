import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsArray,
  IsObject,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

enum ActivityLevel {
  SEDENTARY = 'Sedentary',
  LIGHT = 'Light',
  MODERATE = 'Moderate',
  ACTIVE = 'Active',
  VERY_ACTIVE = 'Very Active',
}

enum Goal {
  MAINTENANCE = 'Maintenance',
  WEIGHT_LOSS = 'Weight Loss',
  MUSCLE_GAIN = 'Muscle Gain',
}

enum CookingComplexity {
  QUICK = 'Quick & Easy',
  STANDARD = 'Standard',
  GOURMET = 'Gourmet',
}

export class CreateMealCharacteristicDto {
  @ApiProperty({
    description: 'Name of the meal plan',
    example: 'My Balanced Diet Plan',
  })
  @IsString()
  planName: string;

  @ApiProperty({
    description: 'Gender',
    example: 'Male',
    enum: Gender,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: string;

  @ApiProperty({
    description: 'Age in years',
    example: 30,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Max(120)
  @IsOptional()
  age?: number;

  @ApiProperty({
    description: 'Height in centimeters',
    example: 175,
    required: false,
  })
  @IsInt()
  @Min(50)
  @Max(250)
  @IsOptional()
  height?: number;

  @ApiProperty({
    description: 'Weight in kilograms',
    example: 70,
    required: false,
  })
  @IsInt()
  @Min(20)
  @Max(300)
  @IsOptional()
  weight?: number;

  @ApiProperty({
    description: 'Activity level',
    example: 'Moderate',
    enum: ActivityLevel,
    required: false,
  })
  @IsString()
  @IsOptional()
  activityLevel?: string;

  @ApiProperty({
    description: 'Goal of the diet plan',
    example: 'Weight Loss',
    enum: Goal,
    required: false,
  })
  @IsString()
  @IsOptional()
  goal?: string;

  @ApiProperty({
    description: 'Target daily calorie intake',
    example: 2000,
    required: false,
  })
  @IsInt()
  @Min(1000)
  @Max(3500)
  @IsOptional()
  targetDailyCalories?: number;

  @ApiProperty({
    description: 'Protein percentage in macro ratio',
    example: 30,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  proteinPercentage?: number;

  @ApiProperty({
    description: 'Fat percentage in macro ratio',
    example: 30,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  fatPercentage?: number;

  @ApiProperty({
    description: 'Carbs percentage in macro ratio',
    example: 40,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  carbsPercentage?: number;

  @ApiProperty({
    description: 'Number of snacks to include',
    example: 2,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @Max(2)
  @IsOptional()
  includeSnacks?: number;

  @ApiProperty({
    description: 'Number of meals per day',
    example: 3,
    default: 3,
  })
  @IsInt()
  @Min(1)
  @Max(3)
  @IsOptional()
  mealsPerDay?: number;

  @ApiProperty({
    description: 'Medical conditions to consider',
    example: ['Diabetes', 'Hypertension'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  medicalConditions?: string[];

  @ApiProperty({
    description: 'Diet types',
    example: ['Vegetarian', 'Gluten-Free'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dietType?: string[];

  @ApiProperty({
    description: 'Dietary restrictions',
    example: ['Lactose Intolerance', 'Nut Allergy'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dietaryRestrictions?: string[];

  @ApiProperty({
    description: 'Vitamins and minerals to prioritize',
    example: ['Vitamin C', 'Iron', 'Calcium'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  vitaminsAndMinerals?: string[];

  @ApiProperty({
    description: 'Custom nutrient targets',
    example: { 'Vitamin D': 1000, 'Omega-3': 500 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  nutrientTargets?: Record<string, number>;

  @ApiProperty({
    description: 'Cooking complexity preference',
    example: 'Standard',
    enum: CookingComplexity,
    required: false,
  })
  @IsString()
  @IsOptional()
  cookingComplexity?: string;

  @ApiProperty({
    description: 'Additional preferences',
    example: ['Organic', 'Local Products'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  additionalPreferences?: string[];
}

export class UpdateMealCharacteristicDto extends CreateMealCharacteristicDto {
  @ApiProperty({
    description: 'Meal characteristic UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;
}

export class MealCharacteristicResponseDto {
  @ApiProperty({
    description: 'Meal characteristic UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Name of the meal plan',
    example: 'My Balanced Diet Plan',
  })
  @IsString()
  planName: string;

  @ApiProperty({
    description: 'Gender',
    example: 'Male',
    enum: Gender,
  })
  @IsEnum(Gender)
  gender: string;

  @ApiProperty({
    description: 'Age in years',
    example: 30,
    required: false,
  })
  @IsInt()
  @IsOptional()
  age?: number;

  @ApiProperty({
    description: 'Height in centimeters',
    example: 175,
    required: false,
  })
  @IsInt()
  @IsOptional()
  height?: number;

  @ApiProperty({
    description: 'Weight in kilograms',
    example: 70,
    required: false,
  })
  @IsInt()
  @IsOptional()
  weight?: number;

  @ApiProperty({
    description: 'Activity level',
    example: 'Moderate',
    enum: ActivityLevel,
    required: false,
  })
  @IsString()
  @IsOptional()
  activityLevel?: string;

  @ApiProperty({
    description: 'Goal of the diet plan',
    example: 'Weight Loss',
    enum: Goal,
    required: false,
  })
  @IsString()
  @IsOptional()
  goal?: string;

  @ApiProperty({
    description: 'Target daily calorie intake',
    example: 2000,
    required: false,
  })
  @IsInt()
  @IsOptional()
  targetDailyCalories?: number;

  @ApiProperty({
    description: 'Protein percentage in macro ratio',
    example: 30,
    required: false,
  })
  @IsInt()
  @IsOptional()
  proteinPercentage?: number;

  @ApiProperty({
    description: 'Fat percentage in macro ratio',
    example: 30,
    required: false,
  })
  @IsInt()
  @IsOptional()
  fatPercentage?: number;

  @ApiProperty({
    description: 'Carbs percentage in macro ratio',
    example: 40,
    required: false,
  })
  @IsInt()
  @IsOptional()
  carbsPercentage?: number;

  @ApiProperty({
    description: 'Number of snacks to include',
    example: 2,
  })
  @IsInt()
  includeSnacks: number;

  @ApiProperty({
    description: 'Number of meals per day',
    example: 3,
  })
  @IsInt()
  mealsPerDay: number;

  @ApiProperty({
    description: 'Medical conditions to consider',
    example: ['Diabetes', 'Hypertension'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  medicalConditions?: string[];

  @ApiProperty({
    description: 'Diet types',
    example: ['Vegetarian', 'Gluten-Free'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  dietType?: string[];

  @ApiProperty({
    description: 'Dietary restrictions',
    example: ['Lactose Intolerance', 'Nut Allergy'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  dietaryRestrictions?: string[];

  @ApiProperty({
    description: 'Vitamins and minerals to prioritize',
    example: ['Vitamin C', 'Iron', 'Calcium'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  vitaminsAndMinerals?: string[];

  @ApiProperty({
    description: 'Custom nutrient targets',
    example: { 'Vitamin D': 1000, 'Omega-3': 500 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  nutrientTargets?: Record<string, number>;

  @ApiProperty({
    description: 'Cooking complexity preference',
    example: 'Standard',
    enum: CookingComplexity,
    required: false,
  })
  @IsString()
  @IsOptional()
  cookingComplexity?: string;

  @ApiProperty({
    description: 'Additional preferences',
    example: ['Organic', 'Local Products'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  additionalPreferences?: string[];

  @ApiProperty({
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-02T00:00:00Z',
  })
  @IsDate()
  updatedAt: Date;
}
