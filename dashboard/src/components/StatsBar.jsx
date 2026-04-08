export default function StatsBar({ events }) {
  const errors    = events.filter(e => e.type === 'error');
  const perfs     = events.filter(e => e.type === 'performance');
  const validPerfs = perfs.filter(p => p.loadTime > 0 && p.loadTime < 60000);
  const avgLoad   = validPerfs.length
    ? Math.round(validPerfs.reduce((a, b) => a + (b.loadTime || 0), 0) / validPerfs.length)
    : 0;
  const anomalies = errors.filter(e => e.message?.includes('ReferenceError') || e.message?.includes('TypeError')).length;

  const stats = [
    { label: 'Total Events', value: events.length,    color: 'var(--primary)', icon: '📊' },
    { label: 'Errors',       value: errors.length,    color: errors.length > 0 ? 'var(--danger)' : 'var(--success)', icon: '❌' },
    { label: 'Avg Load',     value: avgLoad ? `${avgLoad}ms` : '—', color: avgLoad > 3000 ? 'var(--warning)' : 'var(--success)', icon: '⏱️' },
    { label: 'Anomalies',    value: anomalies,         color: anomalies > 0 ? 'var(--warning)' : 'var(--success)', icon: '⚡' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {stats.map(s => (
        <div key={s.label} className="glass" style={{ padding: '20px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
