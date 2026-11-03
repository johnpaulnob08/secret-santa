import { useMemo } from 'react';

export default function Snowflakes({ count = 15 }) {
  const flakes = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 10 + Math.random() * 15,
      size: 8 + Math.random() * 10,
      opacity: 0.05 + Math.random() * 0.15
    })), [count]);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {flakes.map(f => (
        <div key={f.id} style={{
          position: 'absolute', left: `${f.left}%`, top: '-20px',
          fontSize: f.size, opacity: f.opacity, userSelect: 'none',
          animation: `snowfall ${f.duration}s linear ${f.delay}s infinite`,
          color: 'white'
        }}>❄</div>
      ))}
    </div>
  );
}