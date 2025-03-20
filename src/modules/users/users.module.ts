import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ProfileModule } from '../profile/profile.module';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => ProfileModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
