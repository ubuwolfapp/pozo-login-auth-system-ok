
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/types/alerts';

interface AlertActionsProps {
  alerts: Alert[] | undefined;
  onResolveAll: () => void;
  onDeleteAll: () => void;
}

const AlertActions = ({ alerts, onResolveAll, onDeleteAll }: AlertActionsProps) => {
  const hasUnresolvedAlerts = alerts?.some(a => !a.resuelto) ?? false;
  const hasAlerts = alerts && alerts.length > 0;

  return (
    <div className="container mx-auto flex justify-end gap-2 px-4 pt-4">
      <Button
        className="bg-pozo-orange text-white rounded px-4 py-2 font-semibold shadow hover:bg-orange-500 transition"
        onClick={onResolveAll}
        disabled={!hasUnresolvedAlerts}
      >
        Resolver todas
      </Button>
      <Button
        className="bg-red-600 text-white rounded px-4 py-2 font-semibold shadow hover:bg-red-700 transition"
        onClick={onDeleteAll}
        disabled={!hasAlerts}
      >
        Borrar todas
      </Button>
    </div>
  );
};

export default AlertActions;
