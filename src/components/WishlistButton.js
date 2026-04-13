"use client";

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

export default function WishlistButton({ productId, variant = 'default' }) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

  // We should ideally fetch the wishlist on mount to see if this product is in it
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const res = await fetch('/api/wishlist');
        if (res.ok) {
          const data = await res.json();
          const found = data.wishlist?.products?.some(p => p._id === productId || p === productId);
          setInWishlist(found);
        }
      } catch (err) {
         // ignore
      } finally {
        setLoading(false);
      }
    };
    checkWishlist();
  }, [productId]);

  const toggleWishlist = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (loading) return;
    
    // Optimistic UI update
    setInWishlist(!inWishlist);

    try {
      if (inWishlist) {
         await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' });
      } else {
         await fetch('/api/wishlist', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ productId })
         });
      }
    } catch (error) {
       console.error("Wishlist action failed", error);
       // Revert on failure
       setInWishlist(!inWishlist);
    }
  };

  if (variant === 'mini') {
    return (
      <button 
        onClick={toggleWishlist}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: inWishlist ? '#ef4444' : 'var(--text-secondary)', 
          cursor: 'pointer',
          padding: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'var(--transition)'
        }}
        aria-label="Toggle Wishlist"
      >
        <Heart size={18} fill={inWishlist ? '#ef4444' : 'none'} />
      </button>
    );
  }

  return (
    <button 
      onClick={toggleWishlist}
      className={`btn-outline ${inWishlist ? 'active' : ''}`}
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: inWishlist ? 'rgba(239, 68, 68, 0.1)' : 'transparent', borderColor: inWishlist ? '#ef4444' : 'var(--glass-border)', color: inWishlist ? '#ef4444' : 'white' }}
      aria-label="Toggle Wishlist"
    >
      <Heart size={20} fill={inWishlist ? '#ef4444' : 'none'} color={inWishlist ? '#ef4444' : 'currentColor'} />
      {inWishlist ? 'Wishlisted' : 'Add to Wishlist'}
    </button>
  );
}
