
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar, FileImage } from 'lucide-react';

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  preselectedWell?: string;
}

type FormValues = {
  titulo: string;
  descripcion?: string;
  link?: string;
};

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
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  const { register, handleSubmit, reset } = useForm<FormValues>();

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
      setFotoFile(null);
    }
  }, [open, preselectedWell, reset]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFotoFile(e.target.files[0]);
    } else {
      setFotoFile(null);
    }
  };

  const onSubmit = async (formData: FormValues) => {
    if (!selectedDate || !selectedWell || !selectedUser) {
      toast({
        title: "Completa todos los campos",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);

    try {
      let foto_url = null;
      // Si se sube una foto, (a futuro) deberíamos subirla y obtener la URL.
      // Por ahora solo vemos si hay archivo y dejamos null (implementación de upload por Storage sería el siguiente paso)
      if (fotoFile) {
        toast({
          title: "Función de subir fotos no implementada aún",
          description: "La URL quedará vacía por ahora",
        });
        foto_url = null;
      }
      await taskService.createTask({
        titulo: formData.titulo,
        descripcion: formData.descripcion || null,
        link: formData.link || null,
        pozo_id: selectedWell,
        asignado_a: selectedUser,
        asignado_por: user?.email || 'sistema',
        fecha_limite: selectedDate.toISOString(),
        estado: 'pendiente',
        es_critica: isCritical,
        foto_url,
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
      setFotoFile(null);
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
          <div>
            <label className="block mb-1 text-sm">Descripción (opcional)</label>
            <Textarea
              placeholder="Descripción detallada de la tarea"
              {...register('descripcion')}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Link opcional</label>
            <Input
              placeholder="https://enlace-a-documentos.com"
              {...register('link')}
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
          <div>
            <label className="block mb-1 text-sm flex items-center gap-1">
              <FileImage className="h-4 w-4" />
              Foto (opcional)
            </label>
            <Input
              type="file"
              accept="image/*"
              disabled={isLoading}
              onChange={onFileChange}
            />
            {fotoFile && (
              <span className="text-xs text-gray-400">Archivo seleccionado: {fotoFile.name}</span>
            )}
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

