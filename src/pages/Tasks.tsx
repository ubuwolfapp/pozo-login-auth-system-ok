
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { taskService } from '@/services/taskService';
import TaskList from '@/components/tasks/TaskList';
import AddTaskModal from '@/components/tasks/AddTaskModal';
import NavigationBar from '@/components/NavigationBar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Tasks = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preselectedWell, setPreselectedWell] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const userEmail = user?.email || "";

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks
  });

  // Detectar ?openModal=true&well=xxx en la URL
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
          <Button
            className="bg-cyan-500 hover:bg-cyan-600"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-5 w-5 mr-1" />
            Nueva Tarea
          </Button>
        </header>
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-semibold text-lg mb-2">Tareas asignadas por mí</h2>
            <TaskList tasks={tasks} myEmail={userEmail} showOnly="assigned_by_me" />
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-2">Mis tareas asignadas</h2>
            <TaskList tasks={tasks} myEmail={userEmail} showOnly="assigned_to_me" />
          </div>
        </div>
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
