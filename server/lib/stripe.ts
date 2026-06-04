export interface PaymentIntentResult {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
}

export interface PaymentConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  isConfigured: boolean;
}

const config: PaymentConfig = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  isConfigured: false,
};

let stripeClient: any = null;

export function getPaymentConfig(): PaymentConfig {
  return { ...config, isConfigured: Boolean(config.secretKey) };
}

export async function initStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('[Payments] Stripe not configured — using mock mode');
    return;
  }
  try {
    // @ts-expect-error - stripe is optional, loaded at runtime
    const { default: Stripe } = await import('stripe');
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' as any });
    config.publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
    config.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    config.isConfigured = true;
    console.log('[Payments] Stripe initialized');
  } catch {
    console.warn('[Payments] Stripe package not available — using mock mode');
  }
}

function mustGetStripe() {
  if (!stripeClient) throw new Error('Stripe not initialized');
  return stripeClient;
}

export async function createPaymentIntent(amount: number, currency: string = 'usd', metadata: Record<string, string> = {}): Promise<PaymentIntentResult> {
  if (!stripeClient) {
    return {
      id: `pi_mock_${Date.now()}`,
      amount,
      currency: currency.toLowerCase(),
      status: 'requires_payment_method',
      clientSecret: `pi_mock_secret_${Date.now()}`,
    };
  }
  const pi = await mustGetStripe().paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: currency.toLowerCase(),
    metadata,
    automatic_payment_methods: { enabled: true },
  });
  return { id: pi.id, amount: pi.amount / 100, currency: pi.currency, status: pi.status, clientSecret: pi.client_secret || undefined };
}

export async function confirmPaymentIntent(paymentIntentId: string): Promise<PaymentIntentResult> {
  if (!stripeClient) {
    return { id: paymentIntentId, amount: 0, currency: 'usd', status: 'succeeded' };
  }
  const pi = await mustGetStripe().paymentIntents.retrieve(paymentIntentId);
  return { id: pi.id, amount: pi.amount / 100, currency: pi.currency, status: pi.status };
}

export async function cancelPaymentIntent(paymentIntentId: string): Promise<PaymentIntentResult> {
  if (!stripeClient) {
    return { id: paymentIntentId, amount: 0, currency: 'usd', status: 'canceled' };
  }
  const pi = await mustGetStripe().paymentIntents.cancel(paymentIntentId);
  return { id: pi.id, amount: pi.amount / 100, currency: pi.currency, status: pi.status };
}

export async function createRefund(paymentIntentId: string, amount?: number): Promise<{ id: string; status: string; amount: number }> {
  if (!stripeClient) {
    return { id: `ref_mock_${Date.now()}`, status: 'succeeded', amount: amount || 0 };
  }
  const refund = await mustGetStripe().refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
  });
  return { id: refund.id, status: refund.status, amount: refund.amount / 100 };
}

export async function constructWebhookEvent(payload: Buffer | string, signature: string): Promise<any> {
  if (!stripeClient || !config.webhookSecret) {
    const body = typeof payload === 'string' ? JSON.parse(payload) : JSON.parse(payload.toString());
    return body;
  }
  return mustGetStripe().webhooks.constructEvent(payload, signature, config.webhookSecret);
}

export async function retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntentResult | null> {
  if (!stripeClient) return null;
  try {
    const pi = await mustGetStripe().paymentIntents.retrieve(paymentIntentId);
    return { id: pi.id, amount: pi.amount / 100, currency: pi.currency, status: pi.status };
  } catch {
    return null;
  }
}
