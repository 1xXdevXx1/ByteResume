/**
 * Database Seeder for ByteResume
 * BCSE406L - NoSQL Database Project (VIT Vellore)
 * Populates MongoDB with realistic candidate resumes, job postings,
 * analysis reports, match results, and activity logs.
 */

const path = require('path');
const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));
require(path.join(__dirname, '../backend/node_modules/dotenv')).config({ path: path.join(__dirname, '../backend/.env') });


const User = require('../backend/src/models/User');
const Resume = require('../backend/src/models/Resume');
const JobDescription = require('../backend/src/models/JobDescription');
const AnalysisReport = require('../backend/src/models/AnalysisReport');
const MatchResult = require('../backend/src/models/MatchResult');
const ActivityLog = require('../backend/src/models/ActivityLog');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resume_analyzer';

const sampleUsers = [
  { name: 'Devesh Singh', email: 'devesh.singh2022@vitstudent.ac.in' },
  { name: 'Vineet Kumar Mishra', email: 'vineet.mishra2022@vitstudent.ac.in' },
  { name: 'Aarav Sharma', email: 'aarav.sharma@gmail.com' },
  { name: 'Priya Sundaram', email: 'priya.sundaram@vit.ac.in' },
  { name: 'Rohan Patel', email: 'rohan.patel@outlook.com' }
];

