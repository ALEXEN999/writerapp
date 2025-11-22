import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy 
} from "firebase/firestore";
import { 
  Book, Users, Map, Plus, Trash2, MoreHorizontal, Globe, Zap, Feather, Star, Columns, Scroll, LogOut, User, ArrowLeft, Loader2, AlertTriangle, Copy, EyeOff, Cloud, CheckCircle2, Edit2, X, StickyNote, LayoutGrid, Maximize2, Check, Filter, Crown, Shield, Sparkles, Upload, Camera, HardDrive, Shirt, Eye, Brain, History, Swords, Dna, FlaskConical, Users2, Calendar, Link as LinkIcon, ChevronUp, ChevronDown, RotateCcw, Layout, Image as ImageIcon, ExternalLink, Heart, Skull, ArrowRightLeft
} from 'lucide-react';

// --- CONFIGURACIÓN FIREBASE ---
const YOUR_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAs_HluBQ93QBY1ozmfqgGmMwxyVsw6Mg0",
  authDomain: "writerapp-1f216.firebaseapp.com",
  projectId: "writerapp-1f216",
  storageBucket: "writerapp-1f216.firebasestorage.app",
  messagingSenderId: "263441475980",
  appId: "1:263441475980:web:cb000e3a90114df45d4ea9",
  measurementId: "G-L7B60LT4GH"
};

// --- INICIALIZACIÓN ---
let app, auth, db;
try {
  if (getApps().length === 0) {
    app = initializeApp(YOUR_FIREBASE_CONFIG);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Error inicializando Firebase:", e);
}

const appId = YOUR_FIREBASE_CONFIG.projectId;

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

// --- UTILIDADES IMAGEN ---
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
        resolve(dataUrl);
      }
    }
  })
};

const getImageSizeKB = (dataURL) => {
  if (!dataURL) return 0;
  const base64String = dataURL.split(',')[1] || dataURL;
  const bytes = (base64String.length * 3) / 4;
  return (bytes / 1024).toFixed(1);
};

// --- LISTAS ---
const CHAR_IMPORTANCE = ["Principal", "Secundario", "Terciario"];
const CHAR_CSM = ["Maestro", "Agente", "Lider", "No"];
const CHAR_NOBLE = ["Si", "No"];
const DEFAULT_RACES = ["Humano", "Elfo", "Enano"];
const DEFAULT_WORLDS = ["Tierra"];

// --- PLANTILLAS ---
const STRUCTURE_TEMPLATES = {
  heroJourney: { name: "El Viaje del Héroe", description: "El clásico monomito. Ideal para fantasía épica y aventura.", steps: ["Mundo Ordinario", "La Llamada", "Rechazo", "Mentor", "Umbral", "Pruebas", "Acercamiento", "Ordalía", "Recompensa", "Camino de Vuelta", "Resurrección", "Elixir"] },
  threeActs: { name: "3 Actos", description: "La estructura fundamental del drama moderno. Planteamiento, Nudo y Desenlace.", steps: ["Acto I: Planteamiento", "Acto II: Nudo", "Acto III: Desenlace"] },
  kishotenketsu: { name: "Kishōtenketsu", description: "Estructura narrativa tradicional japonesa y coreana. Sin conflicto directo.", steps: ["Introducción (Ki)", "Desarrollo (Shō)", "Giro (Ten)", "Conclusión (Ketsu)"] }
};
const PLOT_ARCHETYPES = ["Vencer al Monstruo", "Pobreza a Riqueza", "La Búsqueda", "Viaje y Retorno", "Comedia", "Tragedia", "Renacimiento"];

const NEW_STORY_TEMPLATE = { 
  title: "Nueva Historia", 
  plotArchetypes: ["La Búsqueda"], 
  plots: [], 
  ideas: [], 
  structureType: null, 
  structurePoints: [], 
  diegesis: "", 
  lore: [], 
  species: [{id: 1, name: "Humano", originWorlds: ["Tierra"]}], 
  worlds: [{id: 1, name: "Tierra"}], 
  subplots: [], 
  characters: [] 
};

// --- COMPONENTES VISUALES RECTOS ---

const OlympusBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 bg-[#fdfbf7]">
    <div className="absolute top-0 left-4 bottom-0 w-[1px] bg-stone-200/50"></div>
    <div className="absolute top-0 right-4 bottom-0 w-[1px] bg-stone-200/50"></div>
  </div>
);

const MarbleCard = ({ children, header, onMore, onClick, className="" }) => (
  <div onClick={onClick} className={`relative bg-white border border-stone-300 shadow-sm mb-6 hover:shadow-md hover:border-amber-400 transition-all group ${onClick ? 'cursor-pointer' : ''} ${className}`}>
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    {(header || onMore) && (
      <div className="flex justify-between items-center p-4 border-b border-stone-200 bg-stone-50">
        <div className="font-serif font-bold text-stone-900 text-base uppercase tracking-widest truncate pr-4">{header}</div>
        {onMore && <button onClick={(e) => { e.stopPropagation(); onMore(); }} className="text-stone-400 hover:text-amber-600"><MoreHorizontal size={18}/></button>}
      </div>
    )}
    <div className="p-0">{children}</div>
  </div>
);

const PillarButton = ({ onClick, children, variant="primary", icon: Icon, disabled, className="" }) => {
  const variants = {
    primary: `bg-stone-900 text-amber-50 border-stone-900 hover:bg-black hover:border-amber-500`,
    gold: `bg-white text-amber-700 border-amber-500 hover:bg-amber-50`,
    ghost: `bg-transparent text-stone-600 border-transparent hover:bg-stone-100 hover:text-stone-900`
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`px-5 py-2 font-serif text-[10px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 border ${variants[variant] || variants.primary} ${className}`}>
      {Icon && <Icon size={12} />} {children}
    </button>
  );
};

const LoadingView = ({ text = "Cargando..." }) => (
  <div className="flex flex-col items-center justify-center h-64 text-stone-400 animate-in fade-in">
    <Loader2 className="animate-spin mb-2" size={24} />
    <span className="font-serif text-sm uppercase tracking-widest">{text}</span>
  </div>
);

const CloudStatus = ({ isSaving }) => (
  <div className="flex items-center gap-2 px-3 py-1 bg-white border border-stone-300 shadow-sm transition-all duration-300">
    {isSaving ? (
      <>
        <Loader2 size={14} className="animate-spin text-amber-600" />
        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Guardando...</span>
      </>
    ) : (
      <>
        <Cloud size={14} className="text-green-600" />
        <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">En línea</span>
      </>
    )}
  </div>
);

