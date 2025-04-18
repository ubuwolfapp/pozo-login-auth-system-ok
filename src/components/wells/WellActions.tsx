
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
        variant="outline" 
        className="w-full"
        onClick={() => navigate(`/settings`)}
      >
        Ajustar Umbrales
      </Button>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => navigate(`/tasks/new?well=${wellId}`)}
      >
        Asignar Tarea
      </Button>
    </div>
  );
};

export default WellActions;
