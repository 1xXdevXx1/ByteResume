import React from 'react';
import { Zap, Database, Clock } from 'lucide-react';

export default function CacheBadge({ source, cached, keyName, latency }) {
  const isHit = cached || (source && source.includes('HIT'));

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 16px',
      borderRadius: '8px',
      background: isHit ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
      border: `1px solid ${isHit ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
      fontFamily: 'var(--font-sans)',
      fontSize: '13px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {isHit ? (
          <>
            <Zap size={16} color="#10B981" />
            <span style={{ fontWeight: '700', color: '#10B981' }}>REDIS CACHE HIT</span>
          </>
        ) : (
          <>
            <Database size={16} color="#F59E0B" />
            <span style={{ fontWeight: '700', color: '#F59E0B' }}>REDIS CACHE MISS (SAVED TO MONGO & CACHE)</span>
          </>
        )}
      </div>

      {latency && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9CA3AF' }}>
          <Clock size={13} />
          <span>{latency} ms</span>
        </div>
      )}

      {keyName && (
        <code style={{
          fontSize: '11px',
          background: 'rgba(0,0,0,0.3)',
          padding: '2px 8px',
          borderRadius: '4px',
          color: '#D1D5DB'
        }}>
          {keyName}
        </code>
      )}
    </div>
  );
}
