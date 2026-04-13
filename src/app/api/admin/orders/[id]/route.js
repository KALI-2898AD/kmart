import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';
import { sendStatusUpdateEmail } from '@/lib/email';

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    
    const adminError = requireAdmin(req);
    if (adminError) return adminError;

    const { id } = params;
    const { status } = await req.json();

    const allowedStatuses = ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Send status update email (non-blocking — won't fail the request)
    if (order.userId) {
      try {
        const user = await User.findById(order.userId).select('email');
        if (user?.email) {
          sendStatusUpdateEmail(order, user.email).catch(err =>
            console.error('Status email failed:', err.message)
          );
        }
      } catch (emailErr) {
        console.error('Could not fetch user for email:', emailErr.message);
      }
    }

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
