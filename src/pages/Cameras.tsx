import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { wellService } from '@/services/wellService';
import NavigationBar from '@/components/NavigationBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import LiveCameraModal from '@/components/wells/LiveCameraModal';

const Cameras = () => {
  const { user, signOut } = useAuth();
  
  const { data: wells, isLoading } = useQuery({
    queryKey: ['wells-with-cameras'],
    queryFn: wellService.getWells
  });

  const handleLogout = async () => {
    await signOut();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>;
  }

  const wellsWithCameras = wells?.filter(well => 
    well.camaras_pozos && well.camaras_pozos.length > 0
  ) || [];

  const hasCameras = wellsWithCameras.length > 0;
  
  const exampleWells = hasCameras ? [] : [
    {
      id: 'example-1',
      nombre: 'Pozo Alpha',
      camaras_pozos: [
        { id: 'cam-1', nombre: 'Cámara Principal', descripcion: 'Vista general', url_stream: '/lovable-uploads/b95d5f26-748c-4aa2-afa7-debb2c4a40d2.jpg' },
        { id: 'cam-2', nombre: 'Cámara Secundaria', descripcion: 'Área de válvulas', url_stream: '/lovable-uploads/b95d5f26-748c-4aa2-afa7-debb2c4a40d2.jpg' }
      ]
    },
    {
      id: 'example-2',
      nombre: 'Pozo Beta',
      camaras_pozos: [
        { id: 'cam-3', nombre: 'Cámara de Seguridad', descripcion: 'Perímetro', url_stream: '/lovable-uploads/b95d5f26-748c-4aa2-afa7-debb2c4a40d2.jpg' }
      ]
    }
  ];
  
  const displayWells = hasCameras ? wellsWithCameras : exampleWells;

  const [selectedCamera, setSelectedCamera] = useState<any>(null);

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="bg-slate-800 border-b border-slate-700 px-4 fixed top-0 left-0 right-0 z-10 py-[20px] rounded-none">
        <div className="container mx-auto flex items-center justify-between">
          <h2 className="text-sm font-medium">
            Bienvenido, {user?.email}
          </h2>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 text-orange-500">
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 mt-16">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Cámaras de Monitoreo</h1>
          <Badge variant="outline" className="bg-slate-800 text-cyan-400 border-cyan-400">
            {displayWells.reduce((total, well) => total + well.camaras_pozos.length, 0)} cámaras activas
          </Badge>
        </header>

        <div className="space-y-6">
          {displayWells.map(well => (
            <div key={well.id} className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-cyan-400">{well.nombre}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {well.camaras_pozos.map(camera => (
                  <Card key={camera.id} className="bg-slate-800 border-slate-700 overflow-hidden">
                    <div className="relative aspect-video">
                      <img 
                        src={camera.url_stream} 
                        alt={camera.nombre}
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive" className="bg-red-500">
                          EN VIVO
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium">{camera.nombre}</h3>
                      <p className="text-sm text-gray-400">{camera.descripcion}</p>
                      <div className="flex justify-between mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => setSelectedCamera(camera)}
                        >
                          Ver en vivo
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          Grabaciones
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {displayWells.length === 0 && (
            <div className="text-center p-10">
              <p>No se encontraron cámaras disponibles.</p>
            </div>
          )}
        </div>
      </div>

      <NavigationBar />
      
      {selectedCamera && (
        <LiveCameraModal
          open={!!selectedCamera}
          onClose={() => setSelectedCamera(null)}
          camera={selectedCamera}
        />
      )}
    </div>
  );
};

export default Cameras;
