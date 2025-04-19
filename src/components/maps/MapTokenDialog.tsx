
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MapTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tempToken: string;
  onTokenChange: (value: string) => void;
  onSave: () => void;
}

const MapTokenDialog = ({
  open,
  onOpenChange,
  tempToken,
  onTokenChange,
  onSave
}: MapTokenDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar token de Mapbox</DialogTitle>
          <DialogDescription>
            Introduce tu token público de Mapbox para visualizar los mapas correctamente.
            Puedes obtener uno gratis en <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-pozo-orange hover:underline">mapbox.com</a>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Introduce el token de Mapbox..."
            value={tempToken}
            onChange={(e) => onTokenChange(e.target.value)}
          />
          <div className="flex justify-end">
            <Button 
              className="bg-pozo-orange hover:bg-orange-600 text-white"
              onClick={onSave}
              disabled={!tempToken}
            >
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapTokenDialog;
