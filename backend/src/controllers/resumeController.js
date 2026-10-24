const Resume = require('../models/Resume');
const User = require('../models/User');
const AnalysisReport = require('../models/AnalysisReport');
const MatchResult = require('../models/MatchResult');
const { extractResume } = require('../services/aiService');
const { logActiTechy } = require('../services/actiTechyLogger');
const redisClient = require('../services/redisClient');
const path = require('path');
const fs = require('fs');

// CREATE Resume (Upload or Text)
exports.createResume = async (req, res) => {
  try {
    let { userId, rawText, fileName, userName, userEmail } = req.body;

    // If userId not provided, check or create user by email/name
    if (!userId) {
      if (userEmail) {
        let user = await User.findOne({ email: userEmail.toLowerCase().trim() });
        if (!user) {
          user = new User({
            name: userName || 'Student Candidate',
            email: userEmail.toLowerCase().trim()
          });
          await user.save();
          await logActiTechy('USER_CREATED', { userId: user._id, email: user.email }, user._id);
        }
        userId = user._id;
      } else {
        // Find default or first existing user
        let user = await User.findOne();
        if (!user) {
          user = new User({ name: 'Default Student', email: 'student@Tech.ac.in' });
          await user.save();
        }
        userId = user._id;
      }
    }

    let filePath = null;
    let actualFileName = fileName || 'Uploaded_Resume.pdf';
    let fileType = 'pdf';

    if (req.file) {
      filePath = req.file.path;
      actualFileName = req.file.originalname;
      fileType = path.extname(req.file.originalname).toLowerCase().replace('.', '') || 'pdf';
    }

    // Call AI service to extract text & structured data
    console.log(`[ResumeController] Extracting text and skills for ${actualFileName}...`);
    const extracted = await extractResume(filePath, rawText, actualFileName);

    const resume = new Resume({
      userId,
      fileName: actualFileName,
      fileType: fileType || extracted.fileType || 'pdf',
      rawText: extracted.rawText || rawText || '',
      skills: extracted.skills || [],
      education: extracted.education || [],
      experience: extracted.experience || [],
      projects: extracted.projects || [],
      uploadedAt: new Date()
    });

    await resume.save();

    await logActiTechy('RESUME_UPLOADED', {
      resumeId: resume._id,
      fileName: resume.fileName,
      skillsCount: resume.skills.length
    }, userId);

    return res.status(201).json(resume);
  } catch (err) {
    console.error('[ResumeController] Error creating resume:', err);
    return res.status(500).json({ error: err.message });
  }
};

// READ All Resumes
exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find()
      .populate('userId', 'name email')
      .sort({ uploadedAt: -1 });
    return res.status(200).json(resumes);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// READ Resume by ID
exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id).populate('userId', 'name email');
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    return res.status(200).json(resume);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// READ Resumes by User ID
exports.getResumesByUserId = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.params.userId }).sort({ uploadedAt: -1 });
    return res.status(200).json(resumes);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// UPDATE Resume Metadata
exports.updateResume = async (req, res) => {
  try {
    const { fileName, skills, education, experience, projects } = req.body;
    const updates = {};
    if (fileName) updates.fileName = fileName;
    if (skills) updates.skills = skills;
    if (education) updates.education = education;
    if (experience) updates.experience = experience;
    if (projects) updates.projects = projects;

    const resume = await Resume.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Invalidate analysis cache for this resume
    await redisClient.del(`resume_analysis:${resume._id}`);

    await logActiTechy('RESUME_UPDATED', { resumeId: resume._id }, resume.userId);
    return res.status(200).json(resume);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE Resume
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Cascade delete associated reports & match results
    await AnalysisReport.deleteMany({ resumeId: resume._id });
    await MatchResult.deleteMany({ resumeId: resume._id });

    // Invalidate Redis cache
    await redisClient.del(`resume_analysis:${resume._id}`);
    const matchKeys = await redisClient.keys(`job_match:${resume._id}:*`);
    for (const k of matchKeys) {
      await redisClient.del(k);
    }

    await logActiTechy('RESUME_DELETED', { resumeId: resume._id, fileName: resume.fileName }, resume.userId);
    return res.status(200).json({ message: 'Resume and associated reports deleted successfully', resumeId: resume._id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
