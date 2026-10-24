const mongoose = require('mongoose');
const User = require('../models/User');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const AnalysisReport = require('../models/AnalysisReport');
const MatchResult = require('../models/MatchResult');
const ActiTechyLog = require('../models/ActiTechyLog');
const redisClient = require('../services/redisClient');

// Descriptive rationale for each index (for Production Architecture evaluation explanation)
const INDEX_EXPLANATIONS = {
  users: {
    'email_1': 'Unique index on email ensures no duplicate candidate accounts and provides O(1) B-tree lookup time during authentication and user retrieval.'
  },
  resumes: {
    'userId_1': 'Fast lookup of all resumes uploaded by a specific user.',
    'uploadedAt_-1': 'Optimizes chronological queries to display the most recently uploaded resumes first.',
    'userId_1_uploadedAt_-1': 'Compound index optimizing simultaneous user filtering and chronological sorting without needing in-memory sort.'
  },
  jobdescriptions: {
    'title_1': 'Rapid sorting and prefix filtering on job positions.',
    'title_text_description_text': 'Text index enabling full-text keyword searches across job postings.'
  },
  analysisreports: {
    'resumeId_1': 'Critical for retrieving the latest ATS analysis report associated with a resume in O(log N).',
    'userId_1': 'Accelerates candidate dashboard and user historical analytics.',
    'resumeId_1_createdAt_-1': 'Compound index fetching the most recent analysis for a resume.',
    'userId_1_atsScore_-1': 'Compound index optimizing user performance leaderboard and score tracking.'
  },
  matchresults: {
    'resumeId_1': 'Fetches all job applications/matches attempted by a candidate resume.',
    'jobDescriptionId_1': 'Rapidly gathers all candidate matches for a specific recruiter job opening.',
    'resumeId_1_jobDescriptionId_1': 'Compound index for quick verification of whether a resume has already been evaluated against a job posting.'
  },
  actiTechylogs: {
    'userId_1': 'Audits all system actions triggered by an individual user.',
    'timestamp_-1': 'Powers recent actiTechy feed and time-series audit queries.',
    'action_1_timestamp_-1': 'Compound index optimizing audit log filtering by action type sorted by recency.'
  }
};

// GET /api/db/indexes
exports.getDatabaseIndexes = async (req, res) => {
  try {
    const models = [
      { name: 'users', model: User },
      { name: 'resumes', model: Resume },
      { name: 'jobdescriptions', model: JobDescription },
      { name: 'analysisreports', model: AnalysisReport },
      { name: 'matchresults', model: MatchResult },
      { name: 'actiTechylogs', model: ActiTechyLog }
    ];

    const report = [];

    for (const item of models) {
      const indexes = await item.model.collection.indexes();
      const explanations = INDEX_EXPLANATIONS[item.name] || {};

      const formatted = indexes.map(idx => ({
        name: idx.name,
        key: idx.key,
        unique: !!idx.unique,
        explanation: explanations[idx.name] || 'General index for query performance optimization.'
      }));

      report.push({
        collection: item.name,
        indexCount: formatted.length,
        indexes: formatted
      });
    }

    return res.status(200).json(report);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/db/collections
exports.getCollectionStats = async (req, res) => {
  try {
    const collections = [
      { name: 'users', model: User, description: 'Candidate accounts & contact details' },
      { name: 'resumes', model: Resume, description: 'Uploaded PDF/DOCX resumes, raw text & parsed skills' },
      { name: 'jobDescriptions', model: JobDescription, description: 'Recruiter job postings & required skills' },
      { name: 'analysisReports', model: AnalysisReport, description: 'ATS scores (0-100), strengths, weaknesses & recommendations' },
      { name: 'matchResults', model: MatchResult, description: 'Resume-to-job match percentages & skill gaps' },
      { name: 'actiTechyLogs', model: ActiTechyLog, description: 'Audit trail of user actions & system events' }
    ];

    const stats = [];
    for (const c of collections) {
      const count = await c.model.countDocuments();
      stats.push({
        name: c.name,
        count,
        description: c.description
      });
    }

    return res.status(200).json(stats);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/db/collections/:name
exports.getCollectionDocuments = async (req, res) => {
  try {
    const { name } = req.params;
    let model = null;
    if (name.toLowerCase() === 'users') model = User;
    else if (name.toLowerCase() === 'resumes') model = Resume;
    else if (name.toLowerCase() === 'jobdescriptions') model = JobDescription;
    else if (name.toLowerCase() === 'analysisreports') model = AnalysisReport;
    else if (name.toLowerCase() === 'matchresults') model = MatchResult;
    else if (name.toLowerCase() === 'actiTechylogs') model = ActiTechyLog;

    if (!model) {
      return res.status(404).json({ error: `Unknown collection: ${name}` });
    }

    const docs = await model.find().sort({ _id: -1 }).limit(20);
    return res.status(200).json({
      collection: name,
      count: docs.length,
      documents: docs
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/db/cache-status
exports.getCacheStatus = async (req, res) => {
  try {
    const status = await redisClient.getStats();
    return res.status(200).json(status);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/db/cache-clear
exports.clearCache = async (req, res) => {
  try {
    await redisClient.flushAll();
    return res.status(200).json({ message: 'Redis cache flushed successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
