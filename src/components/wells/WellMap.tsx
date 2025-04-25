
import React from 'react';
import { Well } from '@/services/wellService';
import { WellMapView } from './WellMapView';

interface WellMapProps {
  wells: Well[];
  onSelectWell: (well: Well) => void;
}

const WellMap: React.FC<WellMapProps> = ({ wells, onSelectWell }) => {
  // Initialize the text shadow style once
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .text-shadow {
        text-shadow: 0px 0px 3px #000, 0px 0px 3px #000;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return <WellMapView wells={wells} onSelectWell={onSelectWell} />;
};

export default WellMap;
