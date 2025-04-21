
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PressureChart from '@/components/PressureChart';
import AlertList from '@/components/alerts/AlertList';
import AlertFilters from '@/components/alerts/AlertFilters';
import AlertsNavigation from '@/components/alerts/AlertsNavigation';
import AlertActions from '@/components/alerts/AlertActions';
import { AlertType } from '@/types/alerts';
import { wellService } from '@/services/wellService';
import { useAlerts } from '@/hooks/useAlerts';

const Alerts = () => {
  const [activeFilter, setActiveFilter] = useState<AlertType>('todas');
  const [selectedWellId, setSelectedWellId] = useState<string | null>(null);

  // Cargar lista de pozos
  const { data: wells } = useQuery({
    queryKey: ['wells'],
    queryFn: wellService.getWells
  });

  // Usar nuestro hook personalizado para manejar alertas
  const {
    alerts,
    isLoading,
    pressureData,
    handleAlertResolved,
    handleResolveAllAlerts,
    handleAlertDeleted,
    handleDeleteAllAlerts
  } = useAlerts(activeFilter, selectedWellId);

  return (
    <div className="min-h-screen bg-[#1C2526] text-white font-sans">
      <AlertsNavigation />

      <AlertActions
        alerts={alerts}
        onResolveAll={handleResolveAllAlerts}
        onDeleteAll={handleDeleteAllAlerts}
      />

      <div className="container mx-auto px-0">
        <AlertFilters 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          selectedWellId={selectedWellId}
          onWellChange={setSelectedWellId}
          wells={wells || []}
        />
        
        <div className="mx-4 mb-6 bg-[#1C2526] rounded-lg p-4 border border-gray-700">
          <PressureChart data={pressureData || []} />
        </div>
        
        <div className="px-4 pb-24">
          <AlertList 
            alerts={alerts}
            isLoading={isLoading}
            onAlertResolved={handleAlertResolved}
            onAlertDeleted={handleAlertDeleted}
          />
        </div>
      </div>
    </div>
  );
};

export default Alerts;
