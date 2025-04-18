
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface WellCamerasProps {
  wellId: string;
}

const WellCameras = ({ wellId }: WellCamerasProps) => {
  const { data: cameras } = useQuery({
    queryKey: ['wellCameras', wellId],
    queryFn: async () => {
      const { data } = await supabase
        .from('camaras_pozos')
        .select('*')
        .eq('pozo_id', wellId);
      return data;
    }
  });

  if (!cameras?.length) {
    return null;
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Cámaras</h3>
        <Button variant="link" className="text-cyan-400">
          Ver en Vivo
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {cameras.map((camera) => (
          <div key={camera.id} className="relative aspect-video rounded-lg overflow-hidden">
            <img 
              src={camera.url_stream} 
              alt={camera.nombre}
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
              <p className="text-sm">{camera.nombre}</p>
              {camera.descripcion && (
                <p className="text-xs text-gray-300">{camera.descripcion}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default WellCameras;
