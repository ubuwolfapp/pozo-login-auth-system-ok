
import { useState } from 'react';

export const useMapboxToken = () => {
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [storedToken, setStoredToken] = useState(() => {
    return localStorage.getItem('mapbox_token') || '';
  });

  const handleSaveToken = () => {
    if (tempToken) {
      localStorage.setItem('mapbox_token', tempToken);
      setStoredToken(tempToken);
      setShowTokenDialog(false);
      window.location.reload();
    }
  };

  const defaultToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';
  const mapboxToken = storedToken || defaultToken;

  return {
    showTokenDialog,
    setShowTokenDialog,
    tempToken,
    setTempToken,
    storedToken,
    handleSaveToken,
    mapboxToken
  };
};
