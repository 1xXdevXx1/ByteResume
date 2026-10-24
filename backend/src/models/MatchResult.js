const mongoose = require('mongoose');

const matchResultSchema = new mongoose.Schema({
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: [true, 'Resume ID is required']
  },
  jobDescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
    required: [true, 'Job Description ID is required']
  },
  matchPercentage: {
    type: Number,
    required: [true, 'Match percentage is required'],
    min: 0,
    max: 100
  },
  matchedSkills: {
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

// Indexes on resume and job for rapid match result retrieval
matchResultSchema.index({ resumeId: 1 });
matchResultSchema.index({ jobDescriptionId: 1 });
matchResultSchema.index({ resumeId: 1, jobDescriptionId: 1 });
matchResultSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MatchResult', matchResultSchema);
