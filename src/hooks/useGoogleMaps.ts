
import { useState, useEffect } from 'react';

// Hook para manejar el estado de carga del mapa
export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate a loaded state
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return { isLoaded, error };
};
