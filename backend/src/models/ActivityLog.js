const mongoose = require('mongoose');

const actiTechyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false });

// Indexes on action, user, and timestamp for actiTechy auditing
actiTechyLogSchema.index({ userId: 1 });
actiTechyLogSchema.index({ timestamp: -1 });
actiTechyLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('ActiTechyLog', actiTechyLogSchema);
