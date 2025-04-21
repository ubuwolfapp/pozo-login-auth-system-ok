
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService, UserSettings } from '@/services/settingsService';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NavigationBar from '@/components/NavigationBar';
import { ArrowLeft, Bell, Globe, Mail, MessageSquare, CircleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['userSettings'],
    queryFn: settingsService.getUserSettings
  });

  // Local state for form values
  const [localSettings, setLocalSettings] = useState<UserSettings | null>(null);

  // When data loads, initialize local state
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
  });

  // Handlers update local state only
  const handleSwitchChange = (field: keyof UserSettings) => {
    if (!localSettings) return;
    setLocalSettings(prev => prev ? { ...prev, [field]: !prev[field] } : prev);
  };

  const handlePressureThresholdChange = (value: string) => {
    if (!localSettings) return;
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    setLocalSettings(prev => prev ? { ...prev, umbral_presion: numValue } : prev);
  };

  // Save button handler
  const handleSaveChanges = () => {
    if (!localSettings) return;
    updateSettingsMutation.mutate({
      notificaciones_activas: localSettings.notificaciones_activas,
      push_activo: localSettings.push_activo,
      correo_activo: localSettings.correo_activo,
      sms_activo: localSettings.sms_activo,
      umbral_presion: localSettings.umbral_presion,
      idioma: localSettings.idioma
    });
  };

  if (isLoading || !localSettings) {
    return <div className="min-h-screen bg-slate-900 text-white p-6">Cargando...</div>;
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

        <div className="space-y-6">
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

          {/* Umbrales de Alerta Section */}
          <div className="bg-slate-800 rounded-lg p-4 space-y-4">
            <h2 className="flex items-center gap-2 mb-4">
              <CircleAlert className="h-5 w-5 text-gray-400" />
              Umbrales de Alerta
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-orange-500">Presión</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={localSettings.umbral_presion || 8000}
                  onChange={(e) => handlePressureThresholdChange(e.target.value)}
                  className="w-24 bg-slate-700 border-slate-600"
                />
                <span className="text-gray-400">psi</span>
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
              onClick={handleSaveChanges} 
              disabled={updateSettingsMutation.isPending}
              className="relative"
            >
              {updateSettingsMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
      <NavigationBar />
    </div>
  );
};

export default Settings;
