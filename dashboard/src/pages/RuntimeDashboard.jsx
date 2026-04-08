import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScan } from '../context/ScanContext.jsx';
import { useRUM } from '../hooks/useRUM.js';
import StatsBar from '../components/StatsBar.jsx';
import RuntimeErrorCard from '../components/RuntimeErrorCard.jsx';
import NotificationBanner from '../components/NotificationBanner.jsx';

// Live demo events when backend isn't running
const DEMO_EVENTS = [
  { type: 'error', message: 'ReferenceError: undefinedFunction is not defined', source: 'app.js', line: 42, col: 8, url: 'https://yoursite.com/app', timestamp: Date.now() - 60000 },
  { type: 'performance', loadTime: 1240, url: 'https://yoursite.com/', timestamp: Date.now() - 45000 },
  { type: 'error', message: 'TypeError: Cannot read properties of null (reading \'name\')', source: 'utils.js', line: 17, col: 5, url: 'https://yoursite.com/dashboard', timestamp: Date.now() - 30000 },
  { type: 'performance', loadTime: 3800, url: 'https://yoursite.com/checkout', timestamp: Date.now() - 20000 },
  { type: 'error', message: 'NetworkError: Failed to fetch /api/data', source: 'fetch.js', line: 88, col: 12, url: 'https://yoursite.com/data', timestamp: Date.now() - 8000 },
];

export default function RuntimeDashboard() {
  const navigate = useNavigate();
  const { sdkConnected, scanTarget, botResults } = useScan();
  const { runtimeErrors, loading, newError, refetch } = useRUM();
  const [notification, setNotification] = useState(null);
  const [filter, setFilter] = useState('all');  // all | errors | perf

  // Use demo data if backend returns empty
  const events = runtimeErrors.length > 0 ? runtimeErrors : DEMO_EVENTS;
  const displayed = filter === 'all'    ? events
                  : filter === 'errors' ? events.filter(e => e.type === 'error')
                  : events.filter(e => e.type === 'performance');

  // Show notification on new error
  useEffect(() => {
    if (newError) setNotification(newError);
  }, [newError]);

  return (
    <div className="page" style={{ padding: '90px 24px 60px' }}>
      {notification && (
        <NotificationBanner error={notification} onDismiss={() => setNotification(null)} />
      )}

      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32, animation: 'fadeInUp 0.4s ease' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: 'var(--success)',
                boxShadow: '0 0 8px var(--success)',
                animation: 'glow-pulse 2s infinite',
              }} />
              <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>Live Monitoring</span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>
              🖥️ Runtime Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Real user monitoring · {scanTarget?.url || 'yoursite.com'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={refetch} style={{ padding: '10px 18px', fontSize: 13 }}>
              🔄 Refresh
            </button>
            {!sdkConnected && (
              <button className="btn btn-primary" onClick={() => navigate('/deploy')} style={{ padding: '10px 18px', fontSize: 13 }}>
                🔌 Connect SDK
              </button>
            )}
          </div>
        </div>

        {/* SDK banner if not connected */}
        {!sdkConnected && (
          <div style={{
            padding: '14px 20px', borderRadius: 12, marginBottom: 24,
            background: 'rgba(124,111,255,0.08)',
            border: '1px solid rgba(124,111,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            animation: 'fadeIn 0.4s ease',
          }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              🔌 <strong style={{ color: 'var(--primary)' }}>SDK not connected</strong> — showing demo data. Deploy and connect the SDK for live monitoring.
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/deploy')} style={{ padding: '8px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>
              Connect →
            </button>
          </div>
        )}

        {/* Stats */}
        <div style={{ marginBottom: 28, animation: 'fadeInUp 0.5s ease' }}>
          <StatsBar events={events} />
        </div>

        {/* Layout: error feed + sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, animation: 'fadeInUp 0.6s ease' }}>

          {/* Error Feed */}
          <div>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {[
                { key: 'all',    label: `All (${events.length})` },
                { key: 'errors', label: `Errors (${events.filter(e => e.type === 'error').length})` },
                { key: 'perf',   label: `Performance (${events.filter(e => e.type === 'performance').length})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  style={{
                    padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                    background: filter === tab.key ? 'rgba(124,111,255,0.2)' : 'transparent',
                    border: `1px solid ${filter === tab.key ? 'rgba(124,111,255,0.4)' : 'var(--border)'}`,
                    color: filter === tab.key ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {displayed.length === 0 ? (
                <div className="glass" style={{ padding: 32, textAlign: 'center', color: 'var(--text-dim)' }}>
                  No events yet. Waiting for real user data…
                </div>
              ) : (
                displayed.slice().reverse().map((event, i) => (
                  <RuntimeErrorCard key={i} event={event} index={i} />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Bot health summary */}
            {botResults.length > 0 && (
              <div className="glass" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                  🤖 Pre-Deploy Health
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {botResults.slice(0, 8).map(b => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{b.icon}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{b.name}</span>
                      </div>
                      <span style={{
                        color: b.status === 'pass' ? 'var(--success)' : b.status === 'warn' ? 'var(--warning)' : 'var(--danger)',
                        fontWeight: 600, fontSize: 11,
                      }}>
                        {b.status === 'pass' ? '✓' : b.status === 'warn' ? '⚠' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/report')} style={{ marginTop: 16, width: '100%', padding: '8px', borderRadius: 8, background: 'rgba(124,111,255,0.1)', border: '1px solid rgba(124,111,255,0.2)', color: 'var(--primary)', fontSize: 12, cursor: 'pointer' }}>
                  View Full Report →
                </button>
              </div>
            )}

            {/* Error breakdown */}
            <div className="glass" style={{ padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                📊 Error Types
              </div>
              {[
                { label: 'TypeError',        count: events.filter(e => e.message?.includes('TypeError')).length },
                { label: 'ReferenceError',   count: events.filter(e => e.message?.includes('ReferenceError')).length },
                { label: 'NetworkError',     count: events.filter(e => e.message?.includes('NetworkError')).length },
                { label: 'Other',            count: events.filter(e => e.type === 'error' && !e.message?.match(/TypeError|ReferenceError|NetworkError/)).length },
              ].filter(e => e.count > 0).map(e => (
                <div key={e.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{e.label}</span>
                    <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{e.count}</span>
                  </div>
                  <div style={{ height: 3, background: 'var(--border)', borderRadius: 2 }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      background: 'linear-gradient(90deg, var(--danger), var(--primary))',
                      width: `${Math.min((e.count / events.length) * 100, 100)}%`,
                    }} />
                  </div>
                </div>
              ))}
              {events.filter(e => e.type === 'error').length === 0 && (
                <div style={{ color: 'var(--success)', fontSize: 13 }}>✓ No errors detected</div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
