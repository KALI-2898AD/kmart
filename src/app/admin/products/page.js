"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
     if(confirm("Are you sure?")) {
        try {
           const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
           if (res.ok) {
              setProducts(products.filter(p => p._id !== id));
           }
        } catch (err) {
           console.error("Delete failed", err);
        }
     }
  };

  return (
    <div>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="title-gradient">Manage Products</h1>
          <Link href="/admin/products/new">
            <button className="btn-primary">
               <span>Add Product</span>
            </button>
          </Link>
       </div>

       {loading ? (
          <p>Loading products...</p>
       ) : (
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                   <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                      <th style={{ padding: '1rem' }}>Image</th>
                      <th style={{ padding: '1rem' }}>Name</th>
                      <th style={{ padding: '1rem' }}>Price</th>
                      <th style={{ padding: '1rem' }}>Category</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                   </tr>
                </thead>
                <tbody>
                   {products.map(product => (
                      <tr key={product._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                         <td style={{ padding: '1rem' }}>
                            <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                         </td>
                         <td style={{ padding: '1rem', fontWeight: 500 }}>{product.name}</td>
                         <td style={{ padding: '1rem' }}>₹{product.price}</td>
                         <td style={{ padding: '1rem' }}>{product.category}</td>
                         <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <Link href={`/admin/products/edit/${product._id}`}>
                               <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '1rem' }}>Edit</button>
                            </Link>
                            <button 
                               onClick={() => handleDelete(product._id)}
                               style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            >Delete</button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       )}
    </div>
  );
}
