import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';
import { 
  FileText, 
  CheckCircle2, 
  BarChart3, 
  TrendingUp, 
  Activity,
  Layers
} from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getDashboardStats();
      setStats(res.data.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      {/* Top Banner */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#818CF8' }}>
            Platform Overview
          </span>
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', letterSpacing: '-0.6px' }}>
          Recruitment Intelligence Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          BCSE406L NoSQL Database Project • Team ByteResume (Devesh Singh & Vineet Mishra)
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(17, 23, 38, 0.8) 100%)', borderLeft: '4px solid #6366F1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Candidate Resumes</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="#818CF8" />
            </div>
          </div>
          <div style={{ fontSize: '34px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>
            {loading ? '...' : stats?.totalResumes ?? 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Indexed in MongoDB <code style={{ color: '#818CF8' }}>resumes</code>
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(17, 23, 38, 0.8) 100%)', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Evaluated Reports</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} color="#34D399" />
            </div>
          </div>
          <div style={{ fontSize: '34px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>
            {loading ? '...' : stats?.totalAnalyses ?? 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Cached in Redis (3600s TTL)
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(17, 23, 38, 0.8) 100%)', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Average ATS Score</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={18} color="#C084FC" />
            </div>
          </div>
          <div style={{ fontSize: '34px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>
            {loading ? '...' : `${stats?.averageAtsScore ?? 0}`}
            <span style={{ fontSize: '18px', fontWeight: '500', color: 'var(--text-muted)', marginLeft: '4px' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Aggregated via MongoDB <code style={{ color: '#C084FC' }}>$avg</code>
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(17, 23, 38, 0.8) 100%)', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Avg Job Alignment</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#FBBF24" />
            </div>
          </div>
          <div style={{ fontSize: '34px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>
            {loading ? '...' : `${stats?.averageJobMatch ?? 0}%`}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            {stats?.totalJobMatches ?? 0} matches evaluated
          </div>
        </div>
      </div>

      {/* System Architecture Specifications */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="card-title" style={{ marginBottom: '18px' }}>
          <Layers size={18} color="#06B6D4" />
          <span>System Architecture & Engine Specifications</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '13px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '12px' }}>Primary NoSQL Database</div>
            <span className="badge badge-mongo">MongoDB (Document Store)</span>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '8px' }}>Persistent candidate & job store</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '12px' }}>High-Speed Caching Layer</div>
            <span className="badge badge-redis">Redis (Key-Value Store)</span>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '8px' }}>Sub-10ms response latency</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '12px' }}>AI Extraction & Parsing</div>
            <span style={{ color: '#F1F5F9', fontWeight: '600' }}>Python Flask (pypdf + docx)</span>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '8px' }}>Semantic skill entity extractor</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '12px' }}>Active MongoDB Collections</div>
            <span style={{ color: '#818CF8', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              6 Collections Active
            </span>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '8px' }}>resumes, jobs, reports, matches...</div>
          </div>
        </div>
      </div>

      {/* Live Activity Stream */}
      <div className="card">
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={18} color="#818CF8" />
            <span>Audit Trail (MongoDB 'activityLogs' Collection)</span>
          </div>
          <button className="btn btn-outline" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={fetchStats}>
            Refresh Stream
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Action Type</th>
                <th>Candidate / User</th>
                <th>Event Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <span className={`badge ${
                        log.action.includes('CREATED') ? 'badge-matched' :
                        log.action.includes('ANALYZED') ? 'badge-tech' :
                        log.action.includes('MATCHED') ? 'badge-soft' : 'badge-tech'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: '#F1F5F9' }}>
                      {log.userId?.name || 'System User'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      {JSON.stringify(log.details)}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No activity logs recorded yet. Upload a resume or run an analysis!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
