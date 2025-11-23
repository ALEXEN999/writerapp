import React, { useState, useRef } from "react";

import LoadingView from "../components/ui/LoadingView";
import MarbleCard from "../components/ui/MarbleCard";
import PillarButton from "../components/ui/PillarButton";
import CharacterCard from "../components/ui/CharacterCard";
import SquareAvatar from "../components/ui/SquareAvatar";
import { compressImage } from "../utils/image";
import { getImageSizeKB } from "../utils/image";

import {
  Users,
  Filter,
  Search,
  Sparkles,
  Flame,
  BookOpen,
  Brain,        // ← AÑADIDO
  History,
  Link as LinkIcon,
  Trash2,
  Plus,
  Eye,
  Shirt,
  Zap,
  Check,
  Users2,
  HardDrive,
  Swords,
  Edit2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";

const CHAR_IMPORTANCE = ["Principal", "Secundario", "Terciario"];
const CHAR_CSM = ["Maestro", "Agente", "Lider", "No"];
const CHAR_NOBLE = ["Si", "No"];
const DEFAULT_RACES = ["Humano", "Elfo", "Enano"];
const DEFAULT_WORLDS = ["Tierra"];
// --- NUEVA VISTA DE PERSONAJES ---
const CharactersView = ({ data, updateData }) => {
    // PROTECCIÓN CONTRA OBJETOS EN GETNAMES
    const getNames = (list) => (list || []).map(i => {
        if (typeof i === 'string') return i;
        return i?.name || "Sin Nombre";
    }).filter(n => typeof n === 'string');

    const dynamicRaces = getNames(data.species).length > 0 ? getNames(data.species) : DEFAULT_RACES;
    const dynamicWorlds = getNames(data.worlds).length > 0 ? getNames(data.worlds) : DEFAULT_WORLDS;

  const [filters, setFilters] = useState({
    importance: "Todas",
    race: "Todas",
    world: "Todos",
    csm: "Todos",
    noble: "Todos"
  });
  
  const [expandedCharId, setExpandedCharId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newRelationId, setNewRelationId] = useState(""); // Para añadir relaciones
  const [newRelationType, setNewRelationType] = useState("ally"); // 'ally' | 'enemy'
  const fileInputRef = useRef(null); 

  if (!data) return <LoadingView />;

  const addChar = () => {
    const newChar = { 
      id: Date.now(), 
      name: "Nuevo Personaje", 
      importance: "Secundario", 
      race: "Humano", 
      world: "Tierra", 
      csm: "No", 
      noble: "No",
      showPersonality: false, personalityText: "",
      showAppearance: false, appearanceText: "",
      showClothing: false, clothingText: "",
      showPowers: false, powersText: "",
      showHistory: false, historyText: "",
      characterPlots: [], imageUrl: "",
      relationships: [] // Nuevo campo
    };
    updateData({ ...data, characters: [newChar, ...data.characters] });
    setExpandedCharId(newChar.id);
    setIsEditing(true); 
  };

  const updateChar = (id, field, val) => {
    updateData({ ...data, characters: data.characters.map(c => c.id === id ? { ...c, [field]: val } : c) });
  };

  const addCharacterPlot = (charId) => {
    const char = data.characters.find(c => c.id === charId);
    if(!char) return;
    const newPlot = { id: Date.now(), text: "" };
    updateChar(charId, 'characterPlots', [...(char.characterPlots || []), newPlot]);
  };

  const updateCharacterPlot = (charId, plotId, text) => {
     const char = data.characters.find(c => c.id === charId);
     if(!char) return;
     const newPlots = (char.characterPlots || []).map(p => p.id === plotId ? { ...p, text } : p);
     updateChar(charId, 'characterPlots', newPlots);
  };

  const deleteCharacterPlot = (charId, plotId) => {
     const char = data.characters.find(c => c.id === charId);
     if(!char) return;
     const newPlots = (char.characterPlots || []).filter(p => p.id !== plotId);
     updateChar(charId, 'characterPlots', newPlots);
  };

  // --- LOGICA RELACIONES ---
  const addRelationship = (charId) => {
      if(!newRelationId) return;
      const char = data.characters.find(c => c.id === charId);
      if(!char) return;
      
      const existing = (char.relationships || []).find(r => r.targetId === newRelationId);
      if(existing) return alert("Ya existe una relación con este personaje.");

      const newRel = { targetId: newRelationId, type: newRelationType };
      updateChar(charId, 'relationships', [...(char.relationships || []), newRel]);
      setNewRelationId("");
  };

  const removeRelationship = (charId, targetId) => {
      const char = data.characters.find(c => c.id === charId);
      if(!char) return;
      updateChar(charId, 'relationships', (char.relationships || []).filter(r => r.targetId !== targetId));
  };

  const deleteChar = (id) => { 
    if(confirm("¿Eliminar personaje?")) {
        updateData({ ...data, characters: data.characters.filter(c => c.id !== id) }); 
        setExpandedCharId(null);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const compressedBase64 = await compressImage(file);
        updateChar(expandedCharId, 'imageUrl', compressedBase64);
    } catch (error) {
        console.error(error);
        alert("Error al procesar la imagen.");
    }
  };

  // Lógica de Filtrado
  const filteredChars = (data.characters || []).filter(char => {
    if (filters.importance !== "Todas" && char.importance !== filters.importance) return false;
    if (filters.race !== "Todas" && char.race !== filters.race) return false;
    if (filters.world !== "Todos" && char.world !== filters.world) return false;
    if (filters.csm !== "Todos" && char.csm !== filters.csm) return false;
    if (filters.noble !== "Todos" && char.noble !== filters.noble) return false;
    return true;
  });

  const FilterSelect = ({ label, value, options, onChange }) => (
    <div className="flex flex-col w-full">
      <label className="text-[8px] font-bold text-stone-400 uppercase mb-1 ml-1 tracking-widest">{label}</label>
      <select 
        className="bg-white border border-stone-300 text-stone-700 text-[10px] font-bold p-1.5 focus:outline-none focus:border-amber-400 cursor-pointer w-full rounded-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value={label.endsWith('s') ? "Todos" : "Todas"}>Todas</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  const DataBadge = ({ label, value }) => (
    <div className="flex flex-col bg-stone-50 p-2 border border-stone-200">
        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-xs font-serif font-bold text-stone-800">{value || "-"}</span>
    </div>
  );

  // --- EDITOR DE PERSONAJE FULLSCREEN ---
  const expandedChar = (data.characters || []).find(c => c.id === expandedCharId);

  if (expandedCharId && expandedChar) {
      const sections = [
        { key: 'Personality', label: '1. Personalidad', icon: Brain },
        { key: 'Appearance', label: '2. Aspecto', icon: Eye },
        { key: 'Clothing', label: '3. Vestimenta', icon: Shirt },
        { key: 'Powers', label: '4. Poderes', icon: Zap },
        { key: 'History', label: '5. Historia', icon: History },
      ];

      return (
        <div className="fixed inset-0 z-50 bg-[#fdfbf7] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
             {/* Header */}
             <div className="flex items-center justify-between p-4 md:p-6 border-b border-stone-200 bg-white shadow-sm">
                 <button onClick={() => { setExpandedCharId(null); setIsEditing(false); }} className="text-stone-500 hover:text-stone-800 flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                   <ArrowLeft size={18}/> Volver
                 </button>
                 
                 {isEditing ? (
                     <button onClick={() => setIsEditing(false)} className="text-amber-600 hover:text-amber-800 flex items-center gap-2 font-bold text-xs uppercase tracking-wider bg-amber-50 px-4 py-2 border border-amber-200 rounded-none hover:bg-amber-50">
                        <Check size={16}/> Listo
                     </button>
                 ) : (
                     <button onClick={() => setIsEditing(true)} className="text-stone-500 hover:text-amber-600 flex items-center gap-2 font-bold text-xs uppercase tracking-wider bg-white px-4 py-2 border border-stone-200 hover:border-amber-400 transition-all rounded-none">
                        <Edit2 size={14}/> Editar
                     </button>
                 )}
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-3xl mx-auto w-full">
                <div className="flex flex-col items-center mb-8">
                    <div className="transform mb-6 shadow-lg border border-stone-300 bg-white p-1 relative">
                        <SquareAvatar 
                            char={expandedChar} 
                            size="xl" 
                            editable={isEditing}
                            onClick={() => isEditing && fileInputRef.current.click()}
                        />
                        {expandedChar.imageUrl && (
                           <div className="absolute -bottom-6 left-0 right-0 text-center">
                             <span className="text-[8px] text-stone-400 flex items-center justify-center gap-1">
                               <HardDrive size={8} /> {getImageSizeKB(expandedChar.imageUrl)} KB
                             </span>
                           </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                    {isEditing ? (
                        <input 
                          className="font-serif font-bold text-3xl text-center text-stone-900 bg-transparent border-b-2 border-transparent hover:border-stone-300 focus:border-amber-500 focus:outline-none w-full placeholder:text-stone-300 pb-1 rounded-none"
                          value={expandedChar.name} 
                          onChange={(e) => updateChar(expandedChar.id, 'name', e.target.value)}
                          placeholder="Nombre del Personaje"
                        />
                    ) : (
                        <h1 className="font-serif font-bold text-4xl text-center text-stone-900 tracking-tight">{expandedChar.name || "Sin Nombre"}</h1>
                    )}
                </div>

                <div className="bg-white border border-stone-200 p-8 shadow-sm space-y-10">
                    
                    {/* MODO EDICIÓN */}
                    {isEditing ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="flex flex-col">
                                    <label className="text-[9px] font-bold text-stone-400 uppercase mb-1">Importancia</label>
                                    <select className="p-2 bg-stone-50 border border-stone-300 focus:border-amber-500 outline-none rounded-none" value={expandedChar.importance} onChange={(e) => updateChar(expandedChar.id, 'importance', e.target.value)}>
                                        {CHAR_IMPORTANCE.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[9px] font-bold text-stone-400 uppercase mb-1">Raza</label>
                                    <select className="p-2 bg-stone-50 border border-stone-300 focus:border-amber-500 outline-none rounded-none" value={expandedChar.race} onChange={(e) => updateChar(expandedChar.id, 'race', e.target.value)}>
                                        {dynamicRaces.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[9px] font-bold text-stone-400 uppercase mb-1">Mundo</label>
                                    <select className="p-2 bg-stone-50 border border-stone-300 focus:border-amber-500 outline-none rounded-none" value={expandedChar.world} onChange={(e) => updateChar(expandedChar.id, 'world', e.target.value)}>
                                        {dynamicWorlds.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[9px] font-bold text-stone-400 uppercase mb-1">CSM</label>
                                    <select className="p-2 bg-stone-50 border border-stone-300 focus:border-amber-500 outline-none rounded-none" value={expandedChar.csm} onChange={(e) => updateChar(expandedChar.id, 'csm', e.target.value)}>
                                        {CHAR_CSM.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[9px] font-bold text-stone-400 uppercase mb-1">Noble</label>
                                    <select className="p-2 bg-stone-50 border border-stone-300 focus:border-amber-500 outline-none rounded-none" value={expandedChar.noble} onChange={(e) => updateChar(expandedChar.id, 'noble', e.target.value)}>
                                        {CHAR_NOBLE.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            {/* SECCIONES DINÁMICAS (TOGGLES) */}
                            <div className="pt-8 border-t border-stone-100">
                                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Detalles Adicionales</h4>
                                <div className="flex flex-wrap gap-3 mb-6">
                                    {sections.map(sec => (
                                        <button
                                            key={sec.key}
                                            onClick={() => updateChar(expandedChar.id, `show${sec.key}`, !expandedChar[`show${sec.key}`])}
                                            className={`px-4 py-2 text-[10px] font-bold uppercase border transition-all flex items-center gap-2 ${expandedChar[`show${sec.key}`] ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-400 border-stone-200 hover:border-amber-500'}`}
                                        >
                                            <sec.icon size={12} /> {sec.label}
                                        </button>
                                    ))}
                                </div>

                                {sections.map(sec => expandedChar[`show${sec.key}`] && (
                                    <div key={sec.key} className="mb-6 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[10px] font-bold text-amber-700 uppercase mb-2 block flex items-center gap-2">
                                           <sec.icon size={12} /> {sec.label}
                                        </label>
                                        <textarea 
                                            className="w-full p-4 bg-stone-50 border border-stone-300 focus:border-amber-500 focus:outline-none min-h-[100px] font-serif text-stone-700 resize-y text-sm rounded-none"
                                            value={expandedChar[`${sec.key.toLowerCase()}Text`] || ""}
                                            onChange={(e) => updateChar(expandedChar.id, `${sec.key.toLowerCase()}Text`, e.target.value)}
                                            placeholder={`Escribe sobre ${sec.label.toLowerCase()}...`}
                                        />
                                    </div>
                                ))}
                            </div>
                            
                            {/* --- SECCIÓN RELACIONES (EDICIÓN) --- */}
                            <div className="pt-8 border-t border-stone-200">
                                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Users2 size={14}/> Relaciones
                                </h4>
                                <div className="bg-stone-50 p-4 border border-stone-200 mb-4">
                                    <div className="flex gap-2 mb-2">
                                        <select 
                                            className="flex-1 p-2 border border-stone-300 text-sm"
                                            value={newRelationId}
                                            onChange={e => setNewRelationId(parseInt(e.target.value))}
                                        >
                                            <option value="">Seleccionar Personaje...</option>
                                            {data.characters.filter(c => c.id !== expandedChar.id).map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <div className="flex border border-stone-300">
                                            <button onClick={()=>setNewRelationType('ally')} className={`px-3 py-1 text-xs font-bold uppercase ${newRelationType === 'ally' ? 'bg-blue-100 text-blue-700' : 'bg-white text-stone-400'}`}>Aliado</button>
                                            <button onClick={()=>setNewRelationType('enemy')} className={`px-3 py-1 text-xs font-bold uppercase ${newRelationType === 'enemy' ? 'bg-red-100 text-red-700' : 'bg-white text-stone-400'}`}>Enemigo</button>
                                        </div>
                                        <button onClick={() => addRelationship(expandedChar.id)} disabled={!newRelationId} className="bg-stone-800 text-white px-3 py-1 uppercase text-xs font-bold">Añadir</button>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    {(expandedChar.relationships || []).map((rel, idx) => {
                                        const target = data.characters.find(c => c.id === rel.targetId);
                                        if(!target) return null;
                                        const isAlly = rel.type === 'ally';
                                        return (
                                            <div key={idx} className={`flex justify-between items-center p-3 border-l-4 shadow-sm bg-white ${isAlly ? 'border-l-blue-500' : 'border-l-red-500'}`}>
                                                <div className="flex items-center gap-3">
                                                    {isAlly ? <HeartHandshake size={16} className="text-blue-500"/> : <Swords size={16} className="text-red-500"/>}
                                                    <span className="font-serif font-bold text-stone-700">{target.name}</span>
                                                </div>
                                                <button onClick={() => removeRelationship(expandedChar.id, rel.targetId)} className="text-stone-400 hover:text-red-500"><X size={14}/></button>
                                            </div>
                                        )
                                    })}
                                    {(expandedChar.relationships || []).length === 0 && <p className="text-xs text-stone-400 italic">Sin relaciones definidas.</p>}
                                </div>
                            </div>

                            {/* TRAMAS DINÁMICAS */}
                            <div className="pt-8 border-t border-stone-200">
                                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                   <Swords size={14}/> Tramas del Personaje
                                </h4>
                                <div className="space-y-4">
                                    {(expandedChar.characterPlots || []).map(plot => (
                                        <div key={plot.id} className="flex gap-3 items-start">
                                            <textarea 
                                                className="flex-1 p-3 bg-white border border-stone-300 text-sm font-serif text-stone-700 focus:border-amber-500 focus:outline-none resize-none h-20 rounded-none"
                                                value={plot.text}
                                                onChange={(e) => updateCharacterPlot(expandedChar.id, plot.id, e.target.value)}
                                                placeholder="Describe una trama específica para este personaje..."
                                            />
                                            <button onClick={() => deleteCharacterPlot(expandedChar.id, plot.id)} className="text-stone-300 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                    <button onClick={() => addCharacterPlot(expandedChar.id)} className="text-xs font-bold text-amber-600 hover:text-amber-800 uppercase flex items-center gap-2 mt-2 bg-amber-50 px-4 py-2 border border-amber-100 hover:border-amber-300 w-full justify-center transition-colors">
                                        <Plus size={14}/> Agregar Trama
                                    </button>
                                </div>
                            </div>

                            <div className="pt-10">
                                <button onClick={() => deleteChar(expandedChar.id)} className="w-full py-4 text-red-600 border border-red-200 hover:bg-red-50 uppercase text-xs font-bold flex items-center justify-center gap-2 transition-colors rounded-none">
                                    <Trash2 size={16}/> Eliminar Personaje
                                </button>
                            </div>
                        </>
                    ) : (
                        /* MODO LECTURA */
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <DataBadge label="Importancia" value={expandedChar.importance} />
                                <DataBadge label="Raza" value={expandedChar.race} />
                                <DataBadge label="Mundo" value={expandedChar.world} />
                                <DataBadge label="CSM" value={expandedChar.csm} />
                                <DataBadge label="Noble" value={expandedChar.noble} />
                            </div>

                            <div className="space-y-8 pt-8 border-t border-stone-100">
                                {sections.map(sec => expandedChar[`show${sec.key}`] && expandedChar[`${sec.key.toLowerCase()}Text`] && (
                                    <div key={sec.key}>
                                        <h4 className="text-[10px] font-bold text-amber-800/60 uppercase mb-2 tracking-widest flex items-center gap-2">
                                           <sec.icon size={12} /> {sec.label}
                                        </h4>
                                        <p className="font-serif text-base text-stone-800 leading-relaxed whitespace-pre-wrap pl-1 border-l-2 border-amber-200">
                                            {expandedChar[`${sec.key.toLowerCase()}Text`]}
                                        </p>
                                    </div>
                                ))}
                                
                                {/* RELACIONES MODO LECTURA */}
                                {(expandedChar.relationships || []).length > 0 && (
                                    <div className="mt-8 pt-8 border-t border-stone-100">
                                        <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                                            <Users2 size={14}/> Relaciones
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {expandedChar.relationships.map((rel, idx) => {
                                                const target = data.characters.find(c => c.id === rel.targetId);
                                                if(!target) return null;
                                                const isAlly = rel.type === 'ally';
                                                return (
                                                    <div key={idx} className={`flex items-center gap-3 p-3 border-l-4 shadow-sm bg-white ${isAlly ? 'border-l-blue-500' : 'border-l-red-500'}`}>
                                                        <div className={`p-2 rounded-full ${isAlly ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                                                            {isAlly ? <HeartHandshake size={16}/> : <Swords size={16}/>}
                                                        </div>
                                                        <div>
                                                            <div className="font-serif font-bold text-stone-800 leading-tight">{target.name}</div>
                                                            <div className={`text-[10px] font-bold uppercase ${isAlly ? 'text-blue-400' : 'text-red-400'}`}>{isAlly ? "Aliado" : "Enemigo"}</div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                                
                                {(expandedChar.characterPlots || []).length > 0 && (
                                   <div className="mt-8 pt-8 border-t border-stone-100">
                                      <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                                         <Swords size={14}/> Tramas Activas
                                      </h4>
                                      <ul className="space-y-3">
                                         {expandedChar.characterPlots.map(p => (
                                            <li key={p.id} className="p-4 bg-stone-50 border-l-4 border-amber-500 text-base font-serif text-stone-800 shadow-sm">
                                                {p.text}
                                            </li>
                                         ))}
                                      </ul>
                                   </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
             </div>
        </div>
      );
  }

  return (
    <div className="p-4 md:p-8 pb-40 animate-in fade-in">
      <div className="mb-8 bg-stone-50 border border-stone-200 p-4 shadow-inner">
        <div className="flex items-center gap-2 mb-3 text-amber-700 font-bold text-xs uppercase tracking-wider">
          <Filter size={14} /> Filtro de Personajes
        </div>
        <div className="grid grid-cols-3 gap-3 pb-2">
          <FilterSelect label="Importancia" value={filters.importance} options={CHAR_IMPORTANCE} onChange={v => setFilters({...filters, importance: v})} />
          <FilterSelect label="Raza" value={filters.race} options={dynamicRaces} onChange={v => setFilters({...filters, race: v})} />
          <FilterSelect label="Mundo" value={filters.world} options={dynamicWorlds} onChange={v => setFilters({...filters, world: v})} />
          <FilterSelect label="CSM" value={filters.csm} options={CHAR_CSM} onChange={v => setFilters({...filters, csm: v})} />
          <FilterSelect label="Noble" value={filters.noble} options={CHAR_NOBLE} onChange={v => setFilters({...filters, noble: v})} />
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="font-serif font-bold text-xl text-stone-800">Personajes ({filteredChars.length})</h3>
        <PillarButton onClick={addChar} variant="gold" icon={Plus}>Añadir Personaje</PillarButton>
      </div>

      {/* GRID DE 3 COLUMNAS MINIMO PARA MOVIL */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
        {filteredChars.map(char => (
          <CharacterCard 
            key={char.id} 
            char={char} 
            onClick={() => { setExpandedCharId(char.id); setIsEditing(false); }} 
          />
        ))}
        {filteredChars.length === 0 && (
          <div className="col-span-full text-center py-12 text-stone-400 italic border-2 border-dashed border-stone-200 rounded-lg">
            No se encontraron personajes con estos filtros.
          </div>
        )}
      </div>
    </div>
  );
};

export default CharactersView;
