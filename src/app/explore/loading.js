export default function Loading() {
  return (
    <div className="container" style={{ padding: "8rem 2rem 5rem" }}>
      <div style={{ height: '40px', width: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}></div>
      <div style={{ height: '20px', width: '500px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', marginBottom: '3rem', animation: 'pulse 1.5s infinite' }}></div>
      
      <div className="products-grid">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="glass-panel" style={{ height: '450px', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0', overflow: 'hidden' }}>
            <div style={{ height: '250px', width: '100%', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }}></div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               <div style={{ height: '14px', width: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
               <div style={{ height: '24px', width: '80%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
               <div style={{ height: '16px', width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
               <div style={{ height: '32px', width: '100px', background: 'rgba(168,85,247,0.1)', borderRadius: '8px', marginTop: 'auto', animation: 'pulse 1.5s infinite' }}></div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 0.8; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
