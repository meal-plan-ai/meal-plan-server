import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Subscription } from './entities/subscription.entity';
import { Payment } from './entities/payment.entity';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { ResponseSubscriptionDto } from './dto/subscription.dto';
import { RequestWithUser } from '../users/users.controller';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user subscription status' })
  @ApiResponse({ status: 200, description: 'Returns subscription status' })
  async getSubscriptionStatus(
    @Request() req: RequestWithUser,
  ): Promise<ResponseSubscriptionDto> {
    return await this.subscriptionsService.checkSubscriptionStatus(req.user.id);
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if user has active subscription' })
  @ApiResponse({
    status: 200,
    description: 'Returns whether user has active subscription',
  })
  async hasActiveSubscription(
    @Request() req: RequestWithUser,
  ): Promise<{ active: boolean }> {
    const active = await this.subscriptionsService.hasActiveSubscription(
      req.user.id,
    );
    return { active };
  }

  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscription status for current user' })
  @ApiResponse({ status: 200, description: 'Returns subscription or null' })
  async getUserSubscription(@Request() req: RequestWithUser) {
    // Only allow users to get their own subscription
    const userId = req.user.id;
    const subscription =
      await this.subscriptionsService.getUserSubscriptionStatus(userId);
    return { subscription };
  }

  @Get('payments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment history for current user' })
  @ApiResponse({ status: 200, description: 'Returns payment history' })
  async getPaymentHistory(@Request() req: RequestWithUser): Promise<Payment[]> {
    return this.subscriptionsService.getUserPaymentHistory(req.user.id);
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe user to a plan' })
  @ApiResponse({ status: 201, description: 'Subscription created' })
  async createSubscription(
    @Request() req: RequestWithUser,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    // Ensure user can only create subscription for themselves

    createSubscriptionDto.userId = req.user.id;
    return this.subscriptionsService.createSubscription(createSubscriptionDto);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled' })
  async cancelSubscription(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<Subscription> {
    const subscription =
      await this.subscriptionsService.findActiveSubscriptionByUserId(
        req.user.id,
      );

    if (!subscription || subscription.id !== id) {
      throw new NotFoundException('Subscription not found');
    }

    return this.subscriptionsService.cancelSubscription(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update subscription' })
  @ApiResponse({ status: 200, description: 'Subscription updated' })
  async updateSubscription(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription =
      await this.subscriptionsService.findActiveSubscriptionByUserId(
        req.user.id,
      );

    if (!subscription || subscription.id !== id) {
      throw new NotFoundException('Subscription not found');
    }

    return this.subscriptionsService.updateSubscription(
      id,
      updateSubscriptionDto,
    );
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase a subscription with payment processing' })
  @ApiResponse({
    status: 201,
    description: 'Subscription purchased successfully',
  })
  async purchaseSubscription(
    @Request() req: RequestWithUser,
    @Body() purchaseDto: PurchaseSubscriptionDto,
  ): Promise<{ subscription: Subscription; payment: Payment }> {
    console.log('purchaseDto', purchaseDto);
    return this.subscriptionsService.purchaseSubscription(
      req.user.id,
      purchaseDto,
    );
  }
  @Get('plans')
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiResponse({ status: 200, description: 'Returns all subscription plans' })
  async getSubscriptionPlans() {
    return this.subscriptionsService.findAllPlans();
  }

  @Get('stripe-config')
  @ApiOperation({ summary: 'Get Stripe configuration for frontend' })
  @ApiResponse({
    status: 200,
    description: 'Returns Stripe public key and config',
  })
  getStripeConfig() {
    return {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    };
  }
}
