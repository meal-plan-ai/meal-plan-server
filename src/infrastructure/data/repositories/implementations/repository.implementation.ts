import { EntityManager, EntityTarget, QueryRunner } from 'typeorm';
import { IGenericRepository } from '~/infrastructure/data/repositories/interfaces';

export class GenericRepository<T> extends IGenericRepository<T> {
  constructor(
    target: EntityTarget<T>,
    manager: EntityManager,
    queryRunner: QueryRunner,
  ) {
    super(target, manager, queryRunner);
  }
}
