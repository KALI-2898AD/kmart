import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { getAuthUser } from "@/lib/auth";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { items, totalAmount, shippingAddress, paymentMethod, otp } = body;

    // Verify OTP from cookie
    const savedOtp = request.cookies.get('order_otp')?.value;
    if (!savedOtp || savedOtp !== otp) {
      return NextResponse.json({ success: false, error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Get the authenticated user if available
    const user = getAuthUser(request);
    const userId = user ? user.userId : null;

    // Create the order
    const order = await Order.create({
      userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod, // Although not in schema enum, it's good for record or we can add to schema
      paymentStatus: "Pending",
      status: "Pending",
    });

    // Send confirmation email
    // We send it to the email provided in the shipping address if available, 
    // or the authenticated user's email if possible.
    // The frontend sends fullName, but not email in shippingAddress.
    // However, the prompt implies SMTP is for automated order notifications.
    // Let's assume we can at least attempt to send it if we have an email.
    
    // Check if we have an email to send to
    const targetEmail = user?.email || process.env.EMAIL_FROM; // Fallback to admin if no user email
    
    if (targetEmail) {
      try {
        await sendOrderConfirmationEmail(order, targetEmail);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // We don't fail the whole checkout if email fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order._id,
      message: "Order placed successfully" 
    }, { status: 201 });

  } catch (error) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to place order" 
    }, { status: 500 });
  }
}
