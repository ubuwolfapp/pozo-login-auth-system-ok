
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tempApiKey: string;
  onApiKeyChange: (value: string) => void;
  onSave: () => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({
  open,
  onOpenChange,
  tempApiKey,
  onApiKeyChange,
  onSave
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Google Maps API Key</DialogTitle>
          <DialogDescription>
            Introduce tu API Key de Google Maps para visualizar los mapas correctamente.
            Puedes obtener una en <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank" rel="noopener noreferrer" className="text-pozo-orange hover:underline">Google Cloud Platform</a>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Introduce tu API Key de Google Maps..."
            value={tempApiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
          />
          <div className="flex justify-end">
            <Button 
              className="bg-pozo-orange hover:bg-orange-600 text-white"
              onClick={onSave}
              disabled={!tempApiKey}
            >
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
