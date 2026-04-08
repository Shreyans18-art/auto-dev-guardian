import { useEffect, useState } from 'react';
import { scoreLabel } from '../utils/scoreCalculator.js';

export default function CriticalScoreGauge({ score }) {
  const [display, setDisplay] = useState(0);
  const info = scoreLabel(score);

  // Count-up animation
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(score / 40);
    const id = setInterval(() => {
      start = Math.min(start + step, score);
      setDisplay(start);
      if (start >= score) clearInterval(id);
    }, 25);
    return () => clearInterval(id);
  }, [score]);

  // SVG arc gauge
  const R   = 80;
  const cx  = 100;
  const cy  = 100;
  const arc = 240; // degrees of the arc
  const startAngle = 150;
  const pct = display / 100;

  const polarToCartesian = (angle) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + R * Math.cos(rad),
      y: cy + R * Math.sin(rad),
    };
  };

  const describeArc = (start, sweep) => {
    const end   = start + sweep;
    const s     = polarToCartesian(start);
    const e     = polarToCartesian(end);
    const large = sweep > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const trackPath = describeArc(startAngle, arc);
  const valuePath = describeArc(startAngle, arc * pct);

  const strokeColor =
    score >= 80 ? 'var(--success)' :
    score >= 50 ? 'var(--warning)' :
    'var(--danger)';

  const glowColor =
    score >= 80 ? 'rgba(0,229,160,0.5)' :
    score >= 50 ? 'rgba(255,183,0,0.5)' :
    'rgba(255,61,107,0.5)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 200, height: 200 }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Track */}
          <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" strokeLinecap="round" />
          {/* Value arc */}
          <path
            d={valuePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="14"
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 10px ${glowColor})`,
              transition: 'stroke 0.3s ease',
            }}
          />
        </svg>

        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            fontSize: 42, fontWeight: 900, color: strokeColor,
            textShadow: `0 0 20px ${glowColor}`,
            animation: 'count-up 0.5s ease',
          }}>
            {display}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: 1, textTransform: 'uppercase' }}>Score</div>
        </div>
      </div>

      <div style={{
        marginTop: 8,
        fontSize: 15, fontWeight: 700, color: strokeColor,
        textAlign: 'center',
        textShadow: `0 0 16px ${glowColor}`,
      }}>
        {info.emoji} {info.label}
      </div>
    </div>
  );
}
