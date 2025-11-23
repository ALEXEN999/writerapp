import React from "react";
import { ArrowLeft, Check, Edit2 } from "lucide-react";

const FullScreenEditor = ({
  title,              // Texto centrado en el header ("Mundo", "Personaje", "Trama", etc.)
  isEditing,          // boolean
  onToggleEditing,    // función para cambiar entre Editar / Listo
  onClose,            // función al pulsar "Volver"
  children,           // contenido del editor (inputs, tarjetas, etc.)
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#fdfbf7] flex flex-col animate-in slide-in-from-bottom-10 duration-300 pb-16">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-stone-200 bg-white shadow-sm">
        <button
          onClick={onClose}
          className="text-stone-500 hover:text-stone-800 flex items-center gap-2 font-bold text-xs uppercase tracking-wider"
        >
          <ArrowLeft size={18} /> Volver
        </button>

        {title && (
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 text-center">
            {title}
          </h2>
        )}

        {onToggleEditing ? (
          <button
            onClick={onToggleEditing}
            className="text-amber-600 flex items-center gap-2 font-bold text-xs uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200 shadow-sm"
          >
            {isEditing ? <Check size={16} /> : <Edit2 size={14} />}
            {isEditing ? "Listo" : "Editar"}
          </button>
        ) : (
          <div className="w-[88px]" /> // espacio para no descuadrar
        )}
      </div>

      {/* CONTENIDO SCROLLEABLE */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-6 max-w-3xl mx-auto w-full">
        {children}
      </div>
    </div>
  );
};

export default FullScreenEditor;
