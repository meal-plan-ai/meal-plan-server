import { User, NutritionPlan } from '~/domain/entities';
import { MealPlan } from '~/domain/valueObjects';
import { IGenericRepository } from './repository.interface';

export abstract class IDataService {
  users: IGenericRepository<User>;
  nutritionPlans: IGenericRepository<NutritionPlan>;
  mealPlans: IGenericRepository<MealPlan>;
}
