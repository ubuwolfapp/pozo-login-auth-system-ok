
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Activity, AlertTriangle, XCircle, Droplet, Thermometer, Gauge } from "lucide-react";

interface WellCardProps {
  nombre: string;
  produccion_diaria: number;
  estado: string;
}

const WellCard: React.FC<WellCardProps> = ({ nombre, produccion_diaria, estado }) => {
  const getStatusIcon = () => {
    switch (estado) {
      case 'activo':
        return <Activity className="h-5 w-5 text-green-500" />;
      case 'advertencia':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'fuera_de_servicio':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (estado) {
      case 'activo':
        return "border-l-green-500";
      case 'advertencia':
        return "border-l-yellow-500";
      case 'fuera_de_servicio':
        return "border-l-red-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <Card className={`bg-[#2E3A59] border-none rounded-lg border-l-4 ${getStatusColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon()}
              <h3 className="text-lg font-medium text-white">{nombre}</h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Droplet className="h-4 w-4" />
                <span>Flujo</span>
              </div>
              <div className="flex items-center gap-1">
                <Gauge className="h-4 w-4" />
                <span>Presión</span>
              </div>
              <div className="flex items-center gap-1">
                <Thermometer className="h-4 w-4" />
                <span>Temp</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[#FF6200] font-semibold">
              {produccion_diaria} bbl/día
            </span>
            <div className="text-xs text-gray-400 mt-1">
              {estado === 'activo' ? 'En operación' : 
               estado === 'advertencia' ? 'Requiere atención' : 
               'Fuera de servicio'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WellCard;