const sampleResumes = [
  {
    userIndex: 0, // Devesh Singh - Full Stack
    fileName: 'Devesh_Singh_FullStack_Resume.pdf',
    fileType: 'pdf',
    rawText: `Devesh Singh - Full Stack Software Engineer
Email: devesh.singh2022@vitstudent.ac.in | GitHub: github.com/devesh-singh
Education:
Bachelor of Technology in Computer Science and Engineering, VIT Vellore (CGPA: 9.1, 2022 - 2026)
Technical Skills:
Languages: JavaScript, TypeScript, Python, C++, SQL, HTML, CSS
Frameworks: React, Node.js, Express, Next.js, Flask
Databases: MongoDB, Redis, PostgreSQL, MySQL
DevOps & Tools: Docker, Git, GitHub, AWS, Postman, Linux, REST API
Experience:
Full Stack Engineering Intern at TechFlow Solutions (May 2025 - July 2025)
- Designed and built scalable microservices handling 25,000 daily active requests with Node.js and MongoDB.
- Implemented Redis caching layer reducing database read latency by 60%.
- Integrated responsive React frontends with real-time WebSocket state management.
Projects:
1. ByteResume - AI Resume Analyzer & Job Matching Platform
- Engineered full-stack MERN application with Python NLP extraction and Redis multi-tier caching.
- Optimized MongoDB queries with compound indexes and aggregation pipelines for analytics.
2. CloudCart - Scalable E-Commerce Engine
- Developed microservices architecture using Docker, Express, MongoDB, and Stripe payment gateway.
Soft Skills: Leadership, Problem Solving, Agile, Team Collaboration, Communication`,
    skills: ['JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'Express', 'MongoDB', 'Redis', 'PostgreSQL', 'Docker', 'Git', 'AWS', 'REST API', 'Leadership', 'Problem Solving', 'Communication', 'Agile'],
    education: ['B.Tech in Computer Science and Engineering, VIT Vellore (2022 - 2026)'],
    experience: ['Full Stack Engineering Intern at TechFlow Solutions (May 2025 - July 2025) - Built scalable microservices with Node.js and MongoDB'],
    projects: [
      'ByteResume - AI Resume Analyzer with Redis & MongoDB',
      'CloudCart - Scalable Microservices E-Commerce Engine'
    ]
  },
  {
    userIndex: 1, // Vineet Kumar Mishra - Backend & Systems
    fileName: 'Vineet_Mishra_Backend_Resume.docx',
    fileType: 'docx',
    rawText: `Vineet Kumar Mishra - Backend Systems Engineer
Email: vineet.mishra2022@vitstudent.ac.in | LinkedIn: linkedin.com/in/vineet-mishra
Education:
Bachelor of Technology in Computer Science, VIT Vellore (2022 - 2026)
Technical Skills:
Languages: Java, Python, Go, C++, SQL
Frameworks: Spring Boot, Django, FastAPI, Express
Databases: MongoDB, Redis, Cassandra, PostgreSQL
Tools: Docker, Kubernetes, Kafka, Git, Linux, AWS, System Design, CI/CD
Experience:
Backend Developer Intern at DataPulse Labs (June 2025 - August 2025)
- Architected high-throughput event-driven data streaming pipeline with Apache Kafka and Redis.
- Implemented MongoDB aggregation framework for real-time user activity analytics.
- Deployed fault-tolerant services on AWS ECS clusters with automated CI/CD pipelines.
Projects:
1. Distributed Cache & Key-Value Engine
- Built an in-memory high-concurrency key-value store with LRU eviction in Go.
2. NoSQL Financial Transaction Processor
- Designed ACID-compliant transaction manager on top of MongoDB replica sets.
Soft Skills: Critical Thinking, System Design, Teamwork, Problem Solving`,
    skills: ['Java', 'Python', 'Go', 'Spring Boot', 'MongoDB', 'Redis', 'Cassandra', 'PostgreSQL', 'Docker', 'Kubernetes', 'Kafka', 'Git', 'AWS', 'System Design', 'CI/CD', 'Problem Solving', 'Teamwork'],
    education: ['B.Tech Computer Science, VIT Vellore (2022 - 2026)'],
    experience: ['Backend Developer Intern at DataPulse Labs - Kafka & Redis stream processing'],
    projects: [
      'Distributed Key-Value Cache Engine in Go',
      'NoSQL Financial Transaction Processor on MongoDB'
    ]
  },
  {
    userIndex: 2, // Aarav Sharma - Data Scientist / ML Engineer
    fileName: 'Aarav_Sharma_DataScience_Resume.pdf',
    fileType: 'pdf',
    rawText: `Aarav Sharma - Machine Learning & Data Engineer
Email: aarav.sharma@gmail.com
Education:
Master of Science in Data Science, VIT Vellore (2023 - 2025)
Technical Skills:
Languages: Python, R, SQL, C++
Frameworks: PyTorch, TensorFlow, Scikit-Learn, Pandas, NumPy, FastAPI
Databases: MongoDB, PostgreSQL, Elasticsearch
Tools: Docker, MLflow, Git, AWS S3, Spark, Hadoop
Experience:
Machine Learning Research Assistant at VIT AI Lab
- Built deep learning models for text classification and biomedical entity extraction.
- Processed 100GB+ unstructured dataset using PySpark and MongoDB storage.
Projects:
1. Neural Resume Matcher - Sentence Transformer embedding search with cosine similarity.
2. Predictive Churn Classifier - Gradient boosting model with 92% ROC-AUC score.
Soft Skills: Analytical Thinking, Presentation, Work Ethic, Research`,
    skills: ['Python', 'SQL', 'Machine Learning', 'Deep Learning', 'NLP', 'MongoDB', 'PostgreSQL', 'Docker', 'Git', 'Data Structures', 'Algorithms', 'Analytical Thinking', 'Communication'],
    education: ['M.S. in Data Science, VIT Vellore (2023 - 2025)'],
    experience: ['Machine Learning Research Assistant at VIT AI Lab'],
    projects: ['Neural Resume Matcher with Transformers', 'Predictive Churn Classifier']
  },
  {
    userIndex: 3, // Priya Sundaram - DevOps & Cloud Architect
    fileName: 'Priya_Sundaram_DevOps_Resume.pdf',
    fileType: 'pdf',
    rawText: `Priya Sundaram - DevOps & Cloud Infrastructure Engineer
Email: priya.sundaram@vit.ac.in
Education:
Bachelor of Technology in Information Technology, VIT Vellore (2021 - 2025)
Technical Skills:
Languages: Python, Bash, Go, SQL
Cloud & DevOps: AWS, Azure, Docker, Kubernetes, Terraform, Ansible, Jenkins, CI/CD, Nginx, Prometheus, Grafana
Databases: MongoDB, Redis, MySQL
Experience:
Cloud Operations Associate at CloudNative Corp (2024 - Present)
- Automated multi-region AWS cloud infrastructure provisioning using Terraform.
- Reduced server deployment time by 75% through standardized Kubernetes Helm charts.
- Configured Prometheus and Grafana alerts for distributed microservices.
Projects:
1. Automated GitOps Deployment Pipeline using ArgoCD and Kubernetes.
2. Resilient MongoDB Sharded Cluster deployment across multi-availability zones.
Soft Skills: Incident Management, Collaboration, Attention to Detail, Problem Solving`,
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'CI/CD', 'Git', 'Python', 'MongoDB', 'Redis', 'Problem Solving', 'Collaboration', 'Attention to Detail'],
    education: ['B.Tech in Information Technology, VIT Vellore (2021 - 2025)'],
    experience: ['Cloud Operations Associate at CloudNative Corp'],
    projects: ['GitOps Deployment Pipeline with ArgoCD', 'Resilient MongoDB Sharded Cluster on AWS']
  },
  {
    userIndex: 4, // Rohan Patel - Frontend React Engineer
    fileName: 'Rohan_Patel_Frontend_Resume.docx',
    fileType: 'docx',
    rawText: `Rohan Patel - Senior Frontend Engineer
Email: rohan.patel@outlook.com
Education:
B.E. in Computer Engineering (2020 - 2024)
Technical Skills:
Languages: JavaScript, TypeScript, HTML, CSS
Frameworks: React, Next.js, Redux Toolkit, Tailwind CSS, Vue.js
Databases: Firebase, MongoDB, SQLite
Tools: Vite, Webpack, Git, Jest, Cypress, Figma
Experience:
Frontend Developer at PixelCraft Studio (2024 - 2026)
- Developed modern user interfaces in React and Next.js with sub-second page transitions.
- Improved Core Web Vitals resulting in 40% increase in user retention.
Projects:
1. Enterprise Analytics Dashboard with D3.js and React.
2. Collaborative Markdown Editor with offline PWA synchronization.
Soft Skills: Creativity, UI/UX Design, Teamwork, Communication`,
    skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'HTML', 'CSS', 'MongoDB', 'Git', 'Vite', 'Communication', 'Creativity', 'Teamwork'],
    education: ['B.E. in Computer Engineering (2020 - 2024)'],
    experience: ['Frontend Developer at PixelCraft Studio (2024 - 2026)'],
    projects: ['Enterprise Analytics Dashboard in React', 'Collaborative PWA Markdown Editor']
  }
];

