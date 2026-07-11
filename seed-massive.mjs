// seed-massive.mjs – populates the product collection
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";

/**
 * Resolve the appropriate MongoDB URI.
 * Mirrors the logic in src/lib/mongodb.js so the script works locally and in production.
 */
function getMongoUri() {
  const env = process.env.NODE_ENV ?? "development";
  const devUri = process.env.MONGODB_URI_DEV ?? "mongodb://127.0.0.1:27017/synra-market";
  const prodUri = process.env.MONGODB_URI_PROD ?? process.env.MONGODB_URI;

  if (env === "production") {
    if (!prodUri) {
      console.warn("[seed] No production MONGODB_URI – falling back to dev URI.");
      return devUri;
    }
    return prodUri;
  }

  // Development / preview
  return devUri;
}

const MONGODB_URI = getMongoUri();

const ProductSchema = new mongoose.Schema({
  name: { type: String },
  description: { type: String },
  price: { type: Number },
  image: { type: String },
  category: { type: String },
  rating: { type: Number, default: 0 },
});
ProductSchema.index(
  { name: "text", description: "text", category: "text" },
  { weights: { name: 5, category: 3, description: 1 }, name: "TextSearchIndex" }
);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function seedMassive() {
  await mongoose.connect(MONGODB_URI);
  console.log("[seed] Connected to MongoDB.");

  const totalItems = 100000;
  const batchSize = 10000;
  const categories = [
    { name: "Electronics", keywords: ["smartphone", "laptop", "keyboard", "headphones", "camera", "smartwatch"] },
    { name: "Clothing", keywords: ["t-shirt", "jacket", "jeans", "hoodie", "sneakers", "hat"] },
    { name: "Books", keywords: ["novel", "biography", "science", "history", "fiction", "textbook"] },
    { name: "Home", keywords: ["lamp", "chair", "sofa", "coffee maker", "pillow", "clock"] },
    { name: "Toys", keywords: ["robot", "board game", "plush", "action figure", "blocks", "puzzle"] },
    { name: "Sports", keywords: ["ball", "racket", "helmet", "weights", "yoga mat", "shoes"] },
  ];

  await Product.deleteMany({});
  console.log("[seed] Cleared existing products.");

  for (let i = 0; i < totalItems; i += batchSize) {
    const products = [];
    for (let j = 0; j < batchSize; j++) {
      const catObj = categories[Math.floor(Math.random() * categories.length)];
      const keyword = catObj.keywords[Math.floor(Math.random() * catObj.keywords.length)];
      const adjective = faker.commerce.productAdjective();
      const material = faker.commerce.productMaterial();
      const productName = `${adjective} ${material} ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`;
      const imageId = Math.floor(Math.random() * 1000) + 1;
      products.push({
        name: productName,
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 50, max: 100000 })),
        image: `https://picsum.photos/seed/${keyword}-${imageId}/400/400`,
        category: catObj.name,
        rating: Math.floor(Math.random() * 5) + 1,
      });
    }
    await Product.insertMany(products);
    console.log(`[seed] Inserted ${i + batchSize} products.`);
  }

  console.log("[seed] Seeding complete.");
  await mongoose.disconnect();
}

seedMassive().catch((err) => {
  console.error("[seed] Error during seeding:", err);
  process.exit(1);
});
