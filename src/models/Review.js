import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide a user ID"],
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Please provide a product ID"],
  },
  rating: {
    type: Number,
    required: [true, "Please provide a rating"],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, "Please provide a comment"],
  },
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
