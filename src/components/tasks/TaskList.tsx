
import React from 'react';
import { Task } from '@/services/taskService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
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

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id}>
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
              <Badge className={getStatusColor(task.estado)}>
                {task.estado}
              </Badge>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Asignado a: {task.asignado_a}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TaskList;
