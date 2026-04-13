"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: '',
    stock: 0
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products`); // All products are public, but we filter in memory or should have a detail route
        // Actually, let's use the explore API to find this product
        const searchRes = await fetch(`/api/admin/products`); 
        if (searchRes.ok) {
          const data = await searchRes.json();
          const product = data.products.find(p => p._id === id);
          if (product) {
            setFormData({
              name: product.name,
              price: product.price,
              description: product.description,
              image: product.image,
              category: product.category,
              stock: product.stock || 0
            });
          } else {
            setError('Product not found');
          }
        }
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
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
        setError(data.error || 'Failed to update product');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="main-wrapper" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}><p>Loading product...</p></div>;

  return (
    <div>
      <h1 className="title-gradient" style={{ marginBottom: '2rem' }}>Edit Product</h1>
      
      {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Product Name</label>
            <input name="name" required value={formData.name} onChange={handleChange} style={inputStyles} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Price (₹)</label>
                <input name="price" type="number" step="0.01" required value={formData.price} onChange={handleChange} style={inputStyles} />
             </div>
             <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Stock</label>
                <input name="stock" type="number" required value={formData.stock} onChange={handleChange} style={inputStyles} />
             </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Image URL</label>
            <input name="image" required value={formData.image} onChange={handleChange} style={inputStyles} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Category</label>
            <input name="category" required value={formData.category} onChange={handleChange} style={inputStyles} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description</label>
            <textarea name="description" required value={formData.description} onChange={handleChange} rows="6" style={{ ...inputStyles, resize: 'vertical' }}></textarea>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
             <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                <span>{saving ? 'Saving...' : 'Update Product'}</span>
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
