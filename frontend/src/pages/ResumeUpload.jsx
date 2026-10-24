import React, { useState, useEffect } from 'react';
import { uploadResume, getUsers, createUser } from '../services/api';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  ArrowRight,
  Code,
  GraduationCap,
  Briefcase,
  FileCode2,
  Sparkles
} from 'lucide-react';

export default function ResumeUpload({ setActiveTab, setSelectedResumeId }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'text'

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
      if (res.data.length > 0 && !selectedUserId) {
        setSelectedUserId(res.data[0]._id);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    try {
      const res = await createUser({ name: newUserName, email: newUserEmail });
      setUsers([res.data, ...users]);
      setSelectedUserId(res.data._id);
      setIsCreatingUser(false);
      setNewUserName('');
      setNewUserEmail('');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (uploadMode === 'file' && !file) {
      setError('Please select a PDF or DOCX resume file.');
      return;
    }
    if (uploadMode === 'text' && !rawText.trim()) {
      setError('Please paste the resume text in the box below.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('userId', selectedUserId);

      if (uploadMode === 'file') {
        formData.append('file', file);
      } else {
        formData.append('rawText', rawText);
        formData.append('fileName', 'Pasted_Resume.txt');
      }

      const res = await uploadResume(formData);
      setResult(res.data);
      if (setSelectedResumeId) {
        setSelectedResumeId(res.data._id);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#818CF8' }}>
            Resume Ingestion Engine
          </span>
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', letterSpacing: '-0.6px' }}>
          Upload & Parse Resume
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Extract text and NLP skills from PDF/DOCX documents and store directly in MongoDB <code style={{ color: '#818CF8' }}>resumes</code> collection.
        </p>
      </div>

      <div className="grid-2">
        {/* Upload Form Card */}
        <div className="card">
          <div className="card-title">
            <UploadCloud size={18} color="#818CF8" />
            <span>Document Submission</span>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              marginBottom: '20px',
              fontSize: '13.5px'
            }}>
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          {/* Candidate Selection */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#F1F5F9' }}>
                Assign Candidate Profile
              </label>
              <button 
                type="button" 
                onClick={() => setIsCreatingUser(!isCreatingUser)}
                style={{ fontSize: '12px', fontWeight: '600', color: '#818CF8', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <UserPlus size={14} />
                <span>{isCreatingUser ? 'Select Existing' : '+ New Candidate'}</span>
              </button>
            </div>

            {isCreatingUser ? (
              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
                <input 
                  type="text" 
                  placeholder="Full Name (e.g. Siddharth Rao)" 
                  value={newUserName} 
                  onChange={(e) => setNewUserName(e.target.value)}
                  style={{ marginBottom: '10px' }}
                />
                <input 
                  type="email" 
                  placeholder="Email (e.g. siddharth@vitstudent.ac.in)" 
                  value={newUserEmail} 
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  style={{ marginBottom: '12px' }}
                />
                <button className="btn btn-primary" style={{ width: '100%', padding: '9px' }} onClick={handleCreateUser}>
                  Save Candidate to MongoDB
                </button>
              </div>
            ) : (
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Mode Switch Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'var(--bg-input)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              className={`btn ${uploadMode === 'file' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, padding: '8px', fontSize: '13px', border: 'none' }}
              onClick={() => setUploadMode('file')}
            >
              PDF / DOCX File
            </button>
            <button
              type="button"
              className={`btn ${uploadMode === 'text' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, padding: '8px', fontSize: '13px', border: 'none' }}
              onClick={() => setUploadMode('text')}
            >
              Paste Text
            </button>
          </div>

          {/* File Upload Zone */}
          {uploadMode === 'file' ? (
            <div style={{
              border: '2px dashed rgba(99, 102, 241, 0.3)',
              borderRadius: '12px',
              padding: '36px 20px',
              textAlign: 'center',
              background: 'linear-gradient(180deg, rgba(14, 21, 36, 0.6) 0%, rgba(9, 13, 22, 0.8) 100%)',
              marginBottom: '22px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <input
                type="file"
                id="resumeFileInput"
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <label htmlFor="resumeFileInput" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}>
                  <UploadCloud size={28} color="#818CF8" />
                </div>
                <span style={{ fontSize: '14.5px', fontWeight: '700', color: '#F8FAFC' }}>
                  {file ? file.name : 'Click to select or drop resume document'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Supports PDF, DOCX, DOC, TXT (up to 10MB)
                </span>
              </label>
            </div>
          ) : (
            <div style={{ marginBottom: '22px' }}>
              <textarea
                rows={9}
                placeholder="Paste candidate resume text, skills summary, education, and projects here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: '14px' }}
            disabled={loading}
            onClick={handleUpload}
          >
            {loading ? (
              <span>Extracting & Parsing NLP Entities...</span>
            ) : (
              <>
                <Sparkles size={17} />
                <span>Upload & Parse into MongoDB</span>
              </>
            )}
          </button>
        </div>

        {/* Extraction Result Showcase */}
        <div className="card">
          <div className="card-title">
            <CheckCircle2 size={18} color="#10B981" />
            <span>Extracted Profile Metadata</span>
          </div>

          {result ? (
            <div>
              <div style={{
                background: 'var(--bg-input)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Stored Document:</span>
                  <span style={{ color: '#fff', fontWeight: '700', fontSize: '13.5px' }}>{result.fileName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>MongoDB ObjectId:</span>
                  <code style={{ color: '#818CF8', fontSize: '12px' }}>{result._id}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Document Format:</span>
                  <span className="badge badge-tech" style={{ textTransform: 'uppercase', fontSize: '11px' }}>
                    {result.fileType}
                  </span>
                </div>
              </div>

              {/* Skills Discovered */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Code size={16} color="#818CF8" />
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#F1F5F9' }}>
                    Extracted Skills ({result.skills.length})
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {result.skills.map((skill, i) => (
                    <span key={i} className="badge badge-tech">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education */}
              {result.education && result.education.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <GraduationCap size={16} color="#C084FC" />
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#F1F5F9' }}>Education</span>
                  </div>
                  <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {result.education.map((edu, i) => (
                      <li key={i}>{edu}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Projects */}
              {result.projects && result.projects.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Briefcase size={16} color="#34D399" />
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#F1F5F9' }}>Projects</span>
                  </div>
                  <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {result.projects.map((proj, i) => (
                      <li key={i}>{proj}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                className="btn btn-success"
                style={{ width: '100%', padding: '13px', fontSize: '14px' }}
                onClick={() => {
                  if (setSelectedResumeId) setSelectedResumeId(result._id);
                  setActiveTab('analysis');
                }}
              >
                <span>Proceed to ATS Analysis & Redis Cache</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--text-muted)' }}>
              <FileCode2 size={44} color="#475569" style={{ marginBottom: '14px' }} />
              <p style={{ fontSize: '14px' }}>
                Upload a candidate resume or choose an existing profile to view extracted NLP skills.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
