import { useState } from 'react';
import { useAIExplain } from '../hooks/useAIExplain.js';

export default function RuntimeErrorCard({ event, index }) {
  const [expanded, setExpanded]     = useState(false);
  const [aiText, setAiText]         = useState('');
  const [aiLoading, setAiLoading]   = useState(false);
  const { explain } = useAIExplain();

  const isError = event.type === 'error';
  const time    = new Date(event.timestamp).toLocaleTimeString();

  const handleAI = async (e) => {
    e.stopPropagation();
    if (aiText) return;
    setAiLoading(true);
    const result = await explain(event.message || 'Unknown error');
    setAiText(result);
    setAiLoading(false);
  };

  return (
    <div style={{
      border: `1px solid ${isError ? 'rgba(255,61,107,0.2)' : 'rgba(255,183,0,0.15)'}`,
      borderRadius: 12,
      overflow: 'hidden',
      background: isError ? 'rgba(255,61,107,0.04)' : 'rgba(255,183,0,0.03)',
      animation: `fadeInUp 0.3s ease ${index * 0.05}s backwards`,
    }}>
      {/* Main row */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: isError ? 'rgba(255,61,107,0.15)' : 'rgba(255,183,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
        }}>
          {isError ? '❌' : '⚡'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            marginBottom: 3,
          }}>
            {event.message || (event.loadTime ? `Load: ${event.loadTime}ms` : 'Event')}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', gap: 12 }}>
            <span>🕒 {time}</span>
            {event.url && <span>🌐 {event.url.replace(/https?:\/\//, '').slice(0, 40)}</span>}
            {event.line && <span>Line {event.line}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className={`badge ${isError ? 'badge-fail' : 'badge-warn'}`}>
            {isError ? '❌ Error' : '⚡ Perf'}
          </span>
          {isError && !aiText && (
            <button onClick={handleAI} style={{
              padding: '4px 10px', borderRadius: 6,
              background: 'rgba(124,111,255,0.15)',
              border: '1px solid rgba(124,111,255,0.3)',
              color: 'var(--primary)', fontSize: 11, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              {aiLoading ? '…' : '🧠 AI Fix'}
            </button>
          )}
          <span style={{ color: 'var(--text-dim)', fontSize: 12, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</span>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--border)', animation: 'fadeIn 0.25s ease' }}>
          <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {event.source && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                <strong>Source:</strong> <span className="code-block" style={{ display: 'inline', padding: '2px 6px', fontSize: 11 }}>{event.source}</span>
              </div>
            )}
            {event.stack && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Stack Trace</div>
                <div className="code-block" style={{ fontSize: 11 }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{event.stack}</pre>
                </div>
              </div>
            )}
            {event.loadTime && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                <strong>Load Time:</strong> <span style={{ color: event.loadTime > 3000 ? 'var(--danger)' : 'var(--success)' }}>{event.loadTime}ms</span>
              </div>
            )}
            {aiText && (
              <div style={{
                padding: 14,
                background: 'rgba(124,111,255,0.08)',
                border: '1px solid rgba(124,111,255,0.2)',
                borderRadius: 10,
              }}>
                <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>🧠 AI Explanation</div>
                <pre style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'pre-wrap', fontFamily: 'Inter', margin: 0, lineHeight: 1.6 }}>{aiText}</pre>
              </div>
            )}
            {aiLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--primary)' }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                Getting AI explanation…
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
