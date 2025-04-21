import React, { useState } from 'react';
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
import WellAlertHistoryModal from '@/components/wells/WellAlertHistoryModal';

const WellDetails = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [historyOpen, setHistoryOpen] = useState(false);

  const { data: well, isLoading } = useQuery({
    queryKey: ['well', id],
    queryFn: () => wellService.getWellById(id!),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pozo-orange"></div>
      </div>
    );
  }

  if (!well) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No se encontró el pozo</h2>
          <p>El pozo que estás buscando no existe o no tienes permisos para verlo.</p>
        </div>
      </div>
    );
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
          onShowAlertHistory={() => setHistoryOpen(true)}
        />

        <WellAlertHistoryModal
          wellId={well.id}
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />

        <div className="space-y-6">
          <WellPressureChart wellId={well.id} />
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
