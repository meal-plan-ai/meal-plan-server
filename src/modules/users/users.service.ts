import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();

    user.email = createUserDto.email;

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(createUserDto.password, salt);

    return this.usersRepository.save(user);
  }

  async updateProfileId(userId: string, profileId: string): Promise<User> {
    const user = await this.findOne(userId);
    user.profileId = profileId;
    return this.usersRepository.save(user);
  }

  async updatePassword(userId: string, newPassword: string): Promise<User> {
    const user = await this.findOne(userId);

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);

    return this.usersRepository.save(user);
  }
}
