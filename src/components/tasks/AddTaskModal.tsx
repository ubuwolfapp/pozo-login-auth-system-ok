
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { taskService, Task } from '@/services/taskService';
import { useQuery } from '@tanstack/react-query';
import { wellService } from '@/services/wellService';
import { toast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ 
  open, 
  onOpenChange,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Una semana en el futuro por defecto
  );
  const [selectedWell, setSelectedWell] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<Task['estado']>('pendiente');
  const [isCritical, setIsCritical] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    titulo: string;
    asignado_a: string;
  }>();
  
  const { data: wells = [] } = useQuery({
    queryKey: ['wells'],
    queryFn: wellService.getWells,
    enabled: open // Solo cargar pozos cuando el modal está abierto
  });

  const onSubmit = async (formData: { titulo: string; asignado_a: string }) => {
    if (!selectedDate || !selectedWell) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const newTask: Omit<Task, 'id' | 'created_at'> = {
        titulo: formData.titulo,
        pozo_id: selectedWell,
        asignado_a: formData.asignado_a,
        fecha_limite: selectedDate.toISOString(),
        estado: selectedStatus,
        es_critica: isCritical
      };
      
      const result = await taskService.createTask(newTask);
      
      if (result) {
        toast({
          title: "Éxito",
          description: "Tarea creada correctamente",
        });
        reset();
        setSelectedWell('');
        setSelectedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        setSelectedStatus('pendiente');
        setIsCritical(false);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error al crear tarea:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la tarea",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-800 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Agregar Nueva Tarea</DialogTitle>
          <DialogDescription className="text-slate-400">
            Complete los datos de la nueva tarea
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-white">Título de la tarea</Label>
            <Input
              id="titulo"
              placeholder="Ej. Reemplazar válvula"
              className="bg-slate-700 border-slate-600 text-white"
              {...register("titulo", { required: true })}
            />
            {errors.titulo && <p className="text-sm text-red-500">El título es obligatorio</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pozo" className="text-white">Pozo relacionado</Label>
            <Select value={selectedWell} onValueChange={setSelectedWell}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Seleccionar pozo" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600 text-white">
                {wells.map((well) => (
                  <SelectItem key={well.id} value={well.id}>{well.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="asignado_a" className="text-white">Asignado a</Label>
            <Input
              id="asignado_a"
              placeholder="Nombre del responsable"
              className="bg-slate-700 border-slate-600 text-white"
              {...register("asignado_a", { required: true })}
            />
            {errors.asignado_a && <p className="text-sm text-red-500">El responsable es obligatorio</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fecha_limite" className="text-white">Fecha límite</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-700 border-slate-600">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="bg-slate-700 text-white"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="estado" className="text-white">Estado</Label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as Task['estado'])}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600 text-white">
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_progreso">En progreso</SelectItem>
                <SelectItem value="resuelta">Resuelta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="es_critica"
              checked={isCritical}
              onCheckedChange={setIsCritical}
            />
            <Label htmlFor="es_critica" className="text-white">Tarea crítica</Label>
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {isLoading ? "Guardando..." : "Guardar tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;
