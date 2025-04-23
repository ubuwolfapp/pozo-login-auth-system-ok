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

// Definimos una posición predeterminada para usar cuando no hay mapa asignado
const DEFAULT_MAP_CONFIG = {
  center: [19.4326, -99.1332] as [number, number],
  zoom: 6
};
const Dashboard = () => {
  const [wells, setWells] = useState<Well[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapConfig, setMapConfig] = useState(DEFAULT_MAP_CONFIG);
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useAuth();
  useEffect(() => {
    const initializeData = async () => {
      try {
        await simulationService.simulateAllWells();
        const {
          data: usuarioInfo,
          error: usuarioError
        } = await supabase.from('usuarios').select('id, pozos_mapa_id').eq('email', user?.email).maybeSingle();
        if (usuarioError || !usuarioInfo) {
          console.warn("No se pudo obtener el usuario, mostrando todos los pozos disponibles");
          const {
            data: allWells
          } = await supabase.from('pozos').select(`
            *,
            alertas(*),
            tareas(*),
            camaras_pozos(*),
            fotos_pozos(*),
            presion_historial(*)
          `);
          setWells(allWells || []);
          setLoading(false);
          return;
        }
        const mapaId = usuarioInfo.pozos_mapa_id;
        if (!mapaId) {
          console.warn("Usuario sin mapa asignado, mostrando todos los pozos disponibles");
          toast({
            title: "Información",
            description: "No tienes un mapa específico asignado. Mostrando vista general.",
            variant: "default"
          });
          const {
            data: allWells
          } = await supabase.from('pozos').select(`
            *,
            alertas(*),
            tareas(*),
            camaras_pozos(*),
            fotos_pozos(*),
            presion_historial(*)
          `);
          setWells(allWells || []);
          setLoading(false);
          return;
        }
        const {
          data: mapa,
          error: mapaError
        } = await supabase.from('pozos_mapa').select('*').eq('id', mapaId).maybeSingle();
        if (mapaError) {
          console.error("Error al obtener configuración del mapa:", mapaError);
          toast({
            title: "Error",
            description: "Error al cargar la configuración del mapa",
            variant: "destructive"
          });
          setLoading(false);
        } else if (mapa) {
          // Ensure proper type conversion for map coordinates
          const centerLat = Number(mapa.centro_latitud);
          const centerLon = Number(mapa.centro_longitud);
          const zoomLevel = Number(mapa.zoom_inicial);
          if (!isNaN(centerLat) && !isNaN(centerLon) && !isNaN(zoomLevel)) {
            setMapConfig({
              center: [centerLat, centerLon],
              zoom: zoomLevel
            });
          }
          const {
            data: pozosRelacion
          } = await supabase.from('pozos_mapas_relacion').select('pozo_id').eq('pozos_mapa_id', mapaId);
          const pozoIds = (pozosRelacion || []).map((rel: any) => rel.pozo_id);
          if (pozoIds.length > 0) {
            const {
              data: pozosData
            } = await supabase.from('pozos').select(`
                *,
                alertas(*),
                tareas(*),
                camaras_pozos(*),
                fotos_pozos(*),
                presion_historial(*)
              `).in('id', pozoIds);
            setWells(pozosData || []);
          }
        }
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
  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
    </div>;
  }
  return <div className="min-h-screen bg-slate-900 text-white pb-20">
    <div className="bg-slate-800 border-b border-slate-700 px-4 fixed top-0 left-0 right-0 z-10 py-[20px] rounded-none">
      <div className="container flex items-center justify-between mx-[35px]">
        <h2 className="text-sm font-medium mx-0 text-justify">
          Bienvenido, {user?.email}
        </h2>
        <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 text-orange-500 mx-0 px-[20px] my-0 py-0">
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

      <WellMapLeaflet wells={wells} onSelectWell={handleSelectWell} initialCenter={mapConfig.center} initialZoom={mapConfig.zoom} />

      <div className="mt-6">
        <WellList wells={wells} onSelectWell={handleSelectWell} />
      </div>
    </div>

    <NavigationBar />
  </div>;
};
export default Dashboard;