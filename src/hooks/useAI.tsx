
import { useQuery } from "@tanstack/react-query";
import { settingsService, UserSettings } from "@/services/settingsService";
import { useLanguage } from "@/contexts/LanguageContext";

export const useAI = () => {
  const { language } = useLanguage();
  
  // Obtener la configuración de IA
  const { data: settings } = useQuery<UserSettings | null>({
    queryKey: ['userSettings'],
    queryFn: settingsService.getUserSettings
  });

  const isAIEnabled = settings?.openai_activo || false;

  // Función para generar una respuesta de IA
  const generateAIResponse = async (prompt: string) => {
    if (!isAIEnabled) {
      const errorMessage = language === 'es' 
        ? "La funcionalidad de IA está desactivada en la configuración."
        : "AI functionality is disabled in settings.";
      
      throw new Error(errorMessage);
    }

    try {
      // Aquí iría la lógica para conectar con OpenAI u otro servicio de IA
      // Por ahora, devolvemos una respuesta simulada
      return {
        text: language === 'es'
          ? `Respuesta simulada de IA para: ${prompt}`
          : `Simulated AI response for: ${prompt}`
      };
    } catch (error) {
      console.error("Error generating AI response:", error);
      throw error;
    }
  };

  return {
    isAIEnabled,
    generateAIResponse
  };
};
