import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @Inject(forwardRef(() => SubscriptionsService))
    private subscriptionsService: SubscriptionsService,
  ) {}

  async getProfile(
    userId: string,
  ): Promise<
    Profile & { hasActiveSubscription?: boolean; subscription?: any }
  > {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException(
        `Profile for user with ID ${userId} not found`,
      );
    }

    // Проверяем наличие активной подписки
    const { hasActiveSubscription, subscription } =
      await this.subscriptionsService.checkSubscriptionStatus(userId);

    // Возвращаем профиль с информацией о подписке
    return {
      ...profile,
      hasActiveSubscription,
      subscription,
    };
  }

  async createProfile(
    userId: string,
    createProfileDto: CreateProfileDto,
  ): Promise<Profile> {
    const profile = this.profileRepository.create({
      ...createProfileDto,
      userId,
    });

    const savedProfile = await this.profileRepository.save(profile);

    return savedProfile;
  }

  async updateProfile(updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id: updateProfileDto.id },
    });

    if (!profile) {
      throw new NotFoundException(
        `Profile with ID ${updateProfileDto.id} not found`,
      );
    }

    this.profileRepository.merge(profile, updateProfileDto);
    return this.profileRepository.save(profile);
  }
}
