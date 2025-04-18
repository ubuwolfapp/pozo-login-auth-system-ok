
import React, { useEffect, useRef } from 'react';
import { Well } from '@/services/wellService';
import { Factory, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';

interface WellMapProps {
  wells: Well[];
  onSelectWell: (well: Well) => void;
}

const WellMap: React.FC<WellMapProps> = ({ wells, onSelectWell }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Función para obtener color según estado
  const getStatusColor = (estado: string): string => {
    switch (estado) {
      case 'activo':
        return 'bg-green-500';
      case 'advertencia':
        return 'bg-yellow-500';
      case 'fuera_de_servicio':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Función para obtener color de texto según estado
  const getStatusTextColor = (estado: string): string => {
    switch (estado) {
      case 'activo':
        return 'text-green-500';
      case 'advertencia':
        return 'text-yellow-500';
      case 'fuera_de_servicio':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="rounded-lg bg-gray-900 border border-gray-700 relative h-[50vh] overflow-hidden">
      {/* Fondo del mapa con patrón de grilla */}
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzMzMzMzQ0IiBvcGFjaXR5PSIwLjIiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] bg-slate-900"
      >
        {/* Capa de sombreado para profundidad */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-slate-900/80"></div>
        
        {/* Brújula */}
        <div className="absolute top-4 right-4 bg-slate-800 bg-opacity-70 p-2 rounded-full">
          <svg width="40" height="40" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#555" strokeWidth="2" />
            <text x="50" y="20" textAnchor="middle" dominantBaseline="middle" fill="#888" fontSize="14">N</text>
            <text x="80" y="50" textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="14">E</text>
            <text x="50" y="85" textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="14">S</text>
            <text x="15" y="50" textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="14">O</text>
            <line x1="50" y1="50" x2="50" y2="15" stroke="#f59e0b" strokeWidth="2" />
            <line x1="50" y1="50" x2="85" y2="50" stroke="#555" strokeWidth="2" />
            <circle cx="50" cy="50" r="5" fill="#f59e0b" />
          </svg>
        </div>
        
        {/* Pozos */}
        <TooltipProvider>
          {wells.map((well) => {
            // Calcular posiciones relativas basadas en un grid
            const gridX = (parseInt(well.id, 36) % 5) / 5;
            const gridY = (parseInt(well.id.slice(-2), 36) % 8) / 8;
            
            return (
              <div
                key={well.id}
                className="absolute cursor-pointer transform transition-transform hover:scale-110"
                style={{
                  left: `${5 + gridX * 90}%`,
                  top: `${10 + gridY * 80}%`
                }}
                onClick={() => onSelectWell(well)}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative flex flex-col items-center">
                      <Factory
                        className={`h-8 w-8 ${getStatusTextColor(well.estado)}`}
                      />
                      <div className={`absolute -top-2 -right-2 w-3 h-3 ${getStatusColor(well.estado)} rounded-full border border-slate-800`}></div>
                      <div className="text-xs text-white font-medium mt-1">{well.nombre}</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-800 border-slate-700 text-white">
                    <div className="text-sm font-bold">{well.nombre}</div>
                    <div className="text-xs text-slate-300">Producción: {well.produccion_diaria.toFixed(0)} bbls</div>
                    <div className="text-xs text-slate-300">
                      Estado: {well.estado === 'activo' ? 'Activo' : 
                              well.estado === 'advertencia' ? 'Advertencia' : 'Fuera de servicio'}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </TooltipProvider>

        {/* Escala del mapa */}
        <div className="absolute bottom-2 left-2 bg-slate-800 bg-opacity-70 px-3 py-1 rounded text-xs text-slate-300">
          Escala: 1:50000
        </div>
        
        {/* Leyenda */}
        <div className="absolute bottom-2 right-2 bg-slate-800 bg-opacity-70 p-2 rounded">
          <div className="text-xs text-slate-300 font-medium mb-1">Leyenda</div>
          <div className="flex items-center text-xs text-slate-300 mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
            <span>Activo</span>
          </div>
          <div className="flex items-center text-xs text-slate-300 mb-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
            <span>Advertencia</span>
          </div>
          <div className="flex items-center text-xs text-slate-300">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
            <span>Fuera de servicio</span>
          </div>
        </div>
      </div>
      
      {/* Mensaje de visualización simplificada */}
      <div className="absolute top-0 left-0 right-0 text-center bg-slate-800 bg-opacity-70 py-1 text-xs text-slate-300">
        Visualización simplificada del mapa de pozos
      </div>

      {/* Si no hay pozos, mostrar mensaje */}
      {wells.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mb-2" />
          <p className="text-white text-lg">No hay pozos para mostrar</p>
        </div>
      )}
    </div>
  );
};

export default WellMap;
