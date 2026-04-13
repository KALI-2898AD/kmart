import { NextResponse } from 'next/server';
import { sendOTPEmail } from '@/lib/email';
import { getAuthUser } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send the email
    await sendOTPEmail(email, otp, "verification");

    // In a real production app, we would store this in Redis or a DB with a TTL.
    // Here, for simplicity, we return it (encrypted or hashed in real apps) 
    // but we'll let the frontend send it back. 
    // WARNING: Sending it back to frontend is insecure for real payments, 
    // but for this project's scope (COD OTP verification), it's a start.
    // IMPROVEMENT: Let's store it in a cookie for 10 mins.
    
    const response = NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully' 
    }, { status: 200 });

    response.cookies.set('order_otp', otp, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Order OTP error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
