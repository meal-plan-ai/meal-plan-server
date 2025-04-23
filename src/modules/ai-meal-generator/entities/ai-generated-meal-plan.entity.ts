import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MealPlan } from '../../meal-plan/entities/meal-plan.entity';

@Entity('ai_generated_meal_plans')
export class AiGeneratedMealPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  mealPlanId: string;

  @ManyToOne(() => MealPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mealPlanId' })
  mealPlan: MealPlan;

  @Column({ type: 'json' })
  generatedPlan: object;

  @Column({ nullable: true })
  userId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  modelVersion: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
