import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';
import { getAuthUser } from '@/lib/auth';

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const user = getAuthUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: productId } = params;

    let wishlist = await Wishlist.findOne({ userId: user.userId });
    
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    await wishlist.save();

    await wishlist.populate('products');

    return NextResponse.json({ success: true, wishlist }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
