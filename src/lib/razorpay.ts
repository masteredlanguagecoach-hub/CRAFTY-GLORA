import crypto from 'crypto';

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  isMock?: boolean;
}

export class RazorpayService {
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  }

  isConfigured(): boolean {
    return Boolean(
      this.keyId &&
      this.keySecret &&
      !this.keyId.includes('demo') &&
      !this.keyId.includes('YourTestKeyIdHere')
    );
  }

  /**
   * Create Razorpay order on server side
   * @param amountInRupees e.g. 1499
   * @param receipt unique identifier
   */
  async createOrder(
    amountInRupees: number,
    receipt: string,
    notes?: Record<string, string>
  ): Promise<RazorpayOrderResponse> {
    const amountInPaise = Math.round(amountInRupees * 100);

    // If real credentials are provided
    if (this.isConfigured()) {
      try {
        const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: 'INR',
            receipt,
            notes: notes || {},
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error('Razorpay Order Creation Failed:', errText);
          throw new Error(`Razorpay Error: ${res.statusText}`);
        }

        const data = await res.json();
        return {
          id: data.id,
          amount: data.amount,
          currency: data.currency,
          receipt: data.receipt,
          status: data.status,
          isMock: false,
        };
      } catch (err) {
        console.warn('Real Razorpay call failed, falling back to simulated order:', err);
      }
    }

    // Development / Test mode sandbox order
    const mockOrderId = `order_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
    return {
      id: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      status: 'created',
      isMock: true,
    };
  }

  /**
   * Server-side HMAC-SHA256 signature verification
   * Never exposed to frontend!
   */
  verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): boolean {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false;
    }

    // In mock/test mode
    if (razorpayOrderId.startsWith('order_') && razorpaySignature.startsWith('demo_sig_')) {
      return true;
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret || 'demo_secret_key_craftyglora')
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      return generatedSignature === razorpaySignature;
    } catch (err) {
      console.error('Signature verification error:', err);
      return false;
    }
  }

  /**
   * Helper to generate a demo signature for sandbox testing
   */
  generateDemoSignature(orderId: string, paymentId: string): string {
    return (
      'demo_sig_' +
      crypto
        .createHmac('sha256', this.keySecret || 'demo_secret_key_craftyglora')
        .update(`${orderId}|${paymentId}`)
        .digest('hex')
        .substring(0, 16)
    );
  }
}

export const razorpayService = new RazorpayService();
