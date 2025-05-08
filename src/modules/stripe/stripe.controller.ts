import { Controller, Post, Res, Body } from '@nestjs/common';
import { StripeService } from './providers/stripe.service';
import { Response } from 'express';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

class CreateCheckoutSessionDto {
  userId: string;
  planId: string;
  metadata?: Record<string, any>;
}

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post('create-checkout-session')
  @ApiOperation({ summary: 'Создать сессию оплаты через Stripe' })
  @ApiBody({ type: CreateCheckoutSessionDto })
  async createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
    @Res() res: Response,
  ) {
    try {
      // Получаем информацию о плане подписки, чтобы использовать правильную стоимость
      const plan = await this.subscriptionsService.findPlanById(dto.planId);

      // Создаем PaymentIntent с метаданными пользователя и плана, передавая цену плана
      const paymentIntent = await this.stripeService.createCheckoutSession(
        dto.userId,
        dto.planId,
        dto.metadata,
        plan.price,
      );

      return res.json({
        checkoutSessionClientSecret: paymentIntent.clientSecret,
        planPrice: plan.price,
        planName: plan.name,
        interval: plan.interval,
      });
    } catch (error: unknown) {
      console.error('Error creating payment intent:', error);
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
}
