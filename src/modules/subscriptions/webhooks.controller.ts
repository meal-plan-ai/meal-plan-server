import {
  Controller,
  // Post,
  // Body,
  // Headers,
  // RawBodyRequest,
  // Req,
  // BadRequestException,
  // Logger,
} from '@nestjs/common';
import {
  ApiTags,
  // ApiOperation
} from '@nestjs/swagger';
// import { ConfigService } from '@nestjs/config';
// import { Request } from 'express';
// import { SubscriptionsService } from './subscriptions.service';
// import { StripeService } from '../stripe/providers/stripe.service';
// import { PaymentStatus, PaymentProvider } from './entities/payment.entity';
// import { SubscriptionStatus } from './entities/subscription.entity';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  // private readonly logger = new Logger(WebhooksController.name);
  // constructor(
  //   private readonly subscriptionsService: SubscriptionsService,
  //   private readonly stripeService: StripeService,
  //   private readonly configService: ConfigService,
  // ) {}
  // @Post('stripe')
  // @ApiOperation({ summary: 'Handle Stripe webhook events' })
  // async handleStripeWebhook(
  //   @Req() req: RawBodyRequest<Request>,
  //   @Headers('stripe-signature') signature: string,
  //   @Body() event: Stripe.Event,
  // ) {
  //   try {
  //     this.logger.log(`Received Stripe webhook event: ${event.type}`);
  //     // For signature verification to work, STRIPE_WEBHOOK_SECRET needs to be configured in .env
  //     // and raw body parsing needs to be set up in main.ts
  //     // For now, we're using the event directly for testing
  //     const stripeEvent = event;
  //     // After setting up proper raw body handling, uncomment:
  //     /*
  //     const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
  //     if (webhookSecret && signature && req.rawBody) {
  //       stripeEvent = this.stripeService.constructWebhookEvent(
  //         req.rawBody,
  //         signature,
  //         webhookSecret,
  //       );
  //     }
  //     */
  //     switch (stripeEvent.type) {
  //       case 'payment_intent.succeeded':
  //         await this.handlePaymentSucceeded(stripeEvent.data.object);
  //         break;
  //       case 'payment_intent.payment_failed':
  //         await this.handlePaymentFailed(stripeEvent.data.object);
  //         break;
  //       case 'invoice.payment_succeeded':
  //         await this.handleInvoicePaymentSucceeded(stripeEvent.data.object);
  //         break;
  //       case 'invoice.payment_failed':
  //         await this.handleInvoicePaymentFailed(stripeEvent.data.object);
  //         break;
  //       case 'customer.subscription.created':
  //         await this.handleSubscriptionCreated(stripeEvent.data.object);
  //         break;
  //       case 'customer.subscription.updated':
  //         await this.handleSubscriptionUpdated(stripeEvent.data.object);
  //         break;
  //       case 'customer.subscription.deleted':
  //         await this.handleSubscriptionDeleted(stripeEvent.data.object);
  //         break;
  //       default:
  //         this.logger.log(`Unhandled event type: ${stripeEvent.type}`);
  //     }
  //     return { received: true };
  //   } catch (error) {
  //     this.logger.error(`Error handling Stripe webhook: ${error.message}`);
  //     throw new BadRequestException(`Webhook Error: ${error.message}`);
  //   }
  // }
  // private async handlePaymentSucceeded(paymentIntent: any) {
  //   const { customer, amount, currency, metadata } = paymentIntent;
  //   if (metadata && metadata.userId) {
  //     // Create payment record
  //     await this.subscriptionsService.createPayment({
  //       userId: metadata.userId,
  //       subscriptionId: metadata.subscriptionId,
  //       amount: amount / 100, // Convert from cents
  //       currency,
  //       status: PaymentStatus.COMPLETED,
  //       provider: PaymentProvider.STRIPE,
  //       externalPaymentId: paymentIntent.id,
  //       metadata: { stripCustomerId: customer },
  //     });
  //   }
  // }
  // private async handlePaymentFailed(paymentIntent: any) {
  //   const { customer, amount, currency, metadata } = paymentIntent;
  //   if (metadata && metadata.userId) {
  //     // Create failed payment record
  //     await this.subscriptionsService.createPayment({
  //       userId: metadata.userId,
  //       subscriptionId: metadata.subscriptionId,
  //       amount: amount / 100, // Convert from cents
  //       currency,
  //       status: PaymentStatus.FAILED,
  //       provider: PaymentProvider.STRIPE,
  //       externalPaymentId: paymentIntent.id,
  //       metadata: {
  //         stripeCustomerId: customer,
  //         failureMessage: paymentIntent.last_payment_error?.message,
  //       },
  //     });
  //   }
  // }
  // private async handleInvoicePaymentSucceeded(invoice: any) {
  //   const { subscription, customer_email, total } = invoice;
  //   if (subscription) {
  //     // Find subscription in our system by external ID
  //     // This would require adding a method to find by external ID in the service
  //     this.logger.log(
  //       `Invoice payment succeeded for subscription ${subscription} by ${customer_email}`,
  //     );
  //   }
  // }
  // private async handleInvoicePaymentFailed(invoice: any) {
  //   const { subscription, customer_email } = invoice;
  //   if (subscription) {
  //     // Update subscription status if needed
  //     this.logger.log(
  //       `Invoice payment failed for subscription ${subscription} by ${customer_email}`,
  //     );
  //   }
  // }
  // private async handleSubscriptionCreated(subscription: any) {
  //   // This might be redundant as we usually create the subscription in our system first
  //   this.logger.log(`Subscription created: ${subscription.id}`);
  // }
  // private async handleSubscriptionUpdated(subscription: any) {
  //   const { id, status, metadata } = subscription;
  //   if (metadata && metadata.subscriptionId) {
  //     const ourSubscriptionId = metadata.subscriptionId;
  //     let ourStatus;
  //     // Map Stripe status to our status
  //     switch (status) {
  //       case 'active':
  //         ourStatus = SubscriptionStatus.ACTIVE;
  //         break;
  //       case 'canceled':
  //         ourStatus = SubscriptionStatus.CANCELLED;
  //         break;
  //       case 'trialing':
  //         ourStatus = SubscriptionStatus.TRIAL;
  //         break;
  //       default:
  //         ourStatus = null;
  //     }
  //     if (ourStatus) {
  //       await this.subscriptionsService.updateSubscription(ourSubscriptionId, {
  //         status: ourStatus,
  //         externalSubscriptionId: id,
  //       });
  //     }
  //   }
  // }
  // private async handleSubscriptionDeleted(subscription: any) {
  //   const { id, metadata } = subscription;
  //   if (metadata && metadata.subscriptionId) {
  //     await this.subscriptionsService.cancelSubscription(
  //       metadata.subscriptionId,
  //     );
  //     this.logger.log(`Subscription ${id} cancelled`);
  //   }
  // }
}
