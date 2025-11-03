
import React, { useState } from 'react';
import RaffleApp from './components/RaffleApp';
import VideoGenerator from './components/VideoGenerator';
import { TicketIcon, VideoIcon } from './components/icons';

type View = 'raffle' | 'video';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('raffle');

  const renderView = () => {
    switch (currentView) {
      case 'raffle':
        return <RaffleApp />;
      case 'video':
        return <VideoGenerator />;
      default:
        return <RaffleApp />;
    }
  };

  return (
    <div>
      <nav className="bg-gray-800 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-xl">App Suite</span>
            </div>
            <div className="flex items-center space-x-2">
              <NavButton
                label="Raffle App"
                icon={<TicketIcon className="w-5 h-5 mr-2" />}
                isActive={currentView === 'raffle'}
                onClick={() => setCurrentView('raffle')}
              />
              <NavButton
                label="Veo Video Generator"
                icon={<VideoIcon className="w-5 h-5 mr-2" />}
                isActive={currentView === 'video'}
                onClick={() => setCurrentView('video')}
              />
            </div>
          </div>
        </div>
      </nav>
      <main>
        {renderView()}
      </main>
    </div>
  );
};

interface NavButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-gray-900 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default App;
