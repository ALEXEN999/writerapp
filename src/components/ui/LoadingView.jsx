import React from "react";
import { Loader2 } from "lucide-react";

const LoadingView = ({ text = "Cargando..." }) => (
  <div className="flex flex-col items-center justify-center h-64 text-stone-400 animate-in fade-in">
    <Loader2 className="animate-spin mb-2" size={24} />
    <span className="font-serif text-sm uppercase tracking-widest">
      {text}
    </span>
  </div>
);

export default LoadingView;
