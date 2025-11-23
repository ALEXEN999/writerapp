import React, { useRef } from "react";
import SquareAvatar from "../ui/SquareAvatar";
import { compressImage } from "../../utils/image";

import {
  ArrowLeft,
  Check,
  Dna,
  FlaskConical,
  Users2,
  Globe,
  StickyNote,
  Zap,
  Eye,
  Trash2,
  Edit2,
} from "lucide-react";

const EntityEditor = ({
  listName,
  item,
  data,
  updateItem,
  deleteItem,
  setExpandedItemId,
  editingItem,
  setEditingItem,
}) => {

  if (!item) return null;
  const fileInputRef = useRef(null);
  const isWorld = listName === "worlds";
  const isSpecies = listName === "species";

  // SAFE GUARDS - Normalizamos el item por si viene como string
  const safeItem = typeof item === "string" ? { id: item, name: item } : item;
  const safeName = String(safeItem.name || "Sin Nombre");

  // Búsqueda segura de personajes
  const worldCharacters = isWorld
    ? (data.characters || []).filter((c) => c && c.world === safeName)
    : [];

  // Cálculo de especies autóctonas (Nueva Lógica: Inversa)
  const autoResidentSpecies = isWorld
    ? (data.species || []).filter((sp) => {
        if (!sp) return false;
        const origins =
          sp.originWorlds || (sp.worldOrigin ? [sp.worldOrigin] : []);
        return origins.includes(safeName);
      })
    : [];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressedBase64 = await compressImage(file);
      updateItem(listName, safeItem.id, "imageUrl", compressedBase64);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar imagen.");
    }
  };

  // Toggle para Especies: Inversa (múltiples mundos)
  const toggleWorldOrigin = (worldName) => {
    const currentOrigins =
      safeItem.originWorlds ||
      (safeItem.worldOrigin ? [safeItem.worldOrigin] : []);
    const newOrigins = currentOrigins.includes(worldName)
      ? currentOrigins.filter((w) => w !== worldName)
      : [...currentOrigins, worldName];
    updateItem(listName, safeItem.id, "originWorlds", newOrigins);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fdfbf7] flex flex-col animate-in slide-in-from-bottom-10 duration-300  pb-16">
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-stone-200 bg-white shadow-sm">
        <button
          onClick={() => {
            setExpandedItemId(null);
            setEditingItem(false);
          }}
          className="text-stone-500 hover:text-stone-800 flex items-center gap-2 font-bold text-xs uppercase tracking-wider"
        >
          <ArrowLeft size={18} /> Volver
        </button>
        <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">
          {isSpecies ? "Especie" : "Mundo"}
        </h2>
        <button
          onClick={() => setEditingItem(!editingItem)}
          className="text-amber-600 flex items-center gap-2 font-bold text-xs uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full"
        >
          {editingItem ? <Check size={16} /> : <Edit2 size={14} />}{" "}
          {editingItem ? "Listo" : "Editar"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-6 max-w-3xl mx-auto w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="transform mb-6 shadow-lg border border-stone-300 bg-white p-1 relative">
            <SquareAvatar
              char={{ name: safeName, imageUrl: safeItem.imageUrl }}
              size="xl"
              editable={editingItem}
              onClick={() => editingItem && fileInputRef.current.click()}
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          {editingItem ? (
            <input
              className="font-serif font-bold text-4xl text-center text-stone-900 bg-transparent border-b-2 border-transparent hover:border-stone-300 focus:border-amber-500 focus:outline-none w-full placeholder:text-stone-300 pb-1 rounded-none"
              value={safeName}
              onChange={(e) =>
                updateItem(listName, safeItem.id, "name", e.target.value)
              }
              placeholder="Nombre"
            />
          ) : (
            <h1 className="font-serif font-bold text-4xl text-stone-900 text-center tracking-tight">
              {safeName}
            </h1>
          )}
        </div>

        <div className="bg-white border border-stone-200 p-8 shadow-sm space-y-10">
          {isWorld && (
            <>
              <div>
                <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Dna size={12} /> Razas Autóctonas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {autoResidentSpecies.length > 0 ? (
                    autoResidentSpecies.map((sp, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-stone-900 text-amber-50 text-xs font-bold"
                      >
                        {typeof sp === "string"
                          ? sp
                          : String(sp?.name || "Error")}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-stone-400 italic">
                      Ninguna especie reclama este mundo como origen.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-2 flex items-center gap-2 border-b border-stone-100 pb-2">
                  <FlaskConical size={12} /> Diégesis Local
                </h4>
                {editingItem ? (
                  <textarea
                    className="w-full p-4 bg-stone-50 border border-stone-300 focus:border-amber-500 focus:outline-none min-h-[120px] font-serif text-stone-700 text-sm rounded-none"
                    value={safeItem.diegesis || ""}
                    onChange={(e) =>
                      updateItem(
                        listName,
                        safeItem.id,
                        "diegesis",
                        e.target.value
                      )
                    }
                    placeholder="Reglas específicas de este mundo..."
                  />
                ) : (
                  <p className="font-serif text-base text-stone-800 leading-relaxed whitespace-pre-wrap pl-1 border-l-2 border-amber-200">
                    {safeItem.diegesis || "Sin datos."}
                  </p>
                )}
              </div>
            </>
          )}

          {isWorld && (
            <div>
              <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-3 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Users2 size={12} /> Habitantes Conocidos
              </h4>
              {worldCharacters.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {worldCharacters.map((char) => (
                    <div
                      key={char.id}
                      className="flex items-center gap-2 bg-stone-50 p-2 border border-stone-200 hover:border-amber-400 transition-colors"
                    >
                      <div className="w-6 h-6 overflow-hidden bg-stone-200 border border-stone-300">
                        {char.imageUrl ? (
                          <img
                            src={char.imageUrl}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="flex items-center justify-center h-full w-full font-serif text-xs font-bold text-stone-500">
                            {String(char.name).charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-stone-700">
                        {String(char.name)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">
                  Ningún personaje asignado a este mundo.
                </p>
              )}
            </div>
          )}

          <div>
            <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-2 flex items-center gap-2 border-b border-stone-100 pb-2">
              <StickyNote size={12} /> Descripción General
            </h4>
            {editingItem ? (
              <textarea
                className="w-full p-4 bg-stone-50 border border-stone-300 focus:border-amber-500 focus:outline-none min-h-[120px] font-serif text-stone-700 text-sm rounded-none"
                value={safeItem.description || ""}
                onChange={(e) =>
                  updateItem(
                    listName,
                    safeItem.id,
                    "description",
                    e.target.value
                  )
                }
                placeholder="Descripción general..."
              />
            ) : (
              <p className="font-serif text-base text-stone-800 leading-relaxed whitespace-pre-wrap pl-1 border-l-2 border-amber-200">
                {safeItem.description || "Sin descripción."}
              </p>
            )}
          </div>

          {isSpecies && (
            <>
              <div>
                <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-2 flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Eye size={12} /> Aspecto
                </h4>
                {editingItem ? (
                  <textarea
                    className="w-full p-4 bg-stone-50 border border-stone-300 focus:border-amber-500 focus:outline-none min-h-[100px] font-serif text-stone-700 text-sm rounded-none"
                    value={safeItem.appearance || ""}
                    onChange={(e) =>
                      updateItem(
                        listName,
                        safeItem.id,
                        "appearance",
                        e.target.value
                      )
                    }
                    placeholder="Características físicas..."
                  />
                ) : (
                  <p className="font-serif text-base text-stone-800 leading-relaxed whitespace-pre-wrap pl-1 border-l-2 border-amber-200">
                    {safeItem.appearance || "Sin definir."}
                  </p>
                )}
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-2 flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Zap size={12} /> Poderes
                </h4>
                {editingItem ? (
                  <textarea
                    className="w-full p-4 bg-stone-50 border border-stone-300 focus:border-amber-500 focus:outline-none min-h-[100px] font-serif text-stone-700 text-sm rounded-none"
                    value={safeItem.powers || ""}
                    onChange={(e) =>
                      updateItem(
                        listName,
                        safeItem.id,
                        "powers",
                        e.target.value
                      )
                    }
                    placeholder="Habilidades mágicas..."
                  />
                ) : (
                  <p className="font-serif text-base text-stone-800 leading-relaxed whitespace-pre-wrap pl-1 border-l-2 border-amber-200">
                    {safeItem.powers || "Sin definir."}
                  </p>
                )}
              </div>

              {/* MULTIPLES MUNDOS DE ORIGEN */}
              <div>
                <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Globe size={12} /> Mundos de Origen
                </h4>
                {editingItem ? (
                  <div className="flex flex-wrap gap-2">
                    {(data.worlds || []).map((w) => {
                      if (!w) return null;
                      const wName =
                        typeof w === "string"
                          ? w
                          : String(w.name || "Desconocido");
                      const currentOrigins =
                        safeItem.originWorlds ||
                        (safeItem.worldOrigin ? [safeItem.worldOrigin] : []);
                      const isSelected = currentOrigins.includes(wName);

                      return (
                        <button
                          key={w.id || wName}
                          onClick={() => toggleWorldOrigin(wName)}
                          className={`px-3 py-1 text-xs font-bold border transition-colors flex items-center gap-2 ${
                            isSelected
                              ? "bg-stone-800 text-white border-stone-800"
                              : "bg-white text-stone-500 border-stone-200 hover:border-amber-400"
                          }`}
                        >
                          {isSelected && <Check size={10} />} {wName}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const currentOrigins =
                        safeItem.originWorlds ||
                        (safeItem.worldOrigin ? [safeItem.worldOrigin] : []);
                      if (currentOrigins.length > 0) {
                        return currentOrigins.map((origin) => (
                          <span
                            key={origin}
                            className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-bold border border-stone-200"
                          >
                            {origin}
                          </span>
                        ));
                      }
                      return (
                        <p className="font-serif text-stone-400 italic text-sm">
                          Desconocido
                        </p>
                      );
                    })()}
                  </div>
                )}
              </div>
            </>
          )}

          {editingItem && (
            <div className="pt-8">
              <button
                onClick={() => deleteItem(listName, safeItem.id)}
                className="w-full py-4 text-red-600 border border-red-200 hover:bg-red-50 uppercase text-xs font-bold flex items-center justify-center gap-2 transition-colors rounded-none"
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );  
};

export default EntityEditor;
