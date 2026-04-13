"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="main-wrapper" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '500px' }}>
        <XCircle size={64} style={{ color: '#ef4444', margin: '0 auto 1.5rem' }} />
        <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Payment Cancelled</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Your checkout session was cancelled. No charges were made to your card.
        </p>
        <Link href="/checkout">
          <button className="btn-primary">
            <span>Return to Checkout</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
