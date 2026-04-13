"use client";

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import WishlistButton from './WishlistButton';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault(); // prevent navigation to detail page
    addToCart(product);
  };

  return (
    <Link href={`/product/${product._id || product.id}`} className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', top: '0.875rem', right: '0.875rem', zIndex: 10 }}>
           <WishlistButton productId={product._id} variant="mini" />
        </div>
      </div>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h3 className="product-title brand-font">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <div className="product-price">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          <button className="add-btn" aria-label="Add to cart" onClick={handleAddToCart}>
            <Plus size={20} />
          </button>
        </div>
      </div>
    </Link>
  );
}
