import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Clock, FolderOpen, FileText } from 'lucide-react';

const TaskHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const {
    data: tasks = [],
    isLoading
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks
  });

  const filteredTasks = tasks.filter(task => {
    const taskDate = new Date(task.created_at);
    const matchesDate = taskDate >= startDate && taskDate <= endDate;
    const matchesSearch = 
      task.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.asignado_a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesSearch;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Historial de Tareas</h1>
        
        <div className="bg-slate-800 p-4 rounded-lg mb-6 space-y-4">
          <h2 className="font-medium">Filtros</h2>
          <Input 
            placeholder="Buscar por título, descripción o asignado..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="bg-slate-700 border-slate-600 text-white" 
          />
          
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
                  <h3 className="font-medium text-orange-600">{task.titulo}</h3>
                  <Badge 
                    variant={task.estado === 'resuelta' ? 'secondary' : 'default'} 
                    className="bg-orange-600"
                  >
                    {task.estado}
                  </Badge>
                </div>
                <p className="text-sm mb-2 text-orange-50">{task.descripcion}</p>
                <div className="text-sm">
                  <p className="text-slate-50">Asignado a: {task.asignado_a}</p>
                  <p className="text-slate-50">Fecha Límite: {format(new Date(task.fecha_limite), 'dd/MM/yyyy')}</p>
                  <p className="text-slate-50 text-xs">Creada: {format(new Date(task.created_at), 'dd/MM/yyyy HH:mm')}</p>
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
              <Badge variant={selectedTask?.estado === 'resuelta' ? 'secondary' : 'default'}>
                {selectedTask?.estado}
              </Badge>
            </div>
            <div>
              <span className="text-gray-400 mr-1">Asignado por:</span> {selectedTask?.asignado_por}<br />
              <span className="text-gray-400 mr-1">Asignado a:</span> {selectedTask?.asignado_a}
            </div>
            <div>
              <span className="font-medium">Descripción:</span><br />
              {selectedTask?.descripcion 
                ? <span>{selectedTask.descripcion}</span> 
                : <span className="italic text-gray-400">Sin descripción</span>
              }
            </div>
            {selectedTask?.link && (
              <div className="flex gap-1 items-center text-blue-400">
                <FileText className="w-4 h-4" />
                <a 
                  href={selectedTask.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline break-all"
                >
                  {selectedTask.link}
                </a>
              </div>
            )}
            <div>
              <span className="text-gray-400 mr-1">Fecha de Creación:</span>
              {selectedTask ? format(new Date(selectedTask.created_at), 'dd/MM/yyyy HH:mm') : ''}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <NavigationBar />
    </div>
  );
};

export default TaskHistory;
