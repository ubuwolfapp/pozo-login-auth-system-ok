
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import NavigationBar from '@/components/NavigationBar';
import { wellService } from '@/services/wellService';
import WellPhotos from '@/components/wells/WellPhotos';
import WellCameras from '@/components/wells/WellCameras';
import WellStats from '@/components/wells/WellStats';
import WellHeader from '@/components/wells/WellHeader';
import WellPressureChart from '@/components/wells/WellPressureChart';
import WellActions from '@/components/wells/WellActions';

const WellDetails = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: well } = useQuery({
    queryKey: ['well', id],
    queryFn: () => wellService.getWellById(id!),
  });

  if (!well) {
    return <div>Loading...</div>;
  }

  const handlePhotoUpload = () => {
    queryClient.invalidateQueries({
      queryKey: ['wellPhotos', well.id]
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="container mx-auto px-4 py-6">
        <WellHeader 
          wellName={well.nombre}
          wellId={well.id}
          onPhotoUpload={handlePhotoUpload}
        />

        <div className="space-y-6">
          <WellPressureChart />
          <WellStats well={well} />
          <WellPhotos wellId={well.id} />
          <WellCameras wellId={well.id} />
          <WellActions wellId={well.id} />
        </div>
      </div>
      <NavigationBar />
    </div>
  );
};

export default WellDetails;
