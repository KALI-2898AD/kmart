"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch('/api/wishlist');
        if (res.ok) {
          const data = await res.json();
          setWishlist(data.wishlist?.products || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '8rem', textAlign: 'center', minHeight: '80vh' }}>
        <h1 className="title-gradient">Your Wishlist</h1>
        <p style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '8rem', minHeight: '80vh' }}>
      <h1 className="title-gradient" style={{ marginBottom: '2rem' }}>Your Wishlist</h1>
      
      {wishlist.length === 0 ? (
         <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Your wishlist is empty.</p>
            <Link href="/explore">
               <button className="btn-primary"><span>Explore Market</span></button>
            </Link>
         </div>
      ) : (
         <div className="products-grid">
            {wishlist.map((product) => (
               <ProductCard key={product._id} product={product} />
            ))}
         </div>
      )}
    </div>
  );
}
