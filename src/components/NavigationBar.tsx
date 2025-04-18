
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Bell, BarChart3, FileText, Settings } from 'lucide-react';

interface NavigationIconProps {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const NavigationIcon: React.FC<NavigationIconProps> = ({ icon, isActive, onClick }) => (
  <div 
    className={`cursor-pointer transition-colors ${isActive ? 'text-pozo-orange' : 'text-gray-400 hover:text-pozo-orange'}`}
    onClick={onClick}
  >
    {icon}
  </div>
);

const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#2E3A59] px-6 py-4 shadow-lg">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <NavigationIcon 
          icon={<Home className="h-6 w-6" />} 
          isActive={currentPath === '/dashboard'} 
          onClick={() => navigate('/dashboard')} 
        />
        
        <NavigationIcon 
          icon={<Bell className="h-6 w-6" />} 
          isActive={currentPath === '/alerts'} 
          onClick={() => navigate('/alerts')} 
        />
        
        <NavigationIcon 
          icon={<BarChart3 className="h-6 w-6" />} 
          isActive={currentPath === '/analytics'} 
          onClick={() => navigate('/analytics')} 
        />
        
        <NavigationIcon 
          icon={<FileText className="h-6 w-6" />} 
          isActive={currentPath === '/reports'} 
          onClick={() => navigate('/reports')} 
        />
        
        <NavigationIcon 
          icon={<Settings className="h-6 w-6" />} 
          isActive={currentPath === '/settings'} 
          onClick={() => navigate('/settings')} 
        />
      </div>
    </nav>
  );
};

export default NavigationBar;
