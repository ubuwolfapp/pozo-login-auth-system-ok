
import React from 'react';
import { Filter, Webcam } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AlertType } from '@/types/alerts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AlertFiltersProps {
  activeFilter: AlertType;
  onFilterChange: (filter: AlertType) => void;
  selectedWellId: string | null;
  onWellChange: (wellId: string) => void;
}

const AlertFilters = ({ activeFilter, onFilterChange, selectedWellId, onWellChange }: AlertFiltersProps) => {
  const [showWebcam, setShowWebcam] = React.useState(false);

  const simulatedWells = [
    { id: '1', nombre: 'Pozo #7' },
    { id: '2', nombre: 'Pozo #12' },
    { id: '3', nombre: 'Pozo #33' },
    { id: '4', nombre: 'Pozo #44' }
  ];

  const handleFilterButtonClick = () => {
    toast({
      title: "Filtro",
      description: "Función de filtro no implementada",
    });
  };

  return (
    <>
      <div className="flex items-center gap-4 px-4 mb-4">
        <Select value={selectedWellId || ''} onValueChange={onWellChange}>
          <SelectTrigger className="w-[200px] bg-[#2E3A59] text-white border-gray-700">
            <SelectValue placeholder="Seleccionar pozo" />
          </SelectTrigger>
          <SelectContent className="bg-[#2E3A59] text-white border-gray-700">
            {simulatedWells.map((well) => (
              <SelectItem key={well.id} value={well.id} className="hover:bg-[#3A4B6B]">
                {well.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedWellId && (
          <Button
            variant="outline"
            size="icon"
            className="bg-[#2E3A59] text-white border-gray-700 hover:bg-[#3A4B6B]"
            onClick={() => setShowWebcam(true)}
          >
            <Webcam className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex justify-between mb-4">
        <button
          onClick={() => onFilterChange('todas')}
          className={`flex-1 py-3 rounded-l-lg ${activeFilter === 'todas' ? 'bg-[#2E3A59]' : 'bg-[#1C2526]'}`}
        >
          Todas
        </button>
        <button
          onClick={() => onFilterChange('critica')}
          className={`flex-1 py-3 ${activeFilter === 'critica' ? 'bg-[#2E3A59]' : 'bg-[#1C2526]'}`}
        >
          Críticas
        </button>
        <button
          onClick={() => onFilterChange('resueltas')}
          className={`flex-1 py-3 rounded-r-lg ${activeFilter === 'resueltas' ? 'bg-[#2E3A59]' : 'bg-[#1C2526]'}`}
        >
          Resueltas
        </button>
      </div>

      <button onClick={handleFilterButtonClick} className="absolute right-4 top-4 text-white">
        <Filter className="h-6 w-6" />
      </button>

      <Dialog open={showWebcam} onOpenChange={setShowWebcam}>
        <DialogContent className="bg-[#1C2526] text-white border-gray-700 max-w-3xl">
          <DialogHeader>
            <DialogTitle>Cámara en vivo</DialogTitle>
          </DialogHeader>
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            <img 
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6" 
              alt="Webcam stream"
              className="w-full h-full object-cover"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertFilters;
