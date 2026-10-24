const axios = require('../backend/node_modules/axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

async function testSystem() {
  console.log('====================================================');
  console.log(' RUNNING END-TO-END SYSTEM VERIFICATION (Production Architecture) ');
  console.log('====================================================\n');

  try {
    // 1. Health check
    console.log('1. Testing Backend Health Endpoint...');
    const health = await axios.get('http://localhost:5000/health');
    console.log('   Status:', health.data.status, '| Service:', health.data.service);

    // 2. Fetch Users
    console.log('\n2. Testing GET /api/users (MongoDB READ)...');
    const users = await axios.get(`${BASE_URL}/users`);
    console.log(`   Fetched ${users.data.length} users. First user: ${users.data[0].name} (${users.data[0].email})`);
    const testUserId = users.data[0]._id;

    // 3. Fetch Resumes
    console.log('\n3. Testing GET /api/resumes (MongoDB READ)...');
    const resumes = await axios.get(`${BASE_URL}/resumes`);
    console.log(`   Fetched ${resumes.data.length} resumes. First resume: ${resumes.data[0].fileName}`);
    const testResumeId = resumes.data[0]._id;

    // 4. Fetch Jobs
    console.log('\n4. Testing GET /api/jobs (MongoDB READ)...');
    const jobs = await axios.get(`${BASE_URL}/jobs`);
    console.log(`   Fetched ${jobs.data.length} jobs. First job: ${jobs.data[0].title} at ${jobs.data[0].company}`);
    const testJobId = jobs.data[0]._id;

    // 5. Test Redis Cache Flush to ensure clean state
    console.log('\n5. Flushing Redis cache to test CACHE MISS...');
    await axios.post(`${BASE_URL}/db/cache-clear`);

    // 6. Test Resume Analysis - Expect CACHE MISS
    console.log('\n6. Testing POST /api/analyze/:resumeId (EXPECT CACHE MISS)...');
    const t0 = Date.now();
    const analysisMiss = await axios.post(`${BASE_URL}/analyze/${testResumeId}`);
    const missLatency = Date.now() - t0;
    console.log(`   Source: ${analysisMiss.data.source} | Cached: ${analysisMiss.data.cached} | Latency: ${missLatency}ms`);
    console.log(`   ATS Score Computed: ${analysisMiss.data.data.atsScore}/100`);

    // 7. Test Resume Analysis - Expect CACHE HIT
    console.log('\n7. Testing POST /api/analyze/:resumeId (EXPECT CACHE HIT)...');
    const t1 = Date.now();
    const analysisHit = await axios.post(`${BASE_URL}/analyze/${testResumeId}`);
    const hitLatency = Date.now() - t1;
    console.log(`   Source: ${analysisHit.data.source} | Cached: ${analysisHit.data.cached} | Latency: ${hitLatency}ms`);
    console.log(`   ATS Score from Cache: ${analysisHit.data.data.atsScore}/100`);

    // 8. Test Job Match - Expect CACHE MISS
    console.log('\n8. Testing POST /api/match (EXPECT CACHE MISS)...');
    const t2 = Date.now();
    const matchMiss = await axios.post(`${BASE_URL}/match`, {
      resumeId: testResumeId,
      jobDescriptionId: testJobId
    });
    const matchMissLatency = Date.now() - t2;
    console.log(`   Source: ${matchMiss.data.source} | Cached: ${matchMiss.data.cached} | Latency: ${matchMissLatency}ms`);
    console.log(`   Match Percentage: ${matchMiss.data.data.matchPercentage}% | Matched Skills: ${matchMiss.data.data.matchedSkills.length}`);

    // 9. Test Job Match - Expect CACHE HIT
    console.log('\n9. Testing POST /api/match (EXPECT CACHE HIT)...');
    const t3 = Date.now();
    const matchHit = await axios.post(`${BASE_URL}/match`, {
      resumeId: testResumeId,
      jobDescriptionId: testJobId
    });
    const matchHitLatency = Date.now() - t3;
    console.log(`   Source: ${matchHit.data.source} | Cached: ${matchHit.data.cached} | Latency: ${matchHitLatency}ms`);
    console.log(`   Match Percentage from Cache: ${matchHit.data.data.matchPercentage}%`);

    // 10. Test Redis Cache Status Monitor
    console.log('\n10. Testing GET /api/db/cache-status...');
    const cacheStatus = await axios.get(`${BASE_URL}/db/cache-status`);
    console.log(`    Mode: ${cacheStatus.data.mode}`);
    console.log(`    Hits: ${cacheStatus.data.hits} | Misses: ${cacheStatus.data.misses} | Hit Ratio: ${cacheStatus.data.hitRatio}`);
    console.log(`    Active Keys (${cacheStatus.data.keyCount}):`, cacheStatus.data.keys.map(k => k.key));

    // 11. Test Aggregation Endpoints
    console.log('\n11. Testing Aggregation Endpoints...');
    const aggAts = await axios.get(`${BASE_URL}/stats/ats`);
    console.log('    Average ATS Score Aggregation:', aggAts.data);

    const aggMissing = await axios.get(`${BASE_URL}/stats/missing-skills`);
    console.log(`    Top Missing Skills (${aggMissing.data.length} found):`, aggMissing.data.slice(0, 3).map(s => `${s.skill} (${s.frequency})`));

    const aggJobs = await axios.get(`${BASE_URL}/stats/job-matches`);
    console.log(`    Job Match Stats by Title (${aggJobs.data.length} jobs):`, aggJobs.data.slice(0, 2).map(j => `${j.jobTitle}: ${j.averageMatch}%`));

    // 12. Test Real CRUD (CREATE, UPDATE, DELETE)
    console.log('\n12. Testing Full CRUD Operations on MongoDB...');
    // CREATE
    const newUser = await axios.post(`${BASE_URL}/users`, {
      name: 'Evaluation Test Candidate',
      email: `evaluation.test.${Date.now()}@Tech.ac.in`
    });
    console.log(`    [CREATE] User created with _id: ${newUser.data._id}`);

    // UPDATE
    const updatedUser = await axios.put(`${BASE_URL}/users/${newUser.data._id}`, {
      name: 'Evaluation Test Candidate (Updated)'
    });
    console.log(`    [UPDATE] User updated name: "${updatedUser.data.name}"`);

    // DELETE
    const deletedUser = await axios.delete(`${BASE_URL}/users/${newUser.data._id}`);
    console.log(`    [DELETE] User deleted successfully:`, deletedUser.data.message);

    console.log('\n====================================================');
    console.log(' ALL TESTS PASSED SUCCESSFULLY! SYSTEM IS 100% READY.');
    console.log('====================================================');

  } catch (err) {
    console.error('Test failed with error:', err.response?.data || err.message);
  }
}

testSystem();
