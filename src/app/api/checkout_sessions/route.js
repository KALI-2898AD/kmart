import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    await dbConnect();
    const user = getAuthUser(req);
    const { items, shippingAddress } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Build Stripe line items
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'inr',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Create order with Pending status — webhook confirms it after payment
    const order = await Order.create({
      userId: user ? user.userId : null,
      items: items.map(item => ({
        product: item.product || item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      shippingAddress,
      status: 'Pending',
      paymentStatus: 'Pending',
    });

    const host = req.headers.get('host');
    const protocol = host.includes('localhost') ? 'http' : 'https';

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        // orderId in metadata so the webhook can find and confirm this order
        metadata: {
          orderId: order._id.toString(),
          userId: user?.userId || 'guest',
        },
        customer_email: user?.email || undefined,
        success_url: `${protocol}://${host}/checkout/success?order_id=${order._id}`,
        cancel_url: `${protocol}://${host}/checkout/cancel?order_id=${order._id}`,
      });

      // Store session ID for idempotency check in webhook
      order.stripeSessionId = session.id;
      await order.save();

      return NextResponse.json({ success: true, url: session.url }, { status: 200 });
    } catch (stripeError) {
      // Clean up pending order if Stripe session fails
      await Order.findByIdAndDelete(order._id);
      console.error('Stripe Session Error:', stripeError);
      return NextResponse.json({ error: `Stripe Error: ${stripeError.message}` }, { status: 400 });
    }
  } catch (error) {
    console.error('Checkout System Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
