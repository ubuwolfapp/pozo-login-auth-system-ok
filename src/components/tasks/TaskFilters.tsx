
import React from "react";

interface TaskFiltersProps {
  estados: string[];
  pozos: string[];
  selectedEstado: string;
  selectedPozo: string;
  selectedFecha: string;
  onEstadoChange: (estado: string) => void;
  onPozoChange: (pozo: string) => void;
  onFechaChange: (fecha: string) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  estados,
  pozos,
  selectedEstado,
  selectedPozo,
  selectedFecha,
  onEstadoChange,
  onPozoChange,
  onFechaChange,
}) => {
  return (
    <div className="mb-6 flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-xs mb-1 text-white">Estado</label>
        <select
          className="bg-slate-800 border border-slate-500 rounded px-2 py-1 text-white"
          value={selectedEstado}
          onChange={(e) => onEstadoChange(e.target.value)}
        >
          <option value="">Todos</option>
          {estados.map((estado) => (
            <option value={estado} key={estado}>{estado}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs mb-1 text-white">Pozo</label>
        <select
          className="bg-slate-800 border border-slate-500 rounded px-2 py-1 text-white"
          value={selectedPozo}
          onChange={(e) => onPozoChange(e.target.value)}
        >
          <option value="">Todos</option>
          {pozos.map((pozo) => (
            <option value={pozo} key={pozo}>{pozo}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs mb-1 text-white">Fecha límite</label>
        <input
          type="date"
          className="bg-slate-800 border border-slate-500 rounded px-2 py-1 text-white"
          value={selectedFecha}
          onChange={(e) => onFechaChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default TaskFilters;
