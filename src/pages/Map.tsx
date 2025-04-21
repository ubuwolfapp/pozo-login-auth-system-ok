
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { wellService, type Well } from '@/services/wellService';
import NavigationBar from '@/components/NavigationBar';
import { useOpenStreetMap } from '@/hooks/useOpenStreetMap';
import { useWellMarkers } from '@/hooks/useWellMarkers';
import MapLoading from '@/components/maps/MapLoading';
import MapError from '@/components/maps/MapError';
import MapEmptyState from '@/components/maps/MapEmptyState';
import { Button } from '@/components/ui/button';
import { LogOut, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import 'leaflet/dist/leaflet.css';

const MapPage = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const { user, signOut } = useAuth();
  
  const { mapContainer, map, mapError } = useOpenStreetMap({
    centro_latitud: 19.4326,
    centro_longitud: -99.1332,
    zoom_inicial: 5
  });

  const { data: wells = [], isLoading } = useQuery({
    queryKey: ['wells-for-map'],
    queryFn: wellService.getWells
  });

  console.log("Wells loaded:", wells.length, wells);

  // Filter wells based on active filter
  const filteredWells = wells.filter(well => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return well.estado === 'activo';
    if (activeFilter === 'warning') return well.estado === 'advertencia';
    if (activeFilter === 'offline') return well.estado === 'fuera_de_servicio';
    if (activeFilter === 'high-production') return well.produccion_diaria > 1000;
    return true;
  });

  // Handle well selection
  const handleSelectWell = (well: Well) => {
    if (!map.current) return;
    // OpenStreetMap markers handle this with popups
    console.log("Well selected:", well);
  };

  // Use the well markers hook
  useWellMarkers(map, filteredWells, handleSelectWell);

  const handleLogout = async () => {
    await signOut();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Top bar with user info and logout */}
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
          <h1 className="text-2xl font-bold">Mapa de Pozos</h1>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
                <SelectValue placeholder="Filtrar pozos" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                <SelectItem value="all">Todos los pozos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="warning">Con advertencias</SelectItem>
                <SelectItem value="offline">Fuera de servicio</SelectItem>
                <SelectItem value="high-production">Alta producción</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        <div className="relative w-full h-[70vh] rounded-lg overflow-hidden bg-slate-800 mb-6">
          <div ref={mapContainer} className="absolute inset-0" />
          
          {!map.current && <MapLoading />}
          
          {mapError && (
            <MapError 
              error={mapError} 
              onRetry={() => window.location.reload()} 
            />
          )}

          {!mapError && filteredWells && filteredWells.length === 0 && <MapEmptyState />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredWells.map(well => (
            <div 
              key={well.id}
              className="bg-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-700 transition-colors"
              onClick={() => handleSelectWell(well)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{well.nombre}</h3>
                <div className={`w-3 h-3 rounded-full ${
                  well.estado === 'activo' ? 'bg-green-500' : 
                  well.estado === 'advertencia' ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}></div>
              </div>
              <p className="text-sm text-gray-400">{well.produccion_diaria} barriles/día</p>
              <p className="text-xs text-gray-500">
                LAT: {well.latitud.toFixed(4)}, LON: {well.longitud.toFixed(4)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <NavigationBar />
    </div>
  );
};

export default MapPage;
