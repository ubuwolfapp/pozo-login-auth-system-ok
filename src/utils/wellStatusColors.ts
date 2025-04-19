
export const getStatusColor = (estado: string): string => {
  switch (estado) {
    case 'activo':
      return '#10B981';
    case 'advertencia':
      return '#F59E0B';
    case 'fuera_de_servicio':
      return '#EF4444';
    default:
      return '#888888';
  }
};

export const getStatusTextColor = (estado: string): string => {
  switch (estado) {
    case 'activo':
      return 'text-green-500';
    case 'advertencia':
      return 'text-yellow-500';
    case 'fuera_de_servicio':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};
