import { Provider } from '@nestjs/common';
import Stripe from 'stripe';

export const STRIPE_CLIENT = 'STRIPE_CLIENT';

// Mock Stripe client for testing
// const mockStripeClient = {
//   customers: {
//     create: jest
//       .fn()
//       .mockImplementation(() => Promise.resolve({ id: 'mock_customer_id' })),
//   },
//   products: {
//     create: jest
//       .fn()
//       .mockImplementation(() => Promise.resolve({ id: 'mock_product_id' })),
//   },
//   prices: {
//     create: jest
//       .fn()
//       .mockImplementation(() => Promise.resolve({ id: 'mock_price_id' })),
//   },
//   subscriptions: {
//     create: jest.fn().mockImplementation(() =>
//       Promise.resolve({
//         id: 'mock_subscription_id',
//         status: 'active',
//         current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
//       }),
//     ),
//     cancel: jest
//       .fn()
//       .mockImplementation(() =>
//         Promise.resolve({ id: 'mock_subscription_id', status: 'canceled' }),
//       ),
//     update: jest
//       .fn()
//       .mockImplementation(() =>
//         Promise.resolve({ id: 'mock_subscription_id', status: 'active' }),
//       ),
//   },
//   paymentIntents: {
//     create: jest.fn().mockImplementation(() =>
//       Promise.resolve({
//         id: 'mock_payment_intent_id',
//         client_secret: 'mock_client_secret',
//         status: 'requires_payment_method',
//       }),
//     ),
//   },
//   webhooks: {
//     constructEvent: jest
//       .fn()
//       .mockImplementation(() => ({ type: 'mock.event', data: { object: {} } })),
//   },
// };

export const StripeProvider: Provider = {
  provide: STRIPE_CLIENT,
  useFactory: () => {
    // If we're in a test environment and the TEST_USE_MOCK_STRIPE flag is set, use the mock
    if (process.env.NODE_ENV === 'test') {
      console.log('Using mock Stripe client for tests');
      // return mockStripeClient;
    }

    const apiKey = process.env.NEXT_PUBLIC_STRIPE_SK_TEST;
    console.log('NEXT_PUBLIC_STRIPE_SK_TEST', apiKey);
    if (!apiKey) {
      throw new Error(
        'NEXT_PUBLIC_STRIPE_SK_TEST environment variable not set',
      );
    }

    return new Stripe(apiKey, {
      apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
    });
  },
  inject: [],
};
