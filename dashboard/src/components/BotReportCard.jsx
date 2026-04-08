import { useState } from 'react';

export default function BotReportCard({ bot }) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    pass: { badge: 'badge-pass', color: 'var(--success)', label: '✓ PASS', bg: 'rgba(0,229,160,0.03)',  borderColor: 'var(--border)' },
    warn: { badge: 'badge-warn', color: 'var(--warning)', label: '⚠ WARN', bg: 'rgba(255,183,0,0.04)',  borderColor: 'rgba(255,183,0,0.2)' },
    fail: { badge: 'badge-fail', color: 'var(--danger)',  label: '✗ FAIL', bg: 'rgba(255,61,107,0.05)', borderColor: 'rgba(255,61,107,0.25)' },
  };
  const cfg = statusConfig[bot.status] || statusConfig.pass;
  const hasDetail = bot.status !== 'pass' && (bot.issue || bot.fix);

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.borderColor}`,
      borderRadius: 12,
      overflow: 'hidden',
      transition: 'border-color 0.2s ease',
    }}>
      {/* ── Main row ── */}
      <div
        onClick={() => hasDetail && setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px',
          cursor: hasDetail ? 'pointer' : 'default',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: bot.status === 'fail'
            ? 'rgba(255,61,107,0.12)'
            : bot.status === 'warn'
            ? 'rgba(255,183,0,0.1)'
            : 'rgba(0,229,160,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {bot.icon}
        </div>

        {/* Name + message */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
            {bot.name}
          </div>
          <div style={{
            fontSize: 12, color: bot.status === 'pass' ? 'var(--text-muted)' : cfg.color,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {bot.message}
          </div>
        </div>

        {/* Badge + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
          {hasDetail && (
            <span style={{
              color: 'var(--text-dim)', fontSize: 11,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}>▾</span>
          )}
        </div>
      </div>

      {/* ── Expanded panel ── */}
      {expanded && hasDetail && (
        <div style={{
          borderTop: `1px solid ${cfg.borderColor}`,
          animation: 'fadeIn 0.2s ease',
        }}>

          {/* Issue */}
          {bot.issue && (
            <div style={{
              padding: '14px 18px 0',
              display: 'flex', gap: 10,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                background: bot.status === 'fail' ? 'rgba(255,61,107,0.2)' : 'rgba(255,183,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800,
                color: cfg.color,
              }}>!</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
                  What's wrong
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  {bot.issue}
                </p>
              </div>
            </div>
          )}

          {/* Impact */}
          {bot.impact && (
            <div style={{
              padding: '12px 18px 0 46px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
                Impact
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                {bot.impact}
              </p>
            </div>
          )}

          {/* Fix steps */}
          {bot.fix && bot.fix.length > 0 && (
            <div style={{
              margin: '14px 18px 16px',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10,
              padding: '14px 16px',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: 'var(--success)',
                textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                🔧 How to fix
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bot.fix.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(0,229,160,0.12)',
                      border: '1px solid rgba(0,229,160,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, color: 'var(--success)',
                      marginTop: 1,
                    }}>{i + 1}</div>
                    <p style={{
                      fontSize: 12, color: 'var(--text-muted)', margin: 0,
                      lineHeight: 1.65, flex: 1,
                      fontFamily: step.startsWith('`') || step.includes('`')
                        ? 'inherit' : 'inherit',
                    }}>
                      {/* Inline code highlighting */}
                      {step.split(/(`[^`]+`)/g).map((part, j) =>
                        part.startsWith('`') && part.endsWith('`')
                          ? <code key={j} style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 11,
                              background: 'rgba(124,111,255,0.12)',
                              border: '1px solid rgba(124,111,255,0.2)',
                              borderRadius: 4,
                              padding: '1px 5px',
                              color: 'var(--primary)',
                            }}>{part.slice(1, -1)}</code>
                          : part
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
