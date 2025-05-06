
import React from 'react';
import { FileText, Image } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Alert } from '@/types/alerts';

interface ResolutionDetailsModalProps {
  alert: Alert | null;
  open: boolean;
  onClose: () => void;
}

const ResolutionDetailsModal = ({ alert, open, onClose }: ResolutionDetailsModalProps) => {
  if (!alert) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="bg-[#1C2526] text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Detalles de Resolución</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <h3 className="text-lg font-medium">Mensaje de alerta</h3>
            <p className="text-gray-300">{alert.mensaje}</p>
          </div>

          {alert.resolucion && (
            <div>
              <h3 className="text-lg font-medium">Resolución</h3>
              <p className="text-gray-300">{alert.resolucion}</p>
            </div>
          )}

          {alert.fecha_resolucion && (
            <div>
              <h3 className="text-lg font-medium">Fecha de resolución</h3>
              <p className="text-gray-300">
                {format(new Date(alert.fecha_resolucion), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          )}

          {alert.foto_url && (
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Image className="h-4 w-4" /> Foto adjunta
              </h3>
              <div className="mt-2 rounded-md overflow-hidden">
                <img 
                  src={alert.foto_url} 
                  alt="Foto de resolución" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          )}

          {alert.doc_url && (
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" /> Documento adjunto
              </h3>
              <a 
                href={alert.doc_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-2 mt-1"
              >
                <FileText className="h-4 w-4" /> Ver documento
              </a>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResolutionDetailsModal;