const sampleJobDescriptions = [
  {
    title: 'Full Stack Engineer (MERN + Redis)',
    company: 'Google Cloud Platform',
    description: 'Looking for a passionate Full Stack Engineer to architect high-concurrency cloud dashboards and APIs. Candidates will build responsive React user interfaces, scalable Node.js microservices, and design high-throughput MongoDB data models with Redis caching.',
    requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'Redis', 'REST API', 'Git'],
    preferredSkills: ['Docker', 'AWS', 'Microservices', 'System Design']
  },
  {
    title: 'Backend Systems Engineer',
    company: 'Amazon Web Services',
    description: 'AWS Database Systems team is hiring a Backend Engineer to build distributed event streaming and caching engines. Responsibilities include building fault-tolerant microservices in Java or Go, designing high-availability NoSQL databases, and managing Kafka streaming clusters.',
    requiredSkills: ['Java', 'Python', 'Go', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'System Design'],
    preferredSkills: ['Kafka', 'AWS', 'Cassandra', 'CI/CD']
  },
  {
    title: 'Senior Data & Machine Learning Engineer',
    company: 'Microsoft AI Research',
    description: 'Join the Microsoft Cognitive Services division to build large-scale NLP parsing and ranking engines. You will develop automated feature pipelines, deploy ML models in containerized microservices, and optimize document databases for vector and unstructured queries.',
    requiredSkills: ['Python', 'SQL', 'Machine Learning', 'Deep Learning', 'NLP', 'MongoDB', 'Docker', 'Data Structures'],
    preferredSkills: ['FastAPI', 'Elasticsearch', 'AWS', 'PyTorch']
  },
  {
    title: 'DevOps & Site Reliability Engineer',
    company: 'ByteDance',
    description: 'We are seeking an SRE/DevOps engineer to manage cloud infrastructure, Kubernetes clusters, and automated CI/CD pipelines for millions of global users. Hands-on expertise with AWS, Docker, Kubernetes, Terraform, and database reliability is required.',
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Terraform', 'CI/CD', 'Git', 'Python'],
    preferredSkills: ['Prometheus', 'MongoDB', 'Redis', 'Ansible']
  },
  {
    title: 'Frontend React Developer',
    company: 'Razorpay Financial Technologies',
    description: 'Razorpay is seeking an enthusiastic Frontend React Developer to build high-performance checkout experiences and financial analytics dashboards. Expertise with React, TypeScript, state management, and modern CSS is essential.',
    requiredSkills: ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Git', 'REST API'],
    preferredSkills: ['Next.js', 'Vite', 'MongoDB', 'Testing']
  }
];

