
import { useState, useEffect } from 'react';

// Hook para manejar el estado de carga del mapa
export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return { isLoaded, error };
};
