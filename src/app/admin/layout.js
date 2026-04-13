"use client";

import Link from 'next/link';

export default function AdminLayout({ children }) {
  return (
    <div className="container" style={{ paddingTop: '8rem', minHeight: '80vh', display: 'flex', gap: '2rem' }}>
      <aside style={{ width: '250px', flexShrink: 0 }} className="glass-panel">
         <div style={{ padding: '2rem' }}>
            <h2 className="brand-font" style={{ marginBottom: '2rem' }}>Admin Panel</h2>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <Link href="/admin" className="nav-link" style={{ display: 'block', padding: '0.5rem 0' }}>Dashboard</Link>
               <Link href="/admin/products" className="nav-link" style={{ display: 'block', padding: '0.5rem 0' }}>Manage Products</Link>
               <Link href="/admin/orders" className="nav-link" style={{ display: 'block', padding: '0.5rem 0' }}>Manage Orders</Link>
               <Link href="/explore" className="nav-link" style={{ display: 'block', padding: '0.5rem 0', marginTop: '2rem', color: 'var(--primary-glow)' }}>Back to Store</Link>
            </nav>
         </div>
      </aside>
      <main style={{ flex: 1 }}>
         {children}
      </main>
    </div>
  );
}
