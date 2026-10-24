const mongoose = require('mongoose');
const AnalysisReport = require('../models/AnalysisReport');
const MatchResult = require('../models/MatchResult');
const ActivityLog = require('../models/ActivityLog');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const redisClient = require('../services/redisClient');

// 1. Average ATS Score Aggregation
// Uses $group to calculate average, minimum, maximum, and total count
exports.getAvgAtsScore = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: null,
          averageAtsScore: { $avg: '$atsScore' },
          highestScore: { $max: '$atsScore' },
          lowestScore: { $min: '$atsScore' },
          totalReports: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          averageAtsScore: { $round: ['$averageAtsScore', 1] },
          highestScore: 1,
          lowestScore: 1,
          totalReports: 1
        }
      }
    ];

    const result = await AnalysisReport.aggregate(pipeline);
    return res.status(200).json(result[0] || { averageAtsScore: 0, highestScore: 0, lowestScore: 0, totalReports: 0 });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 2. ATS Score History for a User Aggregation
// Uses $match, $lookup, $unwind, $sort, and $project
exports.getUserAtsHistory = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    const pipeline = [
      { $match: { userId } },
      {
        $lookup: {
          from: 'resumes',
          localField: 'resumeId',
          foreignField: '_id',
          as: 'resume'
        }
      },
      { $unwind: '$resume' },
      { $sort: { createdAt: 1 } },
      {
        $project: {
          _id: 1,
          atsScore: 1,
          fileName: '$resume.fileName',
          createdAt: 1,
          technicalSkillsCount: { $size: '$technicalSkills' },
          missingSkillsCount: { $size: '$missingSkills' }
        }
      }
    ];

    const result = await AnalysisReport.aggregate(pipeline);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 3. Most Frequently Missing Skills Aggregation
// Uses $unwind, $group, $sort, $limit
exports.getMissingSkillsStats = async (req, res) => {
  try {
    const pipeline = [
      { $unwind: '$missingSkills' },
      {
        $group: {
          _id: '$missingSkills',
          frequency: { $sum: 1 }
        }
      },
      { $sort: { frequency: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          skill: '$_id',
          frequency: 1
        }
      }
    ];

    const result = await AnalysisReport.aggregate(pipeline);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 4. Average Job-Match Percentage Aggregation
// Uses $group, $project
exports.getAvgJobMatch = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: null,
          averageMatchPercentage: { $avg: '$matchPercentage' },
          highestMatch: { $max: '$matchPercentage' },
          lowestMatch: { $min: '$matchPercentage' },
          totalMatches: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          averageMatchPercentage: { $round: ['$averageMatchPercentage', 1] },
          highestMatch: 1,
          lowestMatch: 1,
          totalMatches: 1
        }
      }
    ];

    const result = await MatchResult.aggregate(pipeline);
    return res.status(200).json(result[0] || { averageMatchPercentage: 0, highestMatch: 0, lowestMatch: 0, totalMatches: 0 });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 5. Job-Match Statistics by Job Title Aggregation
// Uses $lookup, $unwind, $group, $sort, $project
exports.getJobMatchByTitleStats = async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: 'jobdescriptions',
          localField: 'jobDescriptionId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $group: {
          _id: '$job.title',
          company: { $first: '$job.company' },
          totalApplications: { $sum: 1 },
          averageMatch: { $avg: '$matchPercentage' },
          maxMatch: { $max: '$matchPercentage' },
          minMatch: { $min: '$matchPercentage' }
        }
      },
      {
        $project: {
          _id: 0,
          jobTitle: '$_id',
          company: 1,
          totalApplications: 1,
          averageMatch: { $round: ['$averageMatch', 1] },
          maxMatch: 1,
          minMatch: 1
        }
      },
      { $sort: { totalApplications: -1, averageMatch: -1 } }
    ];

    const result = await MatchResult.aggregate(pipeline);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 6. Activity Count by Action Aggregation
// Uses $group, $sort, $project
exports.getActivityStats = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          lastPerformed: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          action: '$_id',
          count: 1,
          lastPerformed: 1
        }
      }
    ];

    const result = await ActivityLog.aggregate(pipeline);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Dashboard Consolidated Stats (Cached in Redis)
exports.getDashboardStats = async (req, res) => {
  const cacheKey = 'stats:dashboard';
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({ source: 'REDIS_CACHE_HIT', cached: true, data: cached });
    }

    const [totalResumes, totalJobs, atsData, matchData, recentActivities] = await Promise.all([
      Resume.countDocuments(),
      JobDescription.countDocuments(),
      AnalysisReport.aggregate([
        {
          $group: {
            _id: null,
            averageAtsScore: { $avg: '$atsScore' },
            totalAnalyses: { $sum: 1 }
          }
        }
      ]),
      MatchResult.aggregate([
        {
          $group: {
            _id: null,
            averageMatch: { $avg: '$matchPercentage' },
            totalMatches: { $sum: 1 }
          }
        }
      ]),
      ActivityLog.find().sort({ timestamp: -1 }).limit(8).populate('userId', 'name email')
    ]);

    const dashboardPayload = {
      totalResumes,
      totalJobs,
      totalAnalyses: atsData[0]?.totalAnalyses || 0,
      averageAtsScore: atsData[0]?.averageAtsScore ? Math.round(atsData[0].averageAtsScore) : 0,
      totalJobMatches: matchData[0]?.totalMatches || 0,
      averageJobMatch: matchData[0]?.averageMatch ? Math.round(matchData[0].averageMatch) : 0,
      recentActivities
    };

    // Cache in Redis for 120 seconds
    await redisClient.set(cacheKey, dashboardPayload, 120);

    return res.status(200).json({ source: 'REDIS_CACHE_MISS_SAVED_TO_REDIS', cached: false, data: dashboardPayload });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
