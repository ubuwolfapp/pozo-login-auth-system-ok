
import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '@/services/settingsService';

type Language = 'es' | 'en';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Record<string, string>;
};

const defaultTranslations: Record<string, Record<string, string>> = {
  es: {
    // Dashboard
    dashboard: "Panel de Control",
    wellStatus: "Estado de Pozos",
    alerts: "Alertas",
    tasks: "Tareas",
    production: "Producción",
    viewAll: "Ver todo",
    
    // Navigation
    home: "Inicio",
    reports: "Reportes",
    map: "Mapa",
    cameras: "Cámaras",
    settings: "Configuración",
    
    // Settings
    general: "General",
    wells: "Pozos",
    ai: "Tecnología IA",
    notifications: "Notificaciones",
    push: "Push",
    email: "Correo",
    sms: "SMS",
    language: "Idioma",
    spanish: "Español",
    english: "Inglés",
    simulationValues: "Simulación de valores",
    simulationDescription: "Si está desactivado, no se generarán valores aleatorios de presión, temperatura ni flujo para los pozos.",
    defaultAlertThresholds: "Umbrales de Alerta Predeterminados",
    pressure: "Presión",
    temperature: "Temperatura",
    flow: "Flujo",
    selectWell: "Seleccionar Pozo",
    wellThresholds: "Umbrales del Pozo",
    saveChanges: "Guardar Cambios",
    aiSettings: "Configuración de IA",
    aiFeatures: "Funciones de IA",
    aiDescription: "Activar o desactivar funciones de IA en la aplicación",
    
    // Common
    search: "Buscar",
    filter: "Filtrar",
    status: "Estado",
    active: "Activo",
    inactive: "Inactivo",
    warning: "Advertencia",
    critical: "Crítico",
    normal: "Normal",
    loading: "Cargando",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    view: "Ver",
    details: "Detalles",
    noData: "No hay datos disponibles",
    close: "Cerrar"
  },
  en: {
    // Dashboard
    dashboard: "Dashboard",
    wellStatus: "Well Status",
    alerts: "Alerts",
    tasks: "Tasks",
    production: "Production",
    viewAll: "View all",
    
    // Navigation
    home: "Home",
    reports: "Reports",
    map: "Map",
    cameras: "Cameras",
    settings: "Settings",
    
    // Settings
    general: "General",
    wells: "Wells",
    ai: "AI Technology",
    notifications: "Notifications",
    push: "Push",
    email: "Email",
    sms: "SMS",
    language: "Language",
    spanish: "Spanish",
    english: "English",
    simulationValues: "Value Simulation",
    simulationDescription: "If disabled, random pressure, temperature, and flow values will not be generated for wells.",
    defaultAlertThresholds: "Default Alert Thresholds",
    pressure: "Pressure",
    temperature: "Temperature",
    flow: "Flow",
    selectWell: "Select Well",
    wellThresholds: "Well Thresholds",
    saveChanges: "Save Changes",
    aiSettings: "AI Settings",
    aiFeatures: "AI Features",
    aiDescription: "Enable or disable AI features in the application",
    
    // Common
    search: "Search",
    filter: "Filter",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    warning: "Warning",
    critical: "Critical",
    normal: "Normal",
    loading: "Loading",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    view: "View",
    details: "Details",
    noData: "No data available",
    close: "Close"
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  setLanguage: () => {},
  translations: defaultTranslations.es,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('es');
  const [translations, setTranslations] = useState(defaultTranslations.es);

  useEffect(() => {
    // Cargar el idioma guardado en configuración cuando se inicializa
    const loadSavedLanguage = async () => {
      try {
        const settings = await settingsService.getUserSettings();
        if (settings?.idioma) {
          const lang = settings.idioma === 'español' ? 'es' : 
                      settings.idioma === 'english' ? 'en' : 'es';
          setLanguageState(lang as Language);
          setTranslations(defaultTranslations[lang as Language]);
        }
      } catch (error) {
        console.error("Error loading language settings:", error);
      }
    };

    loadSavedLanguage();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setTranslations(defaultTranslations[lang]);
    
    // Actualizar el idioma en la configuración del usuario
    settingsService.updateSettings({
      idioma: lang === 'es' ? 'español' : 'english'
    });
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};
