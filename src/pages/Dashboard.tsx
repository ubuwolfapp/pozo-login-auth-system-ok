import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wellService, type Well } from '@/services/wellService';
import { simulationService } from '@/services/simulationService';
import WellList from '@/components/wells/WellList';
import WellMap from '@/components/wells/WellMap';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import NavigationBar from '@/components/NavigationBar';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

const Dashboard = () => {
  const [wells, setWells] = useState<Well[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useAuth();

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log("Iniciando carga de datos en Dashboard");
        const data = await wellService.getWells();
        console.log(`Se encontraron ${data.length} pozos para el usuario`);
        
        if (data && data.length > 0) {
          // Solo simulamos los pozos que están asignados al usuario actual
          console.log("Simulando valores para los pozos del usuario");
          await simulationService.simulateUserWells();
          
          // Luego cargar los pozos con sus valores actualizados
          console.log("Recargando datos de los pozos después de simulación");
          const updatedData = await wellService.getWells();
          setWells(updatedData);
          console.log(`Datos actualizados: ${updatedData.length} pozos cargados`);
        } else {
          console.log("No se encontraron pozos para este usuario");
          setWells([]);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const loadWells = async () => {
    try {
      const data = await wellService.getWells();
      setWells(data);
    } catch (error) {
      console.error('Error loading wells:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pozos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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

      <WellMap wells={wells} onSelectWell={handleSelectWell} />

      <div className="mt-6">
        <WellList wells={wells} onSelectWell={handleSelectWell} />
      </div>
    </div>

    <NavigationBar />
  </div>;
};

export default Dashboard;
