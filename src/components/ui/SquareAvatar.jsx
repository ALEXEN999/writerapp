import React from "react";
import { Camera } from "lucide-react";

const SquareAvatar = ({ char, size = "md", onClick, editable }) => {
  const sizeClasses = { 
    sm: "w-8 h-8 text-xs", 
    md: "w-16 h-16 text-xl", 
    lg: "w-32 h-32 text-4xl",
    xl: "w-48 h-48 text-6xl" 
  };
  
  // SAFE GUARD
  const safeName = char?.name ? String(char.name) : "?";

  return (
    <div 
      onClick={editable ? onClick : undefined}
      className={`${sizeClasses[size] || sizeClasses.md} bg-stone-100 border border-stone-300 flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden group ${editable ? 'cursor-pointer hover:border-amber-400' : ''}`}
    >
      {char?.imageUrl ? (
        <img src={char.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span className="font-serif font-bold text-stone-400 select-none">
          {safeName.substring(0, 2).toUpperCase()}
        </span>
      )}
      
      {editable && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera size={24} className="text-white" />
        </div>
      )}
    </div>
  );
};

export default SquareAvatar;
