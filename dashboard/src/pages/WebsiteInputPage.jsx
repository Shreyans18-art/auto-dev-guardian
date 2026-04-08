import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScan } from '../context/ScanContext.jsx';
import { useBotScan } from '../hooks/useBotScan.js';
import BotProgressLoader from '../components/BotProgressLoader.jsx';

export default function WebsiteInputPage() {
  const navigate   = useNavigate();
  const { setScanTarget, setScanning } = useScan();
  const { runScan, progress }          = useBotScan();
  const [url, setUrl]     = useState('');
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);

  const handleScan = async () => {
    if (!url.trim()) { setError('Please enter a URL'); return; }
    let target = url.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    setError('');
    setRunning(true);
    setScanTarget({ type: 'website', url: target });

    await runScan(target);
    navigate('/report');
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '80px 24px' }}>

      {!running ? (
        <div style={{ width: '100%', maxWidth: 620, animation: 'fadeInUp 0.5s ease' }}>
          {/* Back */}
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            fontSize: 14, cursor: 'pointer', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 6,
          }}>← Back to Home</button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🌐</div>
            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
              <span className="gradient-text">Website Scan</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              Enter your URL and we'll run 15 bots across network, security, SEO, performance & more.
            </p>
          </div>

          {/* Input card */}
          <div className="glass" style={{ padding: 32 }}>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, display: 'block', fontWeight: 500 }}>
              Website URL
            </label>
            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <input
                type="text"
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
                style={{
                  flex: 1, padding: '14px 18px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${error ? 'var(--danger)' : 'var(--border2)'}`,
                  borderRadius: 10, color: 'var(--text)', fontSize: 15,
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border2)'}
              />
              <button className="btn btn-primary" onClick={handleScan} style={{ padding: '14px 24px', whiteSpace: 'nowrap' }}>
                Run Scan ⚡
              </button>
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}

            <div className="divider" />

            {/* What we check */}
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>15 Bots Running</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['🌐 Network','🛡️ Headers','🔒 SSL','📡 DNS','⚡ Performance',
                '⏱️ Latency','💓 Uptime','🔌 API','🔍 SEO','🗄️ Caching',
                '♿ Accessibility','📦 Resources','🔑 Auth','🖥️ Console','🗺️ Geo'].map(b => (
                <span key={b} style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(124,111,255,0.08)',
                  border: '1px solid rgba(124,111,255,0.15)',
                  fontSize: 12, color: 'var(--text-muted)',
                }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <BotProgressLoader progress={progress} url={url} />
      )}
    </div>
  );
}
