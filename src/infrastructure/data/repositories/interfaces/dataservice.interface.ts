import { User, NutritionPlan } from '~/domain/entities';
import { IGenericRepository } from './repository.interface';

export abstract class IDataService {
  users: IGenericRepository<User>;
  nutritionPlans: IGenericRepository<NutritionPlan>;
}
