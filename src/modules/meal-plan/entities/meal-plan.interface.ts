import { IMealCharacteristic } from '../../meal-characteristic/entities/meal-characteristic.interface';

export interface IMealPlan {
  id: string;
  name: string;
  durationInDays: number;
  mealCharacteristicId?: string;
  mealCharacteristic?: IMealCharacteristic;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}
