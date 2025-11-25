import React, { useState, useRef } from "react";

import LoadingView from "../components/ui/LoadingView";
import MarbleCard from "../components/ui/MarbleCard";
import PillarButton from "../components/ui/PillarButton";
import SquareAvatar from "../components/ui/SquareAvatar";
import { compressImage } from "../utils/image";
import { getImageSizeKB } from "../utils/image";
import EntityEditor from "../components/entity/EntityEditor";


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
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";



// --- VISTA DE MUNDOS Y ESPECIES ---
const WorldView = ({ data, updateData }) => {
  const [activeTab, setActiveTab] = useState("general");
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [editingItem, setEditingItem] = useState(false);
  const [activeListType, setActiveListType] = useState(null);

  if (!data) return <LoadingView />;

  const addItem = (listName) => {
    const newItem = {
      id: Date.now(),
      name: `Nuevo ${listName === "species" ? "Especie" : "Mundo"}`,
      imageUrl: "",
      originWorlds: [],
    };
    updateData({
      ...data,
      [listName]: [...(data[listName] || []), newItem],
    });
    setExpandedItemId(newItem.id);
    setActiveListType(listName);
    setEditingItem(true);
  };

  const updateItem = (listName, id, field, val) => {
    updateData({
      ...data,
      [listName]: data[listName].map((i) =>
        i.id === id ? { ...i, [field]: val } : i
      ),
    });
  };

  const deleteItem = (listName, id) => {
    if (confirm("¿Eliminar?")) {
      updateData({
        ...data,
        [listName]: data[listName].filter((i) => i.id !== id),
      });
      setExpandedItemId(null);
    }
  };

  const speciesList = data.species || [];
  const worldsList = data.worlds || [];

  const expandedItem = expandedItemId
    ? (activeListType === "species" ? speciesList : worldsList).find(
        (i) => i.id === expandedItemId
      )
    : null;

  return (
    <div className="p-4 md:p-6 pb-32 animate-in fade-in">
      <section className="pb-6">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6 border-b border-stone-200 pb-2 flex items-center gap-2">
          <Globe size={14} /> Mundos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            onClick={() => addItem("worlds")}
            className="aspect-square border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 hover:text-amber-600 hover:border-amber-400 cursor-pointer transition-all group bg-stone-50/50"
          >
            <Plus
              size={24}
              className="mb-2 group-hover:scale-110 transition-transform"
            />
            <span className="text-[9px] font-bold uppercase tracking-wider">
              Nuevo Mundo
            </span>
          </div>
          {worldsList.map((item) => {
            // SAFE GUARD: Normalize legacy data
            const safeItem =
              typeof item === "string"
                ? { id: item, name: item, imageUrl: null }
                : item;
            return (
              <div
                key={safeItem.id || Math.random()}
                onClick={() => {
                  setExpandedItemId(safeItem.id);
                  setActiveListType("worlds");
                  setEditingItem(false);
                }}
                className="aspect-square bg-white border border-stone-300 shadow-sm hover:shadow-md flex flex-col items-center justify-center p-4 text-center cursor-pointer relative group transition-all overflow-hidden hover:border-amber-400"
              >
                {safeItem.imageUrl ? (
                  <img
                    src={safeItem.imageUrl}
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity"
                  />
                ) : (
                  <Globe
                    size={24}
                    className="text-stone-300 mb-3 group-hover:text-amber-400 transition-colors relative z-10"
                  />
                )}
                <h4 className="font-serif font-bold text-lg text-stone-800 leading-tight relative z-10">
                  {String(safeItem.name || "Sin Nombre")}
                </h4>
                <div className="absolute bottom-2 text-[9px] font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider relative z-10">
                  Ver Detalles
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="pb-6">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6 border-b border-stone-200 pb-2 flex items-center gap-2">
          <Dna size={14} /> Especies
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            onClick={() => addItem("species")}
            className="aspect-square border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 hover:text-amber-600 hover:border-amber-400 cursor-pointer transition-all group bg-stone-50/50"
          >
            <Plus
              size={24}
              className="mb-2 group-hover:scale-110 transition-transform"
            />
            <span className="text-[9px] font-bold uppercase tracking-wider">
              Nueva Especie
            </span>
          </div>
          {speciesList.map((item) => {
            // SAFE GUARD: Normalize legacy data
            const safeItem =
              typeof item === "string"
                ? { id: item, name: item, imageUrl: null }
                : item;
            return (
              <div
                key={safeItem.id || Math.random()}
                onClick={() => {
                  setExpandedItemId(safeItem.id);
                  setActiveListType("species");
                  setEditingItem(false);
                }}
                className="aspect-square bg-white border border-stone-300 shadow-sm hover:shadow-md flex flex-col items-center justify-center p-4 text-center cursor-pointer relative group transition-all overflow-hidden hover:border-amber-400"
              >
                {safeItem.imageUrl ? (
                  <img
                    src={safeItem.imageUrl}
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity"
                  />
                ) : (
                  <Dna
                    size={24}
                    className="text-stone-300 mb-3 group-hover:text-amber-400 transition-colors relative z-10"
                  />
                )}
                <h4 className="font-serif font-bold text-lg text-stone-800 leading-tight relative z-10">
                  {String(safeItem.name || "Sin Nombre")}
                </h4>
                <div className="absolute bottom-2 text-[9px] font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider relative z-10">
                  Ver Detalles
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="pb-6">
        <MarbleCard header="Sistema de Magia">
          <textarea
            className="w-full p-6 min-h-[300px] bg-transparent focus:outline-none font-serif text-lg leading-relaxed resize-none text-stone-800 placeholder:text-stone-300"
            placeholder="Escribe aquí las reglas de la magia, los límites y las consecuencias..."
            value={data.diegesis || ""}
            onChange={(e) => updateData({ ...data, diegesis: e.target.value })}
          />
        </MarbleCard>
      </section>

      {expandedItemId && activeListType && (
        <EntityEditor
          listName={activeListType}
          item={expandedItem}
          data={data}
          updateItem={updateItem}
          deleteItem={deleteItem}
          setExpandedItemId={setExpandedItemId}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
        />
      )}
    </div>
  );
};

export default WorldView;
