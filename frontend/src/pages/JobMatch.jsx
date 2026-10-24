import React, { useState, useEffect } from 'react';
import { getResumes, getJobs, createJob, uploadJob, fetchRoleSkillsFromWeb, matchResumeToJob } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import CacheBadge from '../components/CacheBadge';
import { 
  Target, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  Zap, 
  Building2, 
  FileText,
  Plus,
  Sparkles,
  ArrowRight,
  Code,
  Layers,
  UploadCloud,
  FileUp,
  Globe,
  Loader2
} from 'lucide-react';

export default function JobMatch({ selectedResumeId, selectedJobId, setSelectedJobId }) {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeResumeId, setActiveResumeId] = useState(selectedResumeId || '');
  const [activeJobId, setActiveJobId] = useState(selectedJobId || '');

  // Target Job Requisition Mode: 'select', 'upload', or 'custom'
  const [jobMode, setJobMode] = useState('select');
  
  // File Upload State for Job Description
  const [jdFile, setJdFile] = useState(null);
  const [jdCompany, setJdCompany] = useState('');
  const [jdTitle, setJdTitle] = useState('');
  const [uploadingJd, setUploadingJd] = useState(false);

  // Custom Job Manual State
  const [customTitle, setCustomTitle] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customSkills, setCustomSkills] = useState('');
  const [fetchingWebSkills, setFetchingWebSkills] = useState(false);
  const [webSkillsSource, setWebSkillsSource] = useState(null);

  const [matchResult, setMatchResult] = useState(null);
  const [sourceInfo, setSourceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedResumeId) setActiveResumeId(selectedResumeId);
  }, [selectedResumeId]);

  useEffect(() => {
    if (selectedJobId) setActiveJobId(selectedJobId);
  }, [selectedJobId]);

  const loadData = async () => {
    try {
      const [resResumes, resJobs] = await Promise.all([getResumes(), getJobs()]);
      setResumes(resResumes.data);
      setJobs(resJobs.data);

      if (resResumes.data.length > 0 && !activeResumeId && !selectedResumeId) {
        setActiveResumeId(resResumes.data[0]._id);
      }
      if (resJobs.data.length > 0 && !activeJobId && !selectedJobId) {
        setActiveJobId(resJobs.data[0]._id);
      }
    } catch (err) {
      console.error('Error loading matching prerequisites:', err);
    }
  };

  const handleUploadJobDescription = async (e) => {
    e.preventDefault();
    if (!jdFile) {
      setError('Please select a Job Description document (PDF, DOCX, or TXT).');
      return;
    }

    setUploadingJd(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', jdFile);
      if (jdCompany) formData.append('company', jdCompany);
      if (jdTitle) formData.append('title', jdTitle);

      const res = await uploadJob(formData);
      setJobs([res.data, ...jobs]);
      setActiveJobId(res.data._id);
      if (setSelectedJobId) setSelectedJobId(res.data._id);
      
      // Reset inputs & switch to select view with newly uploaded role active
      setJobMode('select');
      setJdFile(null);
      setJdCompany('');
      setJdTitle('');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setUploadingJd(false);
    }
  };

  const handleFetchSkillsFromWeb = async () => {
    if (!customTitle || !customTitle.trim()) {
      setError('Please enter a Job Title (e.g. "DevOps Engineer", "React Developer", "AI Engineer") to fetch skills from the web.');
      return;
    }

    setFetchingWebSkills(true);
    setError(null);
    setWebSkillsSource(null);

    try {
      const res = await fetchRoleSkillsFromWeb(customTitle.trim());
      const fetched = res.data?.skills || [];
      
      if (fetched.length > 0) {
        // Merge with existing skills if user already wrote some
        const existing = customSkills ? customSkills.split(',').map(s => s.trim()).filter(Boolean) : [];
        const combined = Array.from(new Set([...existing, ...fetched]));
        setCustomSkills(combined.join(', '));
        setWebSkillsSource(res.data.source === 'REDIS_CACHE_HIT' ? 'Redis Cached' : 'Live Web Knowledge');
        
        // Auto-populate description if empty
        if (!customDesc) {
          setCustomDesc(`Role: ${customTitle} at ${customCompany || 'Target Organization'}. Core skill requisitions fetched from industry taxonomy and live web: ${combined.slice(0, 8).join(', ')}.`);
        }
      } else {
        setError('No specific skills discovered for this role. You can enter them manually.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch skills from the web.');
    } finally {
      setFetchingWebSkills(false);
    }
  };

  const handleCreateCustomJob = async (e) => {
    e.preventDefault();
    if (!customTitle || !customCompany || !customDesc) {
      setError('Please provide Job Title, Company, and Description.');
      return;
    }

    try {
      const payload = {
        title: customTitle,
        company: customCompany,
        description: customDesc,
        requiredSkills: customSkills ? customSkills.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      const res = await createJob(payload);
      setJobs([res.data, ...jobs]);
      setActiveJobId(res.data._id);
      if (setSelectedJobId) setSelectedJobId(res.data._id);
      setJobMode('select');
      setCustomTitle('');
      setCustomCompany('');
      setCustomDesc('');
      setCustomSkills('');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleMatch = async () => {
    if (!activeResumeId || !activeJobId) return;
    setLoading(true);
    setError(null);
    const start = performance.now();

    try {
      const res = await matchResumeToJob(activeResumeId, activeJobId);
      const latency = Math.round(performance.now() - start);
      setMatchResult(res.data.data);
      setSourceInfo({
        source: res.data.source,
        cached: res.data.cached,
        key: `job_match:${activeResumeId}:${activeJobId}`,
        latency
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentResume = resumes.find(r => r._id === activeResumeId);
  const currentJob = jobs.find(j => j._id === activeJobId);

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#818CF8' }}>
              Skill Gap & Alignment Engine
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', letterSpacing: '-0.6px' }}>
            Job-Resume Alignment Matcher
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Compare candidate profiles against target job requisitions with sub-millisecond Redis caching.
          </p>
        </div>

        {sourceInfo && (
          <CacheBadge
            source={sourceInfo.source}
            cached={sourceInfo.cached}
            keyName={sourceInfo.key}
            latency={sourceInfo.latency}
          />
        )}
      </div>

      {/* Target Alignment Setup Card */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="grid-2" style={{ marginBottom: '24px' }}>
          {/* Resume Selection Side */}
          <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FileText size={18} color="#818CF8" />
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#F1F5F9' }}>
                1. Candidate Resume Profile
              </span>
            </div>
            
            <select
              value={activeResumeId}
              onChange={(e) => setActiveResumeId(e.target.value)}
              style={{ marginBottom: '14px' }}
            >
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.fileName} • {r.userId?.name || 'Candidate'} ({r.skills?.length || 0} skills)
                </option>
              ))}
            </select>

            {currentResume && (
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Detected Skills: </span>
                {currentResume.skills?.slice(0, 6).join(', ')}
                {currentResume.skills?.length > 6 && ` +${currentResume.skills.length - 6} more`}
              </div>
            )}
          </div>

          {/* Job Selection Side */}
          <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="#06B6D4" />
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#F1F5F9' }}>
                  2. Target Job Requisition
                </span>
              </div>

              {/* Mode Toggle */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setJobMode('select')}
                  style={{
                    fontSize: '11.5px',
                    fontWeight: '600',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    color: jobMode === 'select' ? '#fff' : 'var(--text-muted)',
                    background: jobMode === 'select' ? 'rgba(99, 102, 241, 0.3)' : 'transparent'
                  }}
                >
                  Select Existing
                </button>
                <button
                  type="button"
                  onClick={() => setJobMode('upload')}
                  style={{
                    fontSize: '11.5px',
                    fontWeight: '600',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    color: jobMode === 'upload' ? '#fff' : 'var(--text-muted)',
                    background: jobMode === 'upload' ? 'rgba(6, 182, 212, 0.3)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <UploadCloud size={12} />
                  <span>Upload JD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setJobMode('custom')}
                  style={{
                    fontSize: '11.5px',
                    fontWeight: '600',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    color: jobMode === 'custom' ? '#fff' : 'var(--text-muted)',
                    background: jobMode === 'custom' ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={12} />
                  <span>Manual</span>
                </button>
              </div>
            </div>

            {jobMode === 'select' && (
              <div>
                <select
                  value={activeJobId}
                  onChange={(e) => setActiveJobId(e.target.value)}
                  style={{ marginBottom: '14px' }}
                >
                  {jobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.title} — {j.company}
                    </option>
                  ))}
                </select>

                {currentJob && (
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Required: </span>
                    {currentJob.requiredSkills?.join(', ')}
                  </div>
                )}
              </div>
            )}

            {jobMode === 'upload' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Company Name (e.g. Google, Amazon, Microsoft)"
                    value={jdCompany}
                    onChange={(e) => setJdCompany(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Role Title (optional, e.g. Staff Backend Engineer)"
                    value={jdTitle}
                    onChange={(e) => setJdTitle(e.target.value)}
                  />
                </div>

                <div 
                  style={{
                    border: '1.5px dashed rgba(6, 182, 212, 0.4)',
                    borderRadius: '10px',
                    padding: '16px',
                    textAlign: 'center',
                    background: 'rgba(6, 182, 212, 0.04)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setJdFile(e.target.files[0]);
                        // Auto-fill role title if empty
                        if (!jdTitle) {
                          const base = e.target.files[0].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                          setJdTitle(base);
                        }
                      }
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                  <FileUp size={24} color="#06B6D4" style={{ margin: '0 auto 6px auto', display: 'block' }} />
                  <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#F1F5F9' }}>
                    {jdFile ? jdFile.name : 'Click or Drag & Drop Job Description PDF/DOCX'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {jdFile ? `${(jdFile.size / 1024).toFixed(1)} KB selected` : 'Skills and requirements extracted automatically'}
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ 
                    padding: '8px 14px', 
                    background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                    justifyContent: 'center'
                  }} 
                  onClick={handleUploadJobDescription}
                  disabled={uploadingJd || !jdFile}
                >
                  {uploadingJd ? (
                    <span>Extracting Skills & Saving JD...</span>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Extract Skills from JD & Select</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {jobMode === 'custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Job Title (e.g. AI Engineer, DevOps Engineer)"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    placeholder="Company (e.g. Google, OpenAI)"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>

                {/* Auto-Fetch from Web Action Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(99, 102, 241, 0.08)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={14} color="#818CF8" />
                    <span style={{ fontSize: '11.5px', color: '#C7D2FE', fontWeight: '500' }}>
                      Auto-discover skills from the web
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchSkillsFromWeb}
                    disabled={fetchingWebSkills || !customTitle.trim()}
                    style={{
                      fontSize: '11.5px',
                      fontWeight: '600',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(99, 102, 241, 0.3)',
                      color: '#fff',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: !customTitle.trim() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {fetchingWebSkills ? (
                      <>
                        <Loader2 size={12} className="spin" />
                        <span>Searching Web...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} color="#818CF8" />
                        <span>Fetch Skills</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  rows={2}
                  placeholder="Paste job description or requirements summary..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                />

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Required Skills:</span>
                    {webSkillsSource && (
                      <span style={{ fontSize: '10.5px', color: '#34D399', fontWeight: '600' }}>
                        ✓ {webSkillsSource}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Required Skills (comma-separated, e.g. Python, PyTorch, MongoDB)"
                    value={customSkills}
                    onChange={(e) => setCustomSkills(e.target.value)}
                  />
                </div>

                <button className="btn btn-primary" style={{ padding: '8px 14px' }} onClick={handleCreateCustomJob}>
                  Save to MongoDB & Select
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
            <Layers size={15} />
            <span>Cache Key: </span>
            <code style={{ color: '#818CF8', fontSize: '12px' }}>
              job_match:{activeResumeId ? `${activeResumeId.slice(0, 6)}...` : 'id'}:{activeJobId ? `${activeJobId.slice(0, 6)}...` : 'id'}
            </code>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={handleMatch}
              disabled={loading || !activeResumeId || !activeJobId}
              style={{ padding: '11px 24px', fontSize: '14px' }}
            >
              {loading ? (
                <span>Evaluating Alignment...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Calculate Job Match</span>
                </>
              )}
            </button>

            {matchResult && (
              <button
                className="btn btn-outline"
                style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34D399' }}
                onClick={handleMatch}
                title="Requests the same comparison to demonstrate instant REDIS CACHE HIT"
              >
                <Zap size={15} />
                <span>Test Cache HIT</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div style={{ marginTop: '14px', color: '#EF4444', fontSize: '13.5px' }}>
            {error}
          </div>
        )}
      </div>

      {/* Match Result Display */}
      {matchResult ? (
        <div>
          {/* Main Score Hero Card */}
          <div className="card" style={{ marginBottom: '28px', background: 'linear-gradient(135deg, rgba(17, 23, 38, 0.9) 0%, rgba(12, 17, 29, 0.9) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '32px' }}>
              <ScoreGauge
                score={matchResult.matchPercentage}
                label="Job Alignment Match"
                size={175}
              />

              <div style={{ flex: 1, minWidth: '320px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-tech" style={{ fontSize: '11px' }}>EVALUATED ROLE</span>
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', letterSpacing: '-0.3px', marginBottom: '6px' }}>
                  {matchResult.jobTitle || currentJob?.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '13.5px', marginBottom: '20px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#06B6D4', fontWeight: '600' }}>
                    <Building2 size={15} />
                    {matchResult.company || currentJob?.company}
                  </span>
                  <span>•</span>
                  <span>Candidate: <strong>{currentResume?.userId?.name || 'Applicant'}</strong> ({currentResume?.fileName})</span>
                </div>

                {/* Progress bar visual */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Required Skills Coverage</span>
                    <span style={{ color: '#34D399', fontWeight: '700' }}>
                      {matchResult.matchedSkills?.length || 0} Matched / {(matchResult.matchedSkills?.length || 0) + (matchResult.missingSkills?.length || 0)} Total
                    </span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${matchResult.matchPercentage}%`,
                        height: '100%',
                        background: matchResult.matchPercentage >= 80 
                          ? 'linear-gradient(90deg, #10B981, #059669)' 
                          : matchResult.matchPercentage >= 60 
                          ? 'linear-gradient(90deg, #F59E0B, #D97706)' 
                          : 'linear-gradient(90deg, #EF4444, #DC2626)',
                        transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Matched vs Missing Skills Split */}
          <div className="grid-2" style={{ marginBottom: '28px' }}>
            <div className="card">
              <div className="card-title" style={{ color: '#34D399' }}>
                <CheckCircle2 size={19} />
                <span>Matched Qualifications ({matchResult.matchedSkills?.length || 0})</span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Verified competencies present in the candidate profile matching requisition criteria:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {matchResult.matchedSkills?.length > 0 ? (
                  matchResult.matchedSkills.map((skill, i) => (
                    <span key={i} className="badge badge-matched" style={{ padding: '6px 14px', fontSize: '12.5px' }}>
                      ✓ {skill}
                    </span>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No common skills matched</span>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-title" style={{ color: '#F87171' }}>
                <XCircle size={19} />
                <span>Skill Gaps ({matchResult.missingSkills?.length || 0})</span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Mandatory requirements from the job requisition not found on candidate resume:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {matchResult.missingSkills?.length > 0 ? (
                  matchResult.missingSkills.map((skill, i) => (
                    <span key={i} className="badge badge-missing" style={{ padding: '6px 14px', fontSize: '12.5px' }}>
                      ✕ {skill}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#10B981', fontSize: '13px', fontWeight: '600' }}>
                    100% Alignment! All mandatory qualifications satisfied.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tailored Recommendations */}
          <div className="card">
            <div className="card-title" style={{ color: '#818CF8' }}>
              <Lightbulb size={19} />
              <span>Tailored Interview & Resume Recommendations</span>
            </div>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: '#E2E8F0' }}>
              {matchResult.recommendations?.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-muted)' }}>
          <Target size={44} color="#475569" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#E2E8F0', marginBottom: '6px' }}>
            Ready to Evaluate Candidate Alignment
          </h3>
          <p style={{ fontSize: '13.5px', maxWidth: '440px', margin: '0 auto 20px auto' }}>
            Choose a candidate profile and target job description above, then click "Calculate Job Match" to run the evaluation engine.
          </p>
        </div>
      )}
    </div>
  );
}
