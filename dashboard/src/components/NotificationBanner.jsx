import { useEffect, useState } from 'react';

export default function NotificationBanner({ error, onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDismiss?.(); }, 6000);
    return () => clearTimeout(t);
  }, [error, onDismiss]);

  if (!visible || !error) return null;

  return (
    <div style={{
      position: 'fixed', top: 75, right: 20, zIndex: 1500,
      animation: 'slide-in-right 0.4s ease',
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '16px 20px',
        background: 'rgba(18,12,22,0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,61,107,0.4)',
        borderRadius: 14,
        maxWidth: 380,
        boxShadow: '0 8px 32px rgba(255,61,107,0.2)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'rgba(255,61,107,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
          animation: 'pulse-ring 2s infinite',
        }}>🚨</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', marginBottom: 3 }}>
            Runtime Error Detected
          </div>
          <div style={{
            fontSize: 12, color: 'var(--text-muted)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {error.message}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
            {new Date(error.timestamp).toLocaleTimeString()}
          </div>
        </div>

        <button onClick={() => { setVisible(false); onDismiss?.(); }} style={{
          background: 'none', border: 'none',
          color: 'var(--text-dim)', cursor: 'pointer', fontSize: 16,
          flexShrink: 0,
        }}>✕</button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, marginTop: 2 }}>
        <div style={{
          height: '100%', background: 'var(--danger)',
          borderRadius: 1,
          animation: 'shimmer 6s linear forwards',
          width: '100%',
        }} />
      </div>
    </div>
  );
}
