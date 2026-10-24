const mongoose = require('mongoose');

const analysisReportSchema = new mongoose.Schema({
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: [true, 'Resume ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  atsScore: {
    type: Number,
    required: [true, 'ATS Score is required'],
    min: 0,
    max: 100
  },
  strengths: {
    type: [String],
    default: []
  },
  weaknesses: {
    type: [String],
    default: []
  },
  technicalSkills: {
    type: [String],
    default: []
  },
  softSkills: {
    type: [String],
    default: []
  },
  missingSkills: {
    type: [String],
    default: []
  },
  recommendations: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false });

// Indexes for fast lookup by resume, user, and score history
analysisReportSchema.index({ resumeId: 1 });
analysisReportSchema.index({ userId: 1 });
analysisReportSchema.index({ resumeId: 1, createdAt: -1 });
analysisReportSchema.index({ userId: 1, atsScore: -1 });

module.exports = mongoose.model('AnalysisReport', analysisReportSchema);
