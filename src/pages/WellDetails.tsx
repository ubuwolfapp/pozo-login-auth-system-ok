
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import NavigationBar from '@/components/NavigationBar';
import { wellService } from '@/services/wellService';
import PressureChart from '@/components/PressureChart';
import WellPhotos from '@/components/wells/WellPhotos';
import WellCameras from '@/components/wells/WellCameras';
import WellStats from '@/components/wells/WellStats';

const WellDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: well } = useQuery({
    queryKey: ['well', id],
    queryFn: () => wellService.getWellById(id!),
  });

  if (!well) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="container mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold">Pozo #{well.nombre}</h1>
          </div>
          <Button 
            variant="secondary"
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Upload className="mr-2 h-4 w-4" />
            Subir Foto
          </Button>
        </header>

        <div className="space-y-6">
          {/* Chart Section */}
          <Card className="bg-slate-800 border-slate-700">
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Presión</h3>
                <span className="text-sm text-gray-400">Últimas 24 horas</span>
              </div>
              <div className="h-[200px]">
                <PressureChart data={[]} />
              </div>
            </div>
          </Card>

          {/* Stats Section */}
          <WellStats well={well} />

          {/* Photos Section */}
          <WellPhotos wellId={well.id} />

          {/* Cameras Section */}
          <WellCameras wellId={well.id} />

          {/* Action Buttons */}
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
              onClick={() => navigate(`/tasks/new?well=${well.id}`)}
            >
              Asignar Tarea
            </Button>
          </div>
        </div>
      </div>
      <NavigationBar />
    </div>
  );
};

export default WellDetails;
