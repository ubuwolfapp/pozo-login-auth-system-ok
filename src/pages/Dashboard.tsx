
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wellService, type Well } from '@/services/wellService';
import { simulationService } from '@/services/simulationService';
import WellList from '@/components/wells/WellList';
import WellMapLeaflet from '@/components/wells/WellMapLeaflet';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import NavigationBar from '@/components/NavigationBar';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

/**
 * Tipos para pozos_mapa
 */
type PozoMapa = {
  id: string;
  nombre: string;
  centro_latitud: number;
  centro_longitud: number;
  zoom_inicial: number;
};

const Dashboard = () => {
  const [wells, setWells] = useState<Well[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapConfig, setMapConfig] = useState<{ center: [number, number]; zoom: number } | null>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Simulación de valores antes de cargar
        await simulationService.simulateAllWells();

        // 1. Obtener ID del pozo_mapa asignado al usuario
        const { data: usuarioInfo, error: usuarioError } = await supabase
          .from('usuarios')
          .select('id, pozos_mapa_id')
          .eq('email', user?.email)
          .maybeSingle();
        
        if (usuarioError || !usuarioInfo) {
          throw new Error("No se pudo obtener el usuario o el mapa asignado.");
        }

        const mapaId = usuarioInfo.pozos_mapa_id;
        if (!mapaId) throw new Error("No tienes un mapa asignado.");

        // 2. Traer la configuración del mapa
        const { data: mapa, error: mapaError } = await supabase
          .from('pozos_mapa')
          .select('*')
          .eq('id', mapaId)
          .maybeSingle();

        if (mapaError || !mapa) throw new Error("No se encontró la configuración del pozo mapa.");

        setMapConfig({
          center: [mapa.centro_latitud, mapa.centro_longitud],
          zoom: mapa.zoom_inicial,
        });

        // 3. Obtener los pozos asignados al mapa
        const { data: pozosRelacion, error: pozosRelacionError } = await supabase
          .from('pozos_mapas_relacion')
          .select('pozo_id')
          .eq('pozos_mapa_id', mapaId);

        if (pozosRelacionError) throw new Error("No se pudieron obtener los pozos asignados a este mapa.");

        const pozoIds = pozosRelacion.map((rel: any) => rel.pozo_id);

        // 4. Traer los datos completos de esos pozos
        let pozos: Well[] = [];
        if (pozoIds.length > 0) {
          const { data: pozosData, error: pozosError } = await supabase
            .from('pozos')
            .select(`
              *,
              alertas(*),
              tareas(*),
              camaras_pozos(*),
              fotos_pozos(*),
              presion_historial(*)
            `)
            .in('id', pozoIds);

          if (pozosError) throw new Error("No se pudieron obtener los datos de los pozos.");
          pozos = pozosData || [];
        }

        setWells(pozos);
      } catch (error: any) {
        console.error('Error initializing data:', error);
        toast({
          title: "Error",
          description: error.message ?? "No se pudieron cargar los datos",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [user]);

  const handleSelectWell = (well: Well) => {
    navigate(`/wells/${well.id}`);
  };

  const handleGenerateReport = () => {
    navigate('/reports');
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading || !mapConfig) {
    return <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
    </div>;
  }

  return <div className="min-h-screen bg-slate-900 text-white pb-20">
    <div className="bg-slate-800 border-b border-slate-700 px-4 fixed top-0 left-0 right-0 z-10 py-[20px] rounded-none">
      <div className="container mx-auto flex items-center justify-between">
        <h2 className="text-sm font-medium">
          Bienvenido, {user?.email}
        </h2>
        <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 text-orange-500">
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>

    <div className="container mx-auto px-4 py-6 mt-16">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Monitoreo de Pozos</h1>
        <Button onClick={handleGenerateReport} className="bg-pozo-orange hover:bg-opacity-90">
          Generar Reporte
        </Button>
      </header>

      <WellMapLeaflet 
        wells={wells}
        onSelectWell={handleSelectWell}
        initialCenter={mapConfig.center}
        initialZoom={mapConfig.zoom}
      />

      <div className="mt-6">
        <WellList wells={wells} onSelectWell={handleSelectWell} />
      </div>
    </div>

    <NavigationBar />
  </div>;
};

export default Dashboard;
