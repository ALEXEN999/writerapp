// --- ESTILOS GLOBALES FORZADOS (OLIMPO PURO) ---
const GlobalStyles = () => (
  <style>{`
    :root { color-scheme: light; }
    body, html, #root {
      background-color: #fdfbf7 !important; /* Blanco Mármol */
      color: #1c1917 !important; /* Texto Piedra Oscura */
      height: 100%;
      margin: 0;
    }
    /* REGLA MAESTRA: Nada de curvas */
    * { border-radius: 0px !important; }
    input:not([type="checkbox"]):not([type="radio"]), select, textarea {
      border: none;
      border-bottom: 1px solid #d6d3d1;
      background: transparent;
      border-radius: 0 !important;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-bottom: 2px solid #d97706;
      box-shadow: none !important;
    }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; }
    ::-webkit-scrollbar-thumb { background: #d6d3d1; }
  `}</style>
);

export default GlobalStyles;