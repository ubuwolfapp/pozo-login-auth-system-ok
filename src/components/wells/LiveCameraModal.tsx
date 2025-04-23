
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LiveCameraModalProps {
  open: boolean;
  onClose: () => void;
  camera: {
    nombre: string;
    url_stream: string;
    descripcion?: string;
  };
}

const LiveCameraModal = ({ open, onClose, camera }: LiveCameraModalProps) => {
  // Convert video URL to embed URL if it's a YouTube URL
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{camera.nombre}</DialogTitle>
          {camera.descripcion && (
            <p className="text-sm text-gray-400">{camera.descripcion}</p>
          )}
        </DialogHeader>
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
          <iframe
            src={getEmbedUrl(camera.url_stream)}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveCameraModal;