async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected successfully to MongoDB:', MONGODB_URI);

    // Clear existing data in correct order
    console.log('[Seed] Clearing existing collections...');
    await ActivityLog.deleteMany({});
    await MatchResult.deleteMany({});
    await AnalysisReport.deleteMany({});
    await Resume.deleteMany({});
    await JobDescription.deleteMany({});
    await User.deleteMany({});

    // 1. Insert Users
    console.log('[Seed] Inserting 5 users...');
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`[Seed] Inserted ${createdUsers.length} users`);

    // 2. Insert Resumes
    console.log('[Seed] Inserting 5 candidate resumes...');
    const resumesToInsert = sampleResumes.map(r => ({
      userId: createdUsers[r.userIndex]._id,
      fileName: r.fileName,
      fileType: r.fileType,
      rawText: r.rawText,
      skills: r.skills,
      education: r.education,
      experience: r.experience,
      projects: r.projects,
      uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000))
    }));
    const createdResumes = await Resume.insertMany(resumesToInsert);
    console.log(`[Seed] Inserted ${createdResumes.length} resumes`);

    // 3. Insert Job Descriptions
    console.log('[Seed] Inserting 5 job descriptions...');
    const createdJobs = await JobDescription.insertMany(sampleJobDescriptions);
    console.log(`[Seed] Inserted ${createdJobs.length} job descriptions`);

    // 4. Insert Analysis Reports
    console.log('[Seed] Generating analysis reports with ATS scores...');
    const sampleReports = [
      {
        resumeId: createdResumes[0]._id,
        userId: createdUsers[0]._id,
        atsScore: 92,
        strengths: [
          'Excellent technical skill variety (17 skills including React, Node.js, MongoDB, Redis)',
          'Quantifiable impact in internship descriptions (60% latency reduction)',
          'Clear section organization with GitHub project links'
        ],
        weaknesses: [
          'Could add more cloud certification details (AWS Solutions Architect)',
          'Include explicit mention of testing frameworks (Jest/Mocha)'
        ],
        technicalSkills: createdResumes[0].skills.filter(s => !['Leadership', 'Problem Solving', 'Communication', 'Agile'].includes(s)),
        softSkills: ['Leadership', 'Problem Solving', 'Communication', 'Agile'],
        missingSkills: ['Kubernetes', 'GraphQL', 'CI/CD', 'Jest'],
        recommendations: [
          'Add automated unit testing coverage figures for your projects',
          'Mention CI/CD deployment pipelines on AWS'
        ],
        createdAt: new Date(Date.now() - 3 * 86400000)
      },
      {
        resumeId: createdResumes[1]._id,
        userId: createdUsers[1]._id,
        atsScore: 88,
        strengths: [
          'Deep backend engineering foundation in Java, Go, Spring Boot, Kafka, and Redis',
          'Strong systems design and distributed caching experience',
          'Prominent NoSQL database project implementations'
        ],
        weaknesses: [
          'Lacks frontend framework exposure (React/Vue)',
          'Could provide additional quantitative business metrics'
        ],
        technicalSkills: createdResumes[1].skills.filter(s => !['Problem Solving', 'Teamwork'].includes(s)),
        softSkills: ['Problem Solving', 'Teamwork', 'System Design'],
        missingSkills: ['React', 'TypeScript', 'GraphQL', 'Terraform'],
        recommendations: [
          'Acquire foundational React familiarity for full-stack versatility',
          'Highlight deployment metrics and request volumes handled'
        ],
        createdAt: new Date(Date.now() - 2 * 86400000)
      },
      {
        resumeId: createdResumes[2]._id,
        userId: createdUsers[2]._id,
        atsScore: 84,
        strengths: [
          'Comprehensive machine learning stack (Deep Learning, NLP, PyTorch, MongoDB)',
          'Postgraduate academic research background'
        ],
        weaknesses: [
          'Limited cloud deployment and DevOps tooling mentioned',
          'Missing Redis caching layer'
        ],
        technicalSkills: createdResumes[2].skills.filter(s => !['Analytical Thinking', 'Communication'].includes(s)),
        softSkills: ['Analytical Thinking', 'Communication'],
        missingSkills: ['Redis', 'Kubernetes', 'CI/CD', 'AWS', 'REST API'],
        recommendations: [
          'Learn Redis for caching ML inference model predictions',
          'Add Docker containerization details for Python microservices'
        ],
        createdAt: new Date(Date.now() - 1 * 86400000)
      },
      {
        resumeId: createdResumes[3]._id,
        userId: createdUsers[3]._id,
        atsScore: 90,
        strengths: [
          'Exceptional cloud infrastructure & DevOps stack (AWS, Kubernetes, Terraform)',
          'Strong quantifiable impact (75% faster deployment)',
          'Experience with sharded MongoDB deployments'
        ],
        weaknesses: [
          'Minimal application-layer backend programming languages'
        ],
        technicalSkills: createdResumes[3].skills.filter(s => !['Problem Solving', 'Collaboration', 'Attention to Detail'].includes(s)),
        softSkills: ['Problem Solving', 'Collaboration', 'Attention to Detail'],
        missingSkills: ['Node.js', 'Java', 'React', 'GraphQL'],
        recommendations: [
          'Showcase Node.js or Go application backend deployment scripts',
          'Emphasize automated recovery and disaster recovery architecture'
        ],
        createdAt: new Date(Date.now() - 4 * 86400000)
      },
      {
        resumeId: createdResumes[4]._id,
        userId: createdUsers[4]._id,
        atsScore: 78,
        strengths: [
          'Proficient modern frontend stack (React, Next.js, Vite, TypeScript)',
          'Documented 40% user retention improvement'
        ],
        weaknesses: [
          'Missing robust backend database and distributed caching technologies (MongoDB, Redis)',
          'Lacks containerization tools (Docker/Kubernetes)'
        ],
        technicalSkills: createdResumes[4].skills.filter(s => !['Communication', 'Creativity', 'Teamwork'].includes(s)),
        softSkills: ['Communication', 'Creativity', 'Teamwork'],
        missingSkills: ['Docker', 'Redis', 'Kubernetes', 'Python', 'AWS', 'CI/CD'],
        recommendations: [
          'Gain hands-on proficiency in NoSQL document design with MongoDB',
          'Integrate Redis for frontend session and state caching'
        ],
        createdAt: new Date(Date.now() - 12 * 3600000)
      }
    ];

    const createdReports = await AnalysisReport.insertMany(sampleReports);
    console.log(`[Seed] Inserted ${createdReports.length} analysis reports`);

    // 5. Insert Match Results
    console.log('[Seed] Generating match comparisons between resumes and jobs...');
    const sampleMatches = [
      {
        resumeId: createdResumes[0]._id, // Devesh vs Full Stack (Google)
        jobDescriptionId: createdJobs[0]._id,
        matchPercentage: 96,
        matchedSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'Redis', 'REST API', 'Git', 'Docker', 'AWS'],
        missingSkills: ['Microservices', 'System Design'],
        recommendations: [
          'Outstanding alignment! You possess all mandatory qualifications.',
          'Emphasize system architecture design in your interview prep.'
        ]
      },
      {
        resumeId: createdResumes[1]._id, // Vineet vs Backend Systems (AWS)
        jobDescriptionId: createdJobs[1]._id,
        matchPercentage: 94,
        matchedSkills: ['Java', 'Python', 'Go', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'System Design', 'Kafka', 'AWS'],
        missingSkills: ['Cassandra'],
        recommendations: [
          'Strong match! Highlight Kafka event streaming and Redis caching.',
          'Add distributed consensus algorithms to your speaking points.'
        ]
      },
      {
        resumeId: createdResumes[2]._id, // Aarav vs Data & ML (Microsoft)
        jobDescriptionId: createdJobs[2]._id,
        matchPercentage: 88,
        matchedSkills: ['Python', 'SQL', 'Machine Learning', 'Deep Learning', 'NLP', 'MongoDB', 'Docker', 'Data Structures'],
        missingSkills: ['FastAPI', 'Elasticsearch', 'AWS'],
        recommendations: [
          'Solid qualifications! Consider building a demo with FastAPI.',
          'Integrate vector search features with MongoDB Atlas Search.'
        ]
      },
      {
        resumeId: createdResumes[3]._id, // Priya vs DevOps (ByteDance)
        jobDescriptionId: createdJobs[3]._id,
        matchPercentage: 92,
        matchedSkills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Terraform', 'CI/CD', 'Git', 'Python', 'MongoDB', 'Redis'],
        missingSkills: ['Prometheus', 'Ansible'],
        recommendations: [
          'Excellent profile match! Emphasize automated Terraform deployments.',
          'Highlight observability and alert threshold tuning.'
        ]
      },
      {
        resumeId: createdResumes[4]._id, // Rohan vs Frontend (Razorpay)
        jobDescriptionId: createdJobs[4]._id,
        matchPercentage: 86,
        matchedSkills: ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Git', 'REST API', 'Next.js', 'Vite'],
        missingSkills: ['Testing'],
        recommendations: [
          'Great match! Add Jest and React Testing Library coverage.',
          'Showcase performance profiling using Chrome DevTools.'
        ]
      },
      {
        resumeId: createdResumes[0]._id, // Devesh vs Backend Systems
        jobDescriptionId: createdJobs[1]._id,
        matchPercentage: 75,
        matchedSkills: ['Python', 'MongoDB', 'Redis', 'Docker', 'AWS'],
        missingSkills: ['Java', 'Go', 'Kubernetes', 'Kafka'],
        recommendations: [
          'Expand on container orchestration with Kubernetes.',
          'Build an asynchronous messaging pipeline using Kafka or RabbitMQ.'
        ]
      }
    ];

    const createdMatches = await MatchResult.insertMany(sampleMatches);
    console.log(`[Seed] Inserted ${createdMatches.length} match results`);

    // 6. Insert Activity Logs
    console.log('[Seed] Generating audit activity logs...');
    const sampleLogs = [
      { userId: createdUsers[0]._id, action: 'USER_CREATED', details: { name: createdUsers[0].name, email: createdUsers[0].email }, timestamp: new Date(Date.now() - 5 * 86400000) },
      { userId: createdUsers[0]._id, action: 'RESUME_UPLOADED', details: { fileName: createdResumes[0].fileName }, timestamp: new Date(Date.now() - 4 * 86400000) },
      { userId: createdUsers[0]._id, action: 'RESUME_ANALYZED', details: { atsScore: 92 }, timestamp: new Date(Date.now() - 3 * 86400000) },
      { userId: createdUsers[0]._id, action: 'JOB_MATCHED', details: { jobTitle: createdJobs[0].title, matchPercentage: 96 }, timestamp: new Date(Date.now() - 3 * 86400000) },
      { userId: createdUsers[1]._id, action: 'USER_CREATED', details: { name: createdUsers[1].name }, timestamp: new Date(Date.now() - 3 * 86400000) },
      { userId: createdUsers[1]._id, action: 'RESUME_UPLOADED', details: { fileName: createdResumes[1].fileName }, timestamp: new Date(Date.now() - 2 * 86400000) },
      { userId: createdUsers[1]._id, action: 'RESUME_ANALYZED', details: { atsScore: 88 }, timestamp: new Date(Date.now() - 2 * 86400000) },
      { userId: createdUsers[1]._id, action: 'JOB_MATCHED', details: { jobTitle: createdJobs[1].title, matchPercentage: 94 }, timestamp: new Date(Date.now() - 2 * 86400000) },
      { userId: createdUsers[2]._id, action: 'USER_CREATED', details: { name: createdUsers[2].name }, timestamp: new Date(Date.now() - 2 * 86400000) },
      { userId: createdUsers[2]._id, action: 'RESUME_UPLOADED', details: { fileName: createdResumes[2].fileName }, timestamp: new Date(Date.now() - 1 * 86400000) },
      { userId: createdUsers[2]._id, action: 'RESUME_ANALYZED', details: { atsScore: 84 }, timestamp: new Date(Date.now() - 1 * 86400000) },
      { userId: createdUsers[3]._id, action: 'JOB_CREATED', details: { title: createdJobs[3].title, company: createdJobs[3].company }, timestamp: new Date(Date.now() - 18 * 3600000) },
      { userId: createdUsers[4]._id, action: 'JOB_MATCHED', details: { jobTitle: createdJobs[4].title, matchPercentage: 86 }, timestamp: new Date(Date.now() - 6 * 3600000) }
    ];

    const createdLogs = await ActivityLog.insertMany(sampleLogs);
    console.log(`[Seed] Inserted ${createdLogs.length} activity audit logs`);

    console.log('====================================================');
    console.log(' SEED DATA GENERATION COMPLETE');
    console.log(` Total Users:           ${createdUsers.length}`);
    console.log(` Total Resumes:         ${createdResumes.length}`);
    console.log(` Total Job Postings:    ${createdJobs.length}`);
    console.log(` Total Analysis Reports:${createdReports.length}`);
    console.log(` Total Match Results:   ${createdMatches.length}`);
    console.log(` Total Activity Logs:   ${createdLogs.length}`);
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
    process.exit(1);
  }
}

seedDatabase();
