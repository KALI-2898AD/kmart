import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    }
  ],
  totalAmount: {
    type: Number,
    required: [true, "Please provide total amount"],
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending", // Now defaults to Pending for real payments
  },
  stripeSessionId: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
    default: "Pending",
  },
  orderOtp: {
    type: String,
    required: false,
  },
  isOtpVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
