import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IAiMealPlanResponse } from './ai-generated-meal-plan.interface';

@Entity('ai_generated_meal_plans')
export class AiGeneratedMealPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  mealPlanId: string;

  @Column({ type: 'json' })
  generatedPlan: IAiMealPlanResponse;

  @Column({ type: 'varchar', length: 100, nullable: true })
  modelVersion: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
