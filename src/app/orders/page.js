"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return { bg: 'rgba(255, 193, 7, 0.2)', text: '#ffc107' };
    case 'Processing': return { bg: 'rgba(33, 150, 243, 0.2)', text: '#2196f3' };
    case 'Shipped': return { bg: 'rgba(156, 39, 176, 0.2)', text: '#9c27b0' };
    case 'Out for Delivery': return { bg: 'rgba(255, 87, 34, 0.2)', text: '#ff5722' };
    case 'Delivered': return { bg: 'rgba(76, 175, 80, 0.2)', text: '#4caf50' };
    case 'Cancelled': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' };
    default: return { bg: 'rgba(255, 255, 255, 0.1)', text: '#fff' };
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
     return (
      <div className="container" style={{ paddingTop: '8rem', textAlign: 'center', minHeight: '80vh' }}>
        <h1 className="title-gradient">Your Orders</h1>
        <p style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
     );
  }

  return (
    <div className="container" style={{ paddingTop: '8rem', minHeight: '80vh' }}>
      <h1 className="title-gradient" style={{ marginBottom: '2rem' }}>Your Orders</h1>
      
      {orders.length === 0 ? (
         <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You have not placed any orders yet.</p>
            <Link href="/explore">
               <button className="btn-primary"><span>Explore Market</span></button>
            </Link>
         </div>
      ) : (
         <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {orders.map((order) => (
               <div key={order._id} className="glass-panel" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                     <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Order Placed</p>
                        <p style={{ fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                     </div>
                     <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total</p>
                        <p style={{ fontWeight: 600 }}>₹{order.totalAmount.toFixed(2)}</p>
                     </div>
                     <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Order #</p>
                        <p style={{ fontWeight: 600 }}>{order._id}</p>
                     </div>
                     <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Status</p>
                        <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', background: getStatusColor(order.status).bg, color: getStatusColor(order.status).text }}>
                           {order.status}
                        </div>
                     </div>
                  </div>
                  <div>
                     <h3 style={{ marginBottom: '1rem' }}>Items</h3>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {order.items.map((item, idx) => (
                           <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <p>{item.name} <span style={{ color: 'var(--text-secondary)' }}>x{item.quantity}</span></p>
                              <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', textAlign: 'right' }}>
                     <Link href={`/orders/${order._id}`}>
                        <button className="btn-outline" style={{ padding: '0.5rem 1.25rem' }}>Track Order</button>
                     </Link>
                  </div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
}
