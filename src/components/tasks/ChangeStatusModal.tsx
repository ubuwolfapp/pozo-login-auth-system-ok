
import React, { useState } from 'react';
import { Check, Clock, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface ChangeStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: string;
  onStatusChange: (newStatus: 'pendiente' | 'en_progreso' | 'resuelta', details?: {
    descripcion?: string;
    foto?: File;
  }) => void;
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
  open,
  onOpenChange,
  currentStatus,
  onStatusChange,
}) => {
  const [descripcionResolucion, setDescripcionResolucion] = useState("");
  const [fotoResolucion, setFotoResolucion] = useState<File | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<'pendiente' | 'en_progreso' | 'resuelta' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    {
      value: 'pendiente',
      label: 'Pendiente',
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      value: 'en_progreso',
      label: 'En Progreso',
      icon: Clock,
      color: 'bg-blue-500',
    },
    {
      value: 'resuelta',
      label: 'Resuelta',
      icon: Check,
      color: 'bg-green-500',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFotoResolucion(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!selectedStatus) return;
    
    setIsSubmitting(true);
    
    // Solo enviar detalles si es "resuelta"
    if (selectedStatus === 'resuelta') {
      onStatusChange(selectedStatus, {
        descripcion: descripcionResolucion,
        foto: fotoResolucion
      });
    } else {
      onStatusChange(selectedStatus);
    }

    // Reset form
    setDescripcionResolucion("");
    setFotoResolucion(undefined);
    setSelectedStatus(null);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleSelectStatus = (status: 'pendiente' | 'en_progreso' | 'resuelta') => {
    setSelectedStatus(status);
    
    // Si no es 'resuelta', enviar directamente
    if (status !== 'resuelta') {
      onStatusChange(status);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Estado</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {statusOptions.map((status) => (
            <Button
              key={status.value}
              onClick={() => handleSelectStatus(status.value as 'pendiente' | 'en_progreso' | 'resuelta')}
              className={`${status.color} w-full justify-start gap-2 text-white`}
              variant="ghost"
            >
              <status.icon className="h-4 w-4" />
              {status.label}
            </Button>
          ))}
          
          {selectedStatus === 'resuelta' && (
            <div className="space-y-4 mt-4 border-t pt-4">
              <h3 className="font-medium">Detalles de resolución</h3>
              <Textarea 
                placeholder="Describe cómo resolviste esta tarea..." 
                value={descripcionResolucion}
                onChange={(e) => setDescripcionResolucion(e.target.value)}
              />
              <div>
                <label className="block mb-2 text-sm">Adjuntar foto de resolución (opcional)</label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Enviando..." : "Guardar resolución"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeStatusModal;
