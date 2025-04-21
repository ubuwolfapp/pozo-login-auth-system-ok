
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PhotoUpload from '@/components/wells/PhotoUpload';

interface WellHeaderProps {
  wellName: string;
  wellId: string;
  onPhotoUpload: () => void;
  onShowAlertHistory: () => void;
}

const WellHeader = ({ wellName, wellId, onPhotoUpload, onShowAlertHistory }: WellHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between mb-6 flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">Pozo #{wellName}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={onShowAlertHistory}
        >
          <History className="mr-2 h-4 w-4" />
          Historial de Alertas
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
