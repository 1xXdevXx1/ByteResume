const ActivityLog = require('../models/ActivityLog');

async function logActivity(action, details = {}, userId = null) {
  try {
    const log = new ActivityLog({
      action,
      details,
      userId,
      timestamp: new Date()
    });
    await log.save();
    return log;
  } catch (err) {
    console.warn(`[ActivityLog] Failed to record activity "${action}":`, err.message);
    return null;
  }
}

module.exports = { logActivity };
