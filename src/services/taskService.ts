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
  doc_url?: string | null;
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
  },

  async getTaskHistory(taskId: string) {
    try {
      const { data, error } = await supabase
        .from('tareas_historial')
        .select('*')
        .eq('tarea_id', taskId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching task history:', error);
      return [];
    }
  },

  async resolveTask(updatedTask: Task) {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .update({
          estado: 'resuelta',
          descripcion: updatedTask.descripcion,
          link: updatedTask.link,
          foto_url: updatedTask.foto_url,
          doc_url: updatedTask.doc_url,
        })
        .eq('id', updatedTask.id)
        .eq('asignado_a', updatedTask.asignado_a)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error resolving task:', error);
      toast({
        title: "Error",
        description: "No se pudo resolver la tarea",
        variant: "destructive"
      });
      throw error;
    }
  },

  async uploadTaskFile(file: File, taskId: string, fileType: 'photo' | 'document') {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const bucketFolder = fileType === 'photo' ? 'task-photos' : 'task-docs';
      const filePath = `${taskId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucketFolder)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketFolder)
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      toast({
        title: "Error",
        description: `No se pudo subir el ${fileType === 'photo' ? 'foto' : 'documento'}`,
        variant: "destructive"
      });
      throw error;
    }
  }
};
