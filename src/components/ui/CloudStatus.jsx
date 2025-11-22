import React from "react";
import { Loader2, Cloud } from "lucide-react";

const CloudStatus = ({ isSaving }) => (
  <div className="flex items-center gap-2 px-3 py-1 bg-white border border-stone-300 shadow-sm transition-all duration-300">
    {isSaving ? (
      <>
        <Loader2 size={14} className="animate-spin text-amber-600" />
        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
          Guardando...
        </span>
      </>
    ) : (
      <>
        <Cloud size={14} className="text-green-600" />
        <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">
          En línea
        </span>
      </>
    )}
  </div>
);

export default CloudStatus;
