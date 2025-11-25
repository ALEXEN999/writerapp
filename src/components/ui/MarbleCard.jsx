import React from "react";
import { MoreHorizontal } from "lucide-react";

const MarbleCard = ({ children, header, onMore, onClick, className = "" }) => {
  const clickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`relative bg-white border border-stone-200 shadow-sm ${
        clickable ? "cursor-pointer hover:border-amber-400" : ""
      } ${className}`}
    >
      {(header || onMore) && (
        <div className="flex justify-between items-center px-4 py-3 border-b border-stone-200 bg-stone-50">
          <div className="font-serif font-bold text-stone-900 text-xs md:text-sm uppercase tracking-[0.18em] truncate pr-4">
            {header}
          </div>
          {onMore && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMore();
              }}
              className="text-stone-400 hover:text-amber-600"
            >
              <MoreHorizontal size={18} />
            </button>
          )}
        </div>
      )}

      <div className="p-0">{children}</div>
    </div>
  );
};

export default MarbleCard;
