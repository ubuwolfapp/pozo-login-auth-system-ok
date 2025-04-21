
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Task {
  id: string;
  titulo: string;
  pozo_id: string;
  asignado_a: string;
  fecha_limite: string;
  estado: 'pendiente' | 'en_progreso' | 'resuelta';
  es_critica: boolean;
  created_at: string;
  asignado_por: string;
  descripcion?: string | null;
  foto_url?: string | null;
  link?: string | null;
}

export const taskService = {
  async getTasks() {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .order('fecha_limite');

      if (error) throw error;
      return data?.map(task => {
        let validEstado: Task['estado'] = 'pendiente';
        if (task.estado === 'pendiente' || task.estado === 'en_progreso' || task.estado === 'resuelta') {
          validEstado = task.estado as Task['estado'];
        }
        return {
          ...task,
          estado: validEstado
        } as Task;
      }) || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las tareas",
        variant: "destructive"
      });
      return [];
    }
  },

  async getTasksByUser({ asignee, assigner }: { asignee: string; assigner: string; }) {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .or(`asignado_por.eq.${assigner},asignado_a.eq.${asignee}`)
        .order('fecha_limite');

      if (error) throw error;
      return data?.map(task => {
        let validEstado: Task['estado'] = 'pendiente';
        if (task.estado === 'pendiente' || task.estado === 'en_progreso' || task.estado === 'resuelta') {
          validEstado = task.estado as Task['estado'];
        }
        return {
          ...task,
          estado: validEstado
        } as Task;
      }) || [];
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      return [];
    }
  },

  async createTask(task: Omit<Task, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .insert(task)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la tarea",
        variant: "destructive"
      });
      throw error;
    }
  },

  async updateTaskStatus(taskId: string, newStatus: Task['estado'], userEmail: string) {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .update({ estado: newStatus })
        .eq('id', taskId)
        .eq('asignado_a', userEmail) // Solo puede cambiar estado el asignado
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la tarea",
        variant: "destructive"
      });
      return null;
    }
  },

  async deleteTask(taskId: string) {
    try {
      const { error } = await supabase
        .from('tareas')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive"
      });
      return false;
    }
  }
};

