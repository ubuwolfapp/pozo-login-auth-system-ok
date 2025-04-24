import React from 'react';
import { format } from 'date-fns';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { Task } from '@/services/taskService';
interface TaskListProps {
  tasks: Task[];
  myEmail: string;
  showOnly?: 'assigned_by_me' | 'assigned_to_me';
  showCreationDate?: boolean;
}
const TaskList: React.FC<TaskListProps> = ({
  tasks,
  myEmail,
  showOnly = 'assigned_to_me',
  showCreationDate = false
}) => {
  const filteredTasks = tasks.filter(task => showOnly === 'assigned_by_me' ? task.asignado_por === myEmail : task.asignado_a === myEmail);
  return <div className="space-y-4">
      {filteredTasks.map(task => <Link to={`/tasks/${task.id}`} key={task.id}>
          <Card className="p-4 transition-colors px-[19px] py-[18px] my-[14px] bg-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-slate-50 text-lg text-left font-bold">{task.titulo}</h3>
                {showCreationDate && <p className="text-xs mt-1 text-slate-300">
                    Creada: {format(new Date(task.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>}
              </div>
              <Badge variant={task.estado === 'resuelta' ? 'secondary' : 'default'} className={task.estado === 'resuelta' ? 'bg-green-600' : 'bg-orange-600'}>
                {task.estado}
              </Badge>
            </div>
          </Card>
        </Link>)}
    </div>;
};
export default TaskList;