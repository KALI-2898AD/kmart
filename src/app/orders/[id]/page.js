"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Calendar } from 'lucide-react';

const statuses = ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered"];

const statusIcons = {
  "Pending": <Clock size={24} />,
  "Processing": <Package size={24} />,
  "Shipped": <Truck size={24} />,
  "Out for Delivery": <Truck size={24} />,
  "Delivered": <CheckCircle size={24} />
};

export default function OrderTrackingPage({ params }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        const data = await res.json();
        if (res.ok) {
          setOrder(data.order);
        } else {
          setError(data.error || 'Failed to fetch order');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.id]);

  if (loading) return (
    <div className="container" style={{ paddingTop: '8rem', textAlign: 'center', minHeight: '80vh' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Loading tracking details...</p>
    </div>
  );

  if (error || !order) return (
    <div className="container" style={{ paddingTop: '8rem', textAlign: 'center', minHeight: '80vh' }}>
      <h1 className="title-gradient">Order Not Found</h1>
      <Link href="/orders" style={{ color: 'var(--primary-glow)', marginTop: '2rem', display: 'inline-block' }}>
        Back to Orders
      </Link>
    </div>
  );

  const currentStatusIndex = statuses.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';
  
  // Calculate estimated delivery (5 days after creation)
  const orderDate = new Date(order.createdAt);
  const estimatedDate = new Date(orderDate);
  estimatedDate.setDate(orderDate.getDate() + 5);

  return (
    <div className="container" style={{ padding: '8rem 2rem 5rem' }}>
      <Link href="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
        <ArrowLeft size={16} /> Back to My Orders
      </Link>

      <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem', border: isCancelled ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
           <div>
              <h1 className="brand-font" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: isCancelled ? '#ef4444' : 'white' }}>
                 {isCancelled ? 'Order Cancelled' : 'Track Your Order'}
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>Order ID: <span style={{ color: 'white' }}>{order._id}</span></p>
           </div>
           {!isCancelled && (
             <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Estimated Delivery</p>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                   <Calendar size={20} className="text-gradient" /> {estimatedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
             </div>
           )}
        </div>

        {/* Horizontal Timeline */}
        {!isCancelled ? (
          <div style={{ position: 'relative', marginTop: '4rem', marginBottom: '4rem' }}>
             {/* Connecting Line */}
             <div style={{ 
                position: 'absolute', 
                top: '25px', 
                left: '5%', 
                right: '5%', 
                height: '4px', 
                background: 'rgba(255,255,255,0.1)', 
                zIndex: 1 
             }}>
                <div style={{ 
                   height: '100%', 
                   width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%`, 
                   background: 'linear-gradient(to right, var(--primary-glow), var(--accent-color))', 
                   transition: 'width 0.5s ease' 
                }}></div>
             </div>

             {/* Steps */}
             <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                {statuses.map((status, index) => {
                   const isCompleted = index <= currentStatusIndex;
                   const isActive = index === currentStatusIndex;
                   
                   return (
                      <div key={status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                         <div style={{ 
                            width: '50px', 
                            height: '50px', 
                            borderRadius: '50%', 
                            background: isCompleted ? 'linear-gradient(135deg, var(--primary-glow), var(--accent-color))' : 'var(--bg-color)', 
                            border: `2px solid ${isCompleted ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: isCompleted ? 'white' : 'var(--text-secondary)',
                            marginBottom: '1rem',
                            boxShadow: isActive ? '0 0 20px var(--primary-glow)' : 'none',
                            transition: 'all 0.3s ease'
                         }}>
                            {statusIcons[status]}
                         </div>
                         <span style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: isCompleted ? '600' : '400',
                            color: isCompleted ? 'white' : 'var(--text-secondary)',
                            textAlign: 'center'
                         }}>
                            {status}
                         </span>
                      </div>
                   );
                })}
             </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '1rem', border: '1px dashed rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
             <p style={{ color: '#ef4444', fontSize: '1.25rem', fontWeight: 600 }}>This order was cancelled on {new Date(order.updatedAt).toLocaleDateString()}</p>
             <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>If you have already paid, a refund will be processed to your original payment method within 5-7 business days.</p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>
         <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Package size={20} className="text-gradient" /> Order Items
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: idx !== order.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                     <div style={{ width: '60px', height: '60px', borderRadius: '0.5rem', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                        <img src={item.product?.image || '/placeholder.png'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     </div>
                     <div style={{ flex: 1 }}>
                        <h4 style={{ marginBottom: '0.25rem' }}>{item.name}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Quantity: {item.quantity}</p>
                     </div>
                     <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
               ))}
            </div>
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700 }}>
               <span>Total Amount</span>
               <span className="text-gradient">₹{order.totalAmount.toFixed(2)}</span>
            </div>
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
               <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={20} className="text-gradient" /> Shipping Details
               </h3>
               <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <p style={{ color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
               </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
               <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={20} className="text-gradient" /> Order Updates
               </h3>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: order.status === 'Cancelled' ? '0' : '1.5rem' }}>
                  Last update on {new Date(order.updatedAt).toLocaleDateString()} at {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
               </p>
               
               {['Pending', 'Processing'].includes(order.status) && (
                  <button 
                    onClick={async () => {
                      if (confirm("Are you sure you want to cancel this order?")) {
                          try {
                            const res = await fetch(`/api/orders/${order._id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'Cancelled' })
                            });
                            if (res.ok) {
                              window.location.reload();
                            } else {
                              const data = await res.json();
                              alert(data.error || "Failed to cancel order");
                            }
                          } catch (err) {
                            alert("An error occurred");
                          }
                      }
                    }}
                    className="btn-outline" 
                    style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    Cancel Order
                  </button>
               )}

               {order.status === 'Cancelled' && (
                  <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', color: '#ef4444', textAlign: 'center', fontWeight: 600 }}>
                     Order Cancelled
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
