
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface PhotoUploadProps {
  wellId: string;
  onUploadComplete?: () => void;
}

const PhotoUpload = ({ wellId, onUploadComplete }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${wellId}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('well-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('well-photos')
        .getPublicUrl(filePath);

      // Save to fotos_pozos table
      const { error: dbError } = await supabase
        .from('fotos_pozos')
        .insert({
          pozo_id: wellId,
          url: publicUrl,
          usuario: 'Usuario',  // Replace with actual user name when auth is implemented
        });

      if (dbError) throw dbError;

      toast({
        title: "Éxito",
        description: "Foto subida correctamente",
      });

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la foto",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        id="photo-upload"
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      <label htmlFor="photo-upload">
        <Button 
          variant="secondary"
          className="bg-orange-600 hover:bg-orange-700 text-white"
          disabled={uploading}
          asChild
        >
          <span>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Subiendo...' : 'Subir Foto'}
          </span>
        </Button>
      </label>
    </div>
  );
};

export default PhotoUpload;
