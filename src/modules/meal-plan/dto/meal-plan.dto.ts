import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMealPlanDto {
  @ApiProperty({
    description: 'Name of the meal plan',
    example: 'Weight Loss Plan',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Duration of the meal plan in days',
    example: 30,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  durationInDays: number;

  @ApiProperty({
    description: 'Meal characteristic UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  mealCharacteristicId?: string;

  @ApiProperty({
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class UpdateMealPlanDto {
  @ApiProperty({
    description: 'Meal plan UUID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Name of the meal plan',
    example: 'Modified Weight Loss Plan',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Duration of the meal plan in days',
    example: 45,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationInDays?: number;

  @ApiProperty({
    description: 'Meal characteristic UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  mealCharacteristicId?: string;
}

export class MealPlanResponseDto {
  @ApiProperty({
    description: 'Meal plan UUID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Name of the meal plan',
    example: 'Weight Loss Plan',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Duration of the meal plan in days',
    example: 30,
  })
  @IsInt()
  durationInDays: number;

  @ApiProperty({
    description: 'Meal characteristic UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  mealCharacteristicId?: string;

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

export class MealPlanBaseResponseDto {
  @ApiProperty({
    description: 'Meal plan data',
    type: MealPlanResponseDto,
  })
  data: MealPlanResponseDto;
}

export class MealPlansBaseResponseDto {
  @ApiProperty({
    description: 'Array of meal plans',
    type: [MealPlanResponseDto],
  })
  data: MealPlanResponseDto[];
}
