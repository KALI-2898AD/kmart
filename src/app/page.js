import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export const dynamic = 'force-dynamic';

async function getProducts() {
  try {
    await dbConnect();
    const products = await Product.find({}).limit(20).lean();
    return JSON.parse(JSON.stringify(products)) || [];
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();
  const featuredProducts = products.slice(0, 3); // Take first 3 for the homepage

  return (
    <>
      <section className="hero">
        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <h1>
            Discover Next-Gen <br />
            <span className="title-gradient">Hardware</span>
          </h1>
          <p>
            Welcome to Kmart, the premier destination for advanced technology
            and digital assets. Elevate your existence.
          </p>
          <div className="hero-btns">
            <Link href="/explore">
              <button className="btn-primary">
                <span>Explore Market</span>
              </button>
            </Link>
            <button className="btn-outline">View Collections</button>
          </div>
        </div>
      </section>

      <section id="featured" className="products-section">
        <div className="container">
          <h2 className="section-title title-gradient">Featured Arrivals</h2>
          
          {featuredProducts.length > 0 ? (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id || product.name} product={product} />
              ))}
            </div>
          ) : (
            <div className="error-state">
              <p>No products found. Please seed the database.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
