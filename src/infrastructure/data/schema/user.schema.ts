import { EntitySchema } from 'typeorm';
import { User } from '~/domain';

export const UserEntity = new EntitySchema<User>({
  name: 'Users',
  target: User,
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
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
    nutritionPlan: {
      type: 'one-to-many',
      target: 'NutritionPlan',
      inverseSide: 'user',
      cascade: true,
    },
  },
});
