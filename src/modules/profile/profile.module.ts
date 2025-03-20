import { Module, forwardRef } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile]), forwardRef(() => UsersModule)],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
