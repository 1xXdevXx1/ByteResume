const MatchResult = require('../models/MatchResult');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const redisClient = require('../services/redisClient');
const { matchJob } = require('../services/aiService');
const { logActiTechy } = require('../services/actiTechyLogger');

const MATCH_CACHE_TTL = 3600; // 1 hour

// POST /api/match
exports.matchResumeToJob = async (req, res) => {
  try {
    const { resumeId, jobDescriptionId } = req.body;
    if (!resumeId || !jobDescriptionId) {
      return res.status(400).json({ error: 'Both resumeId and jobDescriptionId are required' });
    }

    const cacheKey = `job_match:${resumeId}:${jobDescriptionId}`;

    // 1. Check Redis Cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        source: 'REDIS_CACHE_HIT',
        cached: true,
        data: cachedData
      });
    }

    // 2. Fetch Resume and Job from MongoDB
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const job = await JobDescription.findById(jobDescriptionId);
    if (!job) {
      return res.status(404).json({ error: 'Job description not found' });
    }

    console.log(`[MatchController] Computing match for Resume "${resume.fileName}" vs Job "${job.title}"...`);

    // 3. Compute matching via AI Service
    const aiResult = await matchJob({
      skills: resume.skills,
      rawText: resume.rawText
    }, {
      title: job.title,
      company: job.company,
      description: job.description,
      requiredSkills: job.requiredSkills,
      preferredSkills: job.preferredSkills
    });

    // 4. Save match result in MongoDB
    const matchRecord = new MatchResult({
      resumeId: resume._id,
      jobDescriptionId: job._id,
      matchPercentage: aiResult.matchPercentage,
      matchedSkills: aiResult.matchedSkills || [],
      missingSkills: aiResult.missingSkills || [],
      recommendations: aiResult.recommendations || [],
      createdAt: new Date()
    });

    await matchRecord.save();

    // 5. Cache result in Redis with TTL
    const responsePayload = {
      _id: matchRecord._id,
      resumeId: matchRecord.resumeId,
      jobDescriptionId: matchRecord.jobDescriptionId,
      jobTitle: job.title,
      company: job.company,
      fileName: resume.fileName,
      matchPercentage: matchRecord.matchPercentage,
      matchedSkills: matchRecord.matchedSkills,
      missingSkills: matchRecord.missingSkills,
      recommendations: matchRecord.recommendations,
      createdAt: matchRecord.createdAt
    };

    await redisClient.set(cacheKey, responsePayload, MATCH_CACHE_TTL);

    // 6. Log actiTechy in MongoDB
    await logActiTechy('JOB_MATCHED', {
      resumeId: resume._id,
      jobId: job._id,
      matchPercentage: matchRecord.matchPercentage
    }, resume.userId);

    return res.status(201).json({
      source: 'REDIS_CACHE_MISS_SAVED_TO_MONGODB',
      cached: false,
      data: responsePayload
    });

  } catch (err) {
    console.error('[MatchController] Error matching resume to job:', err);
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/match/:id
exports.getMatchResultById = async (req, res) => {
  try {
    const match = await MatchResult.findById(req.params.id)
      .populate('resumeId', 'fileName fileType')
      .populate('jobDescriptionId', 'title company');
    if (!match) {
      return res.status(404).json({ error: 'Match result not found' });
    }
    return res.status(200).json(match);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/match
exports.getAllMatches = async (req, res) => {
  try {
    const matches = await MatchResult.find()
      .populate('resumeId', 'fileName fileType userId')
      .populate('jobDescriptionId', 'title company')
      .sort({ createdAt: -1 });
    return res.status(200).json(matches);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/match/resume/:resumeId
exports.getMatchesByResume = async (req, res) => {
  try {
    const matches = await MatchResult.find({ resumeId: req.params.resumeId })
      .populate('jobDescriptionId', 'title company')
      .sort({ createdAt: -1 });
    return res.status(200).json(matches);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
