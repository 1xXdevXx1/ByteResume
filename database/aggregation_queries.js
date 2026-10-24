/**
 * MongoDB Aggregation Pipeline Runner
 * NoSQL Database Architecture (Production Engineering)
 * Team: ByteResume
 *
 * Implements and executes the 6 mandatory MongoDB aggregation pipelines:
 * 1. Average ATS Score ($group, $project)
 * 2. User ATS Score History ($match, $lookup, $unwind, $sort, $project)
 * 3. Most Frequently Missing Skills ($unwind, $group, $sort, $limit, $project)
 * 4. Average Job-Match Percentage ($group, $project)
 * 5. Job-Match Statistics by Job Title ($lookup, $unwind, $group, $project, $sort)
 * 6. ActiTechy Count by Action ($group, $sort, $project)
 */

const path = require('path');
const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));
require(path.join(__dirname, '../backend/node_modules/dotenv')).config({ path: path.join(__dirname, '../backend/.env') });


const User = require('../backend/src/models/User');
const AnalysisReport = require('../backend/src/models/AnalysisReport');
const MatchResult = require('../backend/src/models/MatchResult');
const ActiTechyLog = require('../backend/src/models/ActiTechyLog');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resume_analyzer';

async function runAggregations() {
  try {
    console.log('[Aggregations] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Aggregations] Connected to MongoDB at:', MONGODB_URI);

    console.log('\n================================================================');
    console.log('    MANDATORY MONGODB AGGREGATION PIPELINES (VIVA)    ');
    console.log('================================================================\n');

    // -------------------------------------------------------------
    // AGGREGATION 1: Average ATS Score
    // -------------------------------------------------------------
    console.log('>>> [AGGREGATION 1] Average ATS Score across All Resumes');
    console.log('Stages Used: $group -> $project');
    const agg1Pipeline = [
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
          averageAtsScore: { $round: ['$averageAtsScore', 2] },
          highestScore: 1,
          lowestScore: 1,
          totalReports: 1
        }
      }
    ];
    console.log('Pipeline Definition:', JSON.stringify(agg1Pipeline, null, 2));
    const agg1Result = await AnalysisReport.aggregate(agg1Pipeline);
    console.table(agg1Result);
    console.log('----------------------------------------------------------------\n');

    // -------------------------------------------------------------
    // AGGREGATION 2: User ATS Score History
    // -------------------------------------------------------------
    console.log('>>> [AGGREGATION 2] ATS Score History for First User');
    console.log('Stages Used: $match -> $lookup -> $unwind -> $sort -> $project');
    const firstUser = await User.findOne();
    if (firstUser) {
      const agg2Pipeline = [
        { $match: { userId: firstUser._id } },
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
            _id: 0,
            reportId: '$_id',
            atsScore: 1,
            resumeFile: '$resume.fileName',
            date: { $dateToString: { format: '%Y-%m-%d %H:%M', date: '$createdAt' } }
          }
        }
      ];
      console.log(`Matching User: ${firstUser.name} (${firstUser.email})`);
      const agg2Result = await AnalysisReport.aggregate(agg2Pipeline);
      console.table(agg2Result);
    }
    console.log('----------------------------------------------------------------\n');

    // -------------------------------------------------------------
    // AGGREGATION 3: Most Frequently Missing Skills
    // -------------------------------------------------------------
    console.log('>>> [AGGREGATION 3] Most Frequently Missing Skills');
    console.log('Stages Used: $unwind -> $group -> $sort -> $limit -> $project');
    const agg3Pipeline = [
      { $unwind: '$missingSkills' },
      {
        $group: {
          _id: '$missingSkills',
          frequency: { $sum: 1 }
        }
      },
      { $sort: { frequency: -1 } },
      { $limit: 8 },
      {
        $project: {
          _id: 0,
          missingSkill: '$_id',
          frequency: 1
        }
      }
    ];
    console.log('Pipeline Definition:', JSON.stringify(agg3Pipeline, null, 2));
    const agg3Result = await AnalysisReport.aggregate(agg3Pipeline);
    console.table(agg3Result);
    console.log('----------------------------------------------------------------\n');

    // -------------------------------------------------------------
    // AGGREGATION 4: Average Job-Match Percentage
    // -------------------------------------------------------------
    console.log('>>> [AGGREGATION 4] Average Job-Match Percentage Across All Match Runs');
    console.log('Stages Used: $group -> $project');
    const agg4Pipeline = [
      {
        $group: {
          _id: null,
          averageMatchPercentage: { $avg: '$matchPercentage' },
          highestMatch: { $max: '$matchPercentage' },
          lowestMatch: { $min: '$matchPercentage' },
          totalMatchesEvaluated: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          averageMatchPercentage: { $round: ['$averageMatchPercentage', 2] },
          highestMatch: 1,
          lowestMatch: 1,
          totalMatchesEvaluated: 1
        }
      }
    ];
    console.log('Pipeline Definition:', JSON.stringify(agg4Pipeline, null, 2));
    const agg4Result = await MatchResult.aggregate(agg4Pipeline);
    console.table(agg4Result);
    console.log('----------------------------------------------------------------\n');

    // -------------------------------------------------------------
    // AGGREGATION 5: Job-Match Statistics by Job Title
    // -------------------------------------------------------------
    console.log('>>> [AGGREGATION 5] Job-Match Statistics Grouped by Job Title');
    console.log('Stages Used: $lookup -> $unwind -> $group -> $project -> $sort');
    const agg5Pipeline = [
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
          totalCandidatesMatched: { $sum: 1 },
          averageMatchPercentage: { $avg: '$matchPercentage' },
          highestMatch: { $max: '$matchPercentage' },
          lowestMatch: { $min: '$matchPercentage' }
        }
      },
      {
        $project: {
          _id: 0,
          jobTitle: '$_id',
          company: 1,
          totalCandidatesMatched: 1,
          averageMatchPercentage: { $round: ['$averageMatchPercentage', 2] },
          highestMatch: 1,
          lowestMatch: 1
        }
      },
      { $sort: { totalCandidatesMatched: -1, averageMatchPercentage: -1 } }
    ];
    console.log('Pipeline Definition:', JSON.stringify(agg5Pipeline, null, 2));
    const agg5Result = await MatchResult.aggregate(agg5Pipeline);
    console.table(agg5Result);
    console.log('----------------------------------------------------------------\n');

    // -------------------------------------------------------------
    // AGGREGATION 6: ActiTechy Count by Action
    // -------------------------------------------------------------
    console.log('>>> [AGGREGATION 6] System ActiTechy Audit Count Grouped by Action');
    console.log('Stages Used: $group -> $sort -> $project');
    const agg6Pipeline = [
      {
        $group: {
          _id: '$action',
          occurrenceCount: { $sum: 1 },
          lastLogged: { $max: '$timestamp' }
        }
      },
      { $sort: { occurrenceCount: -1 } },
      {
        $project: {
          _id: 0,
          actionType: '$_id',
          occurrenceCount: 1,
          lastLogged: { $dateToString: { format: '%Y-%m-%d %H:%M:%S', date: '$lastLogged' } }
        }
      }
    ];
    console.log('Pipeline Definition:', JSON.stringify(agg6Pipeline, null, 2));
    const agg6Result = await ActiTechyLog.aggregate(agg6Pipeline);
    console.table(agg6Result);
    console.log('================================================================');
    console.log(' ALL 6 MONGODB AGGREGATION PIPELINES EXECUTED SUCCESSFULLY');
    console.log('================================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Aggregations Error] Execution failed:', err);
    process.exit(1);
  }
}

runAggregations();
