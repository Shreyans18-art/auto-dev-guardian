import { useNavigate } from 'react-router-dom';
import { useScan } from '../context/ScanContext.jsx';

export default function LandingPage() {
  const navigate = useNavigate();
  const { setScanTarget } = useScan();

  const handleStart = () => {
    setScanTarget({ type: 'website' });
    navigate('/scan/website');
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '80px 24px 60px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 56, animation: 'fadeInUp 0.6s ease' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 999,
          background: 'rgba(124,111,255,0.1)',
          border: '1px solid rgba(124,111,255,0.25)',
          fontSize: 13, color: 'var(--primary)', fontWeight: 600,
          marginBottom: 24,
        }}>
          <span>⚡</span> AI-Powered Observability Platform
        </div>

        <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 20 }}>
          <span className="gradient-text">Detect. Explain.</span>
          <br />
          <span style={{ color: 'var(--text)' }}>Fix. Deploy.</span>
        </h1>

        <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
          FaultPulse runs 15 AI-powered bots on your website before you deploy —
          then monitors real users with runtime error intelligence.
        </p>
      </div>

      {/* Single Website Check card */}
      <div
        onClick={handleStart}
        style={{
          width: '100%', maxWidth: 480,
          padding: 40,
          background: 'rgba(16,16,28,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(124,111,255,0.3)',
          borderRadius: 24,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 40px rgba(124,111,255,0.2)',
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeInUp 0.8s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = '0 24px 64px rgba(124,111,255,0.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 40px rgba(124,111,255,0.2)';
        }}
      >
        {/* Background glow accent */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(124,111,255,0.15)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }} />

        <div style={{ fontSize: 48, marginBottom: 16 }}>🌐</div>

        <div style={{ marginBottom: 8 }}>
          <span className="badge badge-info" style={{ fontSize: 10 }}>Pre-Deployment Scan</span>
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12, color: 'var(--primary)' }}>
          Website Check
        </h2>

        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
          Enter your live URL and we'll run 15 automated bots — network, SSL, SEO, headers, performance, and more — before you ship.
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {[
            '15 automated bots',
            'Critical score report',
            'AI fix suggestions',
            'Deploy gate + SDK connect',
            'Runtime error monitoring',
          ].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span> {f}
            </div>
          ))}
        </div>

        <button className="btn btn-primary" style={{
          width: '100%', justifyContent: 'center',
          padding: '16px 24px', fontSize: 16, fontWeight: 700,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(124,111,255,0.35)',
        }}>
          Start Website Scan ⚡
        </button>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: 48, marginTop: 52,
        borderTop: '1px solid var(--border)',
        paddingTop: 32,
        animation: 'fadeInUp 1s ease',
      }}>
        {[
          { n: '15', label: 'Bots Running' },
          { n: '~2s', label: 'Scan Time' },
          { n: 'AI', label: 'Powered by Groq' },
          { n: 'RUM', label: 'Real User Monitoring' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{s.n}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
