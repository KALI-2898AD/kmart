import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// IMPORTANT: Raw body is required for Stripe signature verification
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const body = await req.text(); // Raw body — do NOT use req.json()
    const signature = req.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      console.error('Missing Stripe signature or webhook secret');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // ── Verify Stripe signature ──────────────────────────────────────────────
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`❌ Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // ── Handle events ────────────────────────────────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      await dbConnect();

      // ── Idempotency: prevent duplicate processing ─────────────────────────
      const existingOrder = await Order.findOne({ stripeSessionId: session.id });
      if (existingOrder && existingOrder.paymentStatus === 'Completed') {
        console.log(`⚠️ Order already processed for session: ${session.id}`);
        return NextResponse.json({ received: true, note: 'Already processed' });
      }

      // ── Find the pending order and confirm it ─────────────────────────────
      const orderId = session.metadata?.orderId;
      if (!orderId) {
        console.error('No orderId in Stripe session metadata');
        return NextResponse.json({ error: 'No orderId in metadata' }, { status: 400 });
      }

      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'Completed',
          status: 'Processing',           // Move from Pending → Processing
          stripeSessionId: session.id,
        },
        { new: true }
      ).populate('userId', 'name email');

      if (!order) {
        console.error(`Order not found: ${orderId}`);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      console.log(`✅ Order ${orderId} confirmed via Stripe webhook`);

      // ── Send confirmation email ───────────────────────────────────────────
      const userEmail = order.userId?.email || session.customer_details?.email;
      if (userEmail) {
        try {
          const { sendOrderConfirmationEmail } = await import('@/lib/email');
          await sendOrderConfirmationEmail(order, userEmail);
        } catch (emailErr) {
          // Don't fail the webhook if email fails — just log it
          console.error('Email send failed:', emailErr.message);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
