import React, { useState, useEffect } from 'react';
import { getJobs, createJob, updateJob, deleteJob } from '../services/api';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Building2, 
  GitCompare, 
  ArrowRight 
} from 'lucide-react';

export default function JobDescriptions({ setActiveTab, setSelectedJobId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await getJobs();
      setJobs(res.data);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    if (!title || !company || !description) {
      setError('Title, company, and description are required.');
      return;
    }

    try {
      const payload = {
        title,
        company,
        description,
        requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferredSkills: preferredSkills.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await createJob(payload);
      setJobs([res.data, ...jobs]);
      setIsAdding(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleUpdate = async (id) => {
    setError(null);
    try {
      const payload = {
        title,
        company,
        description,
        requiredSkills: typeof requiredSkills === 'string' ? requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : requiredSkills,
        preferredSkills: typeof preferredSkills === 'string' ? preferredSkills.split(',').map(s => s.trim()).filter(Boolean) : preferredSkills
      };

      const res = await updateJob(id, payload);
      setJobs(jobs.map(j => j._id === id ? res.data : j));
      setEditingId(null);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job description from MongoDB? This will also cascade delete related match results.')) {
      return;
    }
    try {
      await deleteJob(id);
      setJobs(jobs.filter(j => j._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const startEdit = (job) => {
    setEditingId(job._id);
    setTitle(job.title);
    setCompany(job.company);
    setDescription(job.description);
    setRequiredSkills((job.requiredSkills || []).join(', '));
    setPreferredSkills((job.preferredSkills || []).join(', '));
  };

  const resetForm = () => {
    setTitle('');
    setCompany('');
    setDescription('');
    setRequiredSkills('');
    setPreferredSkills('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px' }}>
            Job Postings & Requirements
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: '14px', marginTop: '4px' }}>
            Manage target industry jobs stored in MongoDB 'jobDescriptions' collection with required skill matrices.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingId(null);
            resetForm();
          }}
        >
          <Plus size={16} />
          <span>{isAdding ? 'Cancel' : 'Add New Job Description'}</span>
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171', borderRadius: '8px', marginBottom: '20px', fontSize: '13.5px' }}>
          {error}
        </div>
      )}

      {/* Add Job Form Modal/Card */}
      {isAdding && (
        <div className="card" style={{ marginBottom: '32px', borderColor: '#3B82F6' }}>
          <div className="card-title">
            <Briefcase size={20} color="#3B82F6" />
            <span>Create New Job Description (MongoDB CREATE)</span>
          </div>
          <form onSubmit={handleCreate}>
            <div className="grid-2" style={{ marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '4px', display: 'block' }}>Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '4px', display: 'block' }}>Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Google Cloud"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '4px', display: 'block' }}>Job Description</label>
              <textarea
                rows={4}
                placeholder="Overview of duties, team culture, and engineering expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid-2" style={{ marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '4px', display: 'block' }}>
                  Required Skills (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="React, Node.js, MongoDB, Redis, Docker"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '4px', display: 'block' }}>
                  Preferred Skills (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="AWS, Kubernetes, System Design"
                  value={preferredSkills}
                  onChange={(e) => setPreferredSkills(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setIsAdding(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success">
                Save to MongoDB
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jobs Catalog */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Loading job descriptions...</div>
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job._id} className="card" style={{ transition: 'border-color 0.2s' }}>
              {editingId === job._id ? (
                // Inline Edit Form
                <div>
                  <h4 style={{ color: '#60A5FA', fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
                    Edit Job Description (MongoDB UPDATE)
                  </h4>
                  <div className="grid-2" style={{ marginBottom: '12px' }}>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>
                  <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ marginBottom: '12px' }} />
                  <div className="grid-2" style={{ marginBottom: '14px' }}>
                    <input type="text" value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} placeholder="Required skills" />
                    <input type="text" value={preferredSkills} onChange={(e) => setPreferredSkills(e.target.value)} placeholder="Preferred skills" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button className="btn btn-outline" onClick={() => setEditingId(null)}>Cancel</button>
                    <button className="btn btn-success" onClick={() => handleUpdate(job._id)}>Save Changes</button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>
                        {job.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9CA3AF', fontSize: '13px', marginTop: '4px' }}>
                        <Building2 size={15} />
                        <span>{job.company}</span>
                        <span>•</span>
                        <code style={{ fontSize: '11px', color: '#6B7280' }}>ID: {job._id}</code>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => startEdit(job)}
                        title="Edit Job"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '12px', color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        onClick={() => handleDelete(job._id)}
                        title="Delete Job"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                        onClick={() => {
                          if (setSelectedJobId) setSelectedJobId(job._id);
                          setActiveTab('match');
                        }}
                      >
                        <GitCompare size={14} />
                        <span>Match Resume</span>
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '13.5px', color: '#D1D5DB', marginBottom: '14px', lineHeight: 1.6 }}>
                    {job.description}
                  </p>

                  {/* Required & Preferred Skills */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#9CA3AF', fontWeight: '500', width: '110px' }}>Required:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {job.requiredSkills && job.requiredSkills.map((s, i) => (
                          <span key={i} className="badge badge-tech">{s}</span>
                        ))}
                      </div>
                    </div>

                    {job.preferredSkills && job.preferredSkills.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#9CA3AF', fontWeight: '500', width: '110px' }}>Preferred:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {job.preferredSkills.map((s, i) => (
                            <span key={i} className="badge badge-soft">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            No job descriptions found in MongoDB. Click "Add New Job Description" to create one!
          </div>
        )}
      </div>
    </div>
  );
}
