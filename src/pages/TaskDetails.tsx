import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Task, taskService } from "@/services/taskService";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image, FileText, Clock, FolderOpen, Download, ArrowLeft } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationBar from "@/components/NavigationBar";
const TaskDetails = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [descripcion, setDescripcion] = useState("");
  const [link, setLink] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const {
    data: task,
    isLoading
  } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const tasks = await taskService.getTasks();
      return tasks.find(t => t.id === id);
    }
  });
  const {
    data: historial = []
  } = useQuery({
    queryKey: ['task-history', id],
    queryFn: () => taskService.getTaskHistory(id || ''),
    enabled: !!id
  });
  useEffect(() => {
    if (task) {
      setDescripcion(task.descripcion || "");
      setLink(task.link || "");
    }
  }, [task]);
  const handleSaveProgress = async () => {
    if (!task) return;
    setIsSaving(true);
    try {
      let foto_url = task.foto_url;
      if (fotoFile) {
        foto_url = await taskService.uploadTaskFile(fotoFile, task.id, 'photo');
      }
      let doc_url = task.doc_url;
      if (documentFile) {
        doc_url = await taskService.uploadTaskFile(documentFile, task.id, 'document');
      }
      await taskService.resolveTask({
        ...task,
        descripcion,
        link,
        foto_url,
        doc_url,
        estado: task.estado
      });
      toast({
        title: "¡Progreso guardado!",
        description: "Los cambios se han guardado correctamente."
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks']
      });
      queryClient.invalidateQueries({
        queryKey: ['task', id]
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo guardar el progreso",
        variant: "destructive"
      });
    }
    setIsSaving(false);
  };
  const handleResolve = async () => {
    if (!task) return;
    setIsSaving(true);
    try {
      let foto_url = task.foto_url;
      if (fotoFile) {
        foto_url = await taskService.uploadTaskFile(fotoFile, task.id, 'photo');
      }
      let doc_url = task.doc_url;
      if (documentFile) {
        doc_url = await taskService.uploadTaskFile(documentFile, task.id, 'document');
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
        description: "La tarea fue marcada como resuelta."
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks']
      });
      navigate('/tasks');
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo guardar la resolución",
        variant: "destructive"
      });
    }
    setIsSaving(false);
  };
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>;
  }
  if (!task) {
    return <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tarea no encontrada</h1>
          <Button onClick={() => navigate('/tasks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Tareas
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="container mx-auto px-4 py-6">
        <Button variant="outline" onClick={() => navigate('/tasks')} className="mb-6 bg-red-600 hover:bg-red-500">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Tareas
        </Button>

        <div className="bg-slate-800 rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">{task.titulo}</h1>
              <Badge variant={task.estado === 'resuelta' ? 'secondary' : 'default'}>
                {task.estado}
              </Badge>
              {task.es_critica && <span className="ml-2 text-red-500 font-semibold">Crítica</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  <span>Pozo: <b>{task.pozo_id}</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Limite: {new Date(task.fecha_limite).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-400 mr-1">Asignado por:</span> {task.asignado_por}<br />
                  <span className="text-gray-400 mr-1">Asignado a:</span> {task.asignado_a}
                </div>
                <div>
                  <span className="font-medium">Descripción:</span><br />
                  {task.descripcion ? <span>{task.descripcion}</span> : <span className="italic text-gray-400">Sin descripción</span>}
                </div>
                {task.link && <div className="flex gap-1 items-center text-blue-400">
                    <FileText className="w-4 h-4" />
                    <a href={task.link} target="_blank" rel="noopener noreferrer" className="underline break-all">
                      {task.link}
                    </a>
                  </div>}
              </div>

              <div className="space-y-6">
                {task.foto_url && <div>
                    <p className="flex items-center gap-1 mb-1">
                      <Image className="w-4 h-4" />
                      <span className="font-medium">Foto adjunta:</span>
                    </p>
                    <a href={task.foto_url} target="_blank" rel="noopener noreferrer">
                      <img src={task.foto_url} alt="Foto de tarea" className="rounded-md max-h-60 mt-1 border hover:opacity-90 transition-opacity cursor-pointer" />
                    </a>
                  </div>}
                {task.doc_url && <div className="flex gap-2 items-center">
                    <FileText className="w-4 h-4" />
                    <a href={task.doc_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline flex items-center gap-1">
                      Documento adjunto
                      <Download size={16} />
                    </a>
                  </div>}
              </div>
            </div>

            {task.estado !== "resuelta" && user?.email === task.asignado_a && <div className="space-y-6 border-t border-gray-700 pt-6 mt-6">
                <h2 className="text-xl font-semibold">Actualizar Tarea</h2>
                <div>
                  <label className="block mb-2">Descripción del progreso</label>
                  <Textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Describe el progreso de la tarea" rows={3} />
                </div>
                <div>
                  <label className="block mb-2">Link opcional</label>
                  <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://enlace-a-documentos.com" />
                </div>
                <div>
                  <label className="block mb-2">Foto (opcional)</label>
                  <Input type="file" accept="image/*" onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  setFotoFile(e.target.files[0]);
                }
              }} />
                  {fotoFile && <div className="text-xs text-gray-400 mt-1">Archivo: {fotoFile.name}</div>}
                </div>
                <div>
                  <label className="block mb-2">Documento (opcional)</label>
                  <Input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  setDocumentFile(e.target.files[0]);
                }
              }} />
                  {documentFile && <div className="text-xs text-gray-400 mt-1">Archivo: {documentFile.name}</div>}
                </div>
                <div className="flex gap-4">
                  <Button variant="secondary" onClick={handleSaveProgress} disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Guardar Progreso"}
                  </Button>
                  <Button className="bg-green-700 text-white hover:bg-green-800" onClick={handleResolve} disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Marcar como Resuelta"}
                  </Button>
                </div>
              </div>}

            <div className="border-t border-gray-700 pt-6 mt-6">
              <div className="font-bold mb-3 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Historial de Cambios
              </div>
              <ScrollArea className="h-40">
                {historial.length === 0 ? <span className="italic text-gray-400">Sin historial</span> : <ul className="list-disc ml-4 space-y-2">
                    {historial.map(h => <li key={h.id}>
                        [{new Date(h.created_at).toLocaleString()}] <b>{h.usuario_email}</b> &mdash; <span className="capitalize">{h.tipo_cambio}</span>
                      </li>)}
                  </ul>}
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
      <NavigationBar />
    </div>;
};
export default TaskDetails;