const AnalysisReport = require('../models/AnalysisReport');
const Resume = require('../models/Resume');
const redisClient = require('../services/redisClient');
const { analyzeResume } = require('../services/aiService');
const { logActiTechy } = require('../services/actiTechyLogger');

const ANALYSIS_CACHE_TTL = 3600; // 1 hour

// POST /api/analyze/:resumeId
exports.analyzeResumeById = async (req, res) => {
  const { resumeId } = req.params;
  const cacheKey = `resume_analysis:${resumeId}`;

  try {
    // 1. Check Redis Cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        source: 'REDIS_CACHE_HIT',
        cached: true,
        data: cachedData
      });
    }

    // 2. Redis Cache MISS: Fetch resume from MongoDB
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    console.log(`[AnalysisController] Running AI analysis for Resume ${resumeId} (${resume.fileName})...`);

    // 3. Compute analysis via AI Service
    const aiResult = await analyzeResume({
      rawText: resume.rawText,
      skills: resume.skills,
      technicalSkills: resume.skills,
      softSkills: [],
      education: resume.education,
      experience: resume.experience,
      projects: resume.projects
    });

    // 4. Save analysis report to MongoDB
    const report = new AnalysisReport({
      resumeId: resume._id,
      userId: resume.userId,
      atsScore: aiResult.atsScore,
      strengths: aiResult.strengths || [],
      weaknesses: aiResult.weaknesses || [],
      technicalSkills: aiResult.technicalSkills || [],
      softSkills: aiResult.softSkills || [],
      missingSkills: aiResult.missingSkills || [],
      recommendations: aiResult.recommendations || [],
      createdAt: new Date()
    });

    await report.save();

    // 5. Cache result in Redis with TTL
    const responsePayload = {
      _id: report._id,
      resumeId: report.resumeId,
      userId: report.userId,
      atsScore: report.atsScore,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      technicalSkills: report.technicalSkills,
      softSkills: report.softSkills,
      missingSkills: report.missingSkills,
      recommendations: report.recommendations,
      scoreBreakdown: aiResult.scoreBreakdown || null,
      createdAt: report.createdAt
    };

    await redisClient.set(cacheKey, responsePayload, ANALYSIS_CACHE_TTL);

    // 6. Log actiTechy in MongoDB
    await logActiTechy('RESUME_ANALYZED', {
      resumeId: resume._id,
      reportId: report._id,
      atsScore: report.atsScore
    }, resume.userId);

    return res.status(201).json({
      source: 'REDIS_CACHE_MISS_SAVED_TO_MONGODB',
      cached: false,
      data: responsePayload
    });

  } catch (err) {
    console.error('[AnalysisController] Error analyzing resume:', err);
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/analysis/:resumeId
exports.getAnalysisByResumeId = async (req, res) => {
  const { resumeId } = req.params;
  const cacheKey = `resume_analysis:${resumeId}`;

  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        source: 'REDIS_CACHE_HIT',
        cached: true,
        data: cachedData
      });
    }

    const report = await AnalysisReport.findOne({ resumeId }).sort({ createdAt: -1 });
    if (!report) {
      return res.status(404).json({ error: 'No analysis report found for this resume. Run POST /api/analyze/:resumeId first.' });
    }

    // Populate Redis
    await redisClient.set(cacheKey, report, ANALYSIS_CACHE_TTL);

    return res.status(200).json({
      source: 'MONGODB_READ_SAVED_TO_REDIS',
      cached: false,
      data: report
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/users/:userId/analysis
exports.getUserAnalyses = async (req, res) => {
  try {
    const reports = await AnalysisReport.find({ userId: req.params.userId })
      .populate('resumeId', 'fileName fileType uploadedAt')
      .sort({ createdAt: -1 });
    return res.status(200).json(reports);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
