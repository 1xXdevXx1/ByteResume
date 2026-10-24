import React from 'react';

export default function ScoreGauge({ score = 0, label = 'ATS Score', size = 160 }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let color = '#EF4444'; // red
  if (normalizedScore >= 80) color = '#10B981'; // green
  else if (normalizedScore >= 60) color = '#F59E0B'; // yellow/amber

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1F2937"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: size * 0.26, fontWeight: '800', color: '#fff', lineHeight: 1 }}>
            {normalizedScore}
          </span>
          <span style={{ fontSize: size * 0.08, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
            / 100
          </span>
        </div>
      </div>
      <span style={{ marginTop: '12px', fontSize: '14px', fontWeight: '600', color: '#E5E7EB' }}>
        {label}
      </span>
    </div>
  );
}
