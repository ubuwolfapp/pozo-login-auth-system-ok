import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wellService, type Well } from '@/services/wellService';
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
    loadWells();
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
      {/* Top bar with user info and logout */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 fixed top-0 left-0 right-0 z-10">
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