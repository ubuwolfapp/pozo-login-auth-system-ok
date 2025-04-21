
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Link as LinkIcon, Image as ImageIcon, Check } from "lucide-react";

import { Task } from "@/services/taskService";

interface ViewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

const statusColor = {
  pendiente: "bg-yellow-500",
  en_progreso: "bg-blue-500",
  resuelta: "bg-green-500",
};

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({ open, onOpenChange, task }) => {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {task.titulo}
            {task.es_critica && (
              <div className="flex items-center" aria-label="Tarea crítica">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="mb-3 flex gap-3 items-center">
          <Badge className={statusColor[task.estado as keyof typeof statusColor]}>
            {task.estado}
          </Badge>
          <span className="text-xs text-gray-400">
            Fecha límite: {new Date(task.fecha_limite).toLocaleDateString()}
          </span>
        </div>
        <div>
          <div className="mb-1 text-muted-foreground text-xs">Asignado a:</div>
          <div className="mb-2">{task.asignado_a}</div>
          <div className="mb-1 text-muted-foreground text-xs">Asignado por:</div>
          <div className="mb-2">{task.asignado_por}</div>
        </div>
        <div>
          <h4 className="font-semibold mt-3 mb-1">Descripción:</h4>
          <div className="bg-slate-100 rounded p-2 text-slate-800 min-h-[40px]">
            {task.descripcion || <span className="italic text-gray-500">Sin descripción</span>}
          </div>
        </div>
        
        {/* Mostrar detalles de la resolución si existe */}
        {task.estado === 'resuelta' && task.descripcion_resolucion && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold mb-1 flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" /> 
              Resolución:
            </h4>
            <div className="bg-slate-100 rounded p-2 text-slate-800">
              {task.descripcion_resolucion}
            </div>
            {task.fecha_resolucion && (
              <div className="text-xs text-gray-500 mt-1">
                Resuelta el: {new Date(task.fecha_resolucion).toLocaleString()}
              </div>
            )}
            
            {/* Mostrar foto de resolución si existe */}
            {task.foto_resolucion_url && (
              <div className="mt-2">
                <div className="mb-1 text-sm flex gap-1 items-center text-gray-600">
                  <ImageIcon className="h-4 w-4" /> Foto de resolución:
                </div>
                <img 
                  src={task.foto_resolucion_url} 
                  alt="Foto de resolución" 
                  className="rounded max-w-full max-h-60 border border-gray-200" 
                />
              </div>
            )}
          </div>
        )}
        
        {task.link && (
          <div className="mt-3">
            <a
              href={task.link}
              className="inline-flex items-center gap-1 text-cyan-600 underline"
              target="_blank" rel="noopener noreferrer"
            >
              <LinkIcon className="h-4 w-4" /> Ver enlace adjunto
            </a>
          </div>
        )}
        {task.foto_url && (
          <div className="mt-3">
            <div className="mb-1 text-sm flex gap-1 items-center text-gray-600">
              <ImageIcon className="h-4 w-4" /> Foto adjunta:
            </div>
            <img src={task.foto_url} alt="Foto adjunta" className="rounded max-w-full max-h-60 border border-gray-200" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewTaskModal;
