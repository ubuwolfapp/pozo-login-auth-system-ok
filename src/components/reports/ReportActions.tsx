
import React from 'react';
import { Button } from "@/components/ui/button";

interface ReportActionsProps {
  onGeneratePDF: () => void;
  onSendEmail: () => void;
}

const ReportActions = ({ onGeneratePDF, onSendEmail }: ReportActionsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 pt-2 mb-20">
      <Button 
        onClick={onGeneratePDF}
        className="bg-[#FF6200] hover:bg-[#FF6200]/80 text-white py-3"
      >
        Generar PDF
      </Button>
      <Button 
        onClick={onSendEmail}
        className="bg-[#FF6200] hover:bg-[#FF6200]/80 text-white py-3"
      >
        Enviar por Correo
      </Button>
    </div>
  );
};

export default ReportActions;
