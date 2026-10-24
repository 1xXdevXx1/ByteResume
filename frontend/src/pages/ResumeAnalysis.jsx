import React, { useState, useEffect } from 'react';
import { getResumes, analyzeResume, getAnalysis } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import CacheBadge from '../components/CacheBadge';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  Code, 
  Users, 
  AlertTriangle,
  Zap,
  ArrowRight,
  Sparkles,
  BarChart3
} from 'lucide-react';

export default function ResumeAnalysis({ selectedResumeId, setSelectedResumeId, setActiveTab }) {
  const [resumes, setResumes] = useState([]);
  const [activeResumeId, setActiveResumeId] = useState(selectedResumeId || '');
  const [analysis, setAnalysis] = useState(null);
  const [sourceInfo, setSourceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResumes();
  }, []);

  useEffect(() => {
    if (selectedResumeId) {
      setActiveResumeId(selectedResumeId);
      fetchExistingAnalysis(selectedResumeId);
    }
  }, [selectedResumeId]);

  const loadResumes = async () => {
    try {
      const res = await getResumes();
      setResumes(res.data);
      if (res.data.length > 0 && !activeResumeId && !selectedResumeId) {
        setActiveResumeId(res.data[0]._id);
        fetchExistingAnalysis(res.data[0]._id);
      }
    } catch (err) {
      console.error('Error loading resumes:', err);
    }
  };

  const fetchExistingAnalysis = async (resumeId) => {
    if (!resumeId) return;
    const start = performance.now();
    try {
      const res = await getAnalysis(resumeId);
      const latency = Math.round(performance.now() - start);
      setAnalysis(res.data.data);
      setSourceInfo({
        source: res.data.source,
        cached: res.data.cached,
        key: `resume_analysis:${resumeId}`,
        latency
      });
    } catch (err) {
      setAnalysis(null);
      setSourceInfo(null);
    }
  };

  const handleRunAnalysis = async () => {
    if (!activeResumeId) return;
    setLoading(true);
    setError(null);
    const start = performance.now();

    try {
      const res = await analyzeResume(activeResumeId);
      const latency = Math.round(performance.now() - start);
      setAnalysis(res.data.data);
      setSourceInfo({
        source: res.data.source,
        cached: res.data.cached,
        key: `resume_analysis:${activeResumeId}`,
        latency
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentResume = resumes.find(r => r._id === activeResumeId);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#818CF8' }}>
              Deterministic Scoring Engine
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', letterSpacing: '-0.6px' }}>
            ATS Evaluation & Feedback
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Multi-pillar candidate scoring with Redis TTL caching and persistent MongoDB reports.
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

      {/* Control Bar */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '320px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#F1F5F9', marginBottom: '8px', display: 'block' }}>
              Select Candidate Profile from MongoDB
            </label>
            <select
              value={activeResumeId}
              onChange={(e) => {
                setActiveResumeId(e.target.value);
                if (setSelectedResumeId) setSelectedResumeId(e.target.value);
                fetchExistingAnalysis(e.target.value);
              }}
            >
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.fileName} — {r.userId?.name || 'Candidate'} ({r.skills?.length || 0} skills)
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={handleRunAnalysis}
              disabled={loading || !activeResumeId}
              style={{ padding: '11px 22px' }}
            >
              {loading ? (
                <span>Evaluating ATS...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Compute / Fetch Analysis</span>
                </>
              )}
            </button>

            {analysis && (
              <button
                className="btn btn-outline"
                style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34D399', padding: '11px 18px' }}
                onClick={handleRunAnalysis}
                title="Requests the same key again to demonstrate instantaneous REDIS CACHE HIT"
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

      {analysis ? (
        <div>
          {/* Main Hero Card */}
          <div className="card" style={{ marginBottom: '28px', background: 'linear-gradient(135deg, rgba(17, 23, 38, 0.9) 0%, rgba(12, 17, 29, 0.9) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '32px' }}>
              <ScoreGauge score={analysis.atsScore} label="Overall ATS Score" size={175} />

              {/* 4 Pillars Breakdown */}
              <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={17} color="#818CF8" />
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#F1F5F9' }}>
                    Transparent 4-Pillar Scoring Model
                  </h4>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>1. Technical Skills Breadth (Max 40)</span>
                    <span style={{ color: '#818CF8', fontWeight: '700' }}>
                      {analysis.scoreBreakdown?.technicalSkills ?? Math.min(40, (analysis.technicalSkills?.length || 5) * 3)} / 40
                    </span>
                  </div>
                  <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${((analysis.scoreBreakdown?.technicalSkills || 30) / 40) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #6366F1, #818CF8)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>2. Section Completeness (Max 25)</span>
                    <span style={{ color: '#34D399', fontWeight: '700' }}>
                      {analysis.scoreBreakdown?.sectionCompleteness ?? 23} / 25
                    </span>
                  </div>
                  <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${((analysis.scoreBreakdown?.sectionCompleteness || 23) / 25) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #34D399)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>3. Soft Skills & Team Dynamics (Max 15)</span>
                    <span style={{ color: '#C084FC', fontWeight: '700' }}>
                      {analysis.scoreBreakdown?.softSkills ?? 12} / 15
                    </span>
                  </div>
                  <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${((analysis.scoreBreakdown?.softSkills || 12) / 15) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #C084FC)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>4. Action Verbs, Metrics & Impact (Max 20)</span>
                    <span style={{ color: '#FBBF24', fontWeight: '700' }}>
                      {analysis.scoreBreakdown?.actionMetrics ?? 16} / 20
                    </span>
                  </div>
                  <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${((analysis.scoreBreakdown?.actionMetrics || 16) / 20) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid-2" style={{ marginBottom: '28px' }}>
            <div className="card">
              <div className="card-title" style={{ color: '#34D399' }}>
                <CheckCircle2 size={19} />
                <span>Identified Strengths ({analysis.strengths?.length || 0})</span>
              </div>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#E2E8F0' }}>
                {analysis.strengths?.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <div className="card-title" style={{ color: '#F87171' }}>
                <XCircle size={19} />
                <span>Areas for Improvement ({analysis.weaknesses?.length || 0})</span>
              </div>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#E2E8F0' }}>
                {analysis.weaknesses?.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical Skills & Soft Skills Badges */}
          <div className="grid-2" style={{ marginBottom: '28px' }}>
            <div className="card">
              <div className="card-title">
                <Code size={18} color="#818CF8" />
                <span>Technical Skills ({analysis.technicalSkills?.length || 0})</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {analysis.technicalSkills?.map((skill, i) => (
                  <span key={i} className="badge badge-tech" style={{ padding: '6px 14px', fontSize: '12.5px' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-title">
                <Users size={18} color="#C084FC" />
                <span>Soft Skills & Behavioral Competencies</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {analysis.softSkills && analysis.softSkills.length > 0 ? (
                  analysis.softSkills.map((skill, i) => (
                    <span key={i} className="badge badge-soft" style={{ padding: '6px 14px', fontSize: '12.5px' }}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No explicit soft skills detected</span>
                )}
              </div>
            </div>
          </div>

          {/* Recommended Skills & Strategic Advice */}
          <div className="grid-2" style={{ marginBottom: '32px' }}>
            <div className="card">
              <div className="card-title" style={{ color: '#F59E0B' }}>
                <AlertTriangle size={18} />
                <span>High-Impact Skills to Acquire</span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Industry benchmark skills missing in this resume profile:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {analysis.missingSkills?.map((skill, i) => (
                  <span key={i} className="badge badge-missing" style={{ padding: '6px 14px', fontSize: '12.5px' }}>
                    + {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-title" style={{ color: '#818CF8' }}>
                <Lightbulb size={18} />
                <span>Strategic Improvement Advice</span>
              </div>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#E2E8F0' }}>
                {analysis.recommendations?.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Link to Matching */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '14px' }}
              onClick={() => setActiveTab('match')}
            >
              <span>Match Against Target Job Roles</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-muted)' }}>
          <Sparkles size={44} color="#475569" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#E2E8F0', marginBottom: '6px' }}>
            Ready to Evaluate Candidate
          </h3>
          <p style={{ fontSize: '13.5px', maxWidth: '440px', margin: '0 auto 20px auto' }}>
            Click "Compute / Fetch Analysis" to trigger NLP evaluation, calculate the 4-pillar ATS score, and store the report in MongoDB with Redis caching.
          </p>
          <button className="btn btn-primary" onClick={handleRunAnalysis} disabled={!activeResumeId}>
            <Play size={16} />
            <span>Run ATS Analysis</span>
          </button>
        </div>
      )}
    </div>
  );
}
