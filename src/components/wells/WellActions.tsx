import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface WellActionsProps {
  wellId: string;
}

const WellActions = ({ wellId }: WellActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button 
        className="w-full bg-[#FF6200] hover:bg-[#FF6200]/80 text-white"
        onClick={() => navigate(`/settings`)}
      >
        Ajustar Umbrales
      </Button>
      <Button 
        className="w-full bg-[#FF6200] hover:bg-[#FF6200]/80 text-white"
        onClick={() => navigate(`/tasks/new?well=${wellId}`)}
      >
        Asignar Tarea
      </Button>
    </div>
  );
};

export default WellActions;
