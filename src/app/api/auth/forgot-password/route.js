import { NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import { sendOTPEmail } from '@/lib/email';

export async function POST(req) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if user exists. Just say "If an account exists..."
      return NextResponse.json({ success: true, message: 'If an account exists, an OTP has been sent.' }, { status: 200 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpires = otpExpires;
    await user.save();

    // Send the email
    await sendOTPEmail(email, otp, "reset");

    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists, an OTP has been sent.' 
    }, { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
