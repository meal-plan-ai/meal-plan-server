import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { PaymentStatus, PaymentProvider } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'Subscription ID' })
  @IsUUID()
  @IsOptional()
  subscriptionId?: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiPropertyOptional({ description: 'Payment status', enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiProperty({ description: 'Payment provider', enum: PaymentProvider })
  @IsEnum(PaymentProvider)
  @IsNotEmpty()
  provider: PaymentProvider;

  @ApiPropertyOptional({
    description: 'External payment ID (from payment provider)',
  })
  @IsString()
  @IsOptional()
  externalPaymentId?: string;

  @ApiPropertyOptional({ description: 'Additional payment metadata' })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
