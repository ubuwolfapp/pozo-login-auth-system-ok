
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, History, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PhotoUpload from '@/components/wells/PhotoUpload';

interface WellHeaderProps {
  wellName: string;
  wellId: string;
  onPhotoUpload: () => void;
  onShowAlertHistory: () => void;
  onAddTask: () => void;
  onAdjustSettings: () => void;
  onDeleteTask?: (taskId: string) => void;
  onDeleteAlert?: (alertId: string) => void;
}

const WellHeader = ({ 
  wellName, 
  wellId, 
  onPhotoUpload, 
  onShowAlertHistory,
  onAddTask,
  onAdjustSettings
}: WellHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">Pozo #{wellName}</h1>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={onShowAlertHistory}
        >
          <History className="mr-2 h-4 w-4" />
          Historial de Alertas
        </Button>

        <Button
          variant="secondary"
          className="bg-orange-600 hover:bg-orange-700 text-white"
          onClick={onAddTask}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>

        <Button
          variant="secondary"
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
          onClick={onAdjustSettings}
        >
          <Camera className="mr-2 h-4 w-4" />
          Ajustar Umbrales
        </Button>

        <PhotoUpload 
          wellId={wellId}
          onUploadComplete={onPhotoUpload}
        />
      </div>
    </header>
  );
};

export default WellHeader;
