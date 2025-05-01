import { Subscription } from '../entities/subscription.entity';

export interface ResponseSubscriptionDto {
  hasActiveSubscription: boolean;
  subscription?: Subscription;
}
