import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MealCharacteristic } from '../../meal-characteristic/entities/meal-characteristic.entity';
import { AiGeneratedMealPlan } from '../../ai-meal-generator/entities/ai-generated-meal-plan.entity';

@Entity('meal_plans')
export class MealPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int' })
  durationInDays: number;

  @Column({ nullable: true })
  mealCharacteristicId: string;

  @ManyToOne(() => MealCharacteristic, { eager: true })
  @JoinColumn({ name: 'mealCharacteristicId' })
  mealCharacteristic: MealCharacteristic;

  @Column({ nullable: true })
  aiGeneratedMealPlanId: string;

  @ManyToOne(() => AiGeneratedMealPlan, { eager: true })
  @JoinColumn({ name: 'aiGeneratedMealPlanId' })
  aiGeneratedMealPlan: AiGeneratedMealPlan;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
