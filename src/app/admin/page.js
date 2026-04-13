"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, ShoppingBag, Users, IndianRupee, Package, BarChart2, Loader } from 'lucide-react';

const STATUS_COLORS = {
  Pending:            '#ffc107',
  Processing:         '#2196f3',
  Shipped:            '#9c27b0',
  'Out for Delivery': '#ff5722',
  Delivered:          '#4caf50',
  Cancelled:          '#ef4444',
};

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]     = useState(null);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const d = await res.json();
      setData(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <Loader size={40} style={{ color: 'var(--primary-glow)', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text-secondary)' }}>Loading analytics…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: '2rem', background: 'rgba(239,68,68,0.1)', borderRadius: '1rem', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
      ⚠️ Failed to load analytics: {error}
    </div>
  );

  if (!data) return null;

  const maxRevenue = Math.max(...(data.recentRevenue?.map(d => d.revenue) || [1]));
  const totalStatusOrders = Object.values(data.ordersByStatus || {}).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h1 className="title-gradient">Dashboard</h1>
        <button 
          onClick={fetchData} 
          disabled={refreshing}
          className="btn-outline"
          style={{ padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
        >
          <Loader size={16} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Real-time overview of your store</p>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard icon={<ShoppingBag size={22} />} label="Total Orders"   value={data.totalOrders?.toLocaleString('en-IN') || '0'} color="#a855f7" />
        <StatCard icon={<IndianRupee size={22} />} label="Total Revenue"  value={`₹${(data.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="#10b981" />
        <StatCard icon={<Users size={22} />}        label="Total Customers" value={data.totalCustomers?.toLocaleString('en-IN') || '0'} color="#3b82f6" />
        <StatCard icon={<TrendingUp size={22} />}   label="Avg. Order Value" value={data.totalOrders ? `₹${Math.round(data.totalRevenue / data.totalOrders).toLocaleString('en-IN')}` : '₹0'} color="#f59e0b" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>

        {/* ── 7-Day Revenue Chart (CSS Bars) ─────────────────────── */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={20} style={{ color: 'var(--primary-glow)' }} /> 7-Day Revenue
          </h2>
          {data.recentRevenue?.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px' }}>
              {data.recentRevenue.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', writingMode: 'initial' }}>
                    ₹{Math.round(d.revenue / 1000)}k
                  </span>
                  <div
                    title={`₹${d.revenue.toLocaleString('en-IN')}`}
                    style={{
                      width: '100%',
                      height: `${Math.max(8, (d.revenue / maxRevenue) * 110)}px`,
                      background: 'linear-gradient(to top, var(--primary-glow), var(--accent-color))',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.5s ease',
                    }}
                  />
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    {new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: '2rem' }}>No revenue data yet</p>
          )}
        </div>

        {/* ── Orders by Status ───────────────────────────────────── */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} style={{ color: 'var(--primary-glow)' }} /> Orders by Status
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(data.ordersByStatus || {}).map(([status, count]) => {
              const pct = totalStatusOrders ? Math.round((count / totalStatusOrders) * 100) : 0;
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.875rem' }}>
                    <span style={{ color: STATUS_COLORS[status] || '#fff' }}>{status}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: STATUS_COLORS[status] || '#888', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Top Selling Products & Recent Orders ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} style={{ color: 'var(--primary-glow)' }} /> Top Selling Products
          </h2>
          {data.topProducts?.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Product</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600 }}>Units Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>{p.totalSold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No sales data yet.</p>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} style={{ color: 'var(--primary-glow)' }} /> Recent Orders
          </h2>
          {data.recentOrders?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.recentOrders.map((order) => (
                <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{order.userId?.name || 'Guest'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>₹{order.totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 'bold',
                      background: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status]
                    }}>
                      {order.status}
                    </span>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              <Link href="/admin/orders" style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--primary-glow)', textDecoration: 'none', fontWeight: 600, marginTop: '0.5rem' }}>
                View All Orders →
              </Link>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No orders found.</p>
          )}
        </div>

      </div>
    </div>
  );
}


// ── Reusable Stat Card ──────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
      </div>
      <p className="brand-font" style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#fff' }}>{value}</p>
    </div>
  );
}
