import {
  Inject,
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { STRIPE_CLIENT } from './stripe.provider';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);

  constructor(@Inject(STRIPE_CLIENT) private readonly stripe: Stripe) {}

  async createCustomer(user: User): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });

      if (!customer || !customer.id) {
        throw new InternalServerErrorException(
          'Failed to create Stripe customer: Invalid response',
        );
      }

      return customer.id;
    } catch (error) {
      this.logger.error(`Error creating Stripe customer: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to create Stripe customer: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async createProduct(
    name: string,
    description: string,
    metadata: Record<string, string>,
  ) {
    try {
      const product = await this.stripe.products.create({
        name,
        description,
        metadata,
      });

      return { productId: product.id };
    } catch (error) {
      this.logger.error(`Error creating Stripe product: ${error.message}`);
      throw error;
    }
  }

  async createPrice(
    productId: string,
    unitAmount: number,
    currency: string,
    interval?: 'month' | 'year',
    metadata?: Record<string, string>,
  ) {
    try {
      const priceData: Stripe.PriceCreateParams = {
        product: productId,
        unit_amount: Math.round(unitAmount * 100), // Stripe uses cents
        currency,
        metadata,
      };

      if (interval) {
        priceData.recurring = { interval };
      }

      const price = await this.stripe.prices.create(priceData);
      return { priceId: price.id };
    } catch (error) {
      this.logger.error(`Error creating Stripe price: ${error.message}`);
      throw error;
    }
  }

  // async createSubscription(
  //   stripeCustomerId: string,
  //   stripePriceId: string,
  //   trialDays = 0,
  // ) {
  //   try {
  //     const subscription = await this.stripe.subscriptions.create({
  //       customer: stripeCustomerId,
  //       items: [{ price: stripePriceId }],
  //       trial_period_days: trialDays,
  //     });
  //
  //     return {
  //       subscriptionId: subscription.id,
  //       status: subscription.status,
  //       currentPeriodEnd: new Date(
  //         (subscription as any).current_period_end * 1000,
  //       ),
  //     };
  //   } catch (error) {
  //     this.logger.error(`Error creating Stripe subscription: ${error.message}`);
  //     throw error;
  //   }
  // }

  async cancelSubscription(stripeSubscriptionId: string) {
    try {
      const subscription =
        await this.stripe.subscriptions.cancel(stripeSubscriptionId);
      return subscription;
    } catch (error) {
      this.logger.error(
        `Error cancelling Stripe subscription: ${error.message}`,
      );
      throw error;
    }
  }

  async updateSubscription(
    stripeSubscriptionId: string,
    stripePriceId: string,
  ) {
    try {
      const subscription = await this.stripe.subscriptions.update(
        stripeSubscriptionId,
        {
          items: [
            {
              id: stripeSubscriptionId,
              price: stripePriceId,
            },
          ],
        },
      );
      return subscription;
    } catch (error) {
      this.logger.error(`Error updating Stripe subscription: ${error.message}`);
      throw error;
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    stripeCustomerId: string,
    metadata?: Stripe.MetadataParam,
  ) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses cents
        currency,
        customer: stripeCustomerId,
        metadata,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error(`Error creating payment intent: ${error.message}`);
      throw error;
    }
  }

  constructWebhookEvent(
    payload: Buffer,
    signature: string,
    webhookSecret: string,
  ) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}
