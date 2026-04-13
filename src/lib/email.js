import nodemailer from 'nodemailer';

// ─── Transporter ────────────────────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
    },
  });
};

// ─── HTML Email Base Template ────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kmart</title>
</head>
<body style="margin:0;padding:0;background:#050505;font-family:'Inter',Arial,sans-serif;color:#ffffff;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;font-weight:800;margin:0;letter-spacing:-0.05em;">
        <span style="color:#ffffff;">K</span>
        <span style="background:linear-gradient(135deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">mart</span>
      </h1>
    </div>

    <!-- Card -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;color:#71717a;font-size:13px;">
      <p style="margin:0;">© 2026 Kmart. All rights reserved.</p>
      <p style="margin:8px 0 0;">This is an automated email, please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

// ─── Order Item Row ──────────────────────────────────────────────────────────
const itemRow = (item) => `
  <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
    <div>
      <p style="margin:0;font-weight:600;color:#ffffff;">${item.name}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#a1a1aa;">Qty: ${item.quantity}</p>
    </div>
    <p style="margin:0;font-weight:700;color:#a855f7;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
  </div>
`;

// ─── Status Badge ────────────────────────────────────────────────────────────
const statusColors = {
  Pending:          { bg: '#ffc107', text: '#000' },
  Processing:       { bg: '#2196f3', text: '#fff' },
  Shipped:          { bg: '#9c27b0', text: '#fff' },
  'Out for Delivery': { bg: '#ff5722', text: '#fff' },
  Delivered:        { bg: '#4caf50', text: '#fff' },
  Cancelled:        { bg: '#ef4444', text: '#fff' },
};

const statusBadge = (status) => {
  const colors = statusColors[status] || { bg: '#666', text: '#fff' };
  return `<span style="background:${colors.bg};color:${colors.text};padding:4px 14px;border-radius:9999px;font-size:13px;font-weight:700;">${status}</span>`;
};

// ─── Send Order Confirmation Email ───────────────────────────────────────────
export async function sendOrderConfirmationEmail(order, userEmail) {
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('Email not configured — skipping confirmation email.');
    return;
  }

  const estimatedDate = new Date(order.createdAt);
  estimatedDate.setDate(estimatedDate.getDate() + 5);
  const formattedDate = estimatedDate.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const itemsHtml = (order.items || []).map(itemRow).join('');

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">
      🎉 Order Confirmed!
    </h2>
    <p style="margin:0 0 24px;color:#a1a1aa;font-size:15px;">
      Thank you for shopping with Kmart. Your order has been placed successfully.
    </p>

    <div style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.2);border-radius:10px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#a1a1aa;">Order ID</p>
      <p style="margin:4px 0 0;font-family:monospace;font-size:14px;color:#ffffff;">${order._id}</p>
    </div>

    <h3 style="margin:0 0 16px;font-size:16px;color:#a1a1aa;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Order Items</h3>
    ${itemsHtml}

    <div style="display:flex;justify-content:space-between;margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
      <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">Total</p>
      <p style="margin:0;font-size:18px;font-weight:800;color:#a855f7;">₹${order.totalAmount.toLocaleString('en-IN')}</p>
    </div>

    <div style="margin-top:24px;padding:16px;background:rgba(76,175,80,0.1);border:1px solid rgba(76,175,80,0.2);border-radius:10px;">
      <p style="margin:0;font-size:13px;color:#a1a1aa;">📦 Estimated Delivery</p>
      <p style="margin:6px 0 0;font-weight:600;color:#4caf50;">${formattedDate}</p>
    </div>

    <div style="margin-top:24px;text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/orders/${order._id}"
        style="display:inline-block;background:linear-gradient(135deg,#a855f7,#ec4899);color:#ffffff;padding:14px 32px;border-radius:9999px;text-decoration:none;font-weight:700;font-size:15px;">
        Track Your Order →
      </a>
    </div>
  `;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Kmart" <${process.env.EMAIL_FROM}>`,
    to: userEmail,
    subject: `✅ Order Confirmed — #${String(order._id).slice(-8).toUpperCase()}`,
    html: baseTemplate(content),
  });

  console.log(`📧 Confirmation email sent to ${userEmail}`);
}

// ─── Send Status Update Email ────────────────────────────────────────────────
export async function sendStatusUpdateEmail(order, userEmail) {
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('Email not configured — skipping status update email.');
    return;
  }

  const statusMessages = {
    Processing:       'Your order is being prepared and will be dispatched soon.',
    Shipped:          'Great news! Your order is on its way to you.',
    'Out for Delivery': 'Your order is out for delivery. Expect it today!',
    Delivered:        'Your order has been delivered. Enjoy your purchase!',
    Cancelled:        'Your order has been cancelled. A refund will be processed within 5-7 business days.',
  };

  const message = statusMessages[order.status] || 'Your order status has been updated.';

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">
      Order Status Updated
    </h2>
    <p style="margin:0 0 24px;color:#a1a1aa;font-size:15px;">
      Your Kmart order has a new status.
    </p>

    <div style="text-align:center;margin:24px 0;">
      ${statusBadge(order.status)}
    </div>

    <p style="text-align:center;color:#a1a1aa;font-size:15px;margin:0 0 24px;">${message}</p>

    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#a1a1aa;">Order ID</p>
      <p style="margin:4px 0 0;font-family:monospace;font-size:14px;color:#ffffff;">${order._id}</p>
      <p style="margin:12px 0 0;font-size:13px;color:#a1a1aa;">Total Amount</p>
      <p style="margin:4px 0 0;font-weight:700;font-size:16px;color:#a855f7;">₹${order.totalAmount.toLocaleString('en-IN')}</p>
    </div>

    <div style="margin-top:24px;text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/orders/${order._id}"
        style="display:inline-block;background:linear-gradient(135deg,#a855f7,#ec4899);color:#ffffff;padding:14px 32px;border-radius:9999px;text-decoration:none;font-weight:700;font-size:15px;">
        View Order Details →
      </a>
    </div>
  `;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Kmart" <${process.env.EMAIL_FROM}>`,
    to: userEmail,
    subject: `📦 Your Order is now: ${order.status} — #${String(order._id).slice(-8).toUpperCase()}`,
    html: baseTemplate(content),
  });

  console.log(`📧 Status update email (${order.status}) sent to ${userEmail}`);
}

// ─── Send OTP Email ────────────────────────────────────────────────────────
export async function sendOTPEmail(email, otp, type = "verification") {
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('Email not configured — skipping OTP email.');
    return;
  }

  const isReset = type === "reset";
  const title = isReset ? "Reset Your Password" : "Verify Your Order";
  const message = isReset 
    ? "You've requested to reset your password. Use the code below to proceed."
    : "Please use the code below to verify and confirm your Kmart order.";

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">
      ${title}
    </h2>
    <p style="margin:0 0 24px;color:#a1a1aa;font-size:15px;">
      ${message}
    </p>

    <div style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.2);border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:13px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.1em;">Your OTP Code</p>
      <h1 style="margin:0;font-size:42px;letter-spacing:8px;font-family:monospace;color:#ffffff;font-weight:800;">${otp}</h1>
    </div>

    <p style="font-size:13px;color:#71717a;text-align:center;margin:0;">
      This code will expire in <strong style="color:#ffffff;">10 minutes</strong>.<br/>
      If you didn't request this, please ignore this email.
    </p>
  `;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Kmart Security" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `🔐 ${otp} is your ${isReset ? 'Security' : 'Order'} Code`,
    html: baseTemplate(content),
  });

  console.log(`📧 OTP email (${type}) sent to ${email}`);
}
