
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, ChartBarIcon, ListBulletIcon, Cog6ToothIcon, ClockIcon } from '@heroicons/react/24/solid';
import { Map, Video, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';
import { wellService } from '@/services/wellService';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';

interface NavigationIconProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavigationIcon: React.FC<NavigationIconProps> = ({ icon, label, isActive, onClick }) => (
  <div 
    className="flex flex-col items-center cursor-pointer relative"
    onClick={onClick}
  >
    <div className={`transition-colors relative ${isActive ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}>
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
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1C2526] px-6 py-4 border-t border-gray-700 shadow-lg z-40">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <NavigationIcon 
          icon={<HomeIcon className="h-6 w-6" />} 
          label="Home"
          isActive={currentPath === '/dashboard'} 
          onClick={() => navigate('/dashboard')} 
        />
        
        <NavigationIcon 
          icon={<Bell className="h-6 w-6" />} 
          label="Alertas"
          isActive={currentPath === '/alerts'} 
          onClick={() => navigate('/alerts')}
        />

        <NavigationIcon 
          icon={<Map className="h-6 w-6" />} 
          label="Mapa"
          isActive={currentPath === '/map'} 
          onClick={() => navigate('/map')} 
        />
        
        <NavigationIcon 
          icon={<Video className="h-6 w-6" />} 
          label="Cámaras"
          isActive={currentPath === '/cameras'} 
          onClick={() => navigate('/cameras')} 
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
          icon={<ClockIcon className="h-6 w-6" />} 
          label="Historial"
          isActive={currentPath === '/task-history'} 
          onClick={() => navigate('/task-history')} 
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
