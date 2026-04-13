"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (!cleared) {
      clearCart();
      setCleared(true);
    }
  }, [clearCart, cleared]);

  return (
    <div className="main-wrapper" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '500px' }}>
        <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 1.5rem' }} />
        <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Payment Successful!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Thank you for your purchase. Your payment was processed successfully and your order is complete.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
           <Link href="/orders">
             <button className="btn-outline">View Orders</button>
           </Link>
           <Link href="/explore">
             <button className="btn-primary">
               <span>Continue Shopping</span>
             </button>
           </Link>
        </div>
      </div>
    </div>
  );
}
