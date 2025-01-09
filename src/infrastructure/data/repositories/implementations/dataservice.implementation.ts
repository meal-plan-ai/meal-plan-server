import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { NutritionPlan, User } from '~/domain/entities';
import { IDataService } from '../interfaces/dataservice.interface';
import { IGenericRepository } from '../interfaces/repository.interface';
import { GenericRepository } from './repository.implementation';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class GenericDataService
  implements IDataService, OnApplicationBootstrap
{
  users: IGenericRepository<User>;
  nutritionPlans: IGenericRepository<NutritionPlan>;

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,

    @InjectRepository(User)
    private readonly userRepository: IGenericRepository<User>,
    @InjectRepository(NutritionPlan)
    private readonly nutritionPlanRepository: IGenericRepository<NutritionPlan>,
  ) {}

  onApplicationBootstrap() {
    this.users = new GenericRepository<User>(
      User,
      this.entityManager,
      this.userRepository.queryRunner,
    );
    this.nutritionPlans = new GenericRepository<NutritionPlan>(
      NutritionPlan,
      this.entityManager,
      this.nutritionPlanRepository.queryRunner,
    );
  }
}
