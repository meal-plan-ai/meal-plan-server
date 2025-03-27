import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('meal_characteristics')
export class MealCharacteristic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  planName: string;

  @Column({ type: 'enum', enum: ['Male', 'Female', 'Other'], default: 'Other' })
  gender: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'int', nullable: true })
  weight: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  activityLevel: string;

  @Column({ type: 'int', nullable: true })
  activityCalories: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  goal: string;

  @Column({ type: 'int', nullable: true })
  targetDailyCalories: number;

  @Column({ type: 'int', nullable: true })
  proteinPercentage: number;

  @Column({ type: 'int', nullable: true })
  fatPercentage: number;

  @Column({ type: 'int', nullable: true })
  carbsPercentage: number;

  @Column({ type: 'int', default: 0 })
  includeSnacks: number;

  @Column({ type: 'int', default: 3 })
  mealsPerDay: number;

  @Column({ type: 'simple-array', nullable: true })
  medicalConditions: string[];

  @Column({ type: 'simple-array', nullable: true })
  dietType: string[];

  @Column({ type: 'simple-array', nullable: true })
  dietaryRestrictions: string[];

  @Column({ type: 'simple-array', nullable: true })
  vitaminsAndMinerals: string[];

  @Column({ type: 'json', nullable: true })
  nutrientTargets: Record<string, number>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cookingComplexity: string;

  @Column({ type: 'simple-array', nullable: true })
  additionalPreferences: string[];

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
