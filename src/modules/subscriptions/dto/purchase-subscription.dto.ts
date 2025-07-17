import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { PaymentProvider } from '../entities/payment.entity';

// DTO для данных кредитной карты
export class CardDetailsDto {
  @ApiProperty({ description: 'Card number', example: '4242424242424242' })
  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @ApiProperty({ description: 'Cardholder name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Expiry date', example: '12/25' })
  @IsString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiProperty({ description: 'CVV code', example: '123' })
  @IsString()
  @IsNotEmpty()
  cvv: string;
}

export class PurchaseSubscriptionDto {
  @ApiProperty({ description: 'Subscription plan ID' })
  @IsNotEmpty()
  planId: string;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'Stripe payment method ID or token',
    example: 'pm_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;

  @ApiPropertyOptional({ description: 'Auto-renew subscription' })
  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Payment provider',
    example: PaymentProvider.STRIPE,
  })
  @IsEnum(PaymentProvider)
  @IsOptional()
  provider?: PaymentProvider;
}
