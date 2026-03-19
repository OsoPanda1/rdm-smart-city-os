import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-10-28.acacia",
});

export class PaymentService {
  async createCheckoutSession(params: {
    userId: string;
    amount: number;
    currency?: string;
    description: string;
  }) {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: params.currency ?? "mxn",
            product_data: { name: params.description },
            unit_amount: Math.round(params.amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: params.userId,
      },
      success_url: process.env.CHECKOUT_SUCCESS_URL!,
      cancel_url: process.env.CHECKOUT_CANCEL_URL!,
    });

    return { id: session.id, url: session.url };
  }
}
