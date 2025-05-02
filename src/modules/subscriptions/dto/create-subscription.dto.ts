import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsDate,
  IsEnum,
} from 'class-validator';
import { SubscriptionStatus } from '../entities/subscription.entity';
import { Type } from 'class-transformer';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Subscription plan ID' })
  @IsNotEmpty()
  planId: string;

  @ApiPropertyOptional({
    description: 'Subscription status',
    enum: SubscriptionStatus,
  })
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @ApiPropertyOptional({ description: 'Subscription start date' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Subscription end date' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate: Date;

  @ApiPropertyOptional({ description: 'Auto-renew subscription' })
  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @ApiPropertyOptional({
    description: 'External subscription ID (from payment provider)',
  })
  @IsOptional()
  externalSubscriptionId?: string;
}
