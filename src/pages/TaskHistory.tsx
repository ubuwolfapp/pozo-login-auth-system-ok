
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import DateSelector from '@/components/reports/DateSelector';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, subDays } from 'date-fns';
import NavigationBar from '@/components/NavigationBar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task } from '@/services/taskService';
import { Clock, FolderOpen, FileText, Trash } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

const TaskHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskStatus, setTaskStatus] = useState<'all' | 'pendiente' | 'en_progreso' | 'resuelta'>('all');
  const queryClient = useQueryClient();

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      
      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada correctamente",
      });

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive"
      });
    }
  };

  const {
    data: tasks = [],
    isLoading
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks
  });

  const filteredTasks = tasks
    .filter(task => {
      const taskDate = new Date(task.created_at);
      const matchesDate = taskDate >= startDate && taskDate <= endDate;
      const matchesSearch = task.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.asignado_a.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = taskStatus === 'all' || task.estado === taskStatus;
      return matchesDate && matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>;
  }

  return <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Historial de Tareas</h1>
        
        <div className="bg-slate-800 p-4 rounded-lg mb-6 space-y-4">
          <h2 className="font-medium">Filtros</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <Input 
              placeholder="Buscar por título, descripción o asignado..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="bg-slate-700 border-slate-600 text-white flex-1" 
            />
            <Select 
              value={taskStatus} 
              onValueChange={(value: 'all' | 'pendiente' | 'en_progreso' | 'resuelta') => setTaskStatus(value)}
            >
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
          </div>
          
          <DateSelector 
            startDate={startDate} 
            endDate={endDate} 
            onStartDateSelect={date => date && setStartDate(date)} 
            onEndDateSelect={date => date && setEndDate(date)} 
          />
          
          <div className="text-sm text-gray-400">
            Mostrando {filteredTasks.length} de {tasks.length} tareas
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4">
            {filteredTasks.length > 0 ? filteredTasks.map(task => (
              <Card 
                key={task.id} 
                className="border-slate-700 p-4 bg-slate-700 cursor-pointer hover:bg-slate-600" 
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-slate-50 text-lg font-bold">{task.titulo}</h3>
                  <Badge 
                    variant={task.estado === 'resuelta' ? 'secondary' : 'default'} 
                    className={task.estado === 'resuelta' ? 'bg-green-600' : 'bg-orange-600'}
                  >
                    {task.estado}
                  </Badge>
                </div>
                <p className="text-sm mb-2 text-orange-50">{task.descripcion}</p>
                <div className="text-sm">
                  <p className="text-slate-50 mx-[10px]">Asignado a: {task.asignado_a}</p>
                  <p className="text-slate-50 mx-[10px]">Fecha Límite: {format(new Date(task.fecha_limite), 'dd/MM/yyyy')}</p>
                  <p className="text-slate-50 text-xs text-left mx-[10px]">Creada: {format(new Date(task.created_at), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </Card>
            )) : (
              <div className="text-center py-10 text-gray-400">
                No se encontraron tareas con los filtros aplicados
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedTask?.titulo}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              <span>Pozo: <b>{selectedTask?.pozo_id}</b></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Límite: {selectedTask ? format(new Date(selectedTask.fecha_limite), 'dd/MM/yyyy') : ''}</span>
            </div>
            <div>
              <span className="text-gray-400 mr-1">Estado:</span>
              <Badge 
                variant={selectedTask?.estado === 'resuelta' ? 'secondary' : 'default'}
                className={selectedTask?.estado === 'resuelta' ? 'bg-green-600' : 'bg-orange-600'}
              >
                {selectedTask?.estado}
              </Badge>
            </div>
            <div>
              <span className="text-gray-400 mr-1">Asignado por:</span> {selectedTask?.asignado_por}<br />
              <span className="text-gray-400 mr-1">Asignado a:</span> {selectedTask?.asignado_a}
            </div>
            <div>
              <span className="font-medium">Descripción:</span><br />
              {selectedTask?.descripcion ? <span>{selectedTask.descripcion}</span> : <span className="italic text-gray-400">Sin descripción</span>}
            </div>
            {selectedTask?.link && (
              <div className="flex gap-1 items-center text-blue-400">
                <FileText className="w-4 h-4" />
                <a href={selectedTask.link} target="_blank" rel="noopener noreferrer" className="underline break-all">
                  {selectedTask.link}
                </a>
              </div>
            )}
            <div>
              <span className="text-gray-400 mr-1">Fecha de Creación:</span>
              {selectedTask ? format(new Date(selectedTask.created_at), 'dd/MM/yyyy HH:mm') : ''}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash className="h-4 w-4 mr-2" />
                    Eliminar Tarea
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
                      onClick={() => {
                        if (selectedTask) {
                          handleDeleteTask(selectedTask.id);
                          setSelectedTask(null);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <NavigationBar />
    </div>;
};

export default TaskHistory;
