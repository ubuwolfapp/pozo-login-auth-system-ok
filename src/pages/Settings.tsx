import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService, UserSettings } from '@/services/settingsService';
import { wellService } from '@/services/wellService';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationBar from '@/components/NavigationBar';
import { ArrowLeft, Bell, Globe, Mail, MessageSquare, CircleAlert, Thermometer, Droplet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [selectedWellId, setSelectedWellId] = useState<string | null>(null);

  // Consultas para obtener configuraciones y pozos
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: settingsService.getUserSettings
  });

  const { data: wells, isLoading: isLoadingWells } = useQuery({
    queryKey: ['wells'],
    queryFn: wellService.getWells
  });

  const { data: wellUmbrales, isLoading: isLoadingUmbrales } = useQuery({
    queryKey: ['wellUmbrales', selectedWellId],
    queryFn: () => selectedWellId ? settingsService.getWellUmbral(selectedWellId) : null,
    enabled: !!selectedWellId
  });

  // Estado local para formularios
  const [localSettings, setLocalSettings] = useState<UserSettings | null>(null);
  const [localWellUmbrales, setLocalWellUmbrales] = useState<any>(null);

  // Inicializar estados locales cuando se cargan los datos
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        ...settings,
        umbral_temperatura: settings.umbral_temperatura ?? 85,
        umbral_flujo: settings.umbral_flujo ?? 600,
        simulacion_activa: settings.simulacion_activa ?? true,
      });
    }
  }, [settings]);

  useEffect(() => {
    if (wellUmbrales) {
      setLocalWellUmbrales({
        umbral_presion: wellUmbrales.umbral_presion ?? 8000,
        umbral_temperatura: wellUmbrales.umbral_temperatura ?? 85,
        umbral_flujo: wellUmbrales.umbral_flujo ?? 600,
        ...wellUmbrales
      });
    } else if (selectedWellId && settings) {
      setLocalWellUmbrales({
        pozo_id: selectedWellId,
        umbral_presion: settings.umbral_presion ?? 8000,
        umbral_temperatura: settings.umbral_temperatura ?? 85,
        umbral_flujo: settings.umbral_flujo ?? 600
      });
    }
  }, [wellUmbrales, selectedWellId, settings]);

  // Mutaciones para actualizar
  const updateSettingsMutation = useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
  });

  const updateWellUmbralMutation = useMutation({
    mutationFn: (data: { pozoId: string, umbrales: any }) =>
      settingsService.updateWellUmbral(data.pozoId, data.umbrales),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellUmbrales'] });
    },
  });

  // Manejadores para cambios en configuración general
  const handleSwitchChange = (field: keyof UserSettings) => {
    if (!localSettings) return;
    setLocalSettings(prev => prev ? { ...prev, [field]: !prev[field] } : prev);
  };

  const handleThresholdChange = (field: keyof UserSettings, value: string) => {
    if (!localSettings) return;
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    setLocalSettings(prev => prev ? { ...prev, [field]: numValue } : prev);
  };

  // Manejadores para cambios en umbrales de pozo individuales
  const handleWellThresholdChange = (field: string, value: string) => {
    if (!localWellUmbrales) return;
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    setLocalWellUmbrales(prev => ({ ...prev, [field]: numValue }));
  };

  // Guardar cambios
  const handleSaveGeneralChanges = () => {
    if (!localSettings) return;
    updateSettingsMutation.mutate({
      notificaciones_activas: localSettings.notificaciones_activas,
      push_activo: localSettings.push_activo,
      correo_activo: localSettings.correo_activo,
      sms_activo: localSettings.sms_activo,
      umbral_presion: localSettings.umbral_presion,
      umbral_temperatura: localSettings.umbral_temperatura,
      umbral_flujo: localSettings.umbral_flujo,
      simulacion_activa: localSettings.simulacion_activa,
      idioma: localSettings.idioma
    });
  };

  const handleSaveWellUmbrales = () => {
    if (!localWellUmbrales || !selectedWellId) return;
    updateWellUmbralMutation.mutate({
      pozoId: selectedWellId,
      umbrales: {
        umbral_presion: localWellUmbrales.umbral_presion,
        umbral_temperatura: localWellUmbrales.umbral_temperatura,
        umbral_flujo: localWellUmbrales.umbral_flujo
      }
    });
  };

  if (isLoadingSettings || isLoadingWells || !localSettings) {
    return <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="container mx-auto px-4 py-6">
        <header className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Configuración</h1>
        </header>

        <Tabs
          defaultValue="general"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="pozos">Pozos</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            {/* Notificaciones Section */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <span>Notificaciones</span>
                </div>
                <Switch
                  checked={localSettings.notificaciones_activas}
                  onCheckedChange={() => handleSwitchChange('notificaciones_activas')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <span>Push</span>
                </div>
                <Switch
                  checked={localSettings.push_activo}
                  onCheckedChange={() => handleSwitchChange('push_activo')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span>Correo</span>
                </div>
                <Switch
                  checked={localSettings.correo_activo}
                  onCheckedChange={() => handleSwitchChange('correo_activo')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                  <span>SMS</span>
                </div>
                <Switch
                  checked={localSettings.sms_activo}
                  onCheckedChange={() => handleSwitchChange('sms_activo')}
                />
              </div>
            </div>

            {/* Simulación de valores */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">Simulación de valores</span>
                </div>
                <Switch
                  checked={localSettings.simulacion_activa}
                  onCheckedChange={() => handleSwitchChange('simulacion_activa')}
                />
              </div>
              <span className="text-xs text-gray-400">Si está desactivado, no se generarán valores aleatorios de presión, temperatura ni flujo para los pozos.</span>
            </div>

            {/* Umbrales de Alerta Generales */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-4">
              <h2 className="flex items-center gap-2 mb-4">
                <CircleAlert className="h-5 w-5 text-gray-400" />
                Umbrales de Alerta Predeterminados
              </h2>

              <div className="flex items-center justify-between">
                <span className="text-orange-500 flex items-center gap-2">
                  <CircleAlert className="h-4 w-4" />
                  Presión
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={localSettings.umbral_presion || 8000}
                    onChange={(e) => handleThresholdChange('umbral_presion', e.target.value)}
                    className="w-24 bg-slate-700 border-slate-600"
                  />
                  <span className="text-gray-400">psi</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-red-500 flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Temperatura
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={localSettings.umbral_temperatura || 85}
                    onChange={(e) => handleThresholdChange('umbral_temperatura', e.target.value)}
                    className="w-24 bg-slate-700 border-slate-600"
                  />
                  <span className="text-gray-400">°C</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-cyan-500 flex items-center gap-2">
                  <Droplet className="h-4 w-4" />
                  Flujo
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={localSettings.umbral_flujo || 600}
                    onChange={(e) => handleThresholdChange('umbral_flujo', e.target.value)}
                    className="w-24 bg-slate-700 border-slate-600"
                  />
                  <span className="text-gray-400">m³/h</span>
                </div>
              </div>
            </div>

            {/* Idioma Section */}
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <span>Idioma</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Español</span>
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </div>
              </div>
            </div>
            
            {/* Guardar cambios */}
            <div className="mt-6">
              <Button
                onClick={handleSaveGeneralChanges}
                disabled={updateSettingsMutation.isPending}
                className="relative bg-pozo-orange hover:bg-opacity-90"
              >
                {updateSettingsMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Guardar Cambios
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pozos" className="space-y-4">
            {/* Selección de Pozo */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-300">Seleccionar Pozo</label>
                <Select
                  value={selectedWellId || ''}
                  onValueChange={(value) => setSelectedWellId(value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue placeholder="Seleccione un pozo" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {wells?.map((well) => (
                      <SelectItem key={well.id} value={well.id} className="text-white">
                        {well.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedWellId && localWellUmbrales && (
              <>
                {/* Umbrales de Alerta por Pozo */}
                <div className="bg-slate-800 rounded-lg p-4 space-y-4">
                  <h2 className="flex items-center gap-2 mb-4">
                    <CircleAlert className="h-5 w-5 text-gray-400" />
                    Umbrales de Alerta para {wells?.find(w => w.id === selectedWellId)?.nombre}
                  </h2>

                  <div className="flex items-center justify-between">
                    <span className="text-orange-500 flex items-center gap-2">
                      <CircleAlert className="h-4 w-4" />
                      Presión
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={localWellUmbrales.umbral_presion || 8000}
                        onChange={(e) => handleWellThresholdChange('umbral_presion', e.target.value)}
                        className="w-24 bg-slate-700 border-slate-600"
                      />
                      <span className="text-gray-400">psi</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-red-500 flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Temperatura
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={localWellUmbrales.umbral_temperatura || 85}
                        onChange={(e) => handleWellThresholdChange('umbral_temperatura', e.target.value)}
                        className="w-24 bg-slate-700 border-slate-600"
                      />
                      <span className="text-gray-400">°C</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-cyan-500 flex items-center gap-2">
                      <Droplet className="h-4 w-4" />
                      Flujo
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={localWellUmbrales.umbral_flujo || 600}
                        onChange={(e) => handleWellThresholdChange('umbral_flujo', e.target.value)}
                        className="w-24 bg-slate-700 border-slate-600"
                      />
                      <span className="text-gray-400">m³/h</span>
                    </div>
                  </div>
                </div>

                {/* Guardar cambios de pozo */}
                <div className="mt-6">
                  <Button
                    onClick={handleSaveWellUmbrales}
                    disabled={updateWellUmbralMutation.isPending}
                    className="relative"
                  >
                    {updateWellUmbralMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Guardar Cambios
                  </Button>
                </div>
              </>
            )}

            {selectedWellId && isLoadingUmbrales && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
              </div>
            )}

            {!selectedWellId && (
              <div className="bg-slate-800 rounded-lg p-4 text-center text-gray-400">
                Seleccione un pozo para configurar sus umbrales
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <NavigationBar />
    </div>
  );
};

export default Settings;
