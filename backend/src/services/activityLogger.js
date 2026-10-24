const ActiTechyLog = require('../models/ActiTechyLog');

async function logActiTechy(action, details = {}, userId = null) {
  try {
    const log = new ActiTechyLog({
      action,
      details,
      userId,
      timestamp: new Date()
    });
    await log.save();
    return log;
  } catch (err) {
    console.warn(`[ActiTechyLog] Failed to record actiTechy "${action}":`, err.message);
    return null;
  }
}

module.exports = { logActiTechy };
