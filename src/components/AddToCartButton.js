"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button 
      className="btn-primary" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        flex: 1, 
        justifyContent: 'center',
        background: added ? '#10b981' : 'linear-gradient(135deg, var(--primary-glow), var(--accent-color))',
        transition: 'all 0.3s'
      }}
      onClick={handleAdd}
      disabled={added}
    >
      {added ? <Check size={20} /> : <ShoppingCart size={20} />}
      <span>{added ? 'Added to Cart' : 'Add to Digital Cart'}</span>
    </button>
  );
}
