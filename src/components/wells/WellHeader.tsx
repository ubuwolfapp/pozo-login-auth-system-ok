
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PhotoUpload from '@/components/wells/PhotoUpload';

interface WellHeaderProps {
  wellName: string;
  wellId: string;
  onPhotoUpload: () => void;
}

const WellHeader = ({ wellName, wellId, onPhotoUpload }: WellHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between mb-6">
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
      <PhotoUpload 
        wellId={wellId}
        onUploadComplete={onPhotoUpload}
      />
    </header>
  );
};

export default WellHeader;
