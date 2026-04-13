import Link from 'next/link';
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { ArrowLeft, Star } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';
import WishlistButton from '@/components/WishlistButton';
import ReviewSection from '@/components/ReviewSection';

export default async function ProductPage({ params }) {
  await dbConnect();
  
  let product = null;
  try {
    const doc = await Product.findById(params.id);
    if (doc) {
      product = JSON.parse(JSON.stringify(doc));
    }
  } catch (error) {
    console.error("Error fetching product:", error);
  }

  if (!product) {
    return (
      <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
        <h1 className="title-gradient">Product Not Found</h1>
        <Link href="/explore" style={{ color: 'var(--primary-glow)', marginTop: '2rem', display: 'inline-block' }}>
          Return to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '8rem 2rem 5rem' }}>
      <Link href="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem', transition: 'var(--transition)' }} className="hover:text-white">
        <ArrowLeft size={16} /> Back to Market
      </Link>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '4rem', alignItems: 'start' }} className="product-detail-grid">
        
        {/* Left Side: Image */}
        <div className="glass-panel" style={{ padding: '1rem', overflow: 'hidden' }}>
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ width: '100%', borderRadius: '0.5rem', objectFit: 'cover', aspectRatio: '4/3' }} 
          />
        </div>

        {/* Right Side: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span style={{ color: 'var(--primary-glow)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, fontSize: '0.875rem' }}>
              {product.category}
            </span>
            <h1 className="brand-font" style={{ fontSize: '3rem', lineHeight: 1.1, marginTop: '0.5rem', marginBottom: '1rem' }}>
              {product.name}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24' }}>
               <Star size={18} fill="currentColor" />
               <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{product.rating} / 5.0 Rating</span>
            </div>
          </div>

          <div className="brand-font" style={{ fontSize: '2.5rem', fontWeight: 700 }}>
            ₹{product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {product.description}
          </p>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
             <AddToCartButton product={product} />
             <WishlistButton productId={product._id} />
          </div>
          
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
             <p>✔️ High Performance Guarantee</p>
             <p style={{ marginTop: '0.5rem' }}>✔️ Authentic Synra Asset</p>
          </div>

        </div>
      </div>

      {/* Reviews Section */}
      <ReviewSection productId={product._id} />
    </div>
  );
}
