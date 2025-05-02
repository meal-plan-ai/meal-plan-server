import { Controller, Post, Res } from '@nestjs/common';
import { StripeService } from './providers/stripe.service';
import { Response } from 'express';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(@Res() res: Response) {
    try {
      // Создаем PaymentIntent
      const paymentIntent = await this.stripeService.createCheckoutSession();

      // Возвращаем client_secret на фронтенд
      return res.json({
        checkoutSessionClientSecret: paymentIntent.clientSecret,
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
