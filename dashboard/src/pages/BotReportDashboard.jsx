import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScan } from '../context/ScanContext.jsx';
import { computeScore } from '../utils/scoreCalculator.js';
import CriticalScoreGauge from '../components/CriticalScoreGauge.jsx';
import BotReportCard from '../components/BotReportCard.jsx';
import DeployButton from '../components/DeployButton.jsx';

export default function BotReportDashboard() {
  const navigate = useNavigate();
  const { botResults, scanTarget, scanDone, setScanDone, setBotResults } = useScan();
  const score = computeScore(botResults);

  const pass  = botResults.filter(b => b.status === 'pass').length;
  const warn  = botResults.filter(b => b.status === 'warn').length;
  const fail  = botResults.filter(b => b.status === 'fail').length;

  // If no scan done yet, redirect home
  useEffect(() => {
    if (!scanDone && botResults.length === 0) navigate('/');
  }, [scanDone, botResults, navigate]);

  const handleRescan = () => {
    setScanDone(false);
    setBotResults([]);
    navigate('/scan/website');
  };

  if (!botResults.length) return null;

  return (
    <div className="page" style={{ padding: '90px 24px 60px' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: 32, animation: 'fadeInUp 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>
              ← Home
            </button>
            <span style={{ color: 'var(--text-dim)' }}>/</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Website Scan
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>
                🧬 Pre-Deployment Report
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                {scanTarget?.url} · {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Score + Stats row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: 24, marginBottom: 32,
          animation: 'fadeInUp 0.5s ease',
        }}>
          {/* Score gauge card */}
          <div className="glass" style={{ padding: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CriticalScoreGauge score={score} />
          </div>

          {/* Stats + summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stat tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {[
                { label: 'Passed', value: pass, color: 'var(--success)', bg: 'rgba(0,229,160,0.08)', border: 'rgba(0,229,160,0.2)' },
                { label: 'Warnings', value: warn, color: 'var(--warning)', bg: 'rgba(255,183,0,0.08)', border: 'rgba(255,183,0,0.2)' },
                { label: 'Failed', value: fail, color: 'var(--danger)',  bg: 'rgba(255,61,107,0.08)', border: 'rgba(255,61,107,0.2)' },
              ].map(s => (
                <div key={s.label} style={{
                  background: s.bg, border: `1px solid ${s.border}`,
                  borderRadius: 14, padding: '20px 24px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Critical issues list */}
            {fail > 0 && (
              <div style={{
                flex: 1,
                background: 'rgba(255,61,107,0.06)',
                border: '1px solid rgba(255,61,107,0.2)',
                borderRadius: 14,
                padding: '16px 20px',
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                  ❌ Critical Issues ({fail})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {botResults.filter(b => b.status === 'fail').map(b => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <span>{b.icon}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{b.name}</span>
                      <span style={{ color: 'var(--text-dim)', fontSize: 12, marginLeft: 'auto' }}>{b.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bot grid */}
        <div style={{ marginBottom: 32, animation: 'fadeInUp 0.6s ease' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
            🤖 Bot Results — All {botResults.length} Checks
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 10 }}>
            {botResults.map(bot => (
              <BotReportCard key={bot.id} bot={bot} />
            ))}
          </div>
        </div>

        {/* Deploy section */}
        <div className="glass" style={{
          padding: 32, textAlign: 'center',
          animation: 'fadeInUp 0.7s ease',
          border: score >= 80
            ? '1px solid rgba(0,229,160,0.3)'
            : score >= 50
              ? '1px solid rgba(255,183,0,0.25)'
              : '1px solid rgba(255,61,107,0.3)',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
            {score >= 80 ? '✅ Ready to Deploy' : score >= 50 ? '⚠️ Deploy with Caution' : '❌ Not Ready — Fix Issues First'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            {score >= 80
              ? 'All critical checks passed. Your app is ready for production.'
              : score >= 50
              ? 'Some warnings detected. You can deploy but review warnings after.'
              : `${fail} critical bot${fail > 1 ? 's' : ''} failed. Fix issues and re-run scan before deploying.`}
          </p>
          <DeployButton score={score} onRescan={handleRescan} />
        </div>
      </div>
    </div>
  );
}
