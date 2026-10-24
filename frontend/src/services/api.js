import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000
});

// Users
export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Resumes
export const getResumes = () => api.get('/resumes');
export const getResumeById = (id) => api.get(`/resumes/${id}`);
export const uploadResume = (formData) => api.post('/resumes', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteResume = (id) => api.delete(`/resumes/${id}`);

// Jobs
export const getJobs = () => api.get('/jobs');
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const createJob = (data) => api.post('/jobs', data);
export const uploadJob = (formData) => api.post('/jobs/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const fetchRoleSkillsFromWeb = (role) => api.get(`/jobs/fetch-skills?role=${encodeURIComponent(role)}`);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);

// Analysis
export const analyzeResume = (resumeId) => api.post(`/analyze/${resumeId}`);
export const getAnalysis = (resumeId) => api.get(`/analysis/${resumeId}`);
export const getUserAnalyses = (userId) => api.get(`/users/${userId}/analysis`);

// Matching
export const matchResumeToJob = (resumeId, jobDescriptionId) => api.post('/match', { resumeId, jobDescriptionId });
export const getAllMatches = () => api.get('/match');
export const getMatchById = (id) => api.get(`/match/${id}`);

// Stats & Aggregations
export const getDashboardStats = () => api.get('/stats/dashboard');
export const getAtsStats = () => api.get('/stats/ats');
export const getMissingSkillsStats = () => api.get('/stats/missing-skills');
export const getJobMatchStats = () => api.get('/stats/job-matches');
export const getActivityStats = () => api.get('/stats/activity');
export const getUserAtsHistory = (userId) => api.get(`/stats/user/${userId}/ats-history`);

// DB Showcase & Redis Caching
export const getDbIndexes = () => api.get('/db/indexes');
export const getDbCollections = () => api.get('/db/collections');
export const getDbDocuments = (collectionName) => api.get(`/db/collections/${collectionName}`);
export const getCacheStatus = () => api.get('/db/cache-status');
export const clearCache = () => api.post('/db/cache-clear');

export default api;
