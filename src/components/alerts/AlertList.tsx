import React from 'react';
import { AlertTriangle, Check, Image, FileText, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/types/alerts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

interface AlertListProps {
  alerts: Alert[] | undefined;
  isLoading: boolean;
  onAlertResolved?: (alertId: string, resolutionText: string, photoUrl?: string | null, docUrl?: string | null) => void;
  onDeleteAlert?: (alertId: string) => void;
}

const AlertList = ({ alerts, isLoading, onAlertResolved, onDeleteAlert }: AlertListProps) => {
  const [selectedAlert, setSelectedAlert] = React.useState<Alert | null>(null);
  const [resolutionText, setResolutionText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [documentFile, setDocumentFile] = React.useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getAlertBackground = (tipo: string, resuelto?: boolean) => {
    if (resuelto) {
      return 'bg-[#BDE0FE]/80';
    }
    
    switch (tipo) {
      case 'critica':
        return 'bg-[#8B0000]/80';
      case 'advertencia':
        return 'bg-[#2F4F4F]/80';
      default:
        return 'bg-[#2E3A59]/80';
    }
  };

  const getAlertIcon = (tipo: string) => {
    return (
      <AlertTriangle className={`h-6 w-6 ${tipo === 'critica' ? 'text-red-500' : 'text-yellow-500'}`} />
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleResolveClick = async () => {
    if (!selectedAlert) return;
    
    try {
      setIsSubmitting(true);
      
      let photoUrl: string | null = null;
      let docUrl: string | null = null;

      if (photoFile) {
        try {
          const fileExt = photoFile.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `alert-photos/${selectedAlert.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('alert-photos')
            .upload(filePath, photoFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('alert-photos')
            .getPublicUrl(filePath);

          photoUrl = publicUrl;
          
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

      if (documentFile) {
        try {
          const fileExt = documentFile.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `alert-docs/${selectedAlert.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('alert-docs')
            .upload(filePath, documentFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('alert-docs')
            .getPublicUrl(filePath);

          docUrl = publicUrl;
          
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
      
      console.log("Resolving alert:", selectedAlert.id, "Resolution text:", resolutionText);
      
      if (onAlertResolved) {
        await onAlertResolved(selectedAlert.id, resolutionText, photoUrl, docUrl);
      }
      
      setSelectedAlert(null);
      setResolutionText("");
      setPhotoFile(null);
      setDocumentFile(null);
    } catch (error) {
      console.error("Error resolving alert:", error);
      toast({
        title: "Error",
        description: "No se pudo resolver la alerta",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-white">Cargando...</div>;
  }

  if (!alerts?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-lg font-medium">No hay alertas que mostrar</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {alerts?.map((alert) => (
          <Card 
            key={alert.id}
            className={`${getAlertBackground(alert.tipo, alert.resuelto)} border-none p-4`}
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                {getAlertIcon(alert.tipo)}
                <div>
                  <p className="font-medium mb-1 text-white">{alert.mensaje}</p>
                  <p className="text-sm text-white">
                    {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                  {alert.resuelto && alert.fecha_resolucion && (
                    <p className="text-sm text-white mt-1">
                      Resuelto: {format(new Date(alert.fecha_resolucion), 'dd/MM/yyyy HH:mm')}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {!alert.resuelto ? (
                  <Button
                    onClick={() => setSelectedAlert(alert)}
                    variant="secondary"
                    className="bg-[#2F4F4F] hover:bg-[#3A5A5A] text-white"
                  >
                    Resolver
                  </Button>
                ) : (
                  <span className="text-white flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Resuelta
                  </span>
                )}
                
                {onDeleteAlert && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#1C2526] text-white border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          {alert.resuelto ? 
                            "Esta acción no se puede deshacer." :
                            "La alerta se moverá al historial."
                          }
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700 text-white">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteAlert(alert.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="bg-[#1C2526] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Resolver Alerta</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <Textarea
              placeholder="Escriba aquí la resolución..."
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              className="bg-[#2E3A59] border-gray-700 text-white placeholder:text-gray-400"
            />

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Image className="h-4 w-4" /> Adjuntar foto (opcional)
              </label>
              <Input
                type="file" 
                accept="image/*" 
                onChange={handlePhotoChange}
                className="bg-[#2E3A59] border-gray-700 text-white"
              />
              {photoFile && <p className="text-xs mt-1 text-gray-400">Archivo seleccionado: {photoFile.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Adjuntar documento (opcional)
              </label>
              <Input
                type="file" 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" 
                onChange={handleDocumentChange}
                className="bg-[#2E3A59] border-gray-700 text-white"
              />
              {documentFile && <p className="text-xs mt-1 text-gray-400">Archivo seleccionado: {documentFile.name}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setSelectedAlert(null)}
              className="bg-gray-600 hover:bg-gray-700 text-white"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResolveClick}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertList;
