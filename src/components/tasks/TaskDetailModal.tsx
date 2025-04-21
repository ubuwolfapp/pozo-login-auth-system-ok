
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Task, taskService } from "@/services/taskService";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Image, FileText, Clock, FolderOpen } from "lucide-react";

interface TaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onTaskUpdated?: () => void;
}

interface TaskHistory {
  id: string;
  tarea_id: string;
  tipo_cambio: string;
  usuario_email: string;
  created_at: string;
  valor_anterior?: any;
  valor_nuevo?: any;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  open,
  onOpenChange,
  task,
  onTaskUpdated
}) => {
  const { user } = useAuth();
  const [descripcion, setDescripcion] = useState(task?.descripcion || "");
  const [link, setLink] = useState(task?.link || "");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(task?.foto_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [historial, setHistorial] = useState<TaskHistory[]>([]);
  const [resolviendo, setResolviendo] = useState(false);

  useEffect(() => {
    // Reset campos al abrir/cerrar modal
    setDescripcion(task?.descripcion || "");
    setLink(task?.link || "");
    setFotoFile(null);
    setFotoUrl(task?.foto_url || null);
    setResolviendo(false);
    // Cargar historial
    if (task?.id && open) {
      fetchHistorial(task.id);
    }
  // eslint-disable-next-line
  }, [task, open]);

  const fetchHistorial = async (taskId: string) => {
    try {
      const historialData = await taskService.getTaskHistory(taskId);
      setHistorial(historialData);
    } catch (err) {
      setHistorial([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFotoFile(e.target.files[0]);
    } else {
      setFotoFile(null);
    }
  };

  const handleResolve = async () => {
    if (!task) return;
    setIsSaving(true);
    try {
      // Cargar imagen: omitido - implementar aquí si hay bucket (por ahora deja url en null)
      let foto_url = fotoUrl;
      if (fotoFile) {
        toast({
          title: "Subida de fotos no implementada aún",
          description: "Solo se almacena referencia.",
        });
        // Aquí iría lógica de upload real
        foto_url = null;
      }
      // Actualizar tarea con nuevos datos (estado, descripción, foto...)
      await taskService.resolveTask({
        ...task,
        estado: "resuelta",
        descripcion,
        link,
        foto_url,
      });
      toast({
        title: "¡Tarea resuelta!",
        description: "La tarea fue marcada como resuelta.",
      });
      if (onTaskUpdated) onTaskUpdated();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo guardar la resolución",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle de Tarea</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-bold">{task.titulo}</span>{" "}
            <Badge className="uppercase">{task.estado}</Badge>
            {task.es_critica && (
              <span className="ml-2 text-red-500 font-semibold">Crítica</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            <span>Pozo: <b>{task.pozo_id}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Limite: {new Date(task.fecha_limite).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-gray-500 mr-1">Asignado por:</span> {task.asignado_por}<br />
            <span className="text-gray-500 mr-1">Asignado a:</span> {task.asignado_a}
          </div>
          <div>
            <span className="font-medium">Descripción:</span> <br />
            {task.descripcion ? (
              <span>{task.descripcion}</span>
            ) : (
              <span className="italic text-gray-400">Sin descripción</span>
            )}
          </div>
          {task.link && (
            <div className="flex gap-1 items-center text-blue-400">
              <FileText className="w-4 h-4" />
              <a href={task.link} target="_blank" rel="noopener noreferrer" className="underline break-all">{task.link}</a>
            </div>
          )}
          {task.foto_url && (
            <div>
              <Image className="w-4 h-4 inline-block mr-1" />
              <img src={task.foto_url} alt="Tarea" className="rounded max-h-40 mt-1 border" />
            </div>
          )}
        </div>
        {task.estado !== "resuelta" && user?.email === task.asignado_a && (
          <>
            <hr className="my-2" />
            <div>
              <label className="block mb-1">Descripción de la resolución</label>
              <Textarea
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Describe cómo resolviste la tarea"
                rows={3}
              />
            </div>
            <div className="mt-2">
              <label className="block mb-1">Link opcional</label>
              <Input
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="https://enlace-a-documentos.com"
              />
            </div>
            <div className="mt-2">
              <label className="block mb-1">Foto (opcional)</label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
              {fotoFile && <div className="text-xs text-gray-500">Archivo: {fotoFile.name}</div>}
            </div>
            <DialogFooter>
              <Button
                className="bg-green-700 text-white"
                onClick={handleResolve}
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Marcar como Resuelta"}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Historial */}
        <hr className="my-3" />
        <div>
          <div className="font-bold mb-1 flex items-center gap-1"><Clock className="w-4 h-4" />Historial de Cambios</div>
          <div className="max-h-40 overflow-auto text-xs">
            {historial.length === 0 ? (
              <span className="italic text-gray-400">Sin historial</span>
            ) : (
              <ul className="list-disc ml-4">
                {historial.map(h => (
                  <li key={h.id}>
                    [{new Date(h.created_at).toLocaleString()}] <b>{h.usuario_email}</b> &mdash; <span className="capitalize">{h.tipo_cambio}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
