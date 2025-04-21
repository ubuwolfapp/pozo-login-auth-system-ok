
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { AppUser } from '@/services/userService';

export interface TaskFormData {
  titulo: string;
  descripcion?: string;
  link?: string;
  foto?: FileList;
}

interface TaskFormProps {
  onSubmit: (formData: TaskFormData, selectedOptions: {
    selectedDate: Date;
    selectedWell: string;
    selectedUser: string;
    isCritical: boolean;
  }) => void;
  isLoading: boolean;
  wells: any[];
  usuarios: AppUser[];
  preselectedWell?: string;
  loadingUsers?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  isLoading,
  wells,
  usuarios,
  preselectedWell,
  loadingUsers = false
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [selectedWell, setSelectedWell] = useState<string>(preselectedWell || '');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isCritical, setIsCritical] = useState(false);

  const { register, handleSubmit, setValue } = useForm<TaskFormData>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('foto', e.target.files as FileList);
  };

  const handleFormSubmit = (formData: TaskFormData) => {
    onSubmit(formData, {
      selectedDate,
      selectedWell,
      selectedUser,
      isCritical
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-2">
      <div>
        <Input
          placeholder="Título de la tarea"
          {...register('titulo', { required: true })}
          disabled={isLoading}
        />
      </div>
      <div>
        <Textarea
          placeholder="Descripción de la tarea"
          {...register('descripcion')}
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
            {wells.length === 0 ? (
              <SelectItem value="no_wells">No hay pozos disponibles</SelectItem>
            ) : (
              wells.map((well: any) => (
                <SelectItem key={well.id} value={well.id}>
                  {well.nombre}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block mb-1 text-sm">Asignar a usuario</label>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger disabled={loadingUsers}>
            <SelectValue placeholder={
              loadingUsers 
                ? "Cargando usuarios..." 
                : "Selecciona el usuario"
            } />
          </SelectTrigger>
          <SelectContent>
            {loadingUsers ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Cargando usuarios...</span>
              </div>
            ) : usuarios.length === 0 ? (
              <SelectItem value="no_users">No hay usuarios disponibles</SelectItem>
            ) : (
              usuarios.map((u) => (
                <SelectItem key={String(u.id)} value={u.email}>
                  {u.nombre} ({u.email})
                </SelectItem>
              ))
            )}
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
        <label className="block mb-1 text-sm">Adjuntar foto (opcional)</label>
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </div>
      <div>
        <Input
          placeholder="Link externo (opcional)"
          {...register('link')}
          disabled={isLoading}
          type="url"
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
      <Button type="submit" disabled={isLoading} className="relative">
        {isLoading && (
          <Loader2 className="h-4 w-4 absolute left-4 animate-spin" />
        )}
        {isLoading ? "Creando..." : "Crear tarea"}
      </Button>
    </form>
  );
};

export default TaskForm;
