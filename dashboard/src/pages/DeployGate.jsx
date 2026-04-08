import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScan } from '../context/ScanContext.jsx';
import SDKSetupModal from '../components/SDKSetupModal.jsx';

export default function DeployGate() {
  const navigate = useNavigate();
  const { scanTarget, botResults, setSdkConnected } = useScan();
  const [phase, setPhase]   = useState('ready');  // ready → deploying → deployed
  const [showSDK, setShowSDK] = useState(false);
  const [progress, setProgress] = useState(0);

  const pass = botResults.filter(b => b.status === 'pass').length;
  const fail = botResults.filter(b => b.status === 'fail').length;

  const handleDeploy = () => {
    setPhase('deploying');
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 12 + 3;
      if (p >= 100) {
        p = 100;
        clearInterval(id);
        setTimeout(() => setPhase('deployed'), 400);
      }
      setProgress(Math.min(p, 100));
    }, 200);
  };

  const handleSDKConnected = () => {
    setSdkConnected(true);
    setShowSDK(false);
    navigate('/runtime');
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '80px 24px' }}>

      {showSDK && (
        <SDKSetupModal
          onClose={() => setShowSDK(false)}
          onConnected={handleSDKConnected}
        />
      )}

      <div style={{ width: '100%', maxWidth: 600, animation: 'fadeInUp 0.5s ease' }}>
        <button onClick={() => navigate('/report')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', marginBottom: 28 }}>
          ← Back to Report
        </button>

        {phase === 'ready' && (
          <div className="glass" style={{ padding: 40, textAlign: 'center', border: '1px solid rgba(0,229,160,0.2)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🚀</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Ready for Production</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 28 }}>
              Deploy <strong style={{ color: 'var(--text)' }}>{scanTarget?.url || 'your project'}</strong> to production.
            </p>

            {/* Summary */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 32 }}>
              <div style={{ textAlign: 'center', padding: '12px 24px', background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>{pass}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Passed</div>
              </div>
              {fail > 0 && (
                <div style={{ textAlign: 'center', padding: '12px 24px', background: 'rgba(255,183,0,0.08)', border: '1px solid rgba(255,183,0,0.2)', borderRadius: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--warning)' }}>{fail}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Warnings</div>
                </div>
              )}
            </div>

            <button className="btn btn-success" onClick={handleDeploy} style={{ padding: '16px 48px', fontSize: 16, fontWeight: 800, width: '100%', justifyContent: 'center', borderRadius: 12 }}>
              🚀 Deploy to Production
            </button>
          </div>
        )}

        {phase === 'deploying' && (
          <div className="glass" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              border: '4px solid var(--border)',
              borderTopColor: 'var(--success)',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 24px',
            }} />
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Deploying…</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>{scanTarget?.url}</p>

            <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--success), var(--cyan))',
                borderRadius: 3, transition: 'width 0.2s ease',
              }} />
            </div>
            <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              {Math.round(progress)}%
            </div>
          </div>
        )}

        {phase === 'deployed' && (
          <div className="glass" style={{ padding: 40, textAlign: 'center', border: '1px solid rgba(0,229,160,0.3)', animation: 'fadeInUp 0.5s ease' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--success), #00b87a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, margin: '0 auto 20px',
              boxShadow: '0 0 40px rgba(0,229,160,0.4)',
            }}>✓</div>

            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)', marginBottom: 8 }}>Deployed Successfully!</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
              Your app is live. Now connect runtime monitoring to catch real user errors.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                className="btn"
                onClick={() => setShowSDK(true)}
                style={{
                  width: '100%', justifyContent: 'center',
                  background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                  color: '#fff', padding: '16px', fontSize: 15, fontWeight: 700,
                  borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(124,111,255,0.3)',
                }}
              >
                🔌 Configure SDK & Enable Runtime Monitoring
              </button>
              <button className="btn btn-ghost" onClick={() => navigate('/runtime')} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                Skip for now → Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
