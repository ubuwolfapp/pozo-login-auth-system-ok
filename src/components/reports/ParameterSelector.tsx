
import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ParameterSelectorProps {
  onSelect: (parameter: string) => void;
  selectedParameter?: string;
}

const ParameterSelector = ({ onSelect, selectedParameter }: ParameterSelectorProps) => {
  return (
    <div className="bg-[#2A3441] p-4 rounded-lg space-y-2">
      <span className="block mb-2">Parámetros</span>
      <Select value={selectedParameter} onValueChange={onSelect}>
        <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
          <SelectValue placeholder="Seleccionar parámetro" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700 text-white">
          <SelectGroup>
            <SelectItem value="produccion">Producción</SelectItem>
            <SelectItem value="presion">Presión</SelectItem>
            <SelectItem value="dato3">Dato 3</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ParameterSelector;
