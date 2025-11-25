import React, { useState } from "react";
import MarbleCard from "../components/ui/MarbleCard";
import PillarButton from "../components/ui/PillarButton";
import LoadingView from "../components/ui/LoadingView";
import CloudStatus from "../components/ui/CloudStatus";
import FullScreenEditor from "../components/entity/FullScreenEditor";

import {
  Book,
  Loader2,
  X,
  AlertTriangle,
  User,
  LogOut,
  Plus,
  Trash2,
  ArrowLeft,
  Edit2,
  Maximize2,
  StickyNote,
  Check,
  CheckCircle2,
} from "lucide-react";

import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const PLOT_ARCHETYPES = [
  "Vencer al Monstruo",
  "Pobreza a Riqueza",
  "La Búsqueda",
  "Viaje y Retorno",
  "Comedia",
  "Tragedia",
  "Renacimiento",
];

const StoryHub = ({
  user,
  stories,
  activeStoryId,
  setActiveStoryId,
  data,
  updateData,
  onCreateStory,
  onDemoLogin,
  isSaving,
  onDeleteStory,
  auth, // 👈 le pasamos auth desde App.jsx
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newArchetype, setNewArchetype] = useState("");

  // Estados para el Editor de Trama Fullscreen
  const [expandedPlotId, setExpandedPlotId] = useState(null);
  const [isEditingPlot, setIsEditingPlot] = useState(false);

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
    const current = data?.plotArchetypes || [];
    if (!current.includes(arch)) {
      updateData({ ...data, plotArchetypes: [...current, arch] });
    }
    setNewArchetype("");
  };

  const removeArchetype = (arch) => {
    updateData({
      ...data,
      plotArchetypes: (data.plotArchetypes || []).filter((a) => a !== arch),
    });
  };

  // TRAMAS (Funciones)
  const createNewPlot = () => {
    const newPlot = {
      id: Date.now(),
      title: "Nueva Trama",
      description: "",
      characterIds: [],
    };
    updateData({ ...data, plots: [...(data.plots || []), newPlot] });
    setExpandedPlotId(newPlot.id);
    setIsEditingPlot(false);
  };

  const removePlot = (id) => {
    updateData({
      ...data,
      plots: (data.plots || []).filter((p) => p.id !== id),
    });
    if (expandedPlotId === id) setExpandedPlotId(null);
  };

  const updateExpandedPlot = (field, value) => {
    const updatedPlots = (data.plots || []).map((p) =>
      p.id === expandedPlotId ? { ...p, [field]: value } : p
    );
    updateData({ ...data, plots: updatedPlots });
  };

  const toggleCharForExpandedPlot = (charId) => {
    if (!isEditingPlot) return; //  si está en lectura, no hace nada

    const currentPlot = (data.plots || []).find((p) => p.id === expandedPlotId);
    if (!currentPlot) return;

    const currentIds = currentPlot.characterIds || [];
    const newIds = currentIds.includes(charId)
      ? currentIds.filter((id) => id !== charId)
      : [...currentIds, charId];

    updateExpandedPlot("characterIds", newIds);
};

  // IDEAS
  const addIdea = () => {
    const newIdea = {
      id: Date.now(),
      text: "Nueva idea brillante...",
      x: Math.random() * 5,
      y: Math.random() * 5,
      color: Math.floor(Math.random() * 3),
    };
    updateData({ ...data, ideas: [newIdea, ...(data.ideas || [])] });
  };

  const updateIdea = (id, text) => {
    updateData({
      ...data,
      ideas: data.ideas.map((i) => (i.id === id ? { ...i, text } : i)),
    });
  };

  // --- RENDERIZADO ---

  // 1) PANTALLA DE LOGIN
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-[#fdfbf7]">
        <div className="mb-8 border-4 border-amber-500 p-4 bg-stone-800 shadow-xl">
          <Book size={48} className="text-amber-50" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">
          NARRATIVA PRO
        </h1>
        <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-12">
          Edición Olimpo
        </p>
        <div className="space-y-4 w-full max-w-sm">
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-stone-300 p-4 hover:bg-stone-50 shadow-sm"
          >
            {isLoggingIn ? (
              <Loader2 className="animate-spin" />
            ) : (
              <span className="font-bold text-stone-700">
                Conectar con Google
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 2) PANTALLA DE BIBLIOTECA (SIN HISTORIA ACTIVA)
  if (!activeStoryId) {
    return (
      <div className="p-6 md:p-8 pb-32 animate-in fade-in relative">
        {/* --- MODAL DE BORRADO --- */}
        {deletingStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white border border-stone-300 shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => setDeletingStory(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
              >
                <X size={20} />
              </button>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="bg-red-50 p-3 rounded-full mb-4 text-red-500">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="font-serif font-bold text-xl text-stone-900">
                  ¿Eliminar Historia?
                </h3>
                <p className="text-sm text-stone-500 mt-2">
                  Esta acción no se puede deshacer. Se perderán todos los
                  personajes, tramas y configuraciones.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400 text-center">
                  Escribe el nombre exacto para confirmar:
                </p>
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
                  onClick={() => {
                    onDeleteStory(deletingStory.id);
                    setDeletingStory(null);
                    setDeleteConfirmation("");
                  }}
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
            <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center border border-stone-300">
              <User size={20} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-amber-600">
                Autor
              </div>
              <div className="font-serif font-bold text-stone-800">
                {user.displayName || "Invitado"}
              </div>
            </div>
          </div>
          <button
            onClick={() =>
              signOut(auth).catch(() => window.location.reload())
            }
            className="text-stone-400 hover:text-stone-600"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            Biblioteca
          </h2>
          <PillarButton onClick={onCreateStory} variant="primary" icon={Plus}>
            Nueva
          </PillarButton>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-stone-200">
            <p className="text-stone-400 mb-4 font-serif italic">
              El silencio antes de la creación.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {stories.map((s) => (
              <div key={s.id} className="relative group">
                <MarbleCard
                  onClick={() => setActiveStoryId(s.id)}
                  className="cursor-pointer hover:border-amber-400"
                >
                  <div className="p-6 pr-12">
                    <h3 className="font-serif text-xl font-bold text-stone-900">
                      {s.title || "Sin Título"}
                    </h3>
                    <div className="text-xs font-bold text-stone-400 mt-1 uppercase">
                      {(s.plotArchetypes || []).join(", ") ||
                        "Sin Arquetipo"}
                    </div>
                  </div>
                </MarbleCard>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingStory(s);
                    setDeleteConfirmation("");
                  }}
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

  // 3) HISTORIA ACTIVA SIN DATA
  if (!data) return <LoadingView text="Abriendo..." />;

  // Obtenemos la trama que se está editando
  const expandedPlot = (data.plots || []).find((p) => p.id === expandedPlotId);

  // 4) EDITOR PRINCIPAL DE HISTORIA (CON PLOTS, IDEAS, ETC.)
  return (
    <div className="p-4 md:p-8 pb-40 max-w-4xl mx-auto animate-in fade-in relative">
      {/* --- FULLSCREEN PLOT EDITOR --- */}
      {expandedPlotId && expandedPlot && (
        <FullScreenEditor
          title="Trama"
          isEditing={isEditingPlot}
          onToggleEditing={() => setIsEditingPlot(!isEditingPlot)}
          onClose={() => {
            setExpandedPlotId(null);
            setIsEditingPlot(false); //  al cerrar, vuelve a lectura
          }}
        >
          <div className="max-w-4xl mx-auto w-full">
            {/* Title */}
            <input
              className="w-full text-3xl md:text-5xl font-serif font-bold ..."
              value={expandedPlot.title || expandedPlot.type || ""}
              onChange={(e) => updateExpandedPlot("title", e.target.value)}
              placeholder="Título de la Trama"
              readOnly={!isEditingPlot}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lado: personajes + acciones */}
              <div className="space-y-6">
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-lg">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 block">
                    Personajes Implicados
                  </label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {(data.characters || []).map((char) => {
                      const isSelected = (
                        expandedPlot.characterIds || []
                      ).includes(char.id);
                      return (
                        <button
                          key={char.id}
                          onClick={() => toggleCharForExpandedPlot(char.id)}
                          className={`w-full flex items-center gap-3 p-2 rounded-md border transition-all text-left ${
                            isSelected
                              ? "bg-white border-amber-400 shadow-sm"
                              : "border-transparent hover:bg-white hover:border-stone-200"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                              isSelected
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-stone-200 text-stone-500 border-transparent"
                            }`}
                          >
                            {char.name
                              ? String(char.name).substring(0, 2).toUpperCase()
                              : "?"}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              isSelected ? "text-stone-900" : "text-stone-500"
                            }`}
                          >
                            {char.name || "Sin Nombre"}
                          </span>
                          {isSelected && (
                            <CheckCircle2
                              size={14}
                              className="ml-auto text-amber-500"
                            />
                          )}
                        </button>
                      );
                    })}
                    {(data.characters || []).length === 0 && (
                      <p className="text-xs text-stone-400 italic p-2">
                        No hay personajes creados.
                      </p>
                    )}
                  </div>
                </div>

                {isEditingPlot && (
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar esta trama?"))
                        removePlot(expandedPlot.id);
                    }}
                    className="w-full py-3 border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Eliminar Trama
                  </button>
                )}
              </div>

              {/* Columna principal: descripción */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 border border-stone-200 shadow-sm rounded-lg min-h-[50vh]">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
                    <StickyNote size={14} /> Descripción y Notas
                  </label>
                  <textarea
                    className="w-full h-full min-h-[400px] ..."
                    value={expandedPlot.description || ""}
                    onChange={(e) =>
                      updateExpandedPlot("description", e.target.value)
                    }
                    placeholder="Escribe aquí el desarrollo de esta trama..."
                    readOnly={!isEditingPlot}
                  />
                </div>
              </div>
            </div>
          </div>
        </FullScreenEditor>
      )}

      {/* HEADER HISTORIA */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full">
          <div className="flex justify-between items-center mb-4 w-full">
            <button
              onClick={() => setActiveStoryId(null)}
              className="text-xs font-bold uppercase flex items-center gap-2 text-stone-400 hover:text-stone-800"
            >
              <ArrowLeft size={14} /> Volver
            </button>
            {/* Cloud Status en móvil */}
            <div className="md:hidden">
              <CloudStatus isSaving={isSaving} />
            </div>
          </div>

          <div className="relative group w-full">
            {isEditingTitle ? (
              <input
                autoFocus
                className="text-4xl md:text-5xl font-serif font-bold w-full bg-transparent border-b-2 border-amber-400 focus:outline-none text-stone-900 placeholder:text-stone-300 pb-2"
                value={data.title || ""}
                onChange={(e) =>
                  updateData({ ...data, title: e.target.value })
                }
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) =>
                  e.key === "Enter" && setIsEditingTitle(false)
                }
                placeholder="TÍTULO"
              />
            ) : (
              <h1
                className="text-4xl md:text-5xl font-serif font-bold text-stone-900 pb-2 border-b-2 border-transparent relative group-hover:border-stone-100 transition-all cursor-text text-center"
                onClick={() => setIsEditingTitle(true)}
              >
                {data.title || "Sin Título"}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingTitle(true);
                  }}
                  className="absolute -right-8 bottom-2 p-2 text-stone-300 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Edit2 size={16} />
                </button>
              </h1>
            )}
          </div>
        </div>
        {/* Cloud Status en escritorio */}
        <div className="hidden md:block">
          <CloudStatus isSaving={isSaving} />
        </div>
      </div>

      {/* ARQUETIPOS */}
      <div className="mb-10">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-200 pb-2">
          Arquetipos de Trama
        </h3>
        <div className="flex flex-wrap gap-3 items-center">
          {(data.plotArchetypes || []).map((arch, idx) => (
            <span
              key={idx}
              className="bg-stone-800 text-amber-50 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
            >
              {arch}
              <button
                onClick={() => removeArchetype(arch)}
                className="hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}

          <div className="relative flex items-center gap-2 bg-white border border-stone-200 rounded-full px-2 py-1 shadow-sm hover:border-amber-300 transition-colors">
            <select
              className="bg-transparent text-xs font-bold text-stone-600 uppercase focus:outline-none cursor-pointer py-2 px-2 pr-8 appearance-none"
              value=""
              onChange={(e) => {
                if (e.target.value === "custom") {
                  const custom = prompt("Nombre del nuevo arquetipo:");
                  if (custom) addArchetype(custom);
                } else {
                  addArchetype(e.target.value);
                }
              }}
            >
              <option value="" disabled>
                + Añadir Arquetipo
              </option>
              {PLOT_ARCHETYPES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
              <option value="custom" className="text-amber-700 font-bold">
                ✨ Crear Nuevo...
              </option>
            </select>
            <div className="absolute right-3 pointer-events-none text-stone-400">
              <Plus size={12} />
            </div>
          </div>
        </div>
      </div>

      {/* TRAMAS */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4 border-b border-stone-200 pb-2">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
            Tramas Activas
          </h3>
          <button
            onClick={createNewPlot}
            className="text-amber-600 hover:text-amber-800 text-xs font-bold uppercase flex items-center gap-1 transition-colors bg-amber-50 px-3 py-1 rounded-full border border-amber-100"
          >
            + Nueva Trama
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data.plots || []).map((plot) => (
            <div
              key={plot.id}
              onClick={() => {
                setExpandedPlotId(plot.id);
                setIsEditingPlot(false);
              }}
              className="bg-white border border-stone-200 p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition-all cursor-pointer relative group"
            >
              <div className="absolute top-2 right-2 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={16} />
              </div>
              <h4 className="font-serif text-lg font-bold text-stone-800 mb-3 pr-6 truncate">
                {plot.title || plot.type || "Trama Sin Título"}
              </h4>

              <div className="flex -space-x-2 overflow-hidden py-1 pl-1 mb-2">
                {plot.characterIds &&
                  plot.characterIds.map((charId) => {
                    const char = (data.characters || []).find(
                      (c) => c.id === charId
                    );
                    if (!char) return null;
                    return (
                      <div
                        key={charId}
                        className="w-8 h-8 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-stone-600 shadow-sm"
                        title={char.name}
                      >
                        {char.name
                          ? String(char.name).substring(0, 2).toUpperCase()
                          : "?"}
                      </div>
                    );
                  })}
                {(!plot.characterIds || plot.characterIds.length === 0) && (
                  <span className="text-xs text-stone-400 italic">
                    Sin personajes
                  </span>
                )}
              </div>

              {plot.description && (
                <p className="text-xs text-stone-500 line-clamp-2 font-serif italic border-t border-stone-100 pt-2 mt-2">
                  {plot.description}
                </p>
              )}
            </div>
          ))}

          {(data.plots || []).length === 0 && (
            <div
              className="text-stone-400 text-sm italic p-8 text-center col-span-full border-2 border-dashed border-stone-100 rounded-lg cursor-pointer hover:bg-stone-50 hover:border-stone-200 transition-colors"
              onClick={createNewPlot}
            >
              No hay tramas. Haz clic para crear la primera.
            </div>
          )}
        </div>
      </div>

      {/* MURO DE IDEAS */}
      <div>
        <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-2">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
            Muro de Ideas
          </h3>
          <button
            onClick={addIdea}
            className="text-amber-600 hover:text-amber-800 bg-amber-50 p-2 rounded-full border border-amber-100 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(data.ideas || []).map((idea, index) => {
            const rotation = index % 2 === 0 ? "rotate-1" : "-rotate-1";
            const colors = [
              "bg-yellow-100",
              "bg-orange-50",
              "bg-pink-50",
              "bg-blue-50",
            ];
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
                  onClick={() =>
                    updateData({
                      ...data,
                      ideas: data.ideas.filter((i) => i.id !== idea.id),
                    })
                  }
                  className="absolute bottom-2 right-2 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StoryHub;
