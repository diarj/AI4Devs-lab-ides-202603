import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import AddCandidatePage from './components/candidates/AddCandidatePage';
import RecruiterDashboard from './components/candidates/RecruiterDashboard';

function App() {
  return (
    <div className="App app-shell">
      <Routes>
        <Route path="/" element={<RecruiterDashboard />} />
        <Route path="/candidates/new" element={<AddCandidatePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
