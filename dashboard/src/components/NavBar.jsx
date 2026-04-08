import { Link, useLocation } from 'react-router-dom';
import { useScan } from '../context/ScanContext.jsx';
import { useState, useEffect } from 'react';

export default function NavBar() {
  const { runtimeErrors, sdkConnected } = useScan();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const errorCount = runtimeErrors.filter(e => e.type === 'error').length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(8,8,15,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #7c6fff, #00d4ff)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
            boxShadow: '0 0 20px rgba(124,111,255,0.4)',
          }}>⚡</div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>
            <span className="gradient-text">Fault</span>
            <span style={{ color: 'var(--text)' }}>Pulse</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { to: '/',        label: 'Home' },
            { to: '/report',  label: 'Report' },
            { to: '/runtime', label: 'Runtime' },
          ].map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: location.pathname === link.to ? 'var(--primary)' : 'var(--text-muted)',
              background: location.pathname === link.to ? 'rgba(124,111,255,0.12)' : 'transparent',
              transition: 'all 0.2s',
            }}>{link.label}</Link>
          ))}
        </div>

        {/* Right — error badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {sdkConnected && (
            <Link to="/runtime" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 14px',
                background: errorCount > 0 ? 'rgba(255,61,107,0.15)' : 'rgba(0,229,160,0.1)',
                border: `1px solid ${errorCount > 0 ? 'rgba(255,61,107,0.3)' : 'rgba(0,229,160,0.25)'}`,
                borderRadius: 999,
                fontSize: 13,
                color: errorCount > 0 ? 'var(--danger)' : 'var(--success)',
                fontWeight: 600,
                animation: errorCount > 0 ? 'pulse-ring 2s infinite' : 'none',
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: errorCount > 0 ? 'var(--danger)' : 'var(--success)',
                  display: 'inline-block',
                }} />
                {errorCount > 0 ? `${errorCount} Runtime Error${errorCount > 1 ? 's' : ''}` : 'Live Monitoring'}
              </div>
            </Link>
          )}
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--success)',
            boxShadow: '0 0 8px var(--success)',
            animation: 'glow-pulse 2s infinite',
          }} />
        </div>
      </div>
    </nav>
  );
}
