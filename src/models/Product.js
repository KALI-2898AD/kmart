import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name for this product."],
    maxlength: [60, "Name cannot be more than 60 characters"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
  },
  price: {
    type: Number,
    required: [true, "Please provide a price"],
  },
  image: {
    type: String,
    required: [true, "Please provide an image url"],
  },
  category: {
    type: String,
    required: [true, "Please provide a category"],
  },
  rating: {
    type: Number,
    default: 0,
  },
});

// Define text indexes for the advanced search feature
ProductSchema.index({ name: 'text', description: 'text', category: 'text' }, {
  weights: {
    name: 5,
    category: 3,
    description: 1
  },
  name: "TextSearchIndex"
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
