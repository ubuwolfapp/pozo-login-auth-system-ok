
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { taskService } from '@/services/taskService';
import TaskList from '@/components/tasks/TaskList';
import AddTaskModal from '@/components/tasks/AddTaskModal';
import NavigationBar from '@/components/NavigationBar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import TaskFilters from "@/components/tasks/TaskFilters";
import { toast } from "@/hooks/use-toast";

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

  // ---- FILTROS ----
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedPozo, setSelectedPozo] = useState("");
  const [selectedFecha, setSelectedFecha] = useState("");
  // Sacar la lista única de estados y de pozos para los select
  const estadosUnicos = Array.from(new Set(tasks.map(t => t.estado)));
  const pozosUnicos = Array.from(new Set(tasks.map(t => t.pozo_id).filter(Boolean)));

  function filtrarTareas(t) {
    let r = true;
    if (selectedEstado && t.estado !== selectedEstado) r = false;
    if (selectedPozo && t.pozo_id !== selectedPozo) r = false;
    if (selectedFecha) {
      // Comparar solo por día
      r = r && t.fecha_limite?.slice(0,10) === selectedFecha
    }
    return r;
  }
  // ---- FIN FILTROS ----

  // Notificación de tarea nueva para mí
  const tareasAnterioresRef = useRef<{id: string}[]>([]);
  useEffect(() => {
    if (tasks.length > 0 && userEmail) {
      const nuevasAsignadas = tasks.filter(t => t.asignado_a === userEmail &&
        !tareasAnterioresRef.current.some(prev => prev.id === t.id)
      );
      // Si hay alguna tarea nueva asignada a mí, notifico
      if (tareasAnterioresRef.current.length && nuevasAsignadas.length) {
        toast({
          title: "Nueva tarea asignada",
          description: `Te asignaron ${nuevasAsignadas.length} tarea(s) nueva(s).`,
        });
      }
      // Refresco el ref para el próximo render
      tareasAnterioresRef.current = tasks.map(t => ({ id: t.id }));
    }
  }, [tasks, userEmail]);

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
        {/* Filtros */}
        <TaskFilters
          estados={estadosUnicos}
          pozos={pozosUnicos}
          selectedEstado={selectedEstado}
          selectedPozo={selectedPozo}
          selectedFecha={selectedFecha}
          onEstadoChange={setSelectedEstado}
          onPozoChange={setSelectedPozo}
          onFechaChange={setSelectedFecha}
        />
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-semibold text-lg mb-2">Tareas asignadas por mí</h2>
            <TaskList
              tasks={tasks.filter(filtrarTareas)}
              myEmail={userEmail}
              showOnly="assigned_by_me"
            />
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-2">Mis tareas asignadas</h2>
            <TaskList
              tasks={tasks.filter(filtrarTareas)}
              myEmail={userEmail}
              showOnly="assigned_to_me"
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
        onSuccess={handleTaskAdded}
        preselectedWell={preselectedWell}
      />

      <NavigationBar />
    </div>
  );
};

export default Tasks;
