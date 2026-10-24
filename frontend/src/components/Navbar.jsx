import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Sparkles, 
  Target, 
  History, 
  Cpu
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const naVitems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Resume', icon: UploadCloud },
    { id: 'analysis', label: 'ATS Analysis', icon: Sparkles },
    { id: 'match', label: 'Job Match', icon: Target },
    { id: 'history', label: 'History & Logs', icon: History },
  ];

  return (
    <aside style={{
      width: '270px',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      userSelect: 'none'
    }}>
      {/* Brand Header */}
      <div style={{ padding: '26px 22px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            color: '#fff',
            fontSize: '17px',
            letterSpacing: '-0.5px'
          }}>
            BR
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.4px', color: '#fff' }}>
                ByteResume
              </h1>
              <span style={{
                fontSize: '9px',
                fontWeight: '700',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#818CF8',
                padding: '2px 6px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>PRO</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              AI Intelligence & Matching
            </p>
          </div>
        </div>

        {/* Database Architecture Badges */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <span className="badge badge-mongo" style={{ fontSize: '10.5px', padding: '3px 9px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }}></span>
            MongoDB Primary
          </span>
          <span className="badge badge-redis" style={{ fontSize: '10.5px', padding: '3px 9px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF6B61' }}></span>
            Redis Cache
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', padding: '0 12px 6px 12px' }}>
          Platform
        </div>
        {naVitems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.16) 0%, rgba(99, 102, 241, 0.04) 100%)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                width: '100%',
                position: 'relative'
              }}
            >
              <Icon 
                size={18} 
                color={isActive ? '#818CF8' : '#64748B'} 
                style={{ filter: isActive ? 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.5))' : 'none' }}
              />
              <span>{item.label}</span>
              {isActive && (
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#818CF8',
                  boxShadow: '0 0 8px #818CF8'
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Pill */}
      <div style={{ padding: '0 14px 16px 14px' }}>
        <div style={{
          background: 'rgba(17, 24, 39, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="pulse-dot"></div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#F1F5F9' }}>Services Online</div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>MongoDB & Redis Active</div>
            </div>
          </div>
          <Cpu size={15} color="#64748B" />
        </div>
      </div>

      {/* Academic Footer Info */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '11.5px',
        color: 'var(--text-muted)',
        background: 'rgba(0,0,0,0.15)'
      }}>
        <div style={{ fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '2px' }}>
          NoSQL Database Architecture
        </div>
        <div>Production Engineering • Production Architecture</div>
        <div style={{ marginTop: '4px', color: '#64748B', fontSize: '10.5px' }}>
          Team ByteResume (Engineering Team)
        </div>
      </div>
    </aside>
  );
}
