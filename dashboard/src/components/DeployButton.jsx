import { useNavigate } from 'react-router-dom';
import { scoreLabel } from '../utils/scoreCalculator.js';

export default function DeployButton({ score, onRescan }) {
  const navigate = useNavigate();
  const info = scoreLabel(score);
  const canDeploy = score >= 50;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {canDeploy ? (
        <button
          className="btn btn-success"
          onClick={() => navigate('/deploy')}
          style={{
            padding: '16px 40px', fontSize: 16, fontWeight: 800,
            borderRadius: 12, letterSpacing: 0.5,
            animation: 'glow-pulse 3s infinite',
          }}
        >
          🚀 Deploy Now
        </button>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            padding: '14px 28px',
            background: 'rgba(255,61,107,0.1)',
            border: '1px solid rgba(255,61,107,0.3)',
            borderRadius: 12,
            color: 'var(--danger)',
            fontSize: 15,
            fontWeight: 700,
            marginBottom: 12,
          }}>
            ❌ Critical Issues — Fix Required Before Deploy
          </div>
          <button className="btn btn-ghost" onClick={onRescan}>
            🔄 Re-run Scan
          </button>
        </div>
      )}
    </div>
  );
}
