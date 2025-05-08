import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './providers/stripe.service';
import { StripeProvider } from './providers/stripe.provider';
import { StripeController } from './stripe.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [ConfigModule, forwardRef(() => SubscriptionsModule)],
  controllers: [StripeController],
  providers: [StripeProvider, StripeService],
  exports: [StripeService],
})
export class StripeModule {}
