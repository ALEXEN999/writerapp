import React, { useState } from "react";

// componentes que ya has modularizado
import LoadingView from "../components/ui/LoadingView";
import MarbleCard from "../components/ui/MarbleCard";
import PillarButton from "../components/ui/PillarButton";
import CharacterCard from "../components/ui/CharacterCard";
import SquareAvatar from "../components/ui/SquareAvatar";
import { compressImage } from "../utils/image";


// iconos (sobran algunos, no pasa nada)
import {
  Book,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Columns,
  RotateCcw,
  Swords,
  Upload,
  ArrowLeft,
  X,
  ExternalLink,
  Link as LinkIcon,
  Edit2,
} from "lucide-react";

import FullScreenEditor from "../components/entity/FullScreenEditor";

// --- COMPONENTE STRUCTURE VIEW MODIFICADO ---
const StructureView = ({ data, updateData }) => {
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [expandedStepId, setExpandedStepId] = useState(null);
  const [showPlotSelector, setShowPlotSelector] = useState(null);

  const [chapterActiveTab, setChapterActiveTab] = useState("structure");
  const [chapterNewResourceUrl, setChapterNewResourceUrl] = useState("");
  const [chapterNewResourceLabel, setChapterNewResourceLabel] = useState("");
  const [isEditingChapter, setIsEditingChapter] = useState(false);

  if (!data) return <LoadingView />;

  // --- LOGICA DE DATOS ---
  const updateStructure = (newPoints) => {
    updateData({ ...data, structurePoints: newPoints });
  };

  const addItemToStep = (stepId, type, extra = {}) => {
    const newItem = {
      id: Date.now(),
      type,
      title: type === "chapter" ? "Nuevo Capítulo" : "",
      content: "",
      acts: { act1: "", act2: "", act3: "" },
      characterIds: [],
      resources: [],
      ...extra,
    };
    const newPoints = data.structurePoints.map((step) => {
      if (step.id === stepId) {
        return { ...step, items: [...(step.items || []), newItem] };
      }
      return step;
    });
    updateStructure(newPoints);
    if (type === "chapter") {
      setExpandedStepId(stepId);
      setExpandedChapterId(newItem.id);
    }
  };

  const updateItemInStep = (stepId, itemId, updates) => {
    const newPoints = data.structurePoints.map((step) => {
      if (step.id === stepId) {
        const newItems = (step.items || []).map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        );
        return { ...step, items: newItems };
      }
      return step;
    });
    updateStructure(newPoints);
  };

  const removeItemFromStep = (stepId, itemId) => {
    if (!confirm("¿Eliminar este elemento?")) return;
    const newPoints = data.structurePoints.map((step) => {
      if (step.id === stepId) {
        return {
          ...step,
          items: (step.items || []).filter((i) => i.id !== itemId),
        };
      }
      return step;
    });
    updateStructure(newPoints);
    if (expandedChapterId === itemId) setExpandedChapterId(null);
  };

  const moveItemInStep = (stepId, itemIndex, direction) => {
    const newPoints = data.structurePoints.map((step) => {
      if (step.id === stepId) {
        const items = [...(step.items || [])];
        if (direction === "up" && itemIndex > 0) {
          [items[itemIndex], items[itemIndex - 1]] = [
            items[itemIndex - 1],
            items[itemIndex],
          ];
        } else if (direction === "down" && itemIndex < items.length - 1) {
          [items[itemIndex], items[itemIndex + 1]] = [
            items[itemIndex + 1],
            items[itemIndex],
          ];
        }
        return { ...step, items };
      }
      return step;
    });
    updateStructure(newPoints);
  };

  const applyTemplate = (type) => {
    if (
      (data.structurePoints || []).length > 0 &&
      !confirm("¿Cambiar de estructura? Se perderá el contenido actual.")
    )
      return;
    const points = STRUCTURE_TEMPLATES[type].steps.map((step, i) => ({
      id: Date.now() + i,
      type: "step",
      title: step,
      items: [],
      completed: false,
    }));
    updateData({ ...data, structureType: type, structurePoints: points });
  };

  const resetStructure = () => {
    if (
      confirm(
        "¿Estás seguro? Se borrará todo el progreso de la estructura."
      )
    ) {
      updateData({ ...data, structureType: null, structurePoints: [] });
    }
  };

  const addBaseStep = () => {
    const newStep = {
      id: Date.now(),
      type: "step",
      title: "Nuevo Paso Estructural",
      items: [],
      completed: false,
    };
    updateStructure([...(data.structurePoints || []), newStep]);
  };

  const updateStepTitle = (stepId, newTitle) => {
    const newPoints = data.structurePoints.map((p) =>
      p.id === stepId ? { ...p, title: newTitle } : p
    );
    updateStructure(newPoints);
  };

  const deleteBaseStep = (stepId) => {
    if (!confirm("¿Eliminar este paso completo?")) return;
    updateStructure(data.structurePoints.filter((p) => p.id !== stepId));
  };

  // --- EDITOR DE CAPITULO FULLSCREEN ---
  const ChapterEditor = () => {
    if (!expandedChapterId || !expandedStepId) return null;

    const step = data.structurePoints.find((s) => s.id === expandedStepId);
    const chapter = step?.items.find((i) => i.id === expandedChapterId);

    if (!chapter) return null;

    // usamos los estados "globales" del componente padre
    const activeTab = chapterActiveTab;
    const setActiveTab = setChapterActiveTab;

    const newResourceUrl = chapterNewResourceUrl;
    const setNewResourceUrl = setChapterNewResourceUrl;

    const newResourceLabel = chapterNewResourceLabel;
    const setNewResourceLabel = setChapterNewResourceLabel;

    const handleAddResource = (type) => {
      if (!isEditingChapter) return;
      if (!newResourceUrl) return;

      const newRes = {
        id: Date.now(),
        type,
        url: newResourceUrl,
        label: newResourceLabel || "Recurso",
      };

      updateItemInStep(expandedStepId, chapter.id, {
        resources: [...(chapter.resources || []), newRes],
      });

      setNewResourceUrl("");
      setNewResourceLabel("");
    };

    const toggleCharacter = (charId) => {
      if (!isEditingChapter) return;
      const currentIds = chapter.characterIds || [];
      const newIds = currentIds.includes(charId)
        ? currentIds.filter((id) => id !== charId)
        : [...currentIds, charId];

      updateItemInStep(expandedStepId, chapter.id, { characterIds: newIds });
    };

    const handleImageUpload = async (e) => {
      if (!isEditingChapter) return;
      const file = e.target.files[0];
      if (!file) return;
      try {
        const compressedBase64 = await compressImage(file);
        const newRes = {
          id: Date.now(),
          type: "image",
          url: compressedBase64,
          label: file.name,
        };
        updateItemInStep(expandedStepId, chapter.id, {
          resources: [...(chapter.resources || []), newRes],
        });
      } catch (error) {
        console.error(error);
        alert("Error al procesar la imagen.");
      }
    };

    return (
      <FullScreenEditor
        title="Capítulo"
        isEditing={isEditingChapter}
        onToggleEditing={() => setIsEditingChapter((prev) => !prev)}
        onClose={() => {
          setExpandedChapterId(null);
          setExpandedStepId(null);
          setIsEditingChapter(false);
        }}
      >
        <div className="max-w-5xl mx-auto w-full">
          <input
            className="w-full text-4xl md:text-5xl font-serif font-bold"
            defaultValue={chapter.title}
            onBlur={(e) => {
              if (!isEditingChapter) return;
              updateItemInStep(expandedStepId, chapter.id, {
                title: e.target.value,
              });
            }}
            placeholder="Título del Capítulo"
            readOnly={!isEditingChapter}
          />

          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-8">
            Perteneciente a: {step.title}
          </p>

          {/* Tabs */}
          <div className="flex border-b border-stone-200 mb-8">
            {["structure", "characters", "resources"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-amber-500 text-stone-900"
                    : "border-transparent text-stone-400 hover:text-stone-600"
                }`}
              >
                {tab === "structure"
                  ? "Estructura (3 Actos)"
                  : tab === "characters"
                  ? "Personajes"
                  : "Recursos"}
              </button>
            ))}
          </div>

          {/* Tab Estructura */}
          {activeTab === "structure" && (
            <div className="space-y-8 animate-in fade-in">
              {["act1", "act2", "act3"].map((act, i) => (
                <div
                  key={act}
                  className="bg-white p-6 border border-stone-200 shadow-sm"
                >
                  <h4 className="text-xs font-bold text-stone-900 uppercase mb-3 tracking-widest flex items-center gap-2">
                    <span className="bg-stone-900 text-amber-50 w-6 h-6 flex items-center justify-center rounded-full text-[10px]">
                      {i + 1}
                    </span>
                    {act === "act1"
                      ? "Inicio"
                      : act === "act2"
                      ? "Nudo"
                      : "Desenlace"}
                  </h4>
                  <textarea
                    className="w-full min-h-[150px] bg-stone-50 ... outline-none font-serif text-stone-700 leading-relaxed resize-y"
                    defaultValue={(chapter.acts || {})[act] || ""}
                    onBlur={(e) =>
                      updateItemInStep(expandedStepId, chapter.id, {
                        acts: {
                          ...(chapter.acts || {}),
                          [act]: e.target.value,
                        },
                      })
                    }
                    placeholder={`Describe el ${
                      act === "act1"
                        ? "inicio"
                        : act === "act2"
                        ? "nudo"
                        : "desenlace"
                    } de este capítulo...`}
                    readOnly={!isEditingChapter}
                  />
                </div>
              ))}
              <div className="mt-8">
                <label className="text-[10px] font-bold text-stone-400 uppercase mb-2 block">
                  Resumen General (Visible en la tarjeta)
                </label>
                <textarea
                  className="w-full p-4 bg-white border border-stone-200 focus:border-amber-400 outline-none text-base font-serif"
                  defaultValue={chapter.content || ""}
                  onBlur={(e) => {
                    if (!isEditingChapter) return;
                    updateItemInStep(expandedStepId, chapter.id, {
                      content: e.target.value,
                    });
                  }}
                  placeholder="Resumen corto del capítulo..."
                  readOnly={!isEditingChapter}
                />
              </div>
            </div>
          )}

          {/* Tab Personajes */}
          {activeTab === "characters" && (
            <div className="animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(data.characters || []).map((char) => {
                  const isSelected = (chapter.characterIds || []).includes(
                    char.id
                  );
                  return (
                    <div
                      key={char.id}
                      onClick={() => toggleCharacter(char.id)}
                      className={`flex items-center gap-4 p-3 border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-amber-50 border-amber-400"
                          : "bg-white border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      <div className="w-10 h-10 bg-stone-200 flex-shrink-0 overflow-hidden border border-stone-300">
                        {char.imageUrl ? (
                          <img
                            src={char.imageUrl}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-500 font-bold text-xs">
                            {String(char.name).substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-stone-800 truncate">
                          {String(char.name)}
                        </div>
                        <div className="text-[10px] text-stone-500 uppercase tracking-wider">
                          {String(char.race)}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={18} className="text-amber-600" />
                      )}
                    </div>
                  );
                })}
                {(data.characters || []).length === 0 && (
                  <p className="text-stone-400 italic col-span-full">
                    No hay personajes creados en la sección de Personajes.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tab Recursos */}
          {activeTab === "resources" && (
            <div className="animate-in fade-in space-y-8">
              <div className="bg-stone-50 p-6 border border-stone-200">
                <h4 className="text-xs font-bold text-stone-900 uppercase mb-4 tracking-widest">
                  Añadir Nuevo Recurso
                </h4>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 p-2 bg-white border border-stone-300 text-sm"
                      placeholder="Etiqueta (opcional)"
                      value={newResourceLabel}
                      onChange={(e) => setNewResourceLabel(e.target.value)}
                      disabled={!isEditingChapter}
                    />
                    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 cursor-pointer hover:bg-stone-100 text-xs font-bold uppercase">
                      <Upload size={14} /> Subir Imagen
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 p-2 bg-white border border-stone-300 text-sm font-mono"
                      placeholder="Pegar URL de enlace o imagen..."
                      value={newResourceUrl}
                      onChange={(e) => setNewResourceUrl(e.target.value)}
                      disabled={!isEditingChapter}
                    />
                    <button
                      onClick={() => handleAddResource("link")}
                      disabled={!isEditingChapter}
                      className="px-4 py-2 bg-stone-800 text-white text-xs font-bold uppercase hover:bg-stone-900"
                    >
                      Añadir Link
                    </button>
                    <button
                      onClick={() => handleAddResource("image")}
                      disabled={!isEditingChapter}
                      className="px-4 py-2 bg-stone-800 text-white text-xs font-bold uppercase hover:bg-stone-900"
                    >
                      Añadir IMG
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(chapter.resources || []).map((res) => (
                  <div
                    key={res.id}
                    className="group relative bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <button
                      onClick={() => {
                        if (!isEditingChapter) return;
                        const newRes = (chapter.resources || []).filter(
                          (r) => r.id !== res.id
                        );
                        updateItemInStep(expandedStepId, chapter.id, {
                          resources: newRes,
                        });
                      }}
                      className="absolute top-1 right-1 bg-white text-stone-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm border border-stone-100"
                    >
                      <Trash2 size={14} />
                    </button>
                    {res.type === "image" ? (
                      <div
                        className="aspect-square bg-stone-100 relative overflow-hidden cursor-pointer"
                        onClick={() => window.open(res.url, "_blank")}
                      >
                        <img
                          src={res.url}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 truncate font-bold text-center">
                          {res.label}
                        </div>
                      </div>
                    ) : (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="aspect-square flex flex-col items-center justify-center p-4 bg-stone-50 hover:bg-amber-50 transition-colors text-center"
                      >
                        <LinkIcon
                          size={24}
                          className="text-stone-400 mb-2"
                        />
                        <span className="text-xs font-bold text-stone-700 line-clamp-2">
                          {res.label}
                        </span>
                        <span className="text-[9px] text-stone-400 mt-1 truncate w-full">
                          {res.url}
                        </span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </FullScreenEditor>
    );
  };
  // ... resto de StructureView (STRUCTURE_TEMPLATES, return principal, etc.)


  const STRUCTURE_TEMPLATES = {
    heroJourney: {
      name: "El Viaje del Héroe",
      description:
        "El clásico monomito. Ideal para fantasía épica y aventura.",
      steps: [
        "Mundo Ordinario",
        "La Llamada",
        "Rechazo",
        "Mentor",
        "Umbral",
        "Pruebas",
        "Acercamiento",
        "Ordalía",
        "Recompensa",
        "Camino de Vuelta",
        "Resurrección",
        "Elixir",
      ],
    },
    threeActs: {
      name: "3 Actos",
      description:
        "La estructura fundamental del drama moderno. Planteamiento, Nudo y Desenlace.",
      steps: [
        "Acto I: Planteamiento",
        "Acto II: Nudo",
        "Acto III: Desenlace",
      ],
    },
    kishotenketsu: {
      name: "Kishōtenketsu",
      description:
        "Estructura narrativa tradicional japonesa y coreana. Sin conflicto directo.",
      steps: [
        "Introducción (Ki)",
        "Desarrollo (Shō)",
        "Giro (Ten)",
        "Conclusión (Ketsu)",
      ],
    },
  };

  // --- PASO 1: SELECCIÓN DE ESTRUCTURA ---
  if (!data.structureType) {
    return (
      <div className="p-4 md:p-8 animate-in fade-in flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="font-serif font-bold text-2xl text-stone-900 mb-2 text-center">
          Elige la Estructura de tu Historia
        </h2>
        <p className="text-stone-500 text-sm mb-8 text-center max-w-md font-serif italic">
          "El andamiaje invisible que sostiene el alma de tu relato."
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {Object.entries(STRUCTURE_TEMPLATES).map(([key, tpl]) => (
            <div
              key={key}
              onClick={() => applyTemplate(key)}
              className="bg-white border border-stone-300 p-6 shadow-sm hover:shadow-md hover:border-amber-400 cursor-pointer transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-stone-200 group-hover:bg-amber-500 transition-colors"></div>
              <h3 className="font-serif font-bold text-xl text-stone-900 mb-2 group-hover:text-amber-700 transition-colors">
                {tpl.name}
              </h3>
              <p className="text-xs text-stone-500 mb-4 leading-relaxed font-serif">
                {tpl.description}
              </p>
              <div className="flex flex-wrap gap-1 mt-auto">
                {tpl.steps.slice(0, 3).map((step, i) => (
                  <span
                    key={i}
                    className="text-[9px] bg-stone-100 text-stone-600 px-2 py-1 uppercase tracking-wider font-bold border border-stone-200"
                  >
                    {step}
                  </span>
                ))}
                {tpl.steps.length > 3 && (
                  <span className="text-[9px] text-stone-400 px-2 py-1 italic">
                    ...
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- PASO 2: ESTRUCTURA ACTIVA ---
  return (
    <div className="pb-16  md:px-8 animate-in fade-in max-w-5xl mx-auto">
      <ChapterEditor />

      {/* Header Estructura Activa */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-white  shadow-sm">
              <button
                onClick={() => {
                  setExpandedChapterId(null);
                  setExpandedStepId(null);
                  setIsEditingChapter(false);
                  resetStructure();
                }}
                className="text-stone-500 hover:text-stone-800 flex items-center gap-2 font-bold text-xs uppercase tracking-wider"
              >
                <ArrowLeft size={18} />
                Cambiar Estructura
              </button>

              <div className="flex items-center  gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                  {isEditingChapter ? "Editando capítulo" : STRUCTURE_TEMPLATES[data.structureType].name}
                </span>
              </div>

              <div className="w-2 md:w-8" />
            </div>


      {/* Lista de Pasos (Contenedores) */}
      <div className="space-y-12 px-4 pb-12 mt-4">
        {(data.structurePoints || []).map((step, index) => (
          <div
            key={step.id}
            className="relative  pl-4 md:pl-12 border-l-2 border-stone-200 group"
          >
            {/* Marcador del Paso */}
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-stone-200 border-2 border-[#fdfbf7] ring-1 ring-stone-300 group-hover:bg-amber-500 group-hover:ring-amber-500 transition-all z-10"></div>

            {/* Contenido del Paso */}
            <div className="bg-white border border-stone-300 shadow-sm p-6 relative hover:border-amber-400 transition-colors">
              {/* Header del Paso */}
              <div className="flex justify-between items-start mb-6 border-b border-stone-100 pb-4">
                <div className="w-full">
                  <input
                    className="font-serif font-bold text-2xl text-stone-900 bg-transparent border-none focus:outline-none placeholder:text-stone-300 w-full mb-1"
                    defaultValue={step.title}
                    onBlur={(e) =>
                      updateStepTitle(step.id, e.target.value)
                    }
                  />

                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                    Paso {index + 1}
                  </p>
                </div>
                <button
                  onClick={() => deleteBaseStep(step.id)}
                  className="text-stone-300 hover:text-red-500 p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Área de Items (Capítulos y Tramas) */}
              <div className="space-y-4 mb-6 min-h-[50px]">
                {(step.items || []).length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-stone-100 text-stone-300 text-xs font-bold uppercase tracking-wider italic">
                    Vacío
                  </div>
                )}
                {(step.items || []).map((item, idx) => {
                  const isChapter = item.type === "chapter";

                  return (
                    <div
                      key={item.id}
                      className={`border relative group/item animate-in slide-in-from-bottom-1 transition-all hover:shadow-md ${
                        isChapter
                          ? "bg-white border-stone-200 hover:border-amber-400"
                          : "bg-amber-50 border-amber-300 p-4"
                      }`}
                    >
                      {/* CAPITULO COMO TARJETA INTERACTIVA */}
                      {isChapter ? (
                        <div
                          onClick={() => {
                            setExpandedStepId(step.id);
                            setExpandedChapterId(item.id);
                            setChapterActiveTab("structure");      // Tab por defecto
                            setIsEditingChapter(false);            // Entrar en modo lectura
                            setChapterNewResourceUrl("");          // Limpia inputs
                            setChapterNewResourceLabel("");
                          }}
                          className="cursor-pointer p-5"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2 text-stone-400">
                              <Book size={16} />
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                Capítulo
                              </span>
                            </div>
                            {/* Acciones del Item */}
                            <div
                              className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() =>
                                  moveItemInStep(step.id, idx, "up")
                                }
                                className="p-1 text-stone-300 hover:text-stone-600 hover:bg-stone-100"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button
                                onClick={() =>
                                  moveItemInStep(step.id, idx, "down")
                                }
                                className="p-1 text-stone-300 hover:text-stone-600 hover:bg-stone-100"
                              >
                                <ChevronDown size={14} />
                              </button>
                              <button
                                onClick={() =>
                                  removeItemFromStep(step.id, item.id)
                                }
                                className="p-1 text-stone-300 hover:text-red-500 hover:bg-red-50 ml-2"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <h4 className="font-serif font-bold text-lg text-stone-900 mb-2 truncate">
                            {item.title || "Nuevo Capítulo"}
                          </h4>
                          <p className="text-sm text-stone-500 font-serif line-clamp-2 mb-4">
                            {item.content || "Sin resumen..."}
                          </p>

                          {/* Badges de estado */}
                          <div className="flex gap-2 mt-auto">
                            {(item.characterIds || []).length > 0 && (
                              <span className="text-[9px] font-bold text-stone-500 bg-stone-100 px-2 py-1 flex items-center gap-1">
                                <Users size={10} />{" "}
                                {item.characterIds.length}
                              </span>
                            )}
                            {(item.resources || []).length > 0 && (
                              <span className="text-[9px] font-bold text-stone-500 bg-stone-100 px-2 py-1 flex items-center gap-1">
                                <ExternalLink size={10} />{" "}
                                {item.resources.length}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* TRAMA (VISUALIZACIÓN SIMPLE) */
                        <div className="flex items-start gap-3">
                          <div className="mt-1 text-amber-600">
                            <Swords size={16} />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-xs text-amber-800 uppercase tracking-wider mb-2 bg-amber-100 inline-block px-2 py-1">
                              Trama:{" "}
                              {(data.plots || []).find(
                                (p) => p.id === item.plotId
                              )?.title || "Desconocida"}
                            </div>
                            <textarea
                              className="w-full bg-transparent border-none text-sm text-stone-600 font-serif resize-none focus:outline-none p-0"
                              rows={2}
                              defaultValue={item.content}
                              onBlur={(e) =>
                                updateItemInStep(step.id, item.id, {
                                  content: e.target.value,
                                })
                              }
                              placeholder="Notas sobre el avance de la trama..."
                            />

                          </div>
                          <div className="flex flex-col gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button
                              onClick={() =>
                                moveItemInStep(step.id, idx, "up")
                              }
                              className="text-stone-300 hover:text-stone-600"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              onClick={() =>
                                moveItemInStep(step.id, idx, "down")
                              }
                              className="text-stone-300 hover:text-stone-600"
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button
                              onClick={() =>
                                removeItemFromStep(step.id, item.id)
                              }
                              className="text-stone-300 hover:text-red-500 mt-2"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Botonera Contextual del Paso */}
              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <PillarButton
                  onClick={() => addItemToStep(step.id, "chapter")}
                  variant="gold"
                  icon={Plus}
                  className="border-amber-500 text-amber-700 hover:bg-amber-50"
                >
                  Capítulo
                </PillarButton>


                <div className="w-[1px] h-6 bg-stone-200"></div>

                {/* SELECTOR DE TRAMA */}
                {showPlotSelector === step.id ? (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                    <select
                      className="bg-stone-50 border border-stone-300 text-xs font-bold text-stone-600 py-1 pl-2 pr-8 focus:border-amber-400 outline-none w-40"
                      onChange={(e) => {
                        if (e.target.value) {
                          addItemToStep(step.id, "plot", {
                            plotId: parseInt(e.target.value),
                          });
                          setShowPlotSelector(null);
                        }
                      }}
                      defaultValue=""
                      autoFocus
                      onBlur={() =>
                        setTimeout(() => setShowPlotSelector(null), 200)
                      }
                    >
                      <option value="" disabled>
                        Elegir Trama...
                      </option>
                      {(data.plots || []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title || "Sin Título"}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowPlotSelector(null)}
                      className="text-stone-400 hover:text-stone-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <PillarButton
                    onClick={() => setShowPlotSelector(step.id)}
                    variant="gold"
                    icon={Plus}
                    className="!border-stone-300 text-stone-700 hover:border-amber-500 hover:text-amber-700"
                  >
                    Trama
                  </PillarButton>

                )}
              </div>
            </div>
          </div>
        ))}

        {/* Añadir Paso Base Manualmente */}
        <div className="pl-0 md:pl-12">
          <button
            onClick={addBaseStep}
            className="w-full py-4 border-2 border-dashed border-stone-300 text-stone-400 hover:text-amber-600 hover:border-amber-400 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Añadir nuevo paso estructural
          </button>
        </div>
      </div>
    </div>
  );
};

export default StructureView;
