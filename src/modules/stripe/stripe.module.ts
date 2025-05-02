import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './providers/stripe.service';
import { StripeProvider } from './providers/stripe.provider';
import { StripeController } from './stripe.controller';

@Module({
  imports: [ConfigModule],
  controllers: [StripeController],
  providers: [StripeProvider, StripeService],
  exports: [StripeService],
})
export class StripeModule {}
