import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    await dbConnect();
    const user = getAuthUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let wishlist = await Wishlist.findOne({ userId: user.userId }).populate('products');
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: user.userId, products: [] });
    }

    return NextResponse.json({ success: true, wishlist }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const user = getAuthUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    let wishlist = await Wishlist.findOne({ userId: user.userId });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: user.userId, products: [productId] });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    // Populate products before returning
    await wishlist.populate('products');

    return NextResponse.json({ success: true, wishlist }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
