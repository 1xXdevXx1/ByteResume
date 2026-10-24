const JobDescription = require('../models/JobDescription');
const MatchResult = require('../models/MatchResult');
const { logActiTechy } = require('../services/actiTechyLogger');
const redisClient = require('../services/redisClient');
const { extractResume } = require('../services/aiService');
const path = require('path');
const axios = require('axios');

// Domain taxonomy mappings for comprehensive role-to-skills intelligence
const ROLE_SKILL_KNOWLEDGE_BASE = {
  frontend: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vite', 'Redux', 'Tailwind', 'Git', 'REST API'],
  backend: ['Node.js', 'Express', 'Python', 'MongoDB', 'PostgreSQL', 'Redis', 'Docker', 'REST API', 'Microservices', 'Git'],
  fullstack: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB', 'Express', 'Redis', 'Docker', 'REST API', 'Git'],
  'full stack': ['React', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB', 'Express', 'Redis', 'Docker', 'REST API', 'Git'],
  mobile: ['React Native', 'Flutter', 'Dart', 'Swift', 'Kotlin', 'iOS', 'Android', 'REST API', 'Git'],
  ai: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision', 'Pandas', 'Algorithms', 'Git'],
  'artificial intelligence': ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'NLP', 'Algorithms'],
  ml: ['Python', 'Machine Learning', 'Deep Learning', 'Scikit-Learn', 'PyTorch', 'TensorFlow', 'Data Structures', 'Algorithms', 'SQL'],
  'machine learning': ['Python', 'Machine Learning', 'Deep Learning', 'Scikit-Learn', 'PyTorch', 'TensorFlow', 'Data Structures', 'Algorithms', 'SQL'],
  data: ['Python', 'SQL', 'Pandas', 'NumPy', 'Data Analysis', 'Tableau', 'Power BI', 'Machine Learning', 'BigQuery', 'PostgreSQL'],
  devops: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD', 'Terraform', 'Git', 'Jenkins', 'Nginx', 'Bash'],
  cloud: ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Microservices', 'Linux', 'CI/CD', 'Security'],
  cyber: ['Network Security', 'Linux', 'Python', 'Penetration Testing', 'Cryptography', 'SIEM', 'Firewalls', 'Security', 'Wireshark'],
  security: ['Network Security', 'Linux', 'Python', 'Penetration Testing', 'Cryptography', 'SIEM', 'Firewalls', 'Security', 'Wireshark'],
  qa: ['Selenium', 'Cypress', 'JavaScript', 'Python', 'Jest', 'Automation Testing', 'Postman', 'Git', 'Agile', 'Jira'],
  testing: ['Selenium', 'Cypress', 'JavaScript', 'Python', 'Jest', 'Automation Testing', 'Postman', 'Git', 'Agile', 'Jira'],
  blockchain: ['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'Rust', 'JavaScript', 'Cryptography', 'Node.js', 'Git'],
  web3: ['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'Rust', 'JavaScript', 'Cryptography', 'Node.js', 'Git'],
  software: ['Data Structures', 'Algorithms', 'Git', 'REST API', 'System Design', 'OOP', 'CI/CD']
};

// FETCH Skills from Web / Domain Knowledge Base for Custom Job Roles
exports.fetchRoleSkillsFromWeb = async (req, res) => {
  try {
    const { role } = req.query;
    if (!role || !role.trim()) {
      return res.status(400).json({ error: 'Job role parameter is required' });
    }

    const cleanRole = role.trim();
    const roleLower = cleanRole.toLowerCase();

    // 1. Check Redis cache first (TTL 24 hours)
    const cacheKey = `role_skills:${roleLower.replace(/\s+/g, '_')}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        role: cleanRole,
        source: 'REDIS_CACHE_HIT',
        skills: cached
      });
    }

    let webSkills = new Set();

    // 2. Query Live Web (Wikipedia Knowledge Graph / Search API)
    try {
      const searchTerms = encodeURIComponent(`${cleanRole} software skills programming technologies`);
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchTerms}&format=json&utf8=1`;
      
      const wikiRes = await axios.get(wikiUrl, {
        headers: { 'User-Agent': 'ByteResumeBot/1.0 (Academic Project)' },
        timeout: 4000
      });

      if (wikiRes.data?.query?.search?.length > 0) {
        const snippets = wikiRes.data.query.search
          .slice(0, 6)
          .map(item => (item.snippet || '').replace(/<[^>]+>/g, ''))
          .join(' ');

        // Use AI NLP service to parse technical skills from live web text
        const extracted = await extractResume(null, snippets, 'web_snippet.txt');
        if (extracted.skills && Array.isArray(extracted.skills)) {
          extracted.skills.forEach(s => webSkills.add(s));
        }
      }
    } catch (webErr) {
      console.warn(`[JobController] Web fetch warning for "${cleanRole}": ${webErr.message}`);
    }

    // 3. Fallback / Augment with Domain Knowledge Base
    for (const [key, skills] of Object.entries(ROLE_SKILL_KNOWLEDGE_BASE)) {
      if (roleLower.includes(key)) {
        skills.forEach(s => webSkills.add(s));
      }
    }

    // Default baseline if role is very generic or novel
    if (webSkills.size === 0) {
      ['Problem Solving', 'Communication', 'Git', 'Data Structures', 'Algorithms', 'Teamwork', 'Agile'].forEach(s => webSkills.add(s));
    }

    const finalSkills = Array.from(webSkills);

    // Save in Redis cache for 86400 seconds (24h)
    await redisClient.set(cacheKey, finalSkills, 86400);

    return res.status(200).json({
      role: cleanRole,
      source: 'LIVE_WEB_FETCHED_AND_CACHED',
      skills: finalSkills
    });
  } catch (err) {
    console.error('[JobController] Error in fetchRoleSkillsFromWeb:', err);
    return res.status(500).json({ error: err.message });
  }
};

// UPLOAD Job Description (PDF/DOCX/TXT) with Automatic Skill Extraction
exports.uploadJob = async (req, res) => {
  try {
    let { title, company, description } = req.body;
    let filePath = null;
    let actualFileName = 'job_description.txt';

    if (req.file) {
      filePath = req.file.path;
      actualFileName = req.file.originalname;
    }

    if (!filePath && !description) {
      return res.status(400).json({ error: 'Please upload a file or provide a job description.' });
    }

    // Call AI/NLP service to extract raw text and skills from the uploaded document
    console.log(`[JobController] Extracting text and skills for JD file ${actualFileName}...`);
    const extracted = await extractResume(filePath, description, actualFileName);

    const fullText = extracted.rawText || description || '';
    
    // Auto-derive company and title if not manually supplied
    const finalCompany = (company && company.trim()) || 'Company';
    
    let finalTitle = (title && title.trim()) || '';
    if (!finalTitle) {
      // Derive clean title from file name (e.g., 'Google_Senior_Backend_Engineer.pdf' -> 'Google Senior Backend Engineer')
      const baseName = path.parse(actualFileName).name.replace(/[-_]/g, ' ').trim();
      finalTitle = baseName.length > 3 ? baseName : 'Uploaded Job Role';
    }

    // Extracted technical skills directly populated as requiredSkills
    const requiredSkills = extracted.skills && extracted.skills.length > 0
      ? extracted.skills
      : (extracted.technicalSkills || []);

    const preferredSkills = extracted.softSkills || [];

    const job = new JobDescription({
      title: finalTitle,
      company: finalCompany,
      description: fullText,
      requiredSkills,
      preferredSkills
    });

    await job.save();
    await logActiTechy('JOB_CREATED', { 
      jobId: job._id, 
      title: job.title, 
      company: job.company, 
      uploadedFile: actualFileName,
      extractedSkillsCount: requiredSkills.length 
    });

    return res.status(201).json(job);
  } catch (err) {
    console.error('[JobController] Error uploading job description:', err);
    return res.status(500).json({ error: err.message });
  }
};

// CREATE Job Description
exports.createJob = async (req, res) => {
  try {
    const { title, company, description, requiredSkills, preferredSkills } = req.body;
    if (!title || !company || !description) {
      return res.status(400).json({ error: 'Title, company, and description are required' });
    }

    const job = new JobDescription({
      title: title.trim(),
      company: company.trim(),
      description: description.trim(),
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []),
      preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : (preferredSkills ? preferredSkills.split(',').map(s => s.trim()) : [])
    });

    await job.save();
    await logActiTechy('JOB_CREATED', { jobId: job._id, title: job.title, company: job.company });
    return res.status(201).json(job);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// READ All Job Descriptions
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await JobDescription.find().sort({ createdAt: -1 });
    return res.status(200).json(jobs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// READ Job Description by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await JobDescription.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job description not found' });
    }
    return res.status(200).json(job);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// UPDATE Job Description
exports.updateJob = async (req, res) => {
  try {
    const { title, company, description, requiredSkills, preferredSkills } = req.body;
    const updates = {};
    if (title) updates.title = title.trim();
    if (company) updates.company = company.trim();
    if (description) updates.description = description.trim();
    if (requiredSkills) updates.requiredSkills = Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim());
    if (preferredSkills) updates.preferredSkills = Array.isArray(preferredSkills) ? preferredSkills : preferredSkills.split(',').map(s => s.trim());

    const job = await JobDescription.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!job) {
      return res.status(404).json({ error: 'Job description not found' });
    }

    // Invalidate match caches for this job
    const matchKeys = await redisClient.keys(`job_match:*:${job._id}`);
    for (const k of matchKeys) {
      await redisClient.del(k);
    }

    await logActiTechy('JOB_UPDATED', { jobId: job._id, title: job.title });
    return res.status(200).json(job);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE Job Description
exports.deleteJob = async (req, res) => {
  try {
    const job = await JobDescription.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job description not found' });
    }

    // Delete associated match results
    await MatchResult.deleteMany({ jobDescriptionId: job._id });

    // Invalidate Redis cache
    const matchKeys = await redisClient.keys(`job_match:*:${job._id}`);
    for (const k of matchKeys) {
      await redisClient.del(k);
    }

    await logActiTechy('JOB_DELETED', { jobId: job._id, title: job.title });
    return res.status(200).json({ message: 'Job description and related match results deleted', jobId: job._id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
