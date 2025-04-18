
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import ImageViewer from './ImageViewer';

interface WellPhotosProps {
  wellId: string;
}

const WellPhotos = ({ wellId }: WellPhotosProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: photos } = useQuery({
    queryKey: ['wellPhotos', wellId],
    queryFn: async () => {
      const { data } = await supabase
        .from('fotos_pozos')
        .select('*')
        .eq('pozo_id', wellId)
        .order('created_at', { ascending: false });
      return data;
    }
  });

  if (!photos?.length) {
    return null;
  }

  return (
    <>
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h3 className="text-lg font-medium mb-4">Fotos</h3>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedImage(photo.url)}
            >
              <img 
                src={photo.url} 
                alt="Foto del pozo"
                className="w-full h-full object-cover" 
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 text-xs">
                {format(new Date(photo.created_at), 'd MMM yyyy', { locale: es })} - {photo.usuario}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <ImageViewer
        imageUrl={selectedImage || ''}
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
};

export default WellPhotos;
