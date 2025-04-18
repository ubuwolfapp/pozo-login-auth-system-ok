
import React from 'react';
import { Check, Clock, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ChangeStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: string;
  onStatusChange: (newStatus: 'pendiente' | 'en_progreso' | 'resuelta') => void;
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
  open,
  onOpenChange,
  currentStatus,
  onStatusChange,
}) => {
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
              onClick={() => {
                onStatusChange(status.value as 'pendiente' | 'en_progreso' | 'resuelta');
                onOpenChange(false);
              }}
              className={`${status.color} w-full justify-start gap-2 text-white`}
              variant="ghost"
            >
              <status.icon className="h-4 w-4" />
              {status.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeStatusModal;
