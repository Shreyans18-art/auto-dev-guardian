import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScan } from '../context/ScanContext.jsx';

const SDK_SNIPPET = `<!-- Add this to your website's <head> tag -->
<script src="http://localhost:5000/sdk/faultpulse.js"></script>`;

export default function SDKSetupModal({ onClose, onConnected }) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SDK_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div className="glass-strong" style={{
        width: '100%', maxWidth: 560,
        padding: 36,
        animation: 'fadeInUp 0.4s ease',
        border: '1px solid rgba(0,212,255,0.25)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
              🔌 Connect Runtime Monitoring
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Add this SDK snippet to your site to monitor real user errors post-deploy.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Step 1 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800,
            }}>1</div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Copy the SDK snippet</span>
          </div>
          <div className="code-block" style={{ position: 'relative' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{SDK_SNIPPET}</pre>
            <button onClick={handleCopy} style={{
              position: 'absolute', top: 8, right: 8,
              padding: '4px 12px',
              background: copied ? 'rgba(0,229,160,0.2)' : 'rgba(124,111,255,0.2)',
              border: `1px solid ${copied ? 'rgba(0,229,160,0.4)' : 'rgba(124,111,255,0.35)'}`,
              borderRadius: 6,
              color: copied ? 'var(--success)' : 'var(--primary)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800,
            }}>2</div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Paste it in your website's &lt;head&gt;</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, paddingLeft: 32 }}>
            The SDK auto-captures JS errors, load times, and stack traces — sending them to your FaultPulse dashboard in real-time.
          </p>
        </div>

        {/* Step 3 — Confirm toggle */}
        <div style={{
          padding: '16px 20px',
          background: confirmed ? 'rgba(0,229,160,0.08)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${confirmed ? 'rgba(0,229,160,0.3)' : 'var(--border)'}`,
          borderRadius: 12, cursor: 'pointer',
          transition: 'all 0.3s',
          marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 14,
        }} onClick={() => setConfirmed(!confirmed)}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: confirmed ? 'var(--success)' : 'transparent',
            border: `2px solid ${confirmed ? 'var(--success)' : 'var(--border2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', flexShrink: 0,
          }}>
            {confirmed && <span style={{ color: '#000', fontSize: 13, fontWeight: 800 }}>✓</span>}
          </div>
          <span style={{ fontSize: 14, color: confirmed ? 'var(--success)' : 'var(--text-muted)' }}>
            I've added the SDK to my website
          </span>
        </div>

        <button
          className="btn"
          onClick={confirmed ? onConnected : undefined}
          disabled={!confirmed}
          style={{
            width: '100%', justifyContent: 'center',
            background: confirmed
              ? 'linear-gradient(135deg, var(--success), #00b87a)'
              : 'rgba(255,255,255,0.05)',
            color: confirmed ? '#000' : 'var(--text-dim)',
            border: confirmed ? 'none' : '1px solid var(--border)',
            padding: '14px', fontSize: 15, fontWeight: 700,
            borderRadius: 10,
            cursor: confirmed ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s',
            boxShadow: confirmed ? '0 4px 24px var(--success-glow)' : 'none',
          }}
        >
          {confirmed ? '🚀 Go to Runtime Dashboard →' : 'Mark SDK as connected first'}
        </button>
      </div>
    </div>
  );
}
