import { useState, useEffect } from 'react';

// Renombramos pero mantenemos compatibilidad con el código existente
export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return { isLoaded, error };
};
