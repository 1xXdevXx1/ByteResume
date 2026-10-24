const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    trim: true
  },
  rawText: {
    type: String,
    default: ''
  },
  skills: {
    type: [String],
    default: []
  },
  education: {
    type: [String],
    default: []
  },
  experience: {
    type: [String],
    default: []
  },
  projects: {
    type: [String],
    default: []
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false });

// Indexes for fast retrieval by user and recency
resumeSchema.index({ userId: 1 });
resumeSchema.index({ uploadedAt: -1 });
resumeSchema.index({ userId: 1, uploadedAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