const CharacterCard = ({ char, onClick }) => {
  if (!char) return null; // ULTRA SAFE GUARD

  const getBgColor = (name) => {
    const colors = ['bg-stone-200', 'bg-stone-300', 'bg-amber-100', 'bg-orange-100', 'bg-blue-100', 'bg-emerald-100'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
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
      <div className={`absolute inset-0 flex items-center justify-center ${!char.imageUrl ? getBgColor(safeName) : 'bg-stone-100'}`}>
         {char.imageUrl ? (
            <img src={char.imageUrl} alt={safeName} className="w-full h-full object-cover" />
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

      {/* Badge de relaciones si tiene */}
      {(char.relationships || []).length > 0 && (
        <div className="absolute top-0 left-0 p-1 flex gap-1">
            {char.relationships.some(r => r.type === 'ally') && <div className="bg-blue-500 w-2 h-2"></div>}
            {char.relationships.some(r => r.type === 'enemy') && <div className="bg-red-500 w-2 h-2"></div>}
        </div>
      )}

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

// --- COMPONENTE EDITOR DE ENTIDAD (MUNDOS Y ESPECIES) ---
const EntityEditor = ({ listName, item, data, updateItem, deleteItem, setExpandedItemId, editingItem, setEditingItem }) => {
    if (!item) return null;
    const fileInputRef = useRef(null);
    const isWorld = listName === 'worlds';
    const isSpecies = listName === 'species';

    // SAFE GUARDS - Normalizamos el item por si viene como string
    // En especies, originWorlds debe ser array. Si viene string antiguo (worldOrigin), convertir.
    const safeItem = { 
        ...item, 
        name: String(item.name || (typeof item === 'string' ? item : "Sin Nombre")),
        originWorlds: Array.isArray(item.originWorlds) ? item.originWorlds : (item.worldOrigin ? [item.worldOrigin] : []) 
    };
    
    const safeName = safeItem.name;
    
    // LÓGICA AUTOMÁTICA: Habitantes del mundo = Personajes allí + Especies que lo marcan como origen
    const worldCharacters = isWorld ? (data.characters || []).filter(c => c && c.world === safeName) : [];
    const nativeSpeciesList = isWorld ? (data.species || []).filter(sp => {
        const origins = Array.isArray(sp.originWorlds) ? sp.originWorlds : (sp.worldOrigin ? [sp.worldOrigin] : []);
        return origins.includes(safeName);
    }) : [];

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const compressedBase64 = await compressImage(file);
            updateItem(listName, safeItem.id, 'imageUrl', compressedBase64);
        } catch (error) {
            console.error("Error:", error);
            alert("Error al procesar imagen.");
        }
    };

    // LOGICA MULTI-SELECCION PARA ESPECIES
    const toggleWorldOrigin = (worldName) => {
        const currentOrigins = safeItem.originWorlds || [];
        const newOrigins = currentOrigins.includes(worldName)
            ? currentOrigins.filter(w => w !== worldName)
            : [...currentOrigins, worldName];
        updateItem(listName, safeItem.id, 'originWorlds', newOrigins);
        // Borramos legacy field si existe para limpiar datos
        if(safeItem.worldOrigin) updateItem(listName, safeItem.id, 'worldOrigin', null); 
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#fdfbf7] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-stone-200 bg-white shadow-sm">
                <button onClick={() => { setExpandedItemId(null); setEditingItem(false); }} className="text-stone-500 hover:text-stone-800 flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                    <ArrowLeft size={18}/> Volver
                </button>
                <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">
                    {isSpecies ? 'Especie' : 'Mundo'}
                </h2>
                <button onClick={() => setEditingItem(!editingItem)} className="text-amber-600 flex items-center gap-2 font-bold text-xs uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full">
                    {editingItem ? <Check size={16}/> : <Edit2 size={14}/>} {editingItem ? 'Listo' : 'Editar'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-3xl mx-auto w-full">
                <div className="mb-8 flex flex-col items-center">
                    <div className="mb-6 shadow-lg border border-stone-300 bg-white p-1 relative">
                        <SquareAvatar char={{ name: safeName, imageUrl: safeItem.imageUrl }} size="xl" editable={editingItem} onClick={() => editingItem && fileInputRef.current.click()} />
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                    {editingItem ? (
                         <input className="font-serif font-bold text-4xl text-center text-stone-900 bg-transparent border-b-2 border-transparent hover:border-stone-300 focus:border-amber-500 focus:outline-none w-full placeholder:text-stone-300 pb-1 rounded-none" value={safeName} onChange={(e) => updateItem(listName, safeItem.id, 'name', e.target.value)} placeholder="Nombre"/>
                    ) : (
                        <h1 className="font-serif font-bold text-4xl text-stone-900 text-center">{safeName}</h1>
                    )}
                </div>

                <div className="space-y-8">
                    {isWorld && (
                        <>
                        <div className="bg-white p-6 border border-stone-300 shadow-sm">
                            <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-4 flex items-center gap-2 border-b border-stone-100 pb-2"><Dna size={12}/> Razas Autóctonas (Automático)</h4>
                            {/* LISTA DERIVADA AUTOMÁTICAMENTE - NO EDITABLE DIRECTAMENTE AQUÍ */}
                            <div className="flex flex-wrap gap-2">
                                {nativeSpeciesList.length > 0 ? nativeSpeciesList.map((sp, i) => (
                                    <span key={i} className="px-3 py-1 bg-stone-900 text-amber-50 text-xs font-bold">
                                        {typeof sp === 'string' ? sp : String(sp?.name || "Error")}
                                    </span>
                                )) : <p className="text-xs text-stone-400 italic">Ninguna especie reclama este mundo como origen.</p>}
                            </div>
                        </div>
                        <div className="bg-white p-6 border border-stone-300 shadow-sm">
                             <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-2 flex items-center gap-2 border-b border-stone-100 pb-2"><FlaskConical size={12}/> Sistema de Magia / Leyes Locales</h4>
                             {editingItem ? <textarea className="w-full p-3 bg-stone-50 border border-stone-300 h-32 text-sm font-serif" value={safeItem.diegesis||""} onChange={(e)=>updateItem(listName,safeItem.id,'diegesis',e.target.value)}/> : <p className="font-serif text-stone-800 text-sm whitespace-pre-wrap">{safeItem.diegesis||"Sin datos."}</p>}
                        </div>
                        </>
                    )}

                    {isWorld && (
                        <div className="bg-white p-6 border border-stone-300 shadow-sm">
                            <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-3 flex items-center gap-2 border-b border-stone-100 pb-2"><Users2 size={12}/> Habitantes Conocidos</h4>
                            {worldCharacters.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {worldCharacters.map(char => (
                                        <div key={char.id} className="flex items-center gap-2 bg-stone-50 p-2 border border-stone-200 hover:border-amber-400 transition-colors">
                                            <div className="w-6 h-6 overflow-hidden bg-stone-200 border border-stone-300">
                                                 {char.imageUrl ? <img src={char.imageUrl} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full w-full font-serif text-xs font-bold text-stone-500">{String(char.name).charAt(0)}</span>}
                                            </div>
                                            <span className="text-xs font-bold text-stone-700">{String(char.name)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (<p className="text-xs text-stone-400 italic">Ningún personaje asignado a este mundo.</p>)}
                        </div>
                    )}

                    <div className="bg-white p-6 border border-stone-300 shadow-sm">
                        <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-2 flex items-center gap-2 border-b border-stone-100 pb-2"><StickyNote size={12}/> Descripción General</h4>
                        {editingItem ? (
                            <textarea className="w-full p-3 bg-stone-50 border border-stone-300 h-32 text-sm font-serif" value={safeItem.description||""} onChange={(e)=>updateItem(listName,safeItem.id,'description',e.target.value)} placeholder="Descripción general..." />
                        ) : (<p className="font-serif text-stone-700 text-sm whitespace-pre-wrap leading-relaxed">{safeItem.description || "Sin descripción."}</p>)}
                    </div>

                    {isSpecies && (
                        <>
                           <div className="bg-white p-6 border border-stone-300 shadow-sm">
                                <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-2 flex items-center gap-2 border-b border-stone-100 pb-2"><Eye size={12}/> Aspecto</h4>
                                {editingItem ? <textarea className="w-full p-3 bg-stone-50 border border-stone-300 h-24 text-sm font-serif" value={safeItem.appearance||""} onChange={(e)=>updateItem(listName,safeItem.id,'appearance',e.target.value)} placeholder="Características físicas..." /> : <p className="font-serif text-stone-700 text-sm">{safeItem.appearance||"Sin definir."}</p>}
                           </div>
                           <div className="bg-white p-6 border border-stone-300 shadow-sm">
                                <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-2 flex items-center gap-2 border-b border-stone-100 pb-2"><Zap size={12}/> Poderes</h4>
                                {editingItem ? <textarea className="w-full p-3 bg-stone-50 border border-stone-300 h-24 text-sm font-serif" value={safeItem.powers||""} onChange={(e)=>updateItem(listName,safeItem.id,'powers',e.target.value)} placeholder="Habilidades mágicas..." /> : <p className="font-serif text-stone-700 text-sm">{safeItem.powers || "Sin definir."}</p>}
                           </div>
                           <div className="bg-white p-6 border border-stone-300 shadow-sm">
                                <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-2 flex items-center gap-2 border-b border-stone-100 pb-2"><Globe size={12}/> Mundos de Origen (Multiverso)</h4>
                                {editingItem ? (
                                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-stone-50 border border-stone-300">
                                        {(data.worlds || []).map(w => {
                                            if(!w) return null;
                                            const wName = typeof w === 'string' ? w : String(w.name || "Desconocido");
                                            const isSelected = (safeItem.originWorlds || []).includes(wName);
                                            return (
                                                <label key={w.id || wName} className="flex items-center gap-2 cursor-pointer hover:bg-stone-100 p-1">
                                                    <div className={`w-4 h-4 border flex items-center justify-center ${isSelected ? 'bg-stone-800 border-stone-800' : 'bg-white border-stone-300'}`}>
                                                        {isSelected && <Check size={10} className="text-white"/>}
                                                    </div>
                                                    <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleWorldOrigin(wName)} />
                                                    <span className="text-xs font-bold text-stone-600">{wName}</span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {(safeItem.originWorlds && safeItem.originWorlds.length > 0) ? safeItem.originWorlds.map(w => (
                                            <span key={w} className="bg-stone-100 border border-stone-200 px-2 py-1 text-xs font-bold text-stone-700">{w}</span>
                                        )) : <p className="font-serif text-stone-700 text-sm italic">Ninguno conocido.</p>}
                                    </div>
                                )}
                             </div>
                        </>
                    )}

                    {editingItem && (
                         <button onClick={() => deleteItem(listName, safeItem.id)} className="w-full py-3 text-red-600 border border-red-200 hover:bg-red-50 uppercase text-xs font-bold flex items-center justify-center gap-2 mt-8 rounded-none transition-colors">
                            <Trash2 size={16}/> Eliminar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
  };

// --- Módulos ---

// --- COMPONENTE STRUCTURE VIEW MODIFICADO ---
const StructureView = ({ data, updateData }) => {
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [expandedStepId, setExpandedStepId] = useState(null); 
  const [showPlotSelector, setShowPlotSelector] = useState(null);

  if (!data) return <LoadingView />;

  // --- LOGICA DE DATOS ---
  const updateStructure = (newPoints) => {
      updateData({ ...data, structurePoints: newPoints });
  };

  const addItemToStep = (stepId, type, extra = {}) => {
      const newItem = {
          id: Date.now(),
          type,
          title: type === 'chapter' ? "Nuevo Capítulo" : "",
          content: "",
          acts: { act1: "", act2: "", act3: "" },
          characterIds: [],
          resources: [],
          ...extra
      };
      const newPoints = data.structurePoints.map(step => {
          if (step.id === stepId) {
              return { ...step, items: [...(step.items || []), newItem] };
          }
          return step;
      });
      updateStructure(newPoints);
      if(type === 'chapter') {
          setExpandedStepId(stepId);
          setExpandedChapterId(newItem.id);
      }
  };

  const updateItemInStep = (stepId, itemId, updates) => {
      const newPoints = data.structurePoints.map(step => {
          if (step.id === stepId) {
              const newItems = (step.items || []).map(item => 
                  item.id === itemId ? { ...item, ...updates } : item
              );
              return { ...step, items: newItems };
          }
          return step;
      });
      updateStructure(newPoints);
  };

  const removeItemFromStep = (stepId, itemId) => {
      if(!confirm("¿Eliminar este elemento?")) return;
      const newPoints = data.structurePoints.map(step => {
          if (step.id === stepId) {
              return { ...step, items: (step.items || []).filter(i => i.id !== itemId) };
          }
          return step;
      });
      updateStructure(newPoints);
      if (expandedChapterId === itemId) setExpandedChapterId(null);
  };

  const moveItemInStep = (stepId, itemIndex, direction) => {
      const newPoints = data.structurePoints.map(step => {
          if (step.id === stepId) {
             const items = [...(step.items || [])];
             if (direction === 'up' && itemIndex > 0) {
                 [items[itemIndex], items[itemIndex - 1]] = [items[itemIndex - 1], items[itemIndex]];
             } else if (direction === 'down' && itemIndex < items.length - 1) {
                 [items[itemIndex], items[itemIndex + 1]] = [items[itemIndex + 1], items[itemIndex]];
             }
             return { ...step, items };
          }
          return step;
      });
      updateStructure(newPoints);
  };

  const applyTemplate = (type) => {
    if ((data.structurePoints || []).length > 0 && !confirm("¿Cambiar de estructura? Se perderá el contenido actual.")) return;
    const points = STRUCTURE_TEMPLATES[type].steps.map((step, i) => ({ 
      id: Date.now()+i, 
      type: 'step', 
      title: step, 
      items: [], 
      completed: false 
    }));
    updateData({ ...data, structureType: type, structurePoints: points });
  };

  const resetStructure = () => {
    if(confirm("¿Estás seguro? Se borrará todo el progreso de la estructura.")) {
        updateData({ ...data, structureType: null, structurePoints: [] });
    }
  };

  const addBaseStep = () => {
      const newStep = { id: Date.now(), type: 'step', title: "Nuevo Paso Estructural", items: [], completed: false };
      updateStructure([...(data.structurePoints || []), newStep]);
  };
  
  const updateStepTitle = (stepId, newTitle) => {
      const newPoints = data.structurePoints.map(p => p.id === stepId ? {...p, title: newTitle} : p);
      updateStructure(newPoints);
  };

  const deleteBaseStep = (stepId) => {
      if(!confirm("¿Eliminar este paso completo?")) return;
      updateStructure(data.structurePoints.filter(p => p.id !== stepId));
  };

  // --- EDITOR DE CAPITULO FULLSCREEN ---
  const ChapterEditor = () => {
      if (!expandedChapterId || !expandedStepId) return null;
      
      const step = data.structurePoints.find(s => s.id === expandedStepId);
      const chapter = step?.items.find(i => i.id === expandedChapterId);
      
      if (!chapter) return null;

      const [activeTab, setActiveTab] = useState('structure');
      const [newResourceUrl, setNewResourceUrl] = useState("");
      const [newResourceLabel, setNewResourceLabel] = useState("");

      const handleAddResource = (type) => {
          if(!newResourceUrl) return;
          const newRes = { id: Date.now(), type, url: newResourceUrl, label: newResourceLabel || "Recurso" };
          updateItemInStep(expandedStepId, chapter.id, { resources: [...(chapter.resources || []), newRes] });
          setNewResourceUrl(""); setNewResourceLabel("");
      };

      const toggleCharacter = (charId) => {
          const currentIds = chapter.characterIds || [];
          const newIds = currentIds.includes(charId) ? currentIds.filter(id => id !== charId) : [...currentIds, charId];
          updateItemInStep(expandedStepId, chapter.id, { characterIds: newIds });
      };

      const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const compressedBase64 = await compressImage(file);
            const newRes = { id: Date.now(), type: 'image', url: compressedBase64, label: file.name };
            updateItemInStep(expandedStepId, chapter.id, { resources: [...(chapter.resources || []), newRes] });
        } catch (error) {
            console.error(error);
            alert("Error al procesar la imagen.");
        }
      };

      return (
        <div className="fixed inset-0 z-50 bg-[#fdfbf7] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-white shadow-sm">
                <button onClick={() => setExpandedChapterId(null)} className="text-stone-500 hover:text-stone-800 flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                    <ArrowLeft size={18}/> Guardar y Cerrar
                </button>
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Editando Capítulo</span>
                <div className="w-8"></div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full">
                <input 
                    className="w-full text-4xl md:text-5xl font-serif font-bold text-stone-900 bg-transparent border-b-2 border-transparent hover:border-stone-200 focus:border-amber-400 focus:outline-none placeholder:text-stone-300 mb-2 pb-2"
                    value={chapter.title}
                    onChange={(e) => updateItemInStep(expandedStepId, chapter.id, { title: e.target.value })}
                    placeholder="Título del Capítulo"
                />
                <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-8">Perteneciente a: {step.title}</p>

                {/* Tabs */}
                <div className="flex border-b border-stone-200 mb-8">
                    {['structure', 'characters', 'resources'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === tab ? 'border-amber-500 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                        >
                            {tab === 'structure' ? 'Estructura (3 Actos)' : (tab === 'characters' ? 'Personajes' : 'Recursos')}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'structure' && (
                    <div className="space-y-8 animate-in fade-in">
                        {['act1', 'act2', 'act3'].map((act, i) => (
                            <div key={act} className="bg-white p-6 border border-stone-200 shadow-sm">
                                <h4 className="text-xs font-bold text-stone-900 uppercase mb-3 tracking-widest flex items-center gap-2">
                                    <span className="bg-stone-900 text-amber-50 w-6 h-6 flex items-center justify-center rounded-full text-[10px]">{i+1}</span>
                                    {act === 'act1' ? 'Inicio' : (act === 'act2' ? 'Nudo' : 'Desenlace')}
                                </h4>
                                <textarea 
                                    className="w-full min-h-[150px] bg-stone-50 p-4 border border-stone-200 focus:border-amber-400 focus:outline-none font-serif text-stone-700 leading-relaxed resize-y"
                                    value={(chapter.acts || {})[act] || ""}
                                    onChange={(e) => updateItemInStep(expandedStepId, chapter.id, { acts: { ...(chapter.acts || {}), [act]: e.target.value } })}
                                    placeholder={`Describe el ${act === 'act1' ? 'planteamiento' : (act === 'act2' ? 'conflicto principal' : 'clímax y resolución')} del capítulo...`}
                                />
                            </div>
                        ))}
                        <div className="mt-8">
                            <label className="text-[10px] font-bold text-stone-400 uppercase mb-2 block">Resumen General (Visible en la tarjeta)</label>
                            <textarea 
                                className="w-full p-4 bg-white border border-stone-200 focus:border-amber-400 outline-none text-sm font-serif"
                                value={chapter.content || ""}
                                onChange={(e) => updateItemInStep(expandedStepId, chapter.id, { content: e.target.value })}
                                placeholder="Resumen corto del capítulo..."
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'characters' && (
                    <div className="animate-in fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {(data.characters || []).map(char => {
                                const isSelected = (chapter.characterIds || []).includes(char.id);
                                return (
                                    <div 
                                        key={char.id} 
                                        onClick={() => toggleCharacter(char.id)}
                                        className={`flex items-center gap-4 p-3 border cursor-pointer transition-all ${isSelected ? 'bg-amber-50 border-amber-400' : 'bg-white border-stone-200 hover:border-stone-400'}`}
                                    >
                                        <div className="w-10 h-10 bg-stone-200 flex-shrink-0 overflow-hidden border border-stone-300">
                                            {char.imageUrl ? <img src={char.imageUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-stone-500 font-bold text-xs">{String(char.name).substring(0,2).toUpperCase()}</div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm text-stone-800 truncate">{String(char.name)}</div>
                                            <div className="text-[10px] text-stone-500 uppercase tracking-wider">{String(char.race)}</div>
                                        </div>
                                        {isSelected && <CheckCircle2 size={18} className="text-amber-600"/>}
                                    </div>
                                )
                            })}
                            {(data.characters || []).length === 0 && <p className="text-stone-400 italic col-span-full">No hay personajes creados en la sección de Personajes.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div className="animate-in fade-in space-y-8">
                        {/* Add Resource */}
                        <div className="bg-stone-50 p-6 border border-stone-200">
                            <h4 className="text-xs font-bold text-stone-900 uppercase mb-4 tracking-widest">Añadir Nuevo Recurso</h4>
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-2">
                                    <input className="flex-1 p-2 bg-white border border-stone-300 text-sm" placeholder="Etiqueta (opcional)" value={newResourceLabel} onChange={e => setNewResourceLabel(e.target.value)} />
                                    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 cursor-pointer hover:bg-stone-100 text-xs font-bold uppercase">
                                        <Upload size={14}/> Subir Imagen
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload}/>
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <input className="flex-1 p-2 bg-white border border-stone-300 text-sm font-mono" placeholder="Pegar URL de enlace o imagen..." value={newResourceUrl} onChange={e => setNewResourceUrl(e.target.value)} />
                                    <button onClick={() => handleAddResource('link')} className="px-4 py-2 bg-stone-800 text-white text-xs font-bold uppercase hover:bg-stone-900">Añadir Link</button>
                                    <button onClick={() => handleAddResource('image')} className="px-4 py-2 bg-stone-800 text-white text-xs font-bold uppercase hover:bg-stone-900">Añadir IMG</button>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(chapter.resources || []).map((res, idx) => (
                                <div key={res.id} className="group relative bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all">
                                    <button 
                                        onClick={() => {
                                            const newRes = (chapter.resources || []).filter(r => r.id !== res.id);
                                            updateItemInStep(expandedStepId, chapter.id, { resources: newRes });
                                        }}
                                        className="absolute top-1 right-1 bg-white text-stone-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm border border-stone-100"
                                    >
                                        <Trash2 size={14}/>
                                    </button>
                                    {res.type === 'image' ? (
                                        <div className="aspect-square bg-stone-100 relative overflow-hidden cursor-pointer" onClick={() => window.open(res.url, '_blank')}>
                                            <img src={res.url} className="w-full h-full object-cover" />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 truncate font-bold text-center">{res.label}</div>
                                        </div>
                                    ) : (
                                        <a href={res.url} target="_blank" rel="noreferrer" className="aspect-square flex flex-col items-center justify-center p-4 bg-stone-50 hover:bg-amber-50 transition-colors text-center">
                                            <LinkIcon size={24} className="text-stone-400 mb-2"/>
                                            <span className="text-xs font-bold text-stone-700 line-clamp-2">{res.label}</span>
                                            <span className="text-[9px] text-stone-400 mt-1 truncate w-full">{res.url}</span>
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      );
  };

  // --- PASO 1: SELECCIÓN DE ESTRUCTURA ---
  if (!data.structureType) {
      return (
        <div className="p-4 md:p-8 animate-in fade-in flex flex-col items-center justify-center min-h-[50vh]">
             <h2 className="font-serif font-bold text-2xl text-stone-900 mb-2 text-center">Elige la Estructura de tu Historia</h2>
             <p className="text-stone-500 text-sm mb-8 text-center max-w-md font-serif italic">"El andamiaje invisible que sostiene el alma de tu relato."</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                {Object.entries(STRUCTURE_TEMPLATES).map(([key, tpl]) => (
                    <div 
                        key={key} 
                        onClick={() => applyTemplate(key)}
                        className="bg-white border border-stone-300 p-6 shadow-sm hover:shadow-md hover:border-amber-400 cursor-pointer transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-stone-200 group-hover:bg-amber-500 transition-colors"></div>
                        <h3 className="font-serif font-bold text-xl text-stone-900 mb-2 group-hover:text-amber-700 transition-colors">{tpl.name}</h3>
                        <p className="text-xs text-stone-500 mb-4 leading-relaxed font-serif">{tpl.description}</p>
                        <div className="flex flex-wrap gap-1 mt-auto">
                            {tpl.steps.slice(0, 3).map((step, i) => (
                                <span key={i} className="text-[9px] bg-stone-100 text-stone-600 px-2 py-1 uppercase tracking-wider font-bold border border-stone-200">{step}</span>
                            ))}
                            {tpl.steps.length > 3 && <span className="text-[9px] text-stone-400 px-2 py-1 italic">...</span>}
                        </div>
                    </div>
                ))}
             </div>
        </div>
      );
  }

  // --- PASO 2: ESTRUCTURA ACTIVA ---
  return (
    <div className="pb-32 px-4 md:px-8 pt-6 animate-in fade-in max-w-5xl mx-auto">
      <ChapterEditor />
      
      {/* Header Estructura Activa */}
      <div className="flex items-center justify-between mb-10 pb-4 border-b border-stone-200">
         <div className="flex items-center gap-3">
             <div className="bg-stone-900 text-amber-50 p-2">
                 <Columns size={20} />
             </div>
             <div>
                 <h2 className="font-serif font-bold text-xl text-stone-900">{STRUCTURE_TEMPLATES[data.structureType]?.name || "Estructura Personalizada"}</h2>
                 <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Modo Edición</p>
             </div>
         </div>
         <button onClick={resetStructure} className="text-stone-400 hover:text-red-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-stone-200 px-3 py-2 hover:bg-red-50 transition-colors">
            <RotateCcw size={14} /> Reiniciar
         </button>
      </div>

      {/* Lista de Pasos (Contenedores) */}
      <div className="space-y-12 pb-12">
        {(data.structurePoints || []).map((step, index) => (
            <div key={step.id} className="relative pl-8 md:pl-12 border-l-2 border-stone-200 group">
                
                {/* Marcador del Paso */}
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-stone-200 border-2 border-[#fdfbf7] ring-1 ring-stone-300 group-hover:bg-amber-500 group-hover:ring-amber-500 transition-all z-10"></div>
                
                {/* Contenido del Paso */}
                <div className="bg-white border border-stone-300 shadow-sm p-6 relative hover:border-amber-400 transition-colors">
                    
                    {/* Header del Paso */}
                    <div className="flex justify-between items-start mb-6 border-b border-stone-100 pb-4">
                        <div className="w-full">
                            <input 
                                className="font-serif font-bold text-2xl text-stone-900 bg-transparent border-none focus:outline-none placeholder:text-stone-300 w-full mb-1"
                                value={step.title}
                                onChange={(e) => updateStepTitle(step.id, e.target.value)}
                            />
                            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Paso {index + 1}</p>
                        </div>
                        <button onClick={() => deleteBaseStep(step.id)} className="text-stone-300 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                    </div>

                    {/* Área de Items (Capítulos y Tramas) */}
                    <div className="space-y-4 mb-6 min-h-[50px]">
                        {(step.items || []).length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-stone-100 text-stone-300 text-xs font-bold uppercase tracking-wider italic">
                                Vacío
                            </div>
                        )}
                        {(step.items || []).map((item, idx) => {
                            const isChapter = item.type === 'chapter';
                            
                            return (
                                <div key={item.id} className={`border relative group/item animate-in slide-in-from-bottom-1 transition-all hover:shadow-md ${isChapter ? 'bg-white border-stone-200 hover:border-amber-400' : 'bg-amber-50/50 border-amber-200 p-4'}`}>
                                    
                                    {/* CAPITULO COMO TARJETA INTERACTIVA */}
                                    {isChapter ? (
                                        <div 
                                            onClick={() => { setExpandedStepId(step.id); setExpandedChapterId(item.id); }}
                                            className="cursor-pointer p-5"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2 text-stone-400">
                                                    <Book size={16}/>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Capítulo</span>
                                                </div>
                                                {/* Acciones del Item */}
                                                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => moveItemInStep(step.id, idx, 'up')} className="p-1 text-stone-300 hover:text-stone-600 hover:bg-stone-100"><ChevronUp size={14}/></button>
                                                    <button onClick={() => moveItemInStep(step.id, idx, 'down')} className="p-1 text-stone-300 hover:text-stone-600 hover:bg-stone-100"><ChevronDown size={14}/></button>
                                                    <button onClick={() => removeItemFromStep(step.id, item.id)} className="p-1 text-stone-300 hover:text-red-500 hover:bg-red-50 ml-2"><Trash2 size={14}/></button>
                                                </div>
                                            </div>
                                            
                                            <h4 className="font-serif font-bold text-lg text-stone-900 mb-2 truncate">{item.title || "Nuevo Capítulo"}</h4>
                                            <p className="text-sm text-stone-500 font-serif line-clamp-2 mb-4">{item.content || "Sin resumen..."}</p>
                                            
                                            {/* Badges de estado */}
                                            <div className="flex gap-2 mt-auto">
                                                {(item.characterIds || []).length > 0 && (
                                                    <span className="text-[9px] font-bold text-stone-500 bg-stone-100 px-2 py-1 flex items-center gap-1">
                                                        <Users size={10}/> {item.characterIds.length}
                                                    </span>
                                                )}
                                                {(item.resources || []).length > 0 && (
                                                    <span className="text-[9px] font-bold text-stone-500 bg-stone-100 px-2 py-1 flex items-center gap-1">
                                                        <ExternalLink size={10}/> {item.resources.length}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        /* TRAMA (VISUALIZACIÓN SIMPLE) */
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 text-amber-600"><Swords size={16}/></div>
                                            <div className="flex-1">
                                                <div className="font-bold text-xs text-amber-800 uppercase tracking-wider mb-2 bg-amber-100 inline-block px-2 py-1">
                                                    Trama: {(data.plots || []).find(p => p.id === item.plotId)?.title || "Desconocida"}
                                                </div>
                                                <textarea 
                                                    className="w-full bg-transparent border-none text-sm text-stone-600 font-serif resize-none focus:outline-none p-0"
                                                    rows={2}
                                                    value={item.content}
                                                    onChange={(e) => updateItemInStep(step.id, item.id, { content: e.target.value })}
                                                    placeholder="Notas sobre el avance de la trama..."
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <button onClick={() => moveItemInStep(step.id, idx, 'up')} className="text-stone-300 hover:text-stone-600"><ChevronUp size={14}/></button>
                                                <button onClick={() => moveItemInStep(step.id, idx, 'down')} className="text-stone-300 hover:text-stone-600"><ChevronDown size={14}/></button>
                                                <button onClick={() => removeItemFromStep(step.id, item.id)} className="text-stone-300 hover:text-red-500 mt-2"><Trash2 size={14}/></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Botonera Contextual del Paso */}
                    <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                        <button 
                            onClick={() => addItemToStep(step.id, 'chapter')}
                            className="flex items-center gap-2 px-3 py-2 bg-stone-800 text-amber-50 hover:bg-black text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                            <Plus size={12} /> Capítulo
                        </button>
                        
                        <div className="w-[1px] h-6 bg-stone-200"></div>

                        {/* SELECTOR DE TRAMA ARREGLADO */}
                        {showPlotSelector === step.id ? (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                <select 
                                    className="bg-stone-50 border border-stone-300 text-xs font-bold text-stone-600 py-1 pl-2 pr-8 focus:border-amber-400 outline-none w-40"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            addItemToStep(step.id, 'plot', { plotId: parseInt(e.target.value) });
                                            setShowPlotSelector(null);
                                        }
                                    }}
                                    defaultValue=""
                                    autoFocus
                                    onBlur={() => setTimeout(() => setShowPlotSelector(null), 200)}
                                >
                                    <option value="" disabled>Elegir Trama...</option>
                                    {(data.plots || []).map(p => (
                                        <option key={p.id} value={p.id}>{p.title || "Sin Título"}</option>
                                    ))}
                                </select>
                                <button onClick={() => setShowPlotSelector(null)} className="text-stone-400 hover:text-stone-600"><X size={14}/></button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setShowPlotSelector(step.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 hover:border-amber-400 text-stone-600 text-[10px] font-bold uppercase tracking-wider transition-all"
                            >
                                <Plus size={12} /> Trama
                            </button>
                        )}
                    </div>

                </div>
            </div>
        ))}
        
        {/* Añadir Paso Base Manualmente */}
        <div className="pl-8 md:pl-12">
            <button onClick={addBaseStep} className="w-full py-4 border-2 border-dashed border-stone-300 text-stone-400 hover:text-amber-600 hover:border-amber-400 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <Plus size={16}/> Añadir nuevo paso estructural
            </button>
        </div>
      </div>
    </div>
  );
};

const StoryHub = ({ user, stories, activeStoryId, setActiveStoryId, data, updateData, onCreateStory, onDemoLogin, isSaving, onDeleteStory }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newArchetype, setNewArchetype] = useState("");
  
  // Estados para el Editor de Trama Fullscreen
  const [expandedPlotId, setExpandedPlotId] = useState(null);

  // Estado para Modal de Borrado
  const [deletingStory, setDeletingStory] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // LOGIN LOGIC
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      if (!auth) throw new Error("Firebase no inicializado");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ARQUETIPOS
  const addArchetype = (arch) => {
    const current = data.plotArchetypes || [];
    if (!current.includes(arch)) {
      updateData({ ...data, plotArchetypes: [...current, arch] });
    }
    setNewArchetype("");
  };

  const removeArchetype = (arch) => {
    updateData({ ...data, plotArchetypes: (data.plotArchetypes || []).filter(a => a !== arch) });
  };

  // TRAMAS (Funciones)
  const createNewPlot = () => {
    const newPlot = {
      id: Date.now(),
      title: "Nueva Trama",
      description: "",
      characterIds: []
    };
    updateData({ ...data, plots: [...(data.plots || []), newPlot] });
    setExpandedPlotId(newPlot.id);
  };

  const removePlot = (id) => {
    updateData({ ...data, plots: (data.plots || []).filter(p => p.id !== id) });
    if (expandedPlotId === id) setExpandedPlotId(null);
  };

  const updateExpandedPlot = (field, value) => {
    const updatedPlots = (data.plots || []).map(p => 
      p.id === expandedPlotId ? { ...p, [field]: value } : p
    );
    updateData({ ...data, plots: updatedPlots });
  };

  const toggleCharForExpandedPlot = (charId) => {
    const currentPlot = (data.plots || []).find(p => p.id === expandedPlotId);
    if (!currentPlot) return;
    
    const currentIds = currentPlot.characterIds || [];
    const newIds = currentIds.includes(charId) 
      ? currentIds.filter(id => id !== charId)
      : [...currentIds, charId];
      
    updateExpandedPlot('characterIds', newIds);
  };

  // IDEAS
  const addIdea = () => {
    const newIdea = { id: Date.now(), text: "Nueva idea brillante...", x: Math.random() * 5, y: Math.random() * 5, color: Math.floor(Math.random() * 3) };
    updateData({ ...data, ideas: [newIdea, ...(data.ideas || [])] });
  };

  const updateIdea = (id, text) => {
    updateData({ ...data, ideas: data.ideas.map(i => i.id === id ? { ...i, text } : i) });
  };

  // --- RENDERIZADO ---

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-[#fdfbf7]">
        <div className="mb-8 border-4 border-amber-500 p-4 bg-stone-800 shadow-xl"><Book size={48} className="text-amber-50" /></div>
        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">NARRATIVA PRO</h1>
        <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-12">Edición Olimpo</p>
        <div className="space-y-4 w-full max-w-sm">
          <button onClick={handleLogin} disabled={isLoggingIn} className="w-full flex items-center justify-center gap-3 bg-white border border-stone-300 p-4 hover:bg-stone-50 shadow-sm">
            {isLoggingIn ? <Loader2 className="animate-spin"/> : <><span className="font-bold text-stone-700">Conectar con Google</span></>}
          </button>
        </div>
      </div>
    );
  }

  if (!activeStoryId) {
    return (
      <div className="p-6 md:p-8 pb-32 animate-in fade-in relative">
        
        {/* --- MODAL DE BORRADO --- */}
        {deletingStory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white border border-stone-300 shadow-2xl max-w-md w-full p-8 relative">
                    <button onClick={() => setDeletingStory(null)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><X size={20}/></button>
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="bg-red-50 p-3 rounded-full mb-4 text-red-500"><AlertTriangle size={32}/></div>
                        <h3 className="font-serif font-bold text-xl text-stone-900">¿Eliminar Historia?</h3>
                        <p className="text-sm text-stone-500 mt-2">Esta acción no se puede deshacer. Se perderán todos los personajes, tramas y configuraciones.</p>
                    </div>
                    
                    <div className="space-y-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-stone-400 text-center">Escribe el nombre exacto para confirmar:</p>
                        <div className="bg-stone-100 p-2 text-center font-serif font-bold text-stone-800 select-all border border-stone-200">
                            {deletingStory.title}
                        </div>
                        <input 
                            autoFocus
                            className="w-full p-3 border-2 border-stone-200 focus:border-red-400 outline-none text-center font-bold text-stone-800"
                            placeholder="Escribe el título aquí..."
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                        />
                        <button 
                            disabled={deleteConfirmation !== deletingStory.title}
                            onClick={() => { onDeleteStory(deletingStory.id); setDeletingStory(null); setDeleteConfirmation(""); }}
                            className="w-full py-3 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                        >
                            Confirmar Eliminación
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-between items-center mb-8 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center border border-stone-300"><User size={20}/></div>
            <div><div className="text-[10px] font-bold uppercase text-amber-600">Autor</div><div className="font-serif font-bold text-stone-800">{user.displayName || "Invitado"}</div></div>
          </div>
          <button onClick={() => signOut(auth).catch(() => window.location.reload())} className="text-stone-400 hover:text-stone-600"><LogOut size={20}/></button>
        </div>
        <div className="flex justify-between items-end mb-6">
           <h2 className="text-2xl font-serif font-bold text-stone-900">Biblioteca</h2>
           <PillarButton onClick={onCreateStory} variant="primary" icon={Plus}>Nueva</PillarButton>
        </div>
        {stories.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-stone-200"><p className="text-stone-400 mb-4 font-serif italic">El silencio antes de la creación.</p></div>
        ) : (
          <div className="grid gap-4">
            {stories.map(s => (
              <div key={s.id} className="relative group">
                  <MarbleCard onClick={() => setActiveStoryId(s.id)} className="cursor-pointer hover:border-amber-400">
                    <div className="p-6 pr-12">
                        <h3 className="font-serif text-xl font-bold text-stone-900">{s.title || "Sin Título"}</h3>
                        <div className="text-xs font-bold text-stone-400 mt-1 uppercase">{(s.plotArchetypes || []).join(", ") || "Sin Arquetipo"}</div>
                    </div>
                  </MarbleCard>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeletingStory(s); setDeleteConfirmation(""); }}
                    className="absolute top-4 right-4 p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 z-10"
                    title="Eliminar Historia"
                  >
                      <Trash2 size={18} />
                  </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!data) return <LoadingView text="Abriendo..." />;

  // Obtenemos la trama que se está editando
  const expandedPlot = (data.plots || []).find(p => p.id === expandedPlotId);

  return (
    <div className="p-4 md:p-8 pb-40 max-w-4xl mx-auto animate-in fade-in relative">
      
      {/* --- FULLSCREEN PLOT EDITOR --- */}
      {expandedPlotId && expandedPlot && (
        <div className="fixed inset-0 z-50 bg-[#fdfbf7] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
          
          {/* Editor Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-stone-200 bg-white shadow-sm">
             <button onClick={() => setExpandedPlotId(null)} className="text-stone-500 hover:text-stone-800 flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
               <ArrowLeft size={18}/> Volver
             </button>
             <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">Editando Trama</h2>
             <button onClick={() => setExpandedPlotId(null)} className="text-amber-600 hover:text-amber-800 flex items-center gap-2 font-bold text-xs uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full">
               <Check size={16}/> Guardar
             </button>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-4xl mx-auto w-full">
             
             {/* Title */}
             <input 
               className="w-full text-3xl md:text-5xl font-serif font-bold text-stone-900 bg-transparent border-b-2 border-transparent hover:border-stone-200 focus:border-amber-400 focus:outline-none placeholder:text-stone-300 mb-8"
               value={expandedPlot.title || expandedPlot.type || ""}
               onChange={(e) => updateExpandedPlot('title', e.target.value)}
               placeholder="Título de la Trama"
             />

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Sidebar: Characters & Actions (Moved First for Mobile View) */}
                <div className="space-y-6">
                   
                   {/* Character Selector */}
                   <div className="bg-stone-50 border border-stone-200 p-4 rounded-lg">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 block">Personajes Implicados</label>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {(data.characters || []).map(char => {
                          const isSelected = (expandedPlot.characterIds || []).includes(char.id);
                          return (
                            <button 
                              key={char.id}
                              onClick={() => toggleCharForExpandedPlot(char.id)}
                              className={`w-full flex items-center gap-3 p-2 rounded-md border transition-all text-left ${isSelected ? 'bg-white border-amber-400 shadow-sm' : 'border-transparent hover:bg-white hover:border-stone-200'}`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border ${isSelected ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-stone-200 text-stone-500 border-transparent'}`}>
                                {char.name ? String(char.name).substring(0,2).toUpperCase() : "?"}
                              </div>
                              <span className={`text-sm font-medium ${isSelected ? 'text-stone-900' : 'text-stone-500'}`}>{char.name || "Sin Nombre"}</span>
                              {isSelected && <CheckCircle2 size={14} className="ml-auto text-amber-500" />}
                            </button>
                          )
                        })}
                        {(data.characters || []).length === 0 && (
                          <p className="text-xs text-stone-400 italic p-2">No hay personajes creados.</p>
                        )}
                      </div>
                   </div>

                   <button 
                     onClick={() => { if(confirm("¿Eliminar esta trama?")) removePlot(expandedPlot.id); }}
                     className="w-full py-3 border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                   >
                     <Trash2 size={14}/> Eliminar Trama
                   </button>

                </div>

                {/* Main Column: Description */}
                <div className="lg:col-span-2 space-y-6">
                   <div className="bg-white p-6 border border-stone-200 shadow-sm rounded-lg min-h-[50vh]">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
                        <StickyNote size={14}/> Descripción y Notas
                      </label>
                      <textarea 
                        className="w-full h-full min-h-[400px] bg-transparent focus:outline-none resize-none text-lg font-serif text-stone-700 leading-relaxed"
                        value={expandedPlot.description || ""}
                        onChange={(e) => updateExpandedPlot('description', e.target.value)}
                        placeholder="Escribe aquí el desarrollo de esta trama..."
                      />
                   </div>
                </div>

             </div>
          </div>
        </div>
      )}

      {/* HEADER DE LA HISTORIA PRINCIPAL - RESPONSIVE FIX */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full">
          <div className="flex justify-between items-center mb-4 w-full">
            <button onClick={() => setActiveStoryId(null)} className="text-xs font-bold uppercase flex items-center gap-2 text-stone-400 hover:text-stone-800">
              <ArrowLeft size={14}/> Volver
            </button>
            {/* Cloud Status visible en móvil arriba a la derecha */}
            <div className="md:hidden">
               <CloudStatus isSaving={isSaving} />
            </div>
          </div>
          
          <div className="relative group w-full">
            {isEditingTitle ? (
              <input 
                autoFocus
                className="text-4xl md:text-5xl font-serif font-bold w-full bg-transparent border-b-2 border-amber-400 focus:outline-none text-stone-900 placeholder:text-stone-300 pb-2"
                value={data.title||""} 
                onChange={(e) => updateData({...data, title: e.target.value})} 
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                placeholder="TÍTULO" 
              />
            ) : (
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 pb-2 border-b-2 border-transparent relative group-hover:border-stone-100 transition-all cursor-text text-center" onClick={() => setIsEditingTitle(true)}>
                {data.title || "Sin Título"}
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }}
                  className="absolute -right-8 bottom-2 p-2 text-stone-300 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Edit2 size={16} />
                </button>
              </h1>
            )}
          </div>
        </div>
        {/* Cloud Status visible en PC a la derecha */}
        <div className="hidden md:block">
           <CloudStatus isSaving={isSaving} />
        </div>
      </div>

      {/* 2. ARQUETIPOS */}
      <div className="mb-10">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-200 pb-2">Arquetipos de Trama</h3>
        <div className="flex flex-wrap gap-3 items-center">
          {(data.plotArchetypes || []).map((arch, idx) => (
            <span key={idx} className="bg-stone-800 text-amber-50 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm">
              {arch}
              <button onClick={() => removeArchetype(arch)} className="hover:text-red-400 transition-colors"><X size={12} /></button>
            </span>
          ))}
          
          <div className="relative flex items-center gap-2 bg-white border border-stone-200 rounded-full px-2 py-1 shadow-sm hover:border-amber-300 transition-colors">
            <select 
              className="bg-transparent text-xs font-bold text-stone-600 uppercase focus:outline-none cursor-pointer py-2 px-2 pr-8 appearance-none"
              value="" 
              onChange={(e) => {
                if(e.target.value === "custom") {
                  const custom = prompt("Nombre del nuevo arquetipo:");
                  if(custom) addArchetype(custom);
                } else {
                  addArchetype(e.target.value);
                }
              }}
            >
              <option value="" disabled>+ Añadir Arquetipo</option>
              {PLOT_ARCHETYPES.map(a => <option key={a} value={a}>{a}</option>)}
              <option value="custom" className="text-amber-700 font-bold">✨ Crear Nuevo...</option>
            </select>
            <div className="absolute right-3 pointer-events-none text-stone-400"><Plus size={12}/></div>
          </div>
        </div>
      </div>

      {/* 3. TRAMAS Y PERSONAJES (MODO TARJETAS) */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4 border-b border-stone-200 pb-2">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tramas Activas</h3>
          <button onClick={createNewPlot} className="text-amber-600 hover:text-amber-800 text-xs font-bold uppercase flex items-center gap-1 transition-colors bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
            + Nueva Trama
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data.plots || []).map(plot => (
            <div 
              key={plot.id} 
              onClick={() => setExpandedPlotId(plot.id)}
              className="bg-white border border-stone-200 p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition-all cursor-pointer relative group"
            >
              <div className="absolute top-2 right-2 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={16} />
              </div>
              <h4 className="font-serif text-lg font-bold text-stone-800 mb-3 pr-6 truncate">{plot.title || plot.type || "Trama Sin Título"}</h4>
              
              {/* Characters Preview */}
              <div className="flex -space-x-2 overflow-hidden py-1 pl-1 mb-2">
                {plot.characterIds && plot.characterIds.map(charId => {
                  const char = (data.characters || []).find(c => c.id === charId);
                  if (!char) return null;
                  return (
                    <div key={charId} className="w-8 h-8 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-stone-600 shadow-sm" title={char.name}>
                      {char.name ? String(char.name).substring(0,2).toUpperCase() : "?"}
                    </div>
                  );
                })}
                {(!plot.characterIds || plot.characterIds.length === 0) && <span className="text-xs text-stone-400 italic">Sin personajes</span>}
              </div>
              
              {/* Description Preview */}
              {plot.description && (
                <p className="text-xs text-stone-500 line-clamp-2 font-serif italic border-t border-stone-100 pt-2 mt-2">
                  {plot.description}
                </p>
              )}
            </div>
          ))}
          {(data.plots || []).length === 0 && (
            <div className="text-stone-400 text-sm italic p-8 text-center col-span-full border-2 border-dashed border-stone-100 rounded-lg cursor-pointer hover:bg-stone-50 hover:border-stone-200 transition-colors" onClick={createNewPlot}>
              No hay tramas. Haz clic para crear la primera.
            </div>
          )}
        </div>
      </div>

      {/* 4. IDEAS (COLLAGE) */}
      <div>
        <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-2">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Muro de Ideas</h3>
          <button onClick={addIdea} className="text-amber-600 hover:text-amber-800 bg-amber-50 p-2 rounded-full border border-amber-100 transition-colors"><Plus size={20}/></button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(data.ideas || []).map((idea, index) => {
            const rotation = index % 2 === 0 ? 'rotate-1' : '-rotate-1';
            const colors = ['bg-yellow-100', 'bg-orange-50', 'bg-pink-50', 'bg-blue-50'];
            const bgClass = colors[idea.color || 0];

            return (
              <div 
                key={idea.id} 
                className={`${bgClass} p-4 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 hover:scale-105 ${rotation} relative group min-h-[160px] flex flex-col`}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-stone-400/30 rounded-full backdrop-blur-sm shadow-sm border border-white/50"></div> 
                <textarea 
                  className="w-full h-full bg-transparent focus:outline-none resize-none font-serif text-stone-700 text-sm leading-relaxed text-center flex-1 placeholder:text-stone-400/50"
                  value={idea.text}
                  onChange={(e) => updateIdea(idea.id, e.target.value)}
                  placeholder="Escribe..."
                />
                <button 
                  onClick={() => updateData({...data, ideas: data.ideas.filter(i => i.id !== idea.id)})}
                  className="absolute bottom-2 right-2 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14}/>
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

// --- APP SHELL ---
export default function NarrativaOlympus() {
  const [activeTab, setActiveTab] = useState('story');
  const [user, setUser] = useState(null);
  const [stories, setStories] = useState([]);
  const [activeStoryId, setActiveStoryId] = useState(null);
  const [storyData, setStoryData] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const appId = YOUR_FIREBASE_CONFIG.projectId;

  useEffect(() => { 
    if(isDemo || !auth) return;
    const u = onAuthStateChanged(auth, setUser); 
    return () => u(); 
  }, [isDemo]);

  useEffect(() => {
    if (!user) { setStories([]); return; }
    if (isDemo) return; 
    if (!db) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'stories'), orderBy('updatedAt', 'desc'));
    const u = onSnapshot(q, (s) => setStories(s.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => u();
  }, [user, isDemo, appId]);

  useEffect(() => {
    if (!user || !activeStoryId || isDemo) { 
      if(!isDemo) setStoryData(null); 
      return; 
    }
    if (!db) return;
    const u = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'stories', activeStoryId), (d) => d.exists() && setStoryData({id: d.id, ...d.data()}));
    return () => u();
  }, [user, activeStoryId, isDemo, appId]);

  // Manejo de Demo
  const handleDemoLogin = () => {
    setIsDemo(true);
    setUser({ uid: 'demo-user', displayName: 'Visitante' });
    setStories([]);
  };

  const updateStoryData = async (newData) => {
    setStoryData(newData);
    if (isDemo) {
      setStories(prev => prev.map(s => s.id === activeStoryId ? { ...s, ...newData } : s));
      return;
    }
    if (user && activeStoryId && db) {
      setIsSaving(true);
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'stories', activeStoryId), { ...newData, updatedAt: serverTimestamp() }, { merge: true });
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleCreateStory = async () => {
    if (!user) return;
    const newStory = { ...NEW_STORY_TEMPLATE, createdAt: new Date(), updatedAt: new Date() };
    
    if (isDemo) {
      const id = String(Date.now());
      setStories([{ id, ...newStory }, ...stories]);
      setActiveStoryId(id);
      setStoryData({ id, ...newStory });
      return;
    }

    if (db) {
        setIsSaving(true);
        const ref = await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'stories'), { ...NEW_STORY_TEMPLATE, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        setActiveStoryId(ref.id);
        setIsSaving(false);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (isDemo) {
        setStories(stories.filter(s => s.id !== storyId));
        if (activeStoryId === storyId) {
            setActiveStoryId(null);
            setStoryData(null);
        }
        return;
    }
    if (!user || !db) return;
    
    try {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'stories', storyId));
        if (activeStoryId === storyId) {
            setActiveStoryId(null);
            setStoryData(null);
        }
    } catch (e) {
        console.error("Error deleting story:", e);
        alert("Error al eliminar la historia.");
    }
  };

  const navItems = [ { id: 'structure', label: 'Estructura', icon: Columns }, { id: 'world', label: 'Mundo', icon: Globe }, { id: 'characters', label: 'Personajes', icon: Users }, { id: 'story', label: 'Historia', icon: Scroll } ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#fdfbf7] text-stone-800 md:max-w-4xl md:mx-auto md:border-x md:border-stone-200 md:shadow-2xl overflow-x-hidden selection:bg-amber-200">
      <OlympusBackground />
      <GlobalStyles />
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth z-10 relative">
        {(activeStoryId && activeTab !== 'story') 
          ? (activeTab === 'structure' ? <StructureView data={storyData} updateData={updateStoryData}/> : activeTab === 'world' ? <WorldView data={storyData} updateData={updateStoryData}/> : <CharactersView data={storyData} updateData={updateStoryData}/>)
          : <StoryHub 
              user={user} stories={stories} activeStoryId={activeStoryId} setActiveStoryId={setActiveStoryId} data={storyData} 
              updateData={updateStoryData} onCreateStory={handleCreateStory} onDemoLogin={handleDemoLogin} isSaving={isSaving} onDeleteStory={handleDeleteStory}
            />
        }
      </main>
      {user && activeStoryId && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-200 flex justify-between h-16">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-1 flex flex-col items-center justify-center gap-1 border-t-4 transition-all ${activeTab === item.id ? 'border-amber-500 bg-stone-50 text-stone-900' : 'border-transparent text-stone-400'}`}>
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 1.5}/>
              <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}