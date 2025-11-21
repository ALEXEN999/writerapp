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
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy 
} from "firebase/firestore";
import { 
  Book, Users, Map, Plus, Trash2, MoreHorizontal, Globe, Zap, Feather, Star, Columns, Scroll, LogOut, User, ArrowLeft, Loader2, AlertTriangle, Copy, EyeOff, Cloud, CheckCircle2, Edit2, X, StickyNote, LayoutGrid, Maximize2, Check
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

// --- Plantillas ---
const STRUCTURE_TEMPLATES = {
  heroJourney: { name: "El Viaje del Héroe", steps: ["Mundo Ordinario", "La Llamada", "Rechazo", "Mentor", "Umbral", "Pruebas", "Acercamiento", "Ordalía", "Recompensa", "Camino de Vuelta", "Resurrección", "Elixir"] },
  threeActs: { name: "3 Actos", steps: ["Planteamiento", "Incidente", "Giro 1", "Confrontación", "Midpoint", "Giro 2", "Resolución", "Clímax", "Final"] }
};
const PLOT_ARCHETYPES = ["Vencer al Monstruo", "Pobreza a Riqueza", "La Búsqueda", "Viaje y Retorno", "Comedia", "Tragedia", "Renacimiento"];

const NEW_STORY_TEMPLATE = { 
  title: "Nueva Historia", 
  plotArchetypes: ["La Búsqueda"], 
  plots: [], 
  ideas: [], 
  structureType: "heroJourney", 
  structurePoints: [], 
  diegesis: "", 
  lore: [], 
  species: ["Humanos"], 
  subplots: [], 
  characters: [] 
};

// --- Componentes Visuales ---
const OlympusBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 bg-[#fdfbf7]">
    <div className="absolute top-0 left-4 bottom-0 w-[1px] bg-stone-200"></div>
    <div className="absolute top-0 right-4 bottom-0 w-[1px] bg-stone-200"></div>
  </div>
);

const MarbleCard = ({ children, header, onMore, onClick, className="" }) => (
  <div onClick={onClick} className={`relative bg-white border border-stone-200 shadow-sm mb-6 transition-all hover:shadow-md hover:border-amber-200 group ${onClick ? 'cursor-pointer' : ''} ${className}`}>
    <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    {(header || onMore) && (
      <div className="flex justify-between items-center p-6 border-b border-stone-100 bg-stone-50/50">
        <div className="font-serif font-bold text-stone-800 text-lg uppercase tracking-widest truncate pr-4">{header}</div>
        {onMore && <button onClick={(e) => { e.stopPropagation(); onMore(); }} className="text-stone-400 hover:text-amber-600"><MoreHorizontal size={20}/></button>}
      </div>
    )}
    <div className="p-1">{children}</div>
  </div>
);

const PillarButton = ({ onClick, children, variant="primary", icon: Icon, disabled, className="" }) => {
  const variants = {
    primary: `bg-stone-800 text-amber-50 border-stone-800 hover:bg-stone-900 hover:border-amber-400`,
    gold: `bg-white text-amber-700 border-amber-500 hover:bg-amber-50`,
    ghost: `bg-transparent text-stone-500 border-transparent hover:bg-stone-100 hover:text-stone-900`
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`px-6 py-3 font-serif text-xs font-bold uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 border disabled:opacity-50 ${variants[variant] || variants.primary} ${className}`}>
      {Icon && <Icon size={14} />} {children}
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
  <div className="flex items-center gap-2 px-3 py-1 bg-white/80 border border-stone-200 rounded-full shadow-sm transition-all duration-300">
    {isSaving ? (
      <>
        <Loader2 size={14} className="animate-spin text-amber-500" />
        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Guardando...</span>
      </>
    ) : (
      <>
        <Cloud size={14} className="text-green-500" />
        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">En línea</span>
      </>
    )}
  </div>
);

// --- Módulos ---
const StructureView = ({ data, updateData }) => {
  if (!data) return <LoadingView />;
  const applyTemplate = (type) => {
    if (data.structurePoints?.length > 0 && !confirm("¿Reiniciar?")) return;
    const points = STRUCTURE_TEMPLATES[type].steps.map((step, i) => ({ id: Date.now()+i, title: step, content: "", completed: false }));
    updateData({ ...data, structureType: type, structurePoints: points });
  };
  return (
    <div className="pb-32 px-4 md:px-8 pt-6 animate-in fade-in">
      <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2">
        {Object.entries(STRUCTURE_TEMPLATES).map(([key, tpl]) => (
          <button key={key} onClick={() => applyTemplate(key)} className={`px-4 py-2 text-[10px] font-bold uppercase border ${data.structureType === key ? 'bg-stone-800 text-white' : 'bg-white text-stone-500'}`}>{tpl.name}</button>
        ))}
      </div>
      <div className="border-l border-stone-300 pl-8 ml-4">
        {(data.structurePoints || []).map((point) => (
          <div key={point.id} className="mb-8 relative">
            <div className={`absolute -left-[41px] top-1 w-5 h-5 border-2 transform rotate-45 cursor-pointer ${point.completed ? 'bg-amber-500 border-amber-500' : 'bg-white border-stone-300'}`} onClick={() => updateData({...data, structurePoints: data.structurePoints.map(p => p.id === point.id ? {...p, completed: !p.completed} : p)})}></div>
            <div className={point.completed ? 'opacity-50' : ''}>
              <h3 className="font-serif text-lg text-stone-900 mb-2">{point.title}</h3>
              <textarea className="w-full p-4 bg-white border border-stone-200 text-stone-700 font-serif focus:outline-none focus:border-amber-400" rows={3} value={point.content} onChange={(e) => updateData({...data, structurePoints: data.structurePoints.map(p => p.id === point.id ? {...p, content: e.target.value} : p)})} placeholder="..." />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WorldView = ({ data, updateData }) => {
  if (!data) return <LoadingView />;
  return (
    <div className="p-6 pb-32 space-y-8 animate-in fade-in">
      <MarbleCard header="Leyes de la Realidad">
        <textarea className="w-full p-4 min-h-[200px] bg-transparent focus:outline-none font-serif text-lg leading-relaxed resize-none text-stone-800 placeholder:text-stone-300" placeholder="Escribe aquí..." value={data.diegesis || ""} onChange={(e) => updateData({...data, diegesis: e.target.value})} />
      </MarbleCard>
      <div>
        <div className="flex justify-between mb-4 items-center"><h3 className="text-xs font-bold text-stone-400 uppercase">Especies</h3></div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(data.species || []).map((specie, idx) => (
            <div key={idx} className="p-3 bg-white border border-stone-200 flex justify-between items-center"><span className="font-serif font-bold text-sm">{specie}</span><button onClick={() => updateData({...data, species: data.species.filter((_, i) => i !== idx)})}><Trash2 size={12} className="text-stone-300 hover:text-red-500"/></button></div>
          ))}
        </div>
        <input className="w-full p-3 bg-stone-50 border-b border-stone-200 focus:outline-none font-serif text-center" placeholder="+ Nueva Especie" onKeyPress={(e) => { if (e.key === 'Enter') { updateData({...data, species: [...(data.species||[]), e.target.value]}); e.target.value = ''; }}} />
      </div>
    </div>
  );
};

const CharactersView = ({ data, updateData }) => {
  if (!data) return <LoadingView />;
  const updateChar = (id, f, v) => updateData({ ...data, characters: data.characters.map(c => c.id === id ? { ...c, [f]: v } : c) });
  return (
    <div className="p-6 pb-32 space-y-8 animate-in fade-in">
      <div className="flex justify-end"><PillarButton onClick={() => updateData({ ...data, characters: [...(data.characters||[]), { id: Date.now(), name: "Nuevo", species: data.species?.[0]||"" }] })} variant="gold" icon={Plus}>Personaje</PillarButton></div>
      {(data.characters || []).map(char => (
        <MarbleCard key={char.id} className="pt-8">
          <div className="text-center mb-6">
            <input className="text-2xl font-serif font-bold text-center w-full bg-transparent focus:outline-none" value={char.name} onChange={(e) => updateChar(char.id, 'name', e.target.value)} />
            <select className="text-xs font-bold uppercase text-stone-400 bg-transparent mt-2 text-center block w-full" value={char.species} onChange={(e) => updateChar(char.id, 'species', e.target.value)}>
              <option value="">Especie...</option>
              {(data.species || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 px-4 pb-4">
            <textarea className="bg-stone-50 p-2 text-sm font-serif resize-none h-20 border border-stone-100 focus:border-amber-300" placeholder="Deseo..." value={char.charPlot || ""} onChange={(e) => updateChar(char.id, 'charPlot', e.target.value)} />
            <textarea className="bg-stone-50 p-2 text-sm font-serif resize-none h-20 border border-stone-100 focus:border-amber-300" placeholder="Miedo..." value={char.charSubplot || ""} onChange={(e) => updateChar(char.id, 'charSubplot', e.target.value)} />
          </div>
          <button onClick={() => updateData({...data, characters: data.characters.filter(c => c.id !== char.id)})} className="absolute top-2 right-2 text-stone-300 hover:text-red-500"><Trash2 size={14}/></button>
        </MarbleCard>
      ))}
    </div>
  );
};

// --- PANTALLA DE HISTORIA AVANZADA ---

const StoryHub = ({ user, stories, activeStoryId, setActiveStoryId, data, updateData, onCreateStory, onDemoLogin, isSaving }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newArchetype, setNewArchetype] = useState("");
  
  // Estados para el Editor de Trama Fullscreen
  const [expandedPlotId, setExpandedPlotId] = useState(null);

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
          <button onClick={onDemoLogin} className="w-full flex items-center justify-center gap-3 bg-stone-800 text-amber-50 border border-stone-800 p-4 hover:bg-stone-900 shadow-sm">
            <EyeOff size={18}/> <span className="font-bold text-sm">Modo Demo (Offline)</span>
          </button>
        </div>
      </div>
    );
  }

  if (!activeStoryId) {
    return (
      <div className="p-6 md:p-8 pb-32 animate-in fade-in">
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
              <MarbleCard key={s.id} onClick={() => setActiveStoryId(s.id)} className="cursor-pointer hover:border-amber-400">
                <div className="p-6"><h3 className="font-serif text-xl font-bold text-stone-900">{s.title || "Sin Título"}</h3><div className="text-xs font-bold text-stone-400 mt-1 uppercase">{(s.plotArchetypes || []).join(", ") || "Sin Arquetipo"}</div></div>
              </MarbleCard>
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

                {/* Sidebar: Characters & Actions */}
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
                                {char.name ? char.name.substring(0,2).toUpperCase() : "?"}
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
             </div>
          </div>
        </div>
      )}

      {/* HEADER DE LA HISTORIA PRINCIPAL */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button onClick={() => setActiveStoryId(null)} className="text-xs font-bold uppercase flex items-center gap-2 text-stone-400 hover:text-stone-800 mb-4"><ArrowLeft size={14}/> Volver</button>
          <div className="relative group">
            {isEditingTitle ? (
              <input 
                autoFocus
                className="text-3xl md:text-5xl font-serif font-bold w-full bg-transparent border-b-2 border-amber-400 focus:outline-none text-stone-900 placeholder:text-stone-300 pb-2"
                value={data.title||""} 
                onChange={(e) => updateData({...data, title: e.target.value})} 
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                placeholder="TÍTULO" 
              />
            ) : (
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 pb-2 border-b-2 border-transparent relative inline-block group-hover:border-stone-100 transition-all cursor-text" onClick={() => setIsEditingTitle(true)}>
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
        <CloudStatus isSaving={isSaving} />
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
                      {char.name.substring(0,2).toUpperCase()}
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

  const navItems = [ { id: 'structure', label: 'Estructura', icon: Columns }, { id: 'world', label: 'Mundo', icon: Globe }, { id: 'characters', label: 'Elenco', icon: Users }, { id: 'story', label: 'Historia', icon: Scroll } ];

  return (
    <div className="fixed inset-0 flex flex-col bg-[#fdfbf7] text-stone-800 font-sans md:max-w-md md:mx-auto md:border-x md:border-stone-200 md:shadow-2xl overflow-hidden selection:bg-amber-200">
      <OlympusBackground />
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth z-10 relative">
        {(activeStoryId && activeTab !== 'story') 
          ? (activeTab === 'structure' ? <StructureView data={storyData} updateData={updateStoryData}/> : activeTab === 'world' ? <WorldView data={storyData} updateData={updateStoryData}/> : <CharactersView data={storyData} updateData={updateStoryData}/>)
          : <StoryHub 
              user={user} stories={stories} activeStoryId={activeStoryId} setActiveStoryId={setActiveStoryId} data={storyData} 
              updateData={updateStoryData} onCreateStory={handleCreateStory} onDemoLogin={handleDemoLogin} isSaving={isSaving}
            />
        }
      </main>
      {user && activeStoryId && (
        <nav className="absolute bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-200 flex justify-between h-16">
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