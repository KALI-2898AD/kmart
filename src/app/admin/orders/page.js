"use client";

import { useState, useEffect } from 'react';
import { Truck, Package, Clock, CheckCircle, Search, Filter } from 'lucide-react';

const statuses = ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error("Failed to update status");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.userId?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="title-gradient">Manage Orders</h1>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
         <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
               placeholder="Search by Order ID or User Email..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               style={{ ...inputStyles, paddingLeft: '3rem' }} 
            />
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
            <select 
               value={statusFilter} 
               onChange={(e) => setStatusFilter(e.target.value)}
               style={{ ...inputStyles, width: '180px' }}
            >
               <option value="All">All Statuses</option>
               {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
         </div>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>Order ID</th>
                <th style={{ padding: '1rem' }}>Customer</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Total</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                 <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No orders found</td>
                 </tr>
              ) : (
                 filteredOrders.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>{order._id}</td>
                    <td style={{ padding: '1rem' }}>
                       <p style={{ fontWeight: 500 }}>{order.userId?.name || 'Guest'}</p>
                       <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.userId?.email}</p>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>₹{order.totalAmount.toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>
                       <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.75rem', 
                          fontWeight: 'bold',
                          background: getStatusColor(order.status).bg,
                          color: getStatusColor(order.status).text
                       }}>
                          {order.status}
                       </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                       <select 
                          value={order.status} 
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          style={{ ...inputStyles, padding: '0.4rem', fontSize: '0.875rem', width: 'auto' }}
                       >
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </td>
                  </tr>
                 ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

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
