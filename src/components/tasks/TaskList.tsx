
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { Task } from '@/services/taskService';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TaskListProps {
  tasks: Task[];
  myEmail: string;
  showOnly?: 'assigned_by_me' | 'assigned_to_me';
  showCreationDate?: boolean;
  onDeleteTask?: (taskId: string) => void;
}

const ITEMS_PER_PAGE = 5;

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  myEmail,
  showOnly = 'assigned_to_me',
  showCreationDate = false,
  onDeleteTask
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const filteredTasks = tasks.filter(task => 
    showOnly === 'assigned_by_me' ? task.asignado_por === myEmail : task.asignado_a === myEmail
  );

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const truncateDescription = (description: string | null | undefined) => {
    if (!description) return '';
    const words = description.split(' ').slice(0, 50);
    return words.join(' ') + (words.length >= 50 ? '...' : '');
  };

  return (
    <div className="space-y-4">
      {paginatedTasks.map(task => (
        <div key={task.id} className="relative">
          <Link to={`/tasks/${task.id}`}>
            <Card className="p-4 transition-colors px-[19px] py-[18px] my-[14px] bg-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-50 text-lg text-left font-bold">{task.titulo}</h3>
                  {task.descripcion && (
                    <p className="text-slate-300 text-sm mt-1 line-clamp-2">
                      {truncateDescription(task.descripcion)}
                    </p>
                  )}
                  {showCreationDate && (
                    <p className="text-xs mt-1 text-slate-300">
                      Creada: {format(new Date(task.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  )}
                </div>
                <Badge 
                  variant={task.estado === 'resuelta' ? 'secondary' : 'default'} 
                  className={task.estado === 'resuelta' ? 'bg-green-600' : 'bg-orange-600'}
                >
                  {task.estado}
                </Badge>
              </div>
            </Card>
          </Link>
          {onDeleteTask && (
            <div className="absolute top-4 right-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-red-500 hover:text-red-400"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-800 text-white border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteTask(task.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      ))}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default TaskList;
