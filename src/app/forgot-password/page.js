"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setMessage("OTP has been sent to your email.");
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.error || "Reset failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem 2rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {step === 1 && <Mail size={48} className="text-gradient" style={{ margin: '0 auto 1.5rem' }} />}
          {step === 2 && <ShieldCheck size={48} className="text-gradient" style={{ margin: '0 auto 1.5rem' }} />}
          {step === 3 && <KeyRound size={48} className="text-gradient" style={{ margin: '0 auto 1.5rem' }} />}
          
          <h1 className="title-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {step === 1 ? "Forgot Password?" : step === 2 ? "Verify OTP" : "Reset Password"}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {step === 1 ? "Enter your email to receive an OTP code." : 
             step === 2 ? "Check your email for the recovery code." : 
             "Create a strong new password for your account."}
          </p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}
        {message && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.3)' }}>{message}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyles} placeholder="you@example.com" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
              <span>{loading ? "Sending..." : "Send OTP"}</span>
            </button>
          </form>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Enter 6-digit OTP</label>
              <input type="text" maxLength="6" required value={otp} onChange={(e) => setOtp(e.target.value)} style={{ ...inputStyles, textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem' }} placeholder="000000" />
            </div>
            <button onClick={() => setStep(3)} disabled={otp.length !== 6} className="btn-primary" style={{ width: '100%' }}>
              <span>Verify & Continue</span>
            </button>
            <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem' }}>Back to Email</button>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>New Password</label>
              <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyles} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
              <span>{loading ? "Updating..." : "Reset Password"}</span>
            </button>
          </form>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Remembered password? <Link href="/login" className="text-gradient" style={{ fontWeight: '600' }}>Log in</Link>
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
