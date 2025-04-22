import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Task, taskService } from "@/services/taskService";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Image, FileText, Clock, FolderOpen, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    setDescripcion(task?.descripcion || "");
    setLink(task?.link || "");
    setFotoFile(null);
    setFotoUrl(task?.foto_url || null);
    setResolviendo(false);
    setDocumentFile(null);
    if (task?.id && open) {
      fetchHistorial(task.id);
    }
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

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocumentFile(e.target.files[0]);
    } else {
      setDocumentFile(null);
    }
  };

  const handleResolve = async () => {
    if (!task) return;
    setIsSaving(true);
    try {
      let foto_url = fotoUrl;
      if (fotoFile) {
        try {
          const fileExt = fotoFile.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `task-photos/${task.id}/${fileName}`;

          const { error: uploadError, data } = await supabase.storage
            .from('task-photos')
            .upload(filePath, fotoFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('task-photos')
            .getPublicUrl(filePath);

          foto_url = publicUrl;
          toast({
            title: "Foto subida",
            description: "La foto se ha subido correctamente",
          });
        } catch (error) {
          console.error("Error al subir foto:", error);
          toast({
            title: "Error",
            description: "No se pudo subir la foto",
            variant: "destructive"
          });
        }
      }

      let doc_url = task.doc_url;
      if (documentFile) {
        try {
          const fileExt = documentFile.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `task-docs/${task.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('task-docs')
            .upload(filePath, documentFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('task-docs')
            .getPublicUrl(filePath);

          doc_url = publicUrl;
          toast({
            title: "Documento subido",
            description: "El documento se ha subido correctamente",
          });
        } catch (error) {
          console.error("Error al subir documento:", error);
          toast({
            title: "Error",
            description: "No se pudo subir el documento",
            variant: "destructive"
          });
        }
      }

      await taskService.resolveTask({
        ...task,
        estado: "resuelta",
        descripcion,
        link,
        foto_url,
        doc_url
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
              <p className="flex items-center gap-1 mb-1">
                <Image className="w-4 h-4" />
                <span className="font-medium">Foto adjunta:</span>
              </p>
              <a href={task.foto_url} target="_blank" rel="noopener noreferrer">
                <img 
                  src={task.foto_url} 
                  alt="Foto de tarea" 
                  className="rounded-md max-h-60 mt-1 border hover:opacity-90 transition-opacity cursor-pointer" 
                />
              </a>
            </div>
          )}
          {task.doc_url && (
            <div className="flex gap-2 items-center">
              <FileText className="w-4 h-4" />
              <a 
                href={task.doc_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 underline flex items-center gap-1"
              >
                Documento adjunto
                <Download size={16} />
              </a>
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
            <div className="mt-2">
              <label className="block mb-1">Documento (opcional)</label>
              <Input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleDocumentChange} />
              {documentFile && <div className="text-xs text-gray-500">Archivo: {documentFile.name}</div>}
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
