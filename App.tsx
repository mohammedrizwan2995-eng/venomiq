import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Operations from './components/Dashboard';
import ResearchLab from './components/StrategyEngine';
import MarketPulse from './components/CreativeSuite';
import GlobalHub from './components/BoardroomLive';
import Safety from './components/Safety';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.OPERATIONS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case ViewState.OPERATIONS:
        return <Operations />;
      case ViewState.LAB:
        return <ResearchLab />;
      case ViewState.MARKET:
        return <MarketPulse />;
      case ViewState.SAFETY:
        return <Safety />;
      case ViewState.HUB:
        return <GlobalHub />;
      default:
        return <Operations />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex text-stone-800 selection:bg-orange-200">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 h-screen overflow-y-auto w-full pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;