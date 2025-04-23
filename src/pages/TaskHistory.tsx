
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

const TaskHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks
  });

  const filteredTasks = tasks.filter(task => {
    const taskDate = new Date(task.created_at);
    const matchesDate = taskDate >= startDate && taskDate <= endDate;
    const matchesSearch = task.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.asignado_a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Historial de Tareas</h1>
        
        <div className="space-y-4 mb-6">
          <Input
            placeholder="Buscar por título, descripción o asignado..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
          />
          
          <DateSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateSelect={(date) => date && setStartDate(date)}
            onEndDateSelect={(date) => date && setEndDate(date)}
          />
        </div>

        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="bg-slate-800 border-slate-700 p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{task.titulo}</h3>
                  <Badge 
                    variant={task.estado === 'resuelta' ? 'secondary' : 'default'}
                  >
                    {task.estado}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mb-2">{task.descripcion}</p>
                <div className="text-sm">
                  <p>Asignado a: {task.asignado_a}</p>
                  <p>Fecha: {format(new Date(task.created_at), 'dd/MM/yyyy HH:mm')}</p>
                  {task.fecha_limite && (
                    <p>Límite: {format(new Date(task.fecha_limite), 'dd/MM/yyyy')}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
      <NavigationBar />
    </div>
  );
};

export default TaskHistory;
