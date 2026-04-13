import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_for_dev";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = verify(token.value, JWT_SECRET);
    
    await dbConnect();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
