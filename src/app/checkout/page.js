"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { CheckCircle, CreditCard, MapPin, Package } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "", // Added email field for guest/notification
    address: "",
    city: "",
    postalCode: "",
    country: "",
    cardNumber: "",
    expiryDate: "",
    cvc: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const sendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      if (res.ok) {
        setShowOtpStep(true);
      } else {
        alert("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      alert("Error sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // First Step: Request OTP
    if (!showOtpStep) {
      await sendOtp();
      return;
    }

    setLoading(true);

    try {
      const formattedItems = cartItems.map(item => ({
        product: item._id || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      if (paymentMethod === 'card') {
        const res = await fetch("/api/checkout_sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: formattedItems,
            shippingAddress: {
              fullName: formData.fullName,
              address: formData.address,
              city: formData.city,
              postalCode: formData.postalCode,
              country: formData.country,
            }
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            window.location.href = data.url; // Redirect to Stripe
          }
        } else {
          const errorData = await res.json();
          alert(`Failed to initialize checkout: ${errorData.error || 'Please try again.'}`);
          setLoading(false);
        }
      } else {
        // Handle Cash on Delivery
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: formattedItems,
            totalAmount: totalPrice,
            shippingAddress: {
              fullName: formData.fullName,
              address: formData.address,
              city: formData.city,
              postalCode: formData.postalCode,
              country: formData.country,
            },
            paymentMethod,
            otp // Send OTP to verification API
          }),
        });

        if (res.ok) {
          setSuccess(true);
          clearCart();
        } else {
          alert("Checkout failed. Please try again.");
        }
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="main-wrapper" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '500px' }}>
          <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 1.5rem' }} />
          <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Order Confirmed!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Thank you for shopping at Kmart. Your digital order is now being processed.
          </p>
          <Link href="/explore">
            <button className="btn-primary">
              <span>Continue Shopping</span>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="main-wrapper" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Package size={64} style={{ color: 'var(--text-secondary)', margin: '0 auto 1.5rem', opacity: 0.5 }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your cart is empty</h2>
          <Link href="/explore">
            <button className="btn-outline">Browse Market</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="main-wrapper" style={{ padding: '6rem 2rem 4rem' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Secure Checkout</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* We will only show one column on small screens, two on large, but let's use flex row/col for simplicity here */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            
            <div style={{ flex: '1 1 500px' }}>
              <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                  <MapPin size={24} className="text-gradient"/> Shipping Address
                </h3>
                <form id="checkout-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Name</label>
                    <input name="fullName" required value={formData.fullName} onChange={handleChange} style={inputStyles} placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email Address</label>
                    <input name="email" type="email" required value={formData.email} onChange={handleChange} style={inputStyles} placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Street Address</label>
                    <input name="address" required value={formData.address} onChange={handleChange} style={inputStyles} placeholder="123 Neon Way" />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>City</label>
                      <input name="city" required value={formData.city} onChange={handleChange} style={inputStyles} placeholder="Cyber City" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Postal Code</label>
                      <input name="postalCode" required value={formData.postalCode} onChange={handleChange} style={inputStyles} placeholder="10101" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Country</label>
                    <input name="country" required value={formData.country} onChange={handleChange} style={inputStyles} placeholder="United States" />
                  </div>
                </form>
              </div>

              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                  <CreditCard size={24} className="text-gradient"/> Payment Details
                </h3>

                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: paymentMethod === 'card' ? 'white' : 'var(--text-secondary)' }}>
                    <input type="radio" name="paymentOption" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                    Credit Card
                  </label>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: paymentMethod === 'cod' ? 'white' : 'var(--text-secondary)' }}>
                    <input type="radio" name="paymentOption" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                    Pay on Delivery
                  </label>
                </div>

                {paymentMethod === 'card' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Card Number</label>
                      <input name="cardNumber" required value={formData.cardNumber} onChange={handleChange} form="checkout-form" style={inputStyles} placeholder="0000 0000 0000 0000" />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Expiry</label>
                        <input name="expiryDate" required value={formData.expiryDate} onChange={handleChange} form="checkout-form" style={inputStyles} placeholder="MM/YY" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>CVC</label>
                        <input name="cvc" type="password" required value={formData.cvc} onChange={handleChange} form="checkout-form" style={inputStyles} placeholder="123" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={16} style={{ color: '#10b981' }}/> You can pay with cash or card to the delivery executive when your order arrives.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ flex: '1 1 350px' }}>
              <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '7rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Order Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {cartItems.map(item => (
                    <div key={item._id || item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '0.25rem', overflow: 'hidden' }}>
                           <img src={item.image} style={{width: '100%', height:'100%', objectFit: 'cover'}} />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>{item.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                    <span style={{ color: '#10b981' }}>Free</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '1.25rem', fontWeight: '700' }}>
                    <span>Total</span>
                    <span className="text-gradient">₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button type="submit" form="checkout-form" disabled={loading} className="btn-primary" style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
                  <span>{loading ? "Processing..." : showOtpStep ? "Confirm Order" : `Pay ₹${totalPrice.toFixed(2)}`}</span>
                </button>

                {showOtpStep && (
                  <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(168,85,247,0.05)', borderRadius: '0.75rem', border: '1px solid rgba(168,85,247,0.2)' }}>
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Enter the code sent to your email</p>
                    <input 
                      type="text" 
                      maxLength="6" 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value)} 
                      style={{ ...inputStyles, textAlign: 'center', letterSpacing: '4px', fontSize: '1.25rem' }} 
                      placeholder="000000"
                    />
                    <button type="button" onClick={() => setShowOtpStep(false)} style={{ width: '100%', marginTop: '0.75rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}>Change Email</button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
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
