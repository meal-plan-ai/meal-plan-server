import {
  Controller,
  Post,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from '../stripe/providers/stripe.service';
import { PaymentStatus, PaymentProvider } from './entities/payment.entity';
import { SubscriptionStatus } from './entities/subscription.entity';
import { PlanInterval } from './entities/subscription-plan.entity';
import { UsersService } from '../users/users.service';
import Stripe from 'stripe';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @Post('stripe')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
    @Body() event: Stripe.Event,
  ) {
    try {
      this.logger.log(`Received Stripe webhook event: ${event.type}`);

      // Verify the webhook signature
      let stripeEvent: Stripe.Event = event;
      const webhookSecret = this.configService.get<string>(
        'STRIPE_WEBHOOK_SECRET',
      );

      if (webhookSecret && signature && req.rawBody) {
        stripeEvent = this.stripeService.constructWebhookEvent(
          req.rawBody,
          signature,
          webhookSecret,
        );
      }

      switch (stripeEvent.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(stripeEvent.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(stripeEvent.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(
            stripeEvent.data.object as any,
          );
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(stripeEvent.data.object as any);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(stripeEvent.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(stripeEvent.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(stripeEvent.data.object);
          break;
        default:
          this.logger.log(`Unhandled event type: ${stripeEvent.type}`);
      }
      return { received: true };
    } catch (error) {
      this.logger.error(`Error handling Stripe webhook: ${error.message}`);
      throw new BadRequestException(`Webhook Error: ${error.message}`);
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(
      `handlePaymentSucceeded paymentIntent: ${JSON.stringify(paymentIntent)}`,
    );
    const { customer, amount, currency, metadata } = paymentIntent;
    this.logger.log(
      `handlePaymentSucceeded metadata: ${JSON.stringify(metadata)}`,
    );

    // Обработка реального платежа с метаданными
    if (metadata.userId) {
      this.logger.log(
        `createPayment handlePaymentSucceeded metadata.userId: ${metadata.userId}`,
      );
      await this.subscriptionsService.createPayment({
        userId: metadata.userId,
        subscriptionId: metadata.subscriptionId,
        amount: amount / 100,
        currency: currency,
        status: PaymentStatus.COMPLETED,
        provider: PaymentProvider.STRIPE,
        externalPaymentId: paymentIntent.id,
        metadata: { stripeCustomerId: customer as string },
      });

      // Проверяем, является ли это платежом для подписки
      const isSubscription = metadata.isSubscription === 'true';
      // Проверяем, нужно ли включить автоматическое продление
      const autoRenew = metadata.autoRenew === 'true';

      if (isSubscription) {
        this.logger.log(
          `Creating subscription for userId: ${metadata.userId}, planId: ${metadata.planId}`,
        );

        if (metadata.subscriptionId) {
          // Если есть ID подписки, обновляем её статус
          this.logger.log(
            `updateSubscription handlePaymentSucceeded metadata.subscriptionId: ${metadata.subscriptionId}`,
          );
          await this.subscriptionsService.updateSubscription(
            metadata.subscriptionId,
            {
              status: SubscriptionStatus.ACTIVE,
            },
          );
        } else if (metadata.planId) {
          this.logger.log(
            `createSubscription handlePaymentSucceeded metadata.planId: ${metadata.planId}`,
          );

          // Создаем новую подписку
          const endDate = new Date();

          // Устанавливаем дату окончания подписки
          try {
            const plan = await this.subscriptionsService.findPlanById(
              metadata.planId,
            );

            if (plan.interval === PlanInterval.MONTHLY) {
              endDate.setMonth(endDate.getMonth() + 1);
            } else if (plan.interval === PlanInterval.ANNUALLY) {
              endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
              endDate.setMonth(endDate.getMonth() + 1); // По умолчанию месяц
            }

            this.logger.log(
              `Creating subscription with endDate: ${endDate}, autoRenew: ${autoRenew}`,
            );

            await this.subscriptionsService.createSubscription({
              userId: metadata.userId,
              planId: metadata.planId,
              status: SubscriptionStatus.ACTIVE,
              startDate: new Date(),
              endDate: endDate,
              autoRenew: autoRenew, // Используем значение из метаданных
            });
          } catch (error) {
            this.logger.error(`Error creating subscription: ${error.message}`);
          }
        }
      } else if (metadata.subscriptionId) {
        this.logger.log(
          `updateSubscription handlePaymentSucceeded metadata.subscriptionId: ${metadata.subscriptionId}`,
        );
        await this.subscriptionsService.updateSubscription(
          metadata.subscriptionId,
          {
            status: SubscriptionStatus.ACTIVE,
          },
        );
      }
    } else {
      this.logger.warn('Missing userId in payment intent metadata');
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log('handlePaymentFailed', paymentIntent);
    const { customer, amount, currency, metadata } = paymentIntent;
    if (metadata && metadata.userId) {
      // Create failed payment record
      await this.subscriptionsService.createPayment({
        userId: metadata.userId,
        subscriptionId: metadata.subscriptionId,
        amount: amount / 100, // Convert from cents
        currency: currency,
        status: PaymentStatus.FAILED,
        provider: PaymentProvider.STRIPE,
        externalPaymentId: paymentIntent.id,
        metadata: {
          stripeCustomerId: customer as string,
          failureMessage: paymentIntent.last_payment_error?.message,
        },
      });
    }
  }

  private async handleInvoicePaymentSucceeded(invoice: any) {
    const { subscription, customer_email } = invoice;
    if (subscription) {
      // Find subscription in our system by external ID
      // This would require adding a method to find by external ID in the service
      await Promise.resolve(); // Add await to satisfy linter
      this.logger.log(
        `Invoice payment succeeded for subscription ${subscription} by ${customer_email}`,
      );
    }
  }

  private async handleInvoicePaymentFailed(invoice: any) {
    const { subscription, customer_email } = invoice;
    if (subscription) {
      // Update subscription status if needed
      await Promise.resolve(); // Add await to satisfy linter
      this.logger.log(
        `Invoice payment failed for subscription ${subscription} by ${customer_email}`,
      );
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    // Этот обработчик вызывается при создании подписки в Stripe
    await Promise.resolve(); // Add await to satisfy linter
    this.logger.log(`Subscription created: ${subscription.id}`);

    // Извлекаем метаданные из подписки
    const { id, customer, metadata } = subscription;

    // В метаданных должен быть planId и userId
    // Если их нет, это может быть подписка, созданная не через наше приложение
    if (!metadata || (!metadata.userId && !metadata.planId)) {
      this.logger.warn(`Subscription ${id} created without required metadata`);
      return;
    }

    try {
      // Проверяем, есть ли уже подписка с таким внешним ID
      const existingSubscription =
        await this.subscriptionsService.findByExternalId(id);

      if (existingSubscription) {
        this.logger.log(
          `Subscription ${id} already exists in our system, updating status`,
        );

        // Обновляем статус существующей подписки
        await this.subscriptionsService.updateSubscription(
          existingSubscription.id,
          {
            status: SubscriptionStatus.ACTIVE,
          },
        );
      } else if (metadata.userId && metadata.planId) {
        this.logger.log(
          `Creating new subscription for user ${metadata.userId} with plan ${metadata.planId}`,
        );

        // Создаем новую подписку
        const startDate = new Date();
        const endDate = new Date(subscription.ended_at ?? 0 * 1000); // Stripe использует Unix timestamp

        await this.subscriptionsService.createSubscription({
          userId: metadata.userId,
          planId: metadata.planId,
          status: SubscriptionStatus.ACTIVE,
          startDate,
          endDate,
          autoRenew: true,
          externalSubscriptionId: id,
        });

        // Создаем запись о платеже
        const amount = subscription.items.data[0]?.price?.unit_amount || 0;
        const currency = subscription.items.data[0]?.price?.currency || 'usd';

        await this.subscriptionsService.createPayment({
          userId: metadata.userId,
          amount: amount / 100, // Конвертируем из центов
          currency,
          status: PaymentStatus.COMPLETED,
          provider: PaymentProvider.STRIPE,
          externalPaymentId: id,
          metadata: {
            stripeCustomerId:
              typeof customer === 'string' ? customer : (customer as any)?.id,
            stripeSubscriptionId: id,
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Error handling subscription created event: ${error.message}`,
      );
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const { id, status, ended_at } = subscription;
    this.logger.log(`Subscription updated: ${id} with status ${status}`);

    try {
      // Находим подписку в нашей системе по внешнему ID
      const ourSubscription =
        await this.subscriptionsService.findByExternalId(id);

      if (!ourSubscription) {
        this.logger.warn(`Subscription ${id} not found in our system`);
        return;
      }

      // Преобразуем статус Stripe в наш статус
      let ourStatus: SubscriptionStatus;

      switch (status) {
        case 'active':
          ourStatus = SubscriptionStatus.ACTIVE;
          break;
        case 'canceled':
          ourStatus = SubscriptionStatus.CANCELLED;
          break;
        case 'unpaid':
          ourStatus = SubscriptionStatus.UNPAID;
          break;
        case 'past_due':
          ourStatus = SubscriptionStatus.PAST_DUE;
          break;
        case 'trialing':
          ourStatus = SubscriptionStatus.TRIAL;
          break;
        case 'incomplete':
          ourStatus = SubscriptionStatus.INCOMPLETE;
          break;
        case 'incomplete_expired':
          ourStatus = SubscriptionStatus.EXPIRED;
          break;
        default:
          ourStatus = SubscriptionStatus.ACTIVE; // По умолчанию активная
      }

      // Обновляем дату окончания и статус
      await this.subscriptionsService.updateSubscription(ourSubscription.id, {
        status: ourStatus,
        endDate: new Date(ended_at ?? 0 * 1000), // Конвертируем из Unix timestamp
      });

      // Если подписка успешно оплачена, создаем запись о платеже
      if (status === 'active' && subscription.latest_invoice) {
        const amount = subscription.items.data[0]?.price?.unit_amount || 0;
        const currency = subscription.items.data[0]?.price?.currency || 'usd';

        await this.subscriptionsService.createPayment({
          userId: ourSubscription.userId,
          subscriptionId: ourSubscription.id,
          amount: amount / 100, // Конвертируем из центов
          currency,
          status: PaymentStatus.COMPLETED,
          provider: PaymentProvider.STRIPE,
          externalPaymentId:
            typeof subscription.latest_invoice === 'string'
              ? subscription.latest_invoice
              : subscription.latest_invoice.id,
          metadata: {
            stripeCustomerId:
              typeof subscription.customer === 'string'
                ? subscription.customer
                : (subscription.customer as any)?.id,
            stripeSubscriptionId: id,
            renewalPayment: true,
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Error handling subscription updated event: ${error.message}`,
      );
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const { id } = subscription;
    this.logger.log(`Subscription deleted: ${id}`);

    try {
      // Находим подписку в нашей системе по внешнему ID
      const ourSubscription =
        await this.subscriptionsService.findByExternalId(id);

      if (!ourSubscription) {
        this.logger.warn(`Subscription ${id} not found in our system`);
        return;
      }

      // Отменяем подписку в нашей системе
      await this.subscriptionsService.updateSubscription(ourSubscription.id, {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
        autoRenew: false,
      });

      this.logger.log(`Subscription ${id} cancelled in our system`);
    } catch (error) {
      this.logger.error(
        `Error handling subscription deleted event: ${error.message}`,
      );
    }
  }
}
