import crypto from 'crypto';

type PaymentRequest = {
  amount: number;
  currency: string;
  receipt: string;
  metadata?: Record<string, string>;
};

export async function createPaymentOrder(input: PaymentRequest) {
  const provider = (process.env.PAYMENT_PROVIDER || (process.env.STRIPE_SECRET_KEY ? 'stripe' : 'razorpay')).toLowerCase();

  if (provider === 'stripe') {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is required.');
    const body = new URLSearchParams();
    body.set('amount', String(Math.round(input.amount * 100)));
    body.set('currency', input.currency.toLowerCase());
    body.set('metadata[receipt]', input.receipt);
    for (const [key, value] of Object.entries(input.metadata || {})) {
      body.set(`metadata[${key}]`, value);
    }

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || 'Stripe payment intent failed.');
    return { provider: 'stripe', providerPaymentId: data.id, clientSecret: data.client_secret, raw: data };
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required.');
  }

  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(input.amount * 100),
      currency: input.currency,
      receipt: input.receipt,
      notes: input.metadata || {},
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.description || 'Razorpay order failed.');
  return { provider: 'razorpay', providerPaymentId: data.id, raw: data };
}

export function verifyStripeSignature(payload: string, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return false;
  const timestamp = signature.split(',').find((part) => part.startsWith('t='))?.slice(2);
  const v1 = signature.split(',').find((part) => part.startsWith('v1='))?.slice(3);
  if (!timestamp || !v1) return false;
  const signed = `${timestamp}.${payload}`;
  const digest = crypto.createHmac('sha256', secret).update(signed).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(v1));
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const digest = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}
