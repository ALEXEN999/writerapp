import React from "react";
import { MoreHorizontal } from "lucide-react";

const MarbleCard = ({ children, header, onMore, onClick, className = "" }) => (
  <div 
    onClick={onClick} 
    className={`relative bg-white border border-stone-300 shadow-sm mb-6 hover:shadow-md hover:border-amber-400 transition-all group ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    {(header || onMore) && (
      <div className="flex justify-between items-center p-4 border-b border-stone-200 bg-stone-50">
        <div className="font-serif font-bold text-stone-900 text-base uppercase tracking-widest truncate pr-4">
          {header}
        </div>
        {onMore && (
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              onMore(); 
            }}
            className="text-stone-400 hover:text-amber-600"
          >
            <MoreHorizontal size={18}/>
          </button>
        )}
      </div>
    )}
    <div className="p-0">
      {children}
    </div>
  </div>
);

export default MarbleCard;
