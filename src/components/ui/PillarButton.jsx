import React from "react";

const PillarButton = ({
  onClick,
  children,
  variant = "primary",
  icon: Icon,
  disabled,
  className = "",
}) => {
  const variants = {
    primary:
      "bg-stone-900 text-amber-50 border-stone-900 hover:bg-black hover:border-amber-500",
    gold:
      "bg-white text-amber-700 border-amber-500 hover:bg-amber-50",
      ghost:
      "bg-white text-stone-900 border-stone-300 hover:bg-stone-100 hover:border-stone-900",
    link:
      "bg-transparent text-stone-600 border-none hover:text-amber-600 hover:bg-transparent",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-5 py-2 font-serif text-[10px] font-bold uppercase tracking-[0.18em] border ${variants[variant] || variants.primary} ${className}`}
    >
      {Icon && <Icon size={12} />}
      {children}
    </button>
  );
};

export default PillarButton;
