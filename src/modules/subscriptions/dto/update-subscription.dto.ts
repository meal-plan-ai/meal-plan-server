import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsDate,
  IsEnum,
  IsString,
} from 'class-validator';
import { SubscriptionStatus } from '../entities/subscription.entity';
import { Type } from 'class-transformer';

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({
    description: 'Subscription status',
    enum: SubscriptionStatus,
  })
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @ApiPropertyOptional({ description: 'Subscription end date' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Auto-renew subscription' })
  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @ApiPropertyOptional({
    description: 'External subscription ID (from payment provider)',
  })
  @IsString()
  @IsOptional()
  externalSubscriptionId?: string;

  @ApiPropertyOptional({ description: 'Cancellation date' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  cancelledAt?: Date;
}
