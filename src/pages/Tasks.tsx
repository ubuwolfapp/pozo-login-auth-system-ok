
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { taskService } from '@/services/taskService';
import TaskList from '@/components/tasks/TaskList';
import AddTaskModal from '@/components/tasks/AddTaskModal';
import NavigationBar from '@/components/NavigationBar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Tasks = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preselectedWell, setPreselectedWell] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks
  });

  // Detectamos si viene un pozo y openModal en la URL (ej: ?openModal=true&well=123)
  useEffect(() => {
    const openModal = searchParams.get('openModal');
    const wellParam = searchParams.get('well');
    if (openModal === 'true') {
      setIsAddModalOpen(true);
      if (wellParam) setPreselectedWell(wellParam);
      // Limpiamos los params para que no se reabra modal si usuario refresca
      searchParams.delete('openModal');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleTaskAdded = () => {
    // Refrescar la lista de tareas después de agregar una nueva
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
          <Button 
            className="bg-cyan-500 hover:bg-cyan-600"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-5 w-5 mr-1" />
            Nueva Tarea
          </Button>
        </header>
        
        <TaskList tasks={tasks} />
      </div>
      
      <AddTaskModal 
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setPreselectedWell(undefined);
        }}
        onSuccess={handleTaskAdded}
        preselectedWell={preselectedWell}
      />
      
      <NavigationBar />
    </div>
  );
};

export default Tasks;
