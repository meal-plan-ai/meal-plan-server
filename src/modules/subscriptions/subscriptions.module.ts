import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksController } from './webhooks.controller';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionsService } from './subscriptions.service';
import { Payment } from './entities/payment.entity';
import { StripeModule } from '../stripe/stripe.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, SubscriptionPlan, Payment]),
    forwardRef(() => UsersModule),
    StripeModule,
  ],
  controllers: [SubscriptionsController, WebhooksController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
