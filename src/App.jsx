import React, { useState, useEffect, useRef } from 'react';
import OlympusBackground from './components/ui/OlympusBackground';
import StructureView from "./views/StructureView";
import WorldView from "./views/WorldView";
import CharactersView from "./views/CharactersView";
import StoryHub from "./views/StoryHub";
import GlobalStyles from './styles/GlobalStyles';

// Firebase SDK
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
  Book, Users, Map, Plus, Trash2, MoreHorizontal, Globe, Zap, Feather, Star, Columns, Scroll, LogOut, User, ArrowLeft, Loader2, AlertTriangle, Copy, EyeOff, Cloud, CheckCircle2, Edit2, X, StickyNote, LayoutGrid, Maximize2, Check, Filter, Crown, Shield, Sparkles, Upload, Camera, HardDrive, Shirt, Eye, Brain, History, Swords, Dna, FlaskConical, Users2, Calendar, Link as LinkIcon, ChevronUp, ChevronDown, RotateCcw, Layout, Image as ImageIcon, ExternalLink, HeartHandshake, Skull
} from 'lucide-react';

// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// --- INICIALIZACIÓN ---
let app, auth, db;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Error inicializando Firebase:", e);
}

const appId = firebaseConfig.projectId;



// --- PLANTILLAS ---
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

// --- APP SHELL ---
export default function NarrativaOlympus() {
  const [activeTab, setActiveTab] = useState('story');
  const [user, setUser] = useState(null);
  const [stories, setStories] = useState([]);
  const [activeStoryId, setActiveStoryId] = useState(null);
  const [storyData, setStoryData] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef(null);

  
  const appId = firebaseConfig.projectId;

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

  const updateStoryData = (newData) => {
    setStoryData(newData);

    if (isDemo) {
      setStories(prev =>
        prev.map(s =>
          s.id === activeStoryId ? { ...s, ...newData } : s
        )
      );
      return;
    }

    if (!user || !activeStoryId || !db) return;

    // Debounce: cancelamos guardados anteriores
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const toSave = newData;

    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      setDoc(
        doc(db, 'artifacts', appId, 'users', user.uid, 'stories', activeStoryId),
        { ...toSave, updatedAt: serverTimestamp() },
        { merge: true }
      )
        .catch((err) => {
          console.error("Error guardando historia:", err);
        })
        .finally(() => {
          setTimeout(() => setIsSaving(false), 500);
        });
    }, 500); // espera 500 ms sin cambios antes de guardar
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

    const handleImportStory = async (importedData) => {
    if (!importedData || typeof importedData !== "object") return;

    // Evitamos campos que no queremos arrastrar
    const { id, createdAt, updatedAt, ...rest } = importedData;
    const baseStory = rest;

    if (isDemo) {
      const newId = String(Date.now());
      const story = { id: newId, ...baseStory };
      setStories([{ id: newId, ...baseStory }, ...stories]);
      setActiveStoryId(newId);
      setStoryData(story);
      return;
    }

    if (!user || !db) return;

    try {
      setIsSaving(true);
      const ref = await addDoc(
        collection(db, "artifacts", appId, "users", user.uid, "stories"),
        {
          ...baseStory,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );
      setActiveStoryId(ref.id);
    } catch (e) {
      console.error("Error importing story:", e);
      alert("Error al importar la historia.");
    } finally {
      setIsSaving(false);
    }
  };


  const navItems = [ { id: 'structure', label: 'Estructura', icon: Columns }, { id: 'world', label: 'Mundo', icon: Globe }, { id: 'characters', label: 'Personajes', icon: Users }, { id: 'story', label: 'Historia', icon: Scroll } ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#fdfbf7] text-stone-800 md:max-w-4xl md:mx-auto md:border-x md:border-stone-200 md:shadow-2xl overflow-x-hidden selection:bg-amber-200">
      <OlympusBackground />
      <GlobalStyles />
      <main className="flex-1 z-10 relative">
        {(activeStoryId && activeTab !== 'story') 
          ? (activeTab === 'structure' ? <StructureView data={storyData} updateData={updateStoryData}/> : activeTab === 'world' ? <WorldView data={storyData} updateData={updateStoryData}/> : <CharactersView data={storyData} updateData={updateStoryData}/>)
          : <StoryHub 
              user={user}
              stories={stories}
              activeStoryId={activeStoryId}
              setActiveStoryId={setActiveStoryId}
              data={storyData}
              updateData={updateStoryData}
              onCreateStory={handleCreateStory}
              onDemoLogin={handleDemoLogin}
              isSaving={isSaving}
              onDeleteStory={handleDeleteStory}
              auth={auth}   // añadido
              onImportStory={handleImportStory}
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