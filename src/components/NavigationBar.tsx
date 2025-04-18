
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, BellIcon, ChartBarIcon, ListBulletIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';

interface NavigationIconProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavigationIcon: React.FC<NavigationIconProps> = ({ icon, label, isActive, onClick }) => (
  <div 
    className="flex flex-col items-center cursor-pointer"
    onClick={onClick}
  >
    <div className={`transition-colors ${isActive ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}>
      {icon}
    </div>
    <span className={`text-xs mt-1 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`}>
      {label}
    </span>
  </div>
);

const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1C2526] px-6 py-4 border-t border-gray-700 shadow-lg">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <NavigationIcon 
          icon={<HomeIcon className="h-6 w-6" />} 
          label="Home"
          isActive={currentPath === '/dashboard'} 
          onClick={() => navigate('/dashboard')} 
        />
        
        <NavigationIcon 
          icon={<BellIcon className="h-6 w-6" />} 
          label="Alertas"
          isActive={currentPath === '/alerts'} 
          onClick={() => navigate('/alerts')} 
        />
        
        <NavigationIcon 
          icon={<ChartBarIcon className="h-6 w-6" />} 
          label="Reportes"
          isActive={currentPath === '/reports'} 
          onClick={() => navigate('/reports')} 
        />
        
        <NavigationIcon 
          icon={<ListBulletIcon className="h-6 w-6" />} 
          label="Tareas"
          isActive={currentPath === '/tasks'} 
          onClick={() => navigate('/tasks')} 
        />
        
        <NavigationIcon 
          icon={<Cog6ToothIcon className="h-6 w-6" />} 
          label="Ajustes"
          isActive={currentPath === '/settings'} 
          onClick={() => navigate('/settings')} 
        />
      </div>
    </nav>
  );
};

export default NavigationBar;
