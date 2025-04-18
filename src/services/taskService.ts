
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface Task {
  id: string;
  titulo: string;
  pozo_id: string;
  asignado_a: string;
  fecha_limite: string;
  estado: 'pendiente' | 'en_progreso' | 'resuelta';
  es_critica: boolean;
  created_at: string;
}

export const taskService = {
  async getTasks() {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .order('fecha_limite');

      if (error) throw error;
      
      // Validate and transform the estado field to ensure it matches our type
      return data?.map(task => {
        // Ensure estado is one of our valid types
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
      return null;
    }
  }
};
