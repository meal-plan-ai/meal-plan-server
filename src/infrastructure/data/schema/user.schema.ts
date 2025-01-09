import { EntitySchema } from 'typeorm';
import { User } from '~/domain';

export const UserEntity = new EntitySchema<User>({
  name: 'user',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: true,
    },
    name: {
      type: 'varchar',
    },
    email: {
      type: 'varchar',
      unique: true,
    },
    password: {
      type: 'varchar',
    },
  },
  relations: {
    nutritionPlans: {
      type: 'one-to-many',
      target: 'nutritionPlans',
      inverseSide: 'user',
      joinColumn: true,
    },
  },
});
