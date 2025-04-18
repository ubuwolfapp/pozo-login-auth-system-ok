
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';
import TaskList from '@/components/tasks/TaskList';
import AddTaskModal from '@/components/tasks/AddTaskModal';
import NavigationBar from '@/components/NavigationBar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Tasks = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks
  });

  const handleTaskAdded = () => {
    // Refrescar la lista de tareas después de agregar una nueva
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
        onOpenChange={setIsAddModalOpen}
        onSuccess={handleTaskAdded}
      />
      
      <NavigationBar />
    </div>
  );
};

export default Tasks;
