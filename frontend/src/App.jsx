import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import ResumeAnalysis from './pages/ResumeAnalysis';
import JobMatch from './pages/JobMatch';
import History from './pages/History';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard 
            setActiveTab={setActiveTab} 
          />
        )}
        {activeTab === 'upload' && (
          <ResumeUpload 
            setActiveTab={setActiveTab} 
            setSelectedResumeId={setSelectedResumeId} 
          />
        )}
        {activeTab === 'analysis' && (
          <ResumeAnalysis 
            selectedResumeId={selectedResumeId} 
            setSelectedResumeId={setSelectedResumeId}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'match' && (
          <JobMatch 
            selectedResumeId={selectedResumeId} 
            selectedJobId={selectedJobId} 
            setSelectedJobId={setSelectedJobId}
          />
        )}
        {activeTab === 'history' && (
          <History 
            setActiveTab={setActiveTab} 
            setSelectedResumeId={setSelectedResumeId} 
            setSelectedJobId={setSelectedJobId} 
          />
        )}
      </main>
    </div>
  );
}
