import React, { useState } from 'react';
import { Task } from '@/services/taskService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle } from 'lucide-react';
import ChangeStatusModal from './ChangeStatusModal';
import ViewTaskModal from './ViewTaskModal';
import { useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from "@/hooks/useAuth";

interface TaskListProps {
  tasks: Task[];
  myEmail: string | null;
  showOnly?: "assigned_by_me" | "assigned_to_me" | undefined;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, myEmail, showOnly }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-500';
      case 'en_progreso':
        return 'bg-blue-500';
      case 'resuelta':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (showOnly === "assigned_by_me") {
      return task.asignado_por === myEmail;
    }
    if (showOnly === "assigned_to_me") {
      return task.asignado_a === myEmail;
    }
    return true;
  });

  const handleStatusClick = (task: Task) => {
    if (task.asignado_a !== myEmail) {
      toast({
        title: "Solo el usuario asignado puede cambiar el estado.",
        variant: "destructive"
      });
      return;
    }
    setSelectedTask(task);
    setIsStatusModalOpen(true);
  };

  const handleStatusChange = async (
    newStatus: Task['estado'], 
    resolutionDetails?: {
      descripcion?: string;
      foto?: File;
    }
  ) => {
    if (!selectedTask) return;

    try {
      await taskService.updateTaskStatus(
        selectedTask.id, 
        newStatus, 
        myEmail || "", 
        resolutionDetails
      );
      
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      toast({
        title: "Estado actualizado",
        description: "El estado de la tarea ha sido actualizado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la tarea",
        variant: "destructive",
      });
    }
  };

  const handleCardClick = (task: Task) => {
    setViewTask(task);
    setIsViewModalOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => handleCardClick(task)}>
            <CardHeader className="p-4">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold">
                  {task.titulo}
                </CardTitle>
                {task.es_critica && (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {new Date(task.fecha_limite).toLocaleDateString()}
                  </span>
                </div>
                <Badge
                  className={`cursor-pointer ${getStatusColor(task.estado)}`}
                  onClick={e => {
                    e.stopPropagation();
                    handleStatusClick(task);
                  }}
                >
                  {task.estado}
                </Badge>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Asignado a: {task.asignado_a}
                <br />
                Asignado por: {task.asignado_por}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ChangeStatusModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        currentStatus={selectedTask?.estado || 'pendiente'}
        onStatusChange={handleStatusChange}
      />

      <ViewTaskModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        task={viewTask}
      />
    </>
  );
};

export default TaskList;
