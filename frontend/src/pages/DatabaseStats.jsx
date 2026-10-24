import React, { useState, useEffect } from 'react';
import { 
  getDbCollections, 
  getDbIndexes, 
  getDbDocuments,
  getCacheStatus,
  clearCache,
  getAtsStats,
  getMissingSkillsStats,
  getJobMatchStats,
  getActiTechyStats
} from '../services/api';
import { 
  Database, 
  Zap, 
  Layers, 
  ListTree, 
  Play, 
  RefreshCw, 
  Trash2, 
  Code, 
  CheckCircle,
  FileCode,
  Terminal,
  ActiTechy,
  Cpu
} from 'lucide-react';

export default function DatabaseStats() {
  const [activeSection, setActiveSection] = useState('aggregations'); // 'aggregations', 'indexes', 'collections', 'redis'
  
  // Collections state
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('resumes');
  const [collectionDocs, setCollectionDocs] = useState(null);

  // Indexes state
  const [indexes, setIndexes] = useState([]);

  // Aggregation state
  const [aggResults, setAggResults] = useState({});
  const [runningAgg, setRunningAgg] = useState(null);

  // Redis state
  const [cacheStatus, setCacheStatus] = useState(null);

  useEffect(() => {
    loadAllMetadata();
  }, []);

  const loadAllMetadata = async () => {
    try {
      const [resColls, resIdx, resCache] = await Promise.all([
        getDbCollections(),
        getDbIndexes(),
        getCacheStatus()
      ]);
      setCollections(resColls.data);
      setIndexes(resIdx.data);
      setCacheStatus(resCache.data);
      loadCollectionDocs('resumes');
    } catch (err) {
      console.error('Error loading DB metadata:', err);
    }
  };

  const loadCollectionDocs = async (name) => {
    try {
      setSelectedCollection(name);
      const res = await getDbDocuments(name);
      setCollectionDocs(res.data);
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  };

  const runAggregation = async (type) => {
    setRunningAgg(type);
    try {
      let res;
      if (type === 'ats') res = await getAtsStats();
      else if (type === 'missing') res = await getMissingSkillsStats();
      else if (type === 'matches') res = await getJobMatchStats();
      else if (type === 'actiTechy') res = await getActiTechyStats();

      setAggResults(prev => ({ ...prev, [type]: res.data }));
    } catch (err) {
      console.error('Aggregation error:', err);
    } finally {
      setRunningAgg(null);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache();
      const res = await getCacheStatus();
      setCacheStatus(res.data);
      alert('Redis cache flushed! Next analysis or match request will trigger a REDIS CACHE MISS.');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#10B981' }}>
              NoSQL Architecture Inspection Suite
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', letterSpacing: '-0.6px' }}>
            Database & Evaluation Verification Suite
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Interactive demonstration dashboard for Production Architecture: MongoDB collections, B-tree indexes, aggregation pipelines, and Redis cache.
          </p>
        </div>

        <button className="btn btn-outline" onClick={loadAllMetadata}>
          <RefreshCw size={15} />
          <span>Refresh DB Telemetry</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', background: 'var(--bg-card)', padding: '5px', borderRadius: '12px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeSection === 'aggregations' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '9px 18px', border: 'none' }}
          onClick={() => setActiveSection('aggregations')}
        >
          <ListTree size={16} />
          <span>MongoDB Aggregations (6 Pipelines)</span>
        </button>
        <button
          className={`btn ${activeSection === 'indexes' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '9px 18px', border: 'none' }}
          onClick={() => setActiveSection('indexes')}
        >
          <Layers size={16} />
          <span>MongoDB Indexing (getIndexes)</span>
        </button>
        <button
          className={`btn ${activeSection === 'collections' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '9px 18px', border: 'none' }}
          onClick={() => setActiveSection('collections')}
        >
          <Database size={16} />
          <span>Collections & Raw Documents</span>
        </button>
        <button
          className={`btn ${activeSection === 'redis' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '9px 18px', border: 'none' }}
          onClick={() => setActiveSection('redis')}
        >
          <Zap size={16} />
          <span>Redis Cache Telemetry</span>
        </button>
      </div>

      {/* SECTION 1: AGGREGATIONS */}
      {activeSection === 'aggregations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Pipeline 1: Average ATS */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                  Pipeline 1: Average ATS Score across All Resumes
                </h3>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Stages: <code style={{ color: '#818CF8' }}>$group</code> (with <code style={{ color: '#06B6D4' }}>$avg</code>, <code style={{ color: '#34D399' }}>$max</code>, <code style={{ color: '#F87171' }}>$min</code>) → <code style={{ color: '#818CF8' }}>$project</code>
                </span>
              </div>
              <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => runAggregation('ats')}>
                <Play size={14} />
                <span>Execute in MongoDB</span>
              </button>
            </div>
            <pre className="code-block">
              {JSON.stringify(aggResults['ats'] || { note: 'Click "Execute in MongoDB" to run pipeline live' }, null, 2)}
            </pre>
          </div>

          {/* Pipeline 2: Missing Skills */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                  Pipeline 2: Most Frequently Missing Skills
                </h3>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Stages: <code style={{ color: '#818CF8' }}>$unwind: "$missingSkills"</code> → <code style={{ color: '#818CF8' }}>$group</code> → <code style={{ color: '#818CF8' }}>$sort: {`{ frequency: -1 }`}</code> → <code style={{ color: '#818CF8' }}>$limit: 10</code>
                </span>
              </div>
              <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => runAggregation('missing')}>
                <Play size={14} />
                <span>Execute in MongoDB</span>
              </button>
            </div>
            <pre className="code-block">
              {JSON.stringify(aggResults['missing'] || { note: 'Click "Execute in MongoDB" to run pipeline live' }, null, 2)}
            </pre>
          </div>

          {/* Pipeline 3: Job Match Stats by Title */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                  Pipeline 3: Job-Match Statistics Grouped by Job Title
                </h3>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Stages: <code style={{ color: '#818CF8' }}>$lookup: "jobdescriptions"</code> → <code style={{ color: '#818CF8' }}>$unwind</code> → <code style={{ color: '#818CF8' }}>$group</code> → <code style={{ color: '#818CF8' }}>$sort</code>
                </span>
              </div>
              <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => runAggregation('matches')}>
                <Play size={14} />
                <span>Execute in MongoDB</span>
              </button>
            </div>
            <pre className="code-block">
              {JSON.stringify(aggResults['matches'] || { note: 'Click "Execute in MongoDB" to run pipeline live' }, null, 2)}
            </pre>
          </div>

          {/* Pipeline 4: ActiTechy Audit Counts */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                  Pipeline 4: Audit ActiTechy Counts by Action
                </h3>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Stages: <code style={{ color: '#818CF8' }}>$group: {`{ _id: "$action", count: { $sum: 1 } }`}</code> → <code style={{ color: '#818CF8' }}>$sort</code>
                </span>
              </div>
              <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => runAggregation('actiTechy')}>
                <Play size={14} />
                <span>Execute in MongoDB</span>
              </button>
            </div>
            <pre className="code-block">
              {JSON.stringify(aggResults['actiTechy'] || { note: 'Click "Execute in MongoDB" to run pipeline live' }, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* SECTION 2: INDEXES */}
      {activeSection === 'indexes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div className="card" style={{ borderLeft: '4px solid #10B981', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(17, 23, 38, 0.8) 100%)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
              MongoDB Indexing Demonstration (Production Architecture Evaluation Requirement)
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              The output below is retrieved live by executing <code style={{ color: '#34D399' }}>db.collection.getIndexes()</code> across all 6 collections, verifying index existence, key structure, and engineering defense rationale.
            </p>
          </div>

          {indexes.map((colIdx) => (
            <div key={colIdx.collection} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-mongo" style={{ fontSize: '13px', padding: '4px 12px' }}>
                    {colIdx.collection}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {colIdx.indexCount} Active B-Tree / Text Indexes
                  </span>
                </div>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Index Name</th>
                      <th>Key Specification</th>
                      <th>Unique Constraint</th>
                      <th>Evaluation Defense / Engineering Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colIdx.indexes.map((idx) => (
                      <tr key={idx.name}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#818CF8' }}>
                          {idx.name}
                        </td>
                        <td>
                          <code style={{ fontSize: '12px' }}>{JSON.stringify(idx.key)}</code>
                        </td>
                        <td>
                          {idx.unique ? (
                            <span className="badge badge-matched">true</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>false</span>
                          )}
                        </td>
                        <td style={{ fontSize: '13px', color: '#E2E8F0' }}>
                          {idx.explanation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 3: COLLECTIONS & RAW DOCUMENTS */}
      {activeSection === 'collections' && (
        <div>
          {/* Collection Selection Pills */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
            {collections.map((col) => (
              <button
                key={col.name}
                className={`btn ${selectedCollection.toLowerCase() === col.name.toLowerCase() ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '9px 18px', fontSize: '13px' }}
                onClick={() => loadCollectionDocs(col.name)}
              >
                <span>{col.name}</span>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}>
                  {col.count}
                </span>
              </button>
            ))}
          </div>

          {collectionDocs && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                    MongoDB Collection: <span style={{ color: '#818CF8' }}>{collectionDocs.collection}</span>
                  </h3>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    Displaying {collectionDocs.count} documents retrieved directly from MongoDB
                  </span>
                </div>
              </div>

              <pre className="code-block">
                {JSON.stringify(collectionDocs.documents, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: REDIS CACHE TELEMETRY */}
      {activeSection === 'redis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="grid-3">
            <div className="card" style={{ borderLeft: '4px solid #10B981', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(17, 23, 38, 0.8) 100%)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Cache Hits</span>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#10B981', marginTop: '8px', letterSpacing: '-0.5px' }}>
                {cacheStatus?.hits ?? 0}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Served instantly in ~1-7ms without hitting DB/AI
              </span>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #F59E0B', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(17, 23, 38, 0.8) 100%)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Cache Misses</span>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#F59E0B', marginTop: '8px', letterSpacing: '-0.5px' }}>
                {cacheStatus?.misses ?? 0}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Evaluated and cached in Redis with TTL
              </span>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #6366F1', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(17, 23, 38, 0.8) 100%)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Cache Hit Ratio</span>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#818CF8', marginTop: '8px', letterSpacing: '-0.5px' }}>
                {cacheStatus?.hitRatio ?? '0%'}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                System latency optimization percentage
              </span>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                  Active Keys in Redis Key-Value Store ({cacheStatus?.keyCount ?? 0})
                </h3>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Active Mode: <strong style={{ color: '#34D399' }}>{cacheStatus?.mode}</strong>
                </span>
              </div>

              <button className="btn btn-danger" style={{ padding: '9px 18px', fontSize: '13px' }} onClick={handleClearCache}>
                <Trash2 size={14} />
                <span>Flush Redis Cache (Demonstrate MISS)</span>
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Cache Key Pattern</th>
                    <th>Remaining TTL</th>
                    <th>Cache State</th>
                  </tr>
                </thead>
                <tbody>
                  {cacheStatus?.keys && cacheStatus.keys.length > 0 ? (
                    cacheStatus.keys.map((k) => (
                      <tr key={k.key}>
                        <td>
                          <code style={{ color: '#818CF8', fontWeight: '700', fontSize: '13px' }}>{k.key}</code>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                          {k.ttlRemaining} seconds
                        </td>
                        <td>
                          <span className="badge badge-hit">CACHED IN MEMORY</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '28px' }}>
                        No active keys in Redis cache. Run an ATS Analysis or Job Match to populate cache!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
