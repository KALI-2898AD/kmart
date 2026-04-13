"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Hexagon } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await register(name, email, password);
    if (res.success) {
      router.push("/");
    } else {
      setError(res.error || "Registration failed");
    }
  };

  return (
    <div className="main-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Hexagon size={48} className="text-gradient" style={{ margin: '0 auto 1rem' }} />
          <h1 className="title-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Join Kmart today</p>
        </div>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '0.875rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', transition: 'all 0.2s' }}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.875rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', transition: 'all 0.2s' }}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.875rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', transition: 'all 0.2s' }}
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
            <span>Sign Up</span>
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link href="/login" className="text-gradient" style={{ fontWeight: '600' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
