import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import PlacementTab from './components/PlacementTab';
import ScholarshipTab from './components/ScholarshipTab';
import CollegeTab from './components/CollegeTab';
import HistoryTab from './components/HistoryTab';
import AuthModal from './components/AuthModal';

const App = () => {
  const [activeTab, setActiveTab] = useState('placement');

  return (
    <div className="flex min-h-screen bg-[#0b0f19]">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content View */}
      <main className="flex-1 p-8 max-w-6xl mx-auto overflow-y-auto">
        {activeTab === 'placement' && <PlacementTab />}
        {activeTab === 'scholarship' && <ScholarshipTab />}
        {activeTab === 'college' && <CollegeTab />}
        {activeTab === 'history' && <HistoryTab />}
      </main>

      {/* Global Auth Modal */}
      <AuthModal />
    </div>
  );
};

export default App;
