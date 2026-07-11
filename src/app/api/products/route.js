import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = { $text: { $search: search } };
    }

    const totalCount = await Product.countDocuments(query);
    
    const productsQuery = Product.find(query);
    if (search) {
      productsQuery.sort({ score: { $meta: "textScore" } });
    }

    const products = await productsQuery.skip(skip).limit(limit).lean();

    return NextResponse.json({ 
      success: true, 
      data: products, 
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error("Products API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
