
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
          <video
            src={camera.url_stream}
            controls
            autoPlay
            className="w-full h-full object-contain"
          >
            Tu navegador no soporta la reproducción de video.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveCameraModal;
