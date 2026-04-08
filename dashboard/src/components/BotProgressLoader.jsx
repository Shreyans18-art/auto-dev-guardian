export default function BotProgressLoader({ progress, url }) {
  const done  = progress.filter(b => b.status !== 'running').length;
  const total = 15;
  const pct   = Math.round((done / total) * 100);

  return (
    <div style={{ width: '100%', maxWidth: 640, animation: 'fadeInUp 0.4s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px',
        }} />
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
          <span className="gradient-text">Running Scan…</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          {url}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 4, background: 'var(--border)',
        borderRadius: 2, overflow: 'hidden', marginBottom: 24,
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--primary), var(--cyan))',
          borderRadius: 2, transition: 'width 0.4s ease',
        }} />
      </div>
      <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
        {done} / {total} bots complete
      </div>

      {/* Bot list */}
      <div className="glass" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {progress.map(bot => (
          <div key={bot.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', borderRadius: 8,
            background: bot.status === 'running' ? 'rgba(124,111,255,0.06)' : 'transparent',
            transition: 'background 0.3s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{bot.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: bot.status === 'running' ? 'var(--text)' : 'var(--text-muted)' }}>
                {bot.name}
              </span>
            </div>
            <div>
              {bot.status === 'running' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--primary)' }}>
                  <span style={{
                    width: 12, height: 12, borderRadius: '50%',
                    border: '2px solid var(--primary)',
                    borderTopColor: 'transparent',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Running…
                </span>
              )}
              {bot.status === 'pass' && <span className="badge badge-pass">✓ Pass</span>}
              {bot.status === 'warn' && <span className="badge badge-warn">⚠ Warn</span>}
              {bot.status === 'fail' && <span className="badge badge-fail">✗ Fail</span>}
            </div>
          </div>
        ))}
        {progress.length === 0 && (
          <div style={{ textAlign: 'center', padding: 16, color: 'var(--text-dim)', fontSize: 13 }}>
            Initializing bots…
          </div>
        )}
      </div>
    </div>
  );
}
