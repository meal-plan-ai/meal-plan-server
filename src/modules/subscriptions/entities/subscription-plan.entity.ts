import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Subscription } from './subscription.entity';

export enum PlanInterval {
  MONTHLY = 'monthly',
  ANNUALLY = 'annually',
}

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: PlanInterval,
    default: PlanInterval.MONTHLY,
  })
  interval: PlanInterval;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  externalPlanId: string;

  @Column({ default: 0 })
  trialDays: number;

  @Column({ default: 1 })
  mealPlanMaxDays: number;

  @Column({ default: 2 })
  mealPlansPerMonth: number;

  @Column({ default: 1 })
  maxPeopleCount: number;

  @OneToMany(() => Subscription, subscription => subscription.plan)
  subscriptions: Subscription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
