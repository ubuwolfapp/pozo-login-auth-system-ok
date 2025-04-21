import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, ChartBarIcon, ListBulletIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import { Map, Video } from 'lucide-react';
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
  badgeCount?: number;
}

const BadgeNumber: React.FC<{ count: number }> = ({ count }) => (
  <span className="absolute -top-3 right-1 bg-red-500 text-white rounded-full px-1 text-[10px] min-w-[16px] text-center border border-white shadow font-bold z-10 leading-[14px]">
    {count}
  </span>
);

const NavigationIcon: React.FC<NavigationIconProps> = ({ icon, label, isActive, onClick, badgeCount }) => (
  <div 
    className="flex flex-col items-center cursor-pointer relative"
    onClick={onClick}
  >
    <div className={`transition-colors relative ${isActive ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}>
      {icon}
      {badgeCount && badgeCount > 0 && <BadgeNumber count={badgeCount} />}
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

  // Cantidad de alertas no resueltas
  const { data: alertsData } = useQuery({
    queryKey: ['alerts-badge'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alertas')
        .select('id')
        .eq('resuelto', false);
      if (error) return [];
      return data || [];
    },
    refetchInterval: 30000,
  });
  const pendingAlertsCount = alertsData?.length || 0;

  // Cantidad de tareas pendientes o en progreso asignadas al usuario
  const { data: tasksData } = useQuery({
    queryKey: ['tasks-badge', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const all = await taskService.getTasks();
      return all.filter(
        t => t.asignado_a === user.email && 
             (t.estado === 'pendiente' || t.estado === 'en_progreso')
      );
    },
    enabled: !!user?.email,
    refetchInterval: 30000,
  });
  const pendingTasksCount = tasksData?.length || 0;

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
          icon={<svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M16 17a4 4 0 1 1-8 0"/><path d="M8 17v-4h8v4"/><path d="M4 9c0-3.314 2.686-6 6-6s6 2.686 6 6v1c0 2.485 2.014 4.5 4.5 4.5S19 16.485 19 14V9a9 9 0 0 0-18 0v5c0 2.485 2.014 4.5 4.5 4.5S4 16.485 4 14V9z"/></svg>}
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
