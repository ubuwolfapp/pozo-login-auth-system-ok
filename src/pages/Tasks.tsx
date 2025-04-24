import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { taskService } from '@/services/taskService';
import TaskList from '@/components/tasks/TaskList';
import AddTaskModal from '@/components/tasks/AddTaskModal';
import NavigationBar from '@/components/NavigationBar';
import { Button } from '@/components/ui/button';
import { Plus, History } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Tasks = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preselectedWell, setPreselectedWell] = useState<string | undefined>(undefined);
  const [taskStatus, setTaskStatus] = useState<'all' | 'pendiente' | 'en_progreso' | 'resuelta'>('all');
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const userEmail = user?.email || "";

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks
  });

  const filteredTasks = tasks.filter(task => 
    taskStatus === 'all' || task.estado === taskStatus
  );

  useEffect(() => {
    const openModal = searchParams.get('openModal');
    const wellParam = searchParams.get('well');
    if (openModal === 'true') {
      setIsAddModalOpen(true);
      if (wellParam) setPreselectedWell(wellParam);
      searchParams.delete('openModal');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleTaskAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    setPreselectedWell(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="container mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Tareas</h1>
          <div className="flex gap-2 items-center">
            <Select value={taskStatus} onValueChange={(value: 'all' | 'pendiente' | 'en_progreso' | 'resuelta') => setTaskStatus(value)}>
              <SelectTrigger className="w-[180px] bg-slate-800 text-white">
                <SelectValue placeholder="Estado de Tarea" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="en_progreso">En Progreso</SelectItem>
                <SelectItem value="resuelta">Resueltas</SelectItem>
              </SelectContent>
            </Select>
            <Link to="/task-history">
              <Button
                variant="outline"
                className="border-cyan-500 text-cyan-500"
              >
                <History className="h-5 w-5 mr-1" />
                Ver Historial
              </Button>
            </Link>
            <Button
              className="bg-cyan-500 hover:bg-cyan-600"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-5 w-5 mr-1" />
              Nueva Tarea
            </Button>
          </div>
        </header>
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-semibold text-lg mb-2">Tareas asignadas por mí</h2>
            <TaskList 
              tasks={filteredTasks} 
              myEmail={userEmail} 
              showOnly="assigned_by_me" 
              showCreationDate={true}
            />
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-2">Mis tareas asignadas</h2>
            <TaskList 
              tasks={filteredTasks} 
              myEmail={userEmail} 
              showOnly="assigned_to_me" 
              showCreationDate={true}
            />
          </div>
        </div>
      </div>

      <AddTaskModal
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setPreselectedWell(undefined);
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
        preselectedWell={preselectedWell}
      />

      <NavigationBar />
    </div>
  );
};

export default Tasks;
