"use client";

import { Hexagon, ShoppingBag, Search, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link href="/" className="brand">
          <Hexagon size={28} strokeWidth={2.5} />
          K<span className="text-gradient">mart</span>
        </Link>
        
        <div className="nav-links">
          <Link href="/explore" className="nav-link">Explore</Link>
          {user && <Link href="/wishlist" className="nav-link">Wishlist</Link>}
          {user && <Link href="/orders" className="nav-link">Orders</Link>}
          {user && user.role === 'admin' && <Link href="/admin" className="nav-link" style={{ color: 'var(--accent-color)' }}>Admin</Link>}
        </div>

        <div className="nav-actions">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const term = e.target.search.value;
              if (term) router.push(`/explore?search=${encodeURIComponent(term)}`);
            }}
            style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '0.25rem 0.5rem' }}
          >
            <Search size={16} style={{ color: 'var(--text-secondary)', marginLeft: '0.25rem' }} />
            <input 
              name="search"
              placeholder="Search items..." 
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '130px', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
            />
          </form>
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'none', '@media (minWidth: 768px)': { display: 'block' } }}>Hey, {user.name.split(' ')[0]}</span>
              <button className="icon-btn" aria-label="Logout" onClick={logout} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="icon-btn" aria-label="Account">
              <User size={20} />
            </Link>
          )}
          
          <button 
            className="icon-btn" 
            aria-label="Cart" 
            onClick={() => setIsCartOpen(true)}
            style={{ position: 'relative' }}
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span style={{ 
                position: 'absolute', top: '-5px', right: '-5px', 
                background: 'var(--accent-color)', color: '#fff', 
                fontSize: '0.65rem', fontWeight: 'bold', width: '18px', height: '18px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' 
              }}>
                {totalItems}
              </span>
            )}
          </button>

        </div>
      </div>
    </nav>
  );
}
