import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const adminError = requireAdmin(req);
    if (adminError) return adminError;

    const { id } = params;
    const body = await req.json();

    const product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    
    if (!product) {
       return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
    try {
      await dbConnect();
      const adminError = requireAdmin(req);
      if (adminError) return adminError;
  
      const { id } = params;
  
      const product = await Product.findByIdAndDelete(id);
      
      if (!product) {
         return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
  
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
