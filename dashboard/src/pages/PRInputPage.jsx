import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScan } from '../context/ScanContext.jsx';
import { useBotScan } from '../hooks/useBotScan.js';
import BotProgressLoader from '../components/BotProgressLoader.jsx';

export default function PRInputPage() {
  const navigate = useNavigate();
  const { setScanTarget } = useScan();
  const { runScan, progress } = useBotScan();
  const [repo, setRepo]   = useState('');
  const [pr, setPr]       = useState('');
  const [errors, setErrors] = useState({});
  const [running, setRunning] = useState(false);

  const handleScan = async () => {
    const e = {};
    if (!repo.trim()) e.repo = 'GitHub repo URL is required';
    if (!pr.trim())   e.pr   = 'PR number is required';
    if (Object.keys(e).length) { setErrors(e); return; }

    setErrors({});
    setRunning(true);
    setScanTarget({ type: 'pr', url: repo.trim(), pr: pr.trim() });

    await runScan(repo.trim());
    navigate('/report');
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '14px 18px',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${errors[field] ? 'var(--danger)' : 'var(--border2)'}`,
    borderRadius: 10, color: 'var(--text)', fontSize: 15,
    outline: 'none', transition: 'border-color 0.2s',
  });

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '80px 24px' }}>

      {!running ? (
        <div style={{ width: '100%', maxWidth: 620, animation: 'fadeInUp 0.5s ease' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Back to Home
          </button>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔀</div>
            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
              <span style={{ color: 'var(--cyan)' }}>PR / Git Push</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              Connect your GitHub PR and gate the merge — FaultPulse blocks bad code before it ships.
            </p>
          </div>

          <div className="glass" style={{ padding: 32 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontWeight: 500 }}>
                GitHub Repository URL
              </label>
              <input
                type="text"
                placeholder="https://github.com/user/repo"
                value={repo}
                onChange={e => setRepo(e.target.value)}
                style={inputStyle('repo')}
                onFocus={e => e.target.style.borderColor = 'var(--cyan)'}
                onBlur={e => e.target.style.borderColor = errors.repo ? 'var(--danger)' : 'var(--border2)'}
              />
              {errors.repo && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.repo}</p>}
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontWeight: 500 }}>
                Pull Request Number
              </label>
              <input
                type="number"
                placeholder="42"
                value={pr}
                onChange={e => setPr(e.target.value)}
                style={{ ...inputStyle('pr'), maxWidth: 200 }}
                onFocus={e => e.target.style.borderColor = 'var(--cyan)'}
                onBlur={e => e.target.style.borderColor = errors.pr ? 'var(--danger)' : 'var(--border2)'}
              />
              {errors.pr && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.pr}</p>}
            </div>

            <button className="btn" onClick={handleScan} style={{
              width: '100%', justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--cyan), #00a0c0)',
              color: '#000', fontWeight: 700, fontSize: 15, padding: '14px 24px',
            }}>
              Connect & Scan PR →
            </button>

            <div className="divider" />

            <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
              {['Auto merge on pass', 'Block on failure', 'AI fix suggestions'].map(f => (
                <div key={f} style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
                  <span style={{ color: 'var(--cyan)' }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <BotProgressLoader progress={progress} url={`PR #${pr} — ${repo}`} />
      )}
    </div>
  );
}
