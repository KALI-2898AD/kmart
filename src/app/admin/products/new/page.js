"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: '',
    stock: 10
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock)
        })
      });

      if (res.ok) {
        router.push('/admin/products');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add product');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="title-gradient" style={{ marginBottom: '2rem' }}>Add New Product</h1>
      
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Product Name</label>
            <input name="name" required value={formData.name} onChange={handleChange} style={inputStyles} placeholder="e.g. Synra Cyber Deck" />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Price (₹)</label>
                <input name="price" type="number" step="0.01" required value={formData.price} onChange={handleChange} style={inputStyles} placeholder="99.99" />
             </div>
             <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Stock</label>
                <input name="stock" type="number" required value={formData.stock} onChange={handleChange} style={inputStyles} placeholder="10" />
             </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Image URL</label>
            <input name="image" required value={formData.image} onChange={handleChange} style={inputStyles} placeholder="https://..." />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Category</label>
            <input name="category" required value={formData.category} onChange={handleChange} style={inputStyles} placeholder="e.g. Hardware" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description</label>
            <textarea name="description" required value={formData.description} onChange={handleChange} rows="4" style={{ ...inputStyles, resize: 'vertical' }} placeholder="Product details..."></textarea>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
             <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                <span>{loading ? 'Creating...' : 'Create Product'}</span>
             </button>
             <button type="button" onClick={() => router.back()} className="btn-outline" style={{ flex: 1 }}>
                Cancel
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyles = {
  width: '100%', 
  padding: '0.875rem', 
  borderRadius: '0.5rem', 
  background: 'rgba(255,255,255,0.03)', 
  border: '1px solid var(--glass-border)', 
  color: 'white', 
  outline: 'none', 
  transition: 'all 0.2s'
};
