import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './providers/stripe.service';
import { StripeProvider } from './providers/stripe.provider';

@Module({
  imports: [ConfigModule],
  providers: [StripeProvider, StripeService],
  exports: [StripeService],
})
export class StripeModule {}
