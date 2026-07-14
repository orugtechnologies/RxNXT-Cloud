import React from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <div className="group relative inline-flex items-center ml-2 align-middle">
      <HelpCircle className="w-4 h-4 text-slate-400 hover:text-clinic-blue transition-colors cursor-help" />
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-64 p-3 bg-slate-800 text-white text-xs font-normal rounded-lg shadow-xl z-50 pointer-events-none text-left leading-relaxed font-sans">
        {text}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-slate-800"></div>
      </div>
    </div>
  );
}
