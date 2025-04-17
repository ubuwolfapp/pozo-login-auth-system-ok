
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Activity, AlertTriangle, XCircle } from "lucide-react";

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
        return null;
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <h3 className="text-lg font-medium text-white">{nombre}</h3>
          </div>
          <span className="text-pozo-orange font-semibold">
            {produccion_diaria} bbl/día
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WellCard;
