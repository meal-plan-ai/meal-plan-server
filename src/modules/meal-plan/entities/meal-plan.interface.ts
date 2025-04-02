export interface IMealPlan {
  id: string;
  name: string;
  durationInDays: number;
  mealCharacteristicId?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}
