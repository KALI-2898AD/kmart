import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/auth';

export async function GET(req) {
  try {
    await dbConnect();
    
    // Check for admin privileges
    const adminError = requireAdmin(req);
    if (adminError) return adminError;

    const orders = await Order.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
