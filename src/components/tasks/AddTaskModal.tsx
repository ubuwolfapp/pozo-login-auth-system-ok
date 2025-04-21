
import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { taskService } from '@/services/taskService';
import { useQuery } from '@tanstack/react-query';
import { wellService } from '@/services/wellService';
import { userService, AppUser } from '@/services/userService';
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from 'lucide-react';

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  preselectedWell?: string;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  preselectedWell
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [selectedWell, setSelectedWell] = useState<string>(preselectedWell || '');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isCritical, setIsCritical] = useState(false);
  const [usuarios, setUsuarios] = useState<AppUser[]>([]);
  const { register, handleSubmit, reset } = useForm<{ titulo: string }>();

  const { data: wells = [], isLoading: wellsLoading } = useQuery({
    queryKey: ['wells'],
    queryFn: wellService.getWells,
    enabled: open
  });

  // Cargar usuarios al abrir el modal
  useEffect(() => {
    if (open) {
      userService.getAllUsers().then(setUsuarios);
    }
  }, [open]);

  // Preseleccionar pozo si llega por props
  useEffect(() => {
    if (open && preselectedWell) {
      setSelectedWell(preselectedWell);
    }
    if (!open) {
      setSelectedWell('');
      setSelectedUser('');
      reset();
      setSelectedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      setIsCritical(false);
    }
  }, [open, preselectedWell, reset]);

  const onSubmit = async (formData: { titulo: string }) => {
    if (!selectedDate || !selectedWell || !selectedUser) {
      toast({
        title: "Completa todos los campos",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);

    try {
      await taskService.createTask({
        titulo: formData.titulo,
        pozo_id: selectedWell,
        asignado_a: selectedUser,
        asignado_por: user?.email || 'sistema',
        fecha_limite: selectedDate.toISOString(),
        estado: 'pendiente',
        es_critica: isCritical,
      });
      toast({
        title: "¡Tarea creada!",
        description: "Tarea creada correctamente",
      });
      if (onSuccess) onSuccess();
      reset();
      setSelectedWell(preselectedWell || '');
      setSelectedUser('');
      setSelectedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      setIsCritical(false);
      onOpenChange(false);
    } catch (error) {
      // Manejo de error ya está en el servicio
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva tarea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
          <div>
            <Input
              placeholder="Título de la tarea"
              {...register('titulo', { required: true })}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Pozo</label>
            <Select value={selectedWell} onValueChange={setSelectedWell}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el pozo" />
              </SelectTrigger>
              <SelectContent>
                {wells.map((well: any) => (
                  <SelectItem key={well.id} value={well.id}>
                    {well.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm">Asignar a usuario</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el usuario" />
              </SelectTrigger>
              <SelectContent>
                {usuarios.map((u) => (
                  <SelectItem key={u.email} value={u.email}>
                    {u.nombre} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm">Fecha límite</label>
            <Input
              type="date"
              value={selectedDate?.toISOString().substring(0, 10) || ''}
              onChange={e => setSelectedDate(new Date(e.target.value))}
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isCritical}
              onChange={e => setIsCritical(e.target.checked)}
              id="critical"
              className="accent-red-500"
            />
            <label htmlFor="critical">¿Tarea crítica?</label>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear tarea"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;
