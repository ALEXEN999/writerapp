import React from "react";
import { Crown, Shield } from "lucide-react";

const CharacterCard = ({ char, onClick }) => {
  if (!char) return null; // ULTRA SAFE GUARD

  const getBgColor = (name) => {
    const colors = [
      "bg-stone-200",
      "bg-stone-300",
      "bg-amber-100",
      "bg-orange-100",
      "bg-blue-100",
      "bg-emerald-100",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // SAFE GUARD: Ensure char values are strings
  const safeName = String(char.name || "Sin Nombre");
  const safeRace = String(char.race || "Desconocido");
  const safeCsm = String(char.csm || "No");

  return (
    <div
      onClick={onClick}
      className="relative aspect-square overflow-hidden border border-stone-300 hover:border-amber-500 transition-all duration-200 cursor-pointer group bg-white shadow-sm hover:shadow-lg"
    >
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          !char.imageUrl ? getBgColor(safeName) : "bg-stone-100"
        }`}
      >
        {char.imageUrl ? (
          <img
            src={char.imageUrl}
            alt={safeName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-serif text-6xl md:text-8xl font-bold text-stone-400/50 select-none">
            {safeName.substring(0, 1).toUpperCase()}
          </span>
        )}
      </div>

      <div className="absolute top-0 right-0 flex">
        {char.noble === "Si" && (
          <div className="p-1 bg-amber-500 text-white" title="Noble">
            <Crown size={12} fill="currentColor" />
          </div>
        )}
        {safeCsm !== "No" && (
          <div className="p-1 bg-stone-900 text-white" title={`CSM: ${safeCsm}`}>
            <Shield size={12} />
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 pt-8 bg-gradient-to-t from-stone-900 via-stone-900/80 to-transparent text-white">
        <h4 className="font-serif font-bold text-sm md:text-base leading-tight truncate drop-shadow-sm mb-0.5">
          {safeName}
        </h4>
        <div className="flex justify-between items-end">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-stone-300 truncate pr-1">
            {safeRace}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
