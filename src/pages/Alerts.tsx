
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PressureChart from '@/components/PressureChart';
import AlertList from '@/components/alerts/AlertList';
import AlertFilters from '@/components/alerts/AlertFilters';
import AlertsNavigation from '@/components/alerts/AlertsNavigation';
import { Alert, AlertType } from '@/types/alerts';

const Alerts = () => {
  const [activeFilter, setActiveFilter] = useState<AlertType>('todas');
  const [selectedWellId, setSelectedWellId] = useState<string | null>(null);

  // Simulated alerts that match the design
  const simulatedAlerts: Alert[] = [
    {
      id: '1',
      tipo: 'critica',
      mensaje: 'Presión alta en Pozo #7: 8500 psi',
      created_at: '2025-04-16T14:30:00Z',
      resuelto: false,
      pozo: { 
        id: '1', 
        nombre: 'Pozo #7' 
      },
      valor: 8500,
      unidad: 'psi'
    },
    {
      id: '2',
      tipo: 'advertencia',
      mensaje: 'Temperatura moderada en Pozo 33',
      created_at: '2025-04-16T03:15:00Z',
      resuelto: false,
      pozo: { 
        id: '2', 
        nombre: 'Pozo 33' 
      }
    },
    {
      id: '3',
      tipo: 'advertencia',
      mensaje: 'Nivel bajo en Pozo 12',
      created_at: '2025-04-15T18:20:00Z',
      resuelto: false,
      pozo: { 
        id: '3', 
        nombre: 'Pozo 12' 
      }
    },
    {
      id: '4',
      tipo: 'critica',
      mensaje: 'Falla de sensor en Pozo 44',
      created_at: '2025-04-15T10:45:00Z',
      resuelto: false,
      pozo: { 
        id: '4', 
        nombre: 'Pozo 44' 
      }
    }
  ];

  const { data: alerts } = useQuery({
    queryKey: ['alerts', activeFilter, selectedWellId],
    queryFn: async () => {
      // Filter alerts based on activeFilter and selectedWellId
      let filteredAlerts = simulatedAlerts;
      
      if (selectedWellId) {
        filteredAlerts = filteredAlerts.filter(alert => alert.pozo?.id === selectedWellId);
      }

      if (activeFilter === 'critica') {
        return filteredAlerts.filter(alert => alert.tipo === 'critica');
      } else if (activeFilter === 'advertencia') {
        return filteredAlerts.filter(alert => alert.tipo === 'advertencia');
      } else if (activeFilter === 'resueltas') {
        return filteredAlerts.filter(alert => alert.resuelto);
      }
      return filteredAlerts;
    }
  });

  const { data: pressureData } = useQuery({
    queryKey: ['pressure-history'],
    queryFn: async () => {
      // Simulate 24 hours of pressure data
      const data = [];
      const now = new Date();
      for (let i = 0; i < 24; i++) {
        const date = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
        data.push({
          fecha: date.toISOString(),
          valor: 7.5 + Math.sin(i / 3) + Math.random() * 0.5
        });
      }
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-[#1C2526] text-white font-sans">
      <AlertsNavigation />
      
      <div className="container mx-auto px-0">
        <AlertFilters 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          selectedWellId={selectedWellId}
          onWellChange={setSelectedWellId}
        />
        
        <div className="mx-4 mb-6 bg-[#1C2526] rounded-lg p-4 border border-gray-700">
          <PressureChart data={pressureData || []} />
        </div>
        
        <div className="px-4 pb-24">
          <AlertList 
            alerts={alerts as Alert[] | undefined} 
            isLoading={false} 
          />
        </div>
      </div>
    </div>
  );
};

export default Alerts;
