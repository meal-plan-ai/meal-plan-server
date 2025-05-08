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

  async createSubscription(
    stripeCustomerId: string,
    stripePriceId: string,
    trialDays = 0,
  ) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: stripePriceId }],
        trial_period_days: trialDays,
      });

      return {
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000,
        ),
      };
    } catch (error) {
      this.logger.error(`Error creating Stripe subscription: ${error.message}`);
      throw error;
    }
  }

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

  async createSetupIntent() {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        payment_method_types: ['card'],
      });

      return {
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id,
      };
    } catch (error) {
      this.logger.error(`Error creating setup intent: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to create setup intent: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async createCheckoutSession(
    userId: string,
    planId: string,
    metadata: Record<string, any> = {},
    planPrice?: number,
    interval: 'month' | 'year' = 'month',
  ) {
    try {
      // First check if a customer exists for this user
      const customers = await this.stripe.customers.list({
        limit: 1,
        email: metadata.email as string | undefined,
      });

      let customerId: string;
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        // Create a customer if one doesn't exist
        const customer = await this.stripe.customers.create({
          email: (metadata.email as string) || 'customer@example.com',
          metadata: {
            userId,
          },
        });
        customerId = customer.id;
      }

      // Create or get a product for this plan
      const productName = `Plan ${planId}`;
      let productId: string;

      const products = await this.stripe.products.list({
        limit: 1,
        active: true,
      });

      if (products.data.length > 0 && products.data[0].name === productName) {
        productId = products.data[0].id;
      } else {
        const product = await this.stripe.products.create({
          name: productName,
          description: `Subscription for plan ${planId}`,
          metadata: {
            planId,
          },
        });
        productId = product.id;
      }

      // Create a price for this product with recurring billing
      const amount = planPrice ? Math.round(planPrice * 100) : 1999;
      const price = await this.stripe.prices.create({
        product: productId,
        unit_amount: amount,
        currency: 'usd',
        recurring: {
          interval: interval,
        },
        metadata: {
          planId,
        },
      });

      // Create a subscription with expanded invoice and payment intent
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [
          {
            price: price.id,
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          planId,
          autoRenew: (metadata.autoRenew as string) || 'true',
          isSubscription: 'true',
          ...metadata,
        },
      };

      // Create the subscription
      const subscription =
        await this.stripe.subscriptions.create(subscriptionParams);

      // Get the client secret from the invoice's payment intent
      let clientSecret: string = '';
      let paymentIntentId: string = '';

      // Safe type checking and accessing invoice and payment intent
      if (typeof subscription.latest_invoice === 'string') {
        // Fetch the invoice if it wasn't expanded
        const invoice = await this.stripe.invoices.retrieve(
          subscription.latest_invoice,
          {
            expand: ['payment_intent'],
          },
        );

        // Use type casting for the paymentIntent
        const paymentIntent = (
          invoice as unknown as {
            payment_intent?: Stripe.PaymentIntent | string | null;
          }
        ).payment_intent;
        if (paymentIntent && typeof paymentIntent !== 'string') {
          clientSecret = paymentIntent.client_secret || '';
          paymentIntentId = paymentIntent.id;
        }
      } else if (
        subscription.latest_invoice &&
        typeof subscription.latest_invoice === 'object'
      ) {
        // Access the expanded invoice
        const invoice = subscription.latest_invoice;

        // Use type casting for the paymentIntent
        const paymentIntent = (
          invoice as unknown as {
            payment_intent?: Stripe.PaymentIntent | string | null;
          }
        ).payment_intent;
        if (paymentIntent && typeof paymentIntent !== 'string') {
          clientSecret = paymentIntent.client_secret || '';
          paymentIntentId = paymentIntent.id;
        }
      }

      this.logger.log(
        `Created subscription: ${subscription.id} with billing period: ${interval}`,
      );

      // Use a safer type assertion for current_period_end
      const subscriptionWithPeriodEnd = subscription as unknown as {
        current_period_end?: number;
      };
      const currentPeriodEnd =
        subscriptionWithPeriodEnd.current_period_end ||
        Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

      return {
        subscriptionId: subscription.id,
        clientSecret,
        paymentIntentId,
        interval: interval,
        currentPeriodEnd: new Date(currentPeriodEnd * 1000),
      };
    } catch (error) {
      this.logger.error(`Error creating subscription: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to create subscription: ${error instanceof Error ? error.message : String(error)}`,
      );
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
