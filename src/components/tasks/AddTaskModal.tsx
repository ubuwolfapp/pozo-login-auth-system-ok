
import React, { useState, useEffect } from 'react';
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
import TaskForm, { TaskFormData } from './TaskForm';

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
  const [usuarios, setUsuarios] = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const { data: wells = [] } = useQuery({
    queryKey: ['wells'],
    queryFn: wellService.getWells,
    enabled: open
  });

  // Cargar usuarios al abrir el modal y cuando cambia el usuario autenticado
  useEffect(() => {
    if (open) {
      setLoadingUsers(true);
      userService.getAllUsers().then(data => {
        console.log("Usuarios cargados en modal:", data);
        setUsuarios(data || []);
        
        // Si el usuario actual no está en la lista, intentar sincronizarlo
        if (user && !data.some(u => u.email === user.email)) {
          console.log("El usuario actual no está en la lista, intentando sincronizar:", user);
          userService.syncAuthUserToPublic(user)
            .then(syncedUser => {
              if (syncedUser) {
                setUsuarios(prev => [...prev, syncedUser]);
              }
            })
            .catch(err => console.error("Error al sincronizar usuario:", err));
        }
      }).catch(err => {
        console.error("Error al cargar usuarios:", err);
        toast({
          title: "Error al cargar usuarios",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive"
        });
      }).finally(() => {
        setLoadingUsers(false);
      });
    }
  }, [open, user]);

  const handleFormSubmit = async (
    formData: TaskFormData, 
    options: {
      selectedDate: Date;
      selectedWell: string;
      selectedUser: string;
      isCritical: boolean;
    }
  ) => {
    const { selectedDate, selectedWell, selectedUser, isCritical } = options;

    if (!selectedDate || !selectedWell || !selectedUser || !formData.titulo) {
      toast({
        title: "Completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);

    let fotoUrl = undefined;
    if (formData.foto && formData.foto.length > 0) {
      const file = formData.foto[0];
      // Subir foto al bucket "tareas_adjuntos"
      try {
        fotoUrl = await taskService.uploadTaskImage(file);
      } catch (e) {
        toast({
          title: "Error al subir la foto",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      await taskService.createTask({
        titulo: formData.titulo,
        descripcion: formData.descripcion || "",
        link: formData.link || "",
        foto_url: fotoUrl || "",
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
        <TaskForm 
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
          wells={wells}
          usuarios={usuarios}
          preselectedWell={preselectedWell}
          loadingUsers={loadingUsers}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;
