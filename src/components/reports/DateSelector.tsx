
import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DateSelectorProps {
  startDate: Date;
  endDate: Date;
  onStartDateSelect?: (date: Date | undefined) => void;
  onEndDateSelect: (date: Date | undefined) => void;
}

const DateSelector = ({ startDate, endDate, onStartDateSelect, onEndDateSelect }: DateSelectorProps) => {
  const formattedStartDate = format(startDate, "dd/MM/yyyy");
  const formattedEndDate = format(endDate, "dd/MM/yyyy");

  return (
    <div className="bg-[#2A3441] p-4 rounded-lg flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span>{formattedStartDate} - {formattedEndDate}</span>
        
        {onStartDateSelect && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-1 text-xs bg-blue-600 rounded-md text-white">
                Inicio
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0 bg-slate-800 border-slate-700">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={onStartDateSelect}
                className="bg-slate-800 border-slate-700 text-white pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        )}
        
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-1 text-xs bg-cyan-600 rounded-md text-white">
              Fin
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0 bg-slate-800 border-slate-700">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={onEndDateSelect}
              className="bg-slate-800 border-slate-700 text-white pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <CalendarIcon className="h-6 w-6 text-cyan-400" />
    </div>
  );
};

export default DateSelector;
