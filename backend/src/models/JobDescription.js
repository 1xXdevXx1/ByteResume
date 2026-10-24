const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description text is required']
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  preferredSkills: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false });

// Indexes on title for filtering and full-text search
jobDescriptionSchema.index({ title: 1 });
jobDescriptionSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);
