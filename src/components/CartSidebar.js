"use client";

import { X, Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartSidebar() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="cart-overlay" 
        onClick={() => setIsCartOpen(false)}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(5px)",
          zIndex: 100
        }}
      />
      <div 
        className="glass-panel"
        style={{
          position: "fixed",
          top: 0, right: 0, bottom: 0,
          width: "100%", maxWidth: "450px",
          zIndex: 101,
          display: "flex", flexDirection: "column",
          borderRadius: "0",
          borderRight: "none", borderTop: "none", borderBottom: "none"
        }}
      >
        {/* Header */}
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShoppingCart size={24} color="var(--primary-glow)" /> Your Cart
          </h2>
          <button className="icon-btn" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "4rem" }}>
              <ShoppingCart size={48} style={{ margin: "0 auto 1rem", opacity: 0.2 }} />
              <p>Your digital cart is strictly empty.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item._id || item.id} style={{ display: "flex", gap: "1rem" }}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "0.5rem" }} 
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>{item.name}</h4>
                  <div style={{ color: "var(--primary-glow)", fontWeight: "600" }}>
                    ₹{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: "2rem", border: "1px solid var(--glass-border)" }}>
                      <button className="icon-btn" style={{ padding: "0.25rem" }} onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}><Minus size={14}/></button>
                      <span style={{ width: "2rem", textAlign: "center", fontSize: "0.875rem" }}>{item.quantity}</span>
                      <button className="icon-btn" style={{ padding: "0.25rem" }} onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}><Plus size={14}/></button>
                    </div>
                    <button 
                      style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "0.75rem", textDecoration: "underline", cursor: "pointer" }}
                      onClick={() => removeFromCart(item._id || item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div style={{ padding: "1.5rem", borderTop: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: "600" }}>
              <span>Total Origin</span>
              <span className="text-gradient">₹{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <Link href="/checkout" onClick={() => setIsCartOpen(false)} style={{ display: "block", width: "100%" }}>
              <button className="btn-primary" style={{ width: "100%" }}>
                <span>Initialize Checkout</span>
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
