import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Inject,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import {
  SubscriptionPlan,
  PlanInterval,
} from './entities/subscription-plan.entity';
import {
  Payment,
  PaymentStatus,
  PaymentProvider,
} from './entities/payment.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import { StripeService } from '../stripe/providers/stripe.service';
import { UsersService } from '../users/users.service';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private stripeService: StripeService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async findActiveSubscriptionByUserId(
    userId: string,
  ): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: [
        { userId, status: SubscriptionStatus.ACTIVE },
        { userId, status: SubscriptionStatus.TRIAL },
      ],
      relations: ['plan'],
    });
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const { hasActiveSubscription } =
      await this.checkSubscriptionStatus(userId);
    return hasActiveSubscription;
  }

  async getUserSubscriptionStatus(
    userId: string,
  ): Promise<Subscription | null> {
    return this.findActiveSubscriptionByUserId(userId);
  }

  async createSubscription(
    createDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const plan = await this.findPlanById(createDto.planId);
    const newSubscription = this.subscriptionRepository.create({
      userId: createDto.userId,
      planId: plan.id,
      status: createDto.status || SubscriptionStatus.TRIAL,
      startDate: createDto.startDate || new Date(),
      endDate: createDto.endDate,
      autoRenew: createDto.autoRenew || false,
      externalSubscriptionId: createDto.externalSubscriptionId,
    });
    return this.subscriptionRepository.save(newSubscription);
  }

  async updateSubscription(
    id: string,
    updateDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    Object.assign(subscription, updateDto);
    return this.subscriptionRepository.save(subscription);
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    subscription.autoRenew = false;

    return this.subscriptionRepository.save(subscription);
  }

  async checkSubscriptionStatus(
    userId: string,
  ): Promise<{ hasActiveSubscription: boolean; subscription?: Subscription }> {
    const subscription = await this.findActiveSubscriptionByUserId(userId);

    if (!subscription) {
      return { hasActiveSubscription: false };
    }

    if (
      new Date() > subscription.endDate &&
      subscription.status !== SubscriptionStatus.EXPIRED
    ) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionRepository.save(subscription);
      return { hasActiveSubscription: false, subscription };
    }
    return {
      hasActiveSubscription:
        subscription.status === SubscriptionStatus.ACTIVE ||
        subscription.status === SubscriptionStatus.TRIAL,
      subscription,
    };
  }

  async findAllPlans(): Promise<SubscriptionPlan[]> {
    return this.planRepository.find({ where: { isActive: true } });
  }

  async findPlanById(id: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID ${id} not found`);
    }
    return plan;
  }

  async createPayment(createDto: CreatePaymentDto): Promise<Payment> {
    const newPayment = this.paymentRepository.create({
      userId: createDto.userId,
      subscriptionId: createDto.subscriptionId,
      amount: createDto.amount,
      currency: createDto.currency,
      status: createDto.status || PaymentStatus.PENDING,
      provider: createDto.provider,
      externalPaymentId: createDto.externalPaymentId,
      metadata: createDto.metadata,
    });

    return this.paymentRepository.save(newPayment);
  }

  async getUserPaymentHistory(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async purchaseSubscription(
    userId: string,
    purchaseDto: PurchaseSubscriptionDto,
  ): Promise<{ subscription: Subscription; payment: Payment }> {
    try {
      const plan = await this.findPlanById(purchaseDto.planId);

      const user = await this.usersService.findOne(userId);

      const startDate = new Date();
      const endDate = new Date(startDate);

      if (plan.interval === PlanInterval.MONTHLY) {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (plan.interval === PlanInterval.ANNUALLY) {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      const subscription = await this.createSubscription({
        userId,
        planId: plan.id,
        status: SubscriptionStatus.TRIAL,
        startDate,
        endDate,
        autoRenew: purchaseDto.autoRenew || false,
      });

      let customerId = '';

      if (user.stripeCustomerId) {
        customerId = String(user.stripeCustomerId);
      } else {
        const stripeCustomerId = await this.stripeService.createCustomer(user);
        await this.usersService.update(user.id, { stripeCustomerId });
        customerId = stripeCustomerId;
      }

      const paymentIntent = await this.stripeService.createPaymentIntent(
        plan.price,
        purchaseDto.currency || 'USD',
        customerId,
        {
          subscriptionId: subscription.id,
          planId: plan.id,
          ...purchaseDto.metadata,
        } as Stripe.MetadataParam,
      );

      const payment = await this.createPayment({
        userId,
        subscriptionId: subscription.id,
        amount: plan.price,
        currency: purchaseDto.currency || 'USD',
        status: PaymentStatus.PENDING,
        provider: purchaseDto.provider || PaymentProvider.STRIPE,
        externalPaymentId: paymentIntent.paymentIntentId,
        metadata: {
          ...purchaseDto.metadata,
          stripeCustomerId: customerId,
          clientSecret: paymentIntent.clientSecret,
        },
      });

      await this.updateSubscription(subscription.id, {
        status: SubscriptionStatus.ACTIVE,
      });

      await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.COMPLETED,
      });

      subscription.status = SubscriptionStatus.ACTIVE;
      payment.status = PaymentStatus.COMPLETED;

      return { subscription, payment };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Subscription purchase failed: ${errorMessage}`,
      );
    }
  }
}
