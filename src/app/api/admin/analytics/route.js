import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await dbConnect();
    const adminError = requireAdmin(req);
    if (adminError) return adminError;

    // ── Run all aggregations in parallel ────────────────────────────────────
    const [
      orderStats,
      ordersByStatus,
      topProducts,
      recentRevenue,
      totalCustomers,
      recentOrders,
    ] = await Promise.all([

      // 1. Total orders + total revenue
      Order.aggregate([
        { $match: { paymentStatus: 'Completed' } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
          },
        },
      ]),

      // 2. Orders count by status
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // 3. Top 5 selling products (by units sold)
      Order.aggregate([
        { $match: { paymentStatus: 'Completed' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        { $project: { name: '$_id', totalSold: 1, revenue: 1, _id: 0 } },
      ]),

      // 4. Revenue by day for the last 7 days
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'Completed',
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', revenue: 1, orders: 1, _id: 0 } },
      ]),

      // 5. Unique customers
      User.countDocuments({}),

      // 6. Recent 5 orders
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email'),
    ]);

    const stats = orderStats[0] || { totalOrders: 0, totalRevenue: 0 };

    return NextResponse.json({
      totalOrders: stats.totalOrders,
      totalRevenue: stats.totalRevenue,
      totalCustomers,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topProducts,
      recentRevenue,
      recentOrders,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
