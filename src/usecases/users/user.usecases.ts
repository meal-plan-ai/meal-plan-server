import { Injectable, Logger } from '@nestjs/common';
import { User } from '~/domain/entities';
import { IDataService } from '~/infrastructure/data/repositories/interfaces';

@Injectable()
export class UserService {
  constructor(
    private readonly dataService: IDataService,
    private readonly logger = new Logger(UserService.name),
  ) {}

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.dataService.users.find();
    } catch (error) {
      this.logger.error(
        'Error in getAllUsers service method',
        new Error(error).stack,
      );
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User | string> {
    try {
      const user = await this.dataService.users.findOne({
        where: { id: userId },
      });
      return user ? user : `user with ${userId} dont exist`;
    } catch (error) {
      this.logger.error(
        'Error in getUserById service method',
        new Error(error).stack,
      );
      throw error;
    }
  }

  async getUserByEmail(userEmail: string): Promise<User | string> {
    try {
      const user = await this.dataService.users.findOne({
        where: { email: userEmail },
      });
      return user ? user : `user with ${userEmail} dont exist`;
    } catch (error) {
      this.logger.error(
        'Error in getUserByEmail service method',
        new Error(error).stack,
      );
      throw error;
    }
  }

  async createUser(user: User): Promise<User> {
    try {
      const createdUser = await this.dataService.users.create(user);
      await this.dataService.users.save(createdUser);
      return createdUser;
    } catch (error) {
      this.logger.error(
        'Error in createUser service method',
        new Error(error).stack,
      );
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      const result = await this.dataService.users.delete({ id: userId });
      return result.affected
        ? `User with id ${userId} has been deleted successfully.`
        : `Can not delete user with id ${userId}, because such user does not exist.`;
    } catch (error) {
      this.logger.error(
        'Error in deleteUser service method',
        new Error(error).stack,
      );
      throw error;
    }
  }
}
