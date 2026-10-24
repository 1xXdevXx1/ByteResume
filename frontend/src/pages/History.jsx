import React, { useState, useEffect } from 'react';
import { getResumes, getAllMatches, deleteResume } from '../services/api';
import { 
  History as HistoryIcon, 
  FileText, 
  Target, 
  Trash2, 
  ExternalLink,
  Calendar,
  Building2,
  Search,
  Sparkles
} from 'lucide-react';

export default function History({ setActiveTab, setSelectedResumeId, setSelectedJobId }) {
  const [resumes, setResumes] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('resumes'); // 'resumes' or 'matches'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [resResumes, resMatches] = await Promise.all([
        getResumes(),
        getAllMatches()
      ]);
      setResumes(resResumes.data);
      setMatches(resMatches.data);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (id) => {
    if (!window.confirm('Delete this resume? All associated ATS reports and match results will be removed from MongoDB.')) {
      return;
    }
    try {
      await deleteResume(id);
      setResumes(resumes.filter(r => r._id !== id));
      setMatches(matches.filter(m => m.resumeId?._id !== id && m.resumeId !== id));
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const filteredResumes = resumes.filter(r => 
    r.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.userId?.name && r.userId.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredMatches = matches.filter(m => 
    (m.jobDescriptionId?.title && m.jobDescriptionId.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.jobDescriptionId?.company && m.jobDescriptionId.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.resumeId?.fileName && m.resumeId.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#818CF8' }}>
              Historical Archives
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', letterSpacing: '-0.6px' }}>
            Evaluation History & Records
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Historical candidate resumes, evaluation reports, and job-match results stored in MongoDB.
          </p>
        </div>

        {/* Sub-tab toggle */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-card)', padding: '5px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <button
            className={`btn ${activeSubTab === 'resumes' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 18px', fontSize: '13px', border: 'none' }}
            onClick={() => setActiveSubTab('resumes')}
          >
            <FileText size={15} />
            <span>Resumes ({resumes.length})</span>
          </button>
          <button
            className={`btn ${activeSubTab === 'matches' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 18px', fontSize: '13px', border: 'none' }}
            onClick={() => setActiveSubTab('matches')}
          >
            <Target size={15} />
            <span>Job Matches ({matches.length})</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '24px', maxWidth: '400px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Filter records by keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '38px' }}
        />
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          Loading historical database records...
        </div>
      ) : activeSubTab === 'resumes' ? (
        /* Resumes History Table */
        <div className="card">
          <div className="card-title">
            <FileText size={18} color="#818CF8" />
            <span>Candidate Resumes in MongoDB ({filteredResumes.length})</span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Candidate</th>
                  <th>Skills Extracted</th>
                  <th>Format</th>
                  <th>Uploaded Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResumes.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#fff' }}>{r.fileName}</div>
                      <code style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {r._id}</code>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{r.userId?.name || 'Candidate'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.userId?.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-tech">{r.skills?.length || 0} skills</span>
                    </td>
                    <td>
                      <span className="badge badge-tech" style={{ textTransform: 'uppercase', fontSize: '11px' }}>
                        {r.fileType}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                      {new Date(r.uploadedAt).toLocaleDateString()} {new Date(r.uploadedAt).toLocaleTimeString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => {
                            if (setSelectedResumeId) setSelectedResumeId(r._id);
                            setActiveTab('analysis');
                          }}
                          title="View ATS Analysis"
                        >
                          <span>Analyze</span>
                          <ExternalLink size={12} />
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '6px 10px', color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          onClick={() => handleDeleteResume(r._id)}
                          title="Delete from MongoDB"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Matches History Table */
        <div className="card">
          <div className="card-title">
            <Target size={18} color="#10B981" />
            <span>Job Matching History in MongoDB ({filteredMatches.length})</span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Job Title & Company</th>
                  <th>Candidate Resume</th>
                  <th>Match %</th>
                  <th>Matched Skills</th>
                  <th>Missing Skills</th>
                  <th>Evaluation Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#fff' }}>
                        {m.jobDescriptionId?.title || 'Job Opening'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Building2 size={13} color="#06B6D4" />
                        <span>{m.jobDescriptionId?.company || 'Company'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{m.resumeId?.fileName || 'Resume'}</div>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: '800',
                        fontSize: '15px',
                        color: m.matchPercentage >= 80 ? '#10B981' : m.matchPercentage >= 60 ? '#F59E0B' : '#EF4444'
                      }}>
                        {m.matchPercentage}%
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-matched">{m.matchedSkills?.length || 0} matched</span>
                    </td>
                    <td>
                      <span className="badge badge-missing">{m.missingSkills?.length || 0} missing</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                      {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
