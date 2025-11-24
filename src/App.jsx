import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, CheckSquare, Activity, GraduationCap, DollarSign, 
  Moon, Sun, ChevronRight, Plus, Trash2, Calendar as CalIcon, 
  Clock, Coffee, Brain, Wallet, TrendingUp, TrendingDown, Save, ArrowLeft, ArrowRight,
  Droplets, Dumbbell, BookOpen, Play, Pause, RotateCcw, Download,
  Music, UserMinus, UserPlus, AlertCircle, Sparkles, X, Loader2,
  Focus, Zap, Target, Trophy, Eye, EyeOff, ShoppingBag, HelpCircle,
  Dna, MessageSquare, Edit2, MoreVertical, List, AlertTriangle, FileText,
  Utensils, Scale, CalendarDays, Lock, Unlock, ChevronLeft, Repeat, BarChart2, Filter, LayoutTemplate
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
  ComposedChart
} from 'recharts';

/**
 * GEMINI API UTILS
 */
const apiKey = ""; // <--- ¡PEGA TU API KEY AQUÍ!

const callGemini = async (prompt) => {
  if (!apiKey) return "Error: No has puesto tu API Key en el código.";
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar respuesta.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Lo siento, hubo un error conectando con la IA.";
  }
};

/**
 * CUSTOM HOOK: PERSISTENCIA DE DATOS
 */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

/**
 * UTILS & CONFIG
 */
const generateId = () => Math.random().toString(36).substr(2, 9);
const getTodayString = () => new Date().toISOString().split('T')[0];
const formatDate = (dateString) => {
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

const parseDuration = (durationStr) => {
  // Simple parser: "30 min" -> 30, "1h" -> 60, "1h 30m" -> 90
  if (!durationStr) return 0;
  let total = 0;
  const h = durationStr.match(/(\d+)\s*h/);
  const m = durationStr.match(/(\d+)\s*m/);
  if (h) total += parseInt(h[1]) * 60;
  if (m) total += parseInt(m[1]);
  // Fallback for simple numbers or just "min"
  if (!h && !m) {
     const val = parseInt(durationStr);
     if (!isNaN(val)) total += val;
  }
  return total;
};

/**
 * SHARED COMPONENTS
 */
const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", size = 'md', disabled = false }) => {
  const sizes = { xs: "px-2 py-1 text-xs", sm: "px-3 py-2 text-xs", md: "px-5 py-3 text-sm", lg: "px-6 py-4 text-base" };
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30",
    success: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20",
    ghost: "hover:bg-white/5 text-white/60 hover:text-white",
    ai: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white shadow-lg shadow-purple-500/30 border-none",
    zen: "bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${sizes[size]} rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Header = ({ title, subtitle, onBack, rightContent }) => (
  <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-down">
    <div>
      <h1 className="text-4xl font-bold text-white tracking-tight">
        {title}
      </h1>
      <p className="text-blue-200/40 mt-1 font-medium">{subtitle}</p>
    </div>
    <div className="flex items-center gap-3">
      {rightContent}
      {onBack && (
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft size={18} /> Volver
        </Button>
      )}
    </div>
  </div>
);

const ProgressBar = ({ current, total, color = "bg-blue-500" }) => {
  const percent = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;
  return (
    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }}></div>
    </div>
  );
};

const AIModal = ({ isOpen, onClose, title, content, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white"><X size={20}/></button>
        <div className="flex items-center gap-2 mb-4 text-purple-400">
          <Sparkles size={24} />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 min-h-[150px] text-white/80 leading-relaxed text-sm overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40">
              <Loader2 size={32} className="animate-spin text-purple-500" />
              <p>Consultando a Gemini...</p>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{content}</div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
};

/**
 * APP 1: LIFE HUB (Updated with AI & Summary Modal)
 */
const LifeHub = ({ onBack }) => {
  // -- STATE --
  const [currentDate, setCurrentDate] = useState(getTodayString());
  
  // Almacenamos TODAS las rutinas por fecha
  const [routinesByDate, setRoutinesByDate] = useLocalStorage('nexus_routines_db_v1', {
    [getTodayString()]: [
      //{ id: '1', title: 'Piano', time: '09:00', duration: '30 min', iconName: 'Music', completed: false, repeat: 'daily' },
      //{ id: '2', title: 'Leer', time: '10:00', duration: '30 min', iconName: 'BookOpen', completed: false, repeat: 'daily' }
    ]
  });

  const [taskTemplates, setTaskTemplates] = useLocalStorage('nexus_templates_v2', [
    //{ id: 't1', title: 'Lectura', iconName: 'BookOpen', duration: '30 min', usageCount: 5, lastUsed: '2023-10-01' },
    //{ id: 't2', title: 'Gym', iconName: 'Dumbbell', duration: '1h', usageCount: 12, lastUsed: '2023-10-05' },
    //{ id: 't3', title: 'Deep Work', iconName: 'Brain', duration: '2h', usageCount: 8, lastUsed: '2023-10-04' },
  ]);
  
  const [history, setHistory] = useLocalStorage('nexus_routine_history_v2', []);

  // -- UI STATE --
  const [zenMode, setZenMode] = useState(false);
  const [viewMode, setViewMode] = useState('today');
  const [modal, setModal] = useState({ open: false, type: '', data: null });
  const [templateFilter, setTemplateFilter] = useState('all');
  
  // New States for AI & Summary
  const [aiModal, setAiModal] = useState({ open: false, loading: false, content: '' });
  const [summaryModal, setSummaryModal] = useState({ open: false, data: null });

  // -- DERIVED STATE --
  const currentRoutine = routinesByDate[currentDate] || [];

  // -- SMART ROLLOVER LOGIC --
  useEffect(() => {
    if (routinesByDate[currentDate]) return;
    const dates = Object.keys(routinesByDate).sort();
    const previousDate = dates.reverse().find(d => d < currentDate);

    if (previousDate) {
      const previousTasks = routinesByDate[previousDate];
      const newTasks = previousTasks.map(t => ({
        ...t,
        id: generateId(),
        completed: false 
      }));
      
      setRoutinesByDate(prev => ({ ...prev, [currentDate]: newTasks }));
    } else {
      setRoutinesByDate(prev => ({ ...prev, [currentDate]: [] }));
    }
  }, [currentDate, routinesByDate]);


  // -- HELPERS --
  const getIcon = (name) => {
    const icons = { Music, BookOpen, Dumbbell, Brain, Target, ShoppingBag, Zap, Moon, Laptop: LayoutTemplate, Briefcase: Wallet };
    const IconComponent = icons[name] || Target;
    return <IconComponent size={20} />;
  };

  const changeDate = (days) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  // -- ACTIONS --
  const updateCurrentRoutine = (newRoutine) => {
    setRoutinesByDate(prev => ({ ...prev, [currentDate]: newRoutine }));
  };

  const toggleTask = (id) => {
    updateCurrentRoutine(currentRoutine.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };
  
  const deleteTask = (id) => {
    if(confirm('¿Eliminar tarea solo de este día?')) {
      updateCurrentRoutine(currentRoutine.filter(t => t.id !== id));
    }
  };

  // -- NEW CLOSE DAY LOGIC --
  const closeDay = () => {
    const completedCount = currentRoutine.filter(t => t.completed).length;
    const totalTime = currentRoutine.filter(t => t.completed).reduce((acc, t) => acc + parseDuration(t.duration), 0);
    const score = currentRoutine.length > 0 ? Math.round((completedCount / currentRoutine.length) * 100) : 0;
    
    // Save History immediately
    const newHistoryEntry = { date: currentDate, score, completedCount, totalTasks: currentRoutine.length, timeSpent: totalTime };
    const newHistory = [...history.filter(h => h.date !== currentDate), newHistoryEntry]; 
    setHistory(newHistory);

    // Show Nice Summary Modal instead of alert
    setSummaryModal({
        open: true,
        data: newHistoryEntry
    });
  };

  const finishCloseDay = () => {
    setSummaryModal({ open: false, data: null });
    changeDate(1); // Jump to next day
  };

  // -- AI LOGIC --
  const handleAIOptimize = async () => {
    setAiModal({ open: true, loading: true, content: '', title: 'Optimizador de Rutina' });
    
    const tasksList = currentRoutine.map(t => `- ${t.title} (${t.duration}) a las ${t.time}`).join('\n');
    const prompt = `Actúa como experto en productividad. Analiza esta rutina diaria:\n${tasksList}\n\nDame 3 sugerencias cortas y directas para optimizar el flujo de trabajo o descansos. Sé breve.`;

    const result = await callGemini(prompt);
    setAiModal({ open: true, loading: false, content: result, title: 'Sugerencias de IA' });
  };


  const saveTask = (taskData) => {
    if (!taskData.title) return;
    if (modal.data?.id && modal.type === 'task') { // Edit
      updateCurrentRoutine(currentRoutine.map(t => t.id === modal.data.id ? { ...t, ...taskData } : t));
    } else { // New
      updateCurrentRoutine([...currentRoutine, { ...taskData, id: generateId(), completed: false, category: 'Manual' }]);
    }
    setModal({ open: false, type: '', data: null });
  };

  const applyTemplate = (tpl) => {
    const updatedTemplates = taskTemplates.map(t => t.id === tpl.id ? { ...t, usageCount: (t.usageCount || 0) + 1, lastUsed: getTodayString() } : t);
    setTaskTemplates(updatedTemplates);
    updateCurrentRoutine([...currentRoutine, { id: generateId(), title: tpl.title, duration: tpl.duration, iconName: tpl.iconName, completed: false, repeat: 'none', time: '09:00' }]);
    setModal({ open: false, type: '', data: null });
  };

  const saveTemplate = (tplData) => {
     if(tplData.id) {
        setTaskTemplates(taskTemplates.map(t => t.id === tplData.id ? {...t, ...tplData} : t));
     } else {
        setTaskTemplates([...taskTemplates, { ...tplData, id: generateId(), usageCount: 0, lastUsed: getTodayString() }]);
     }
  };
  const deleteTemplate = (id) => {
    if(confirm("¿Borrar plantilla?")) setTaskTemplates(taskTemplates.filter(t => t.id !== id));
  };

  // -- METRICS --
  const completedTasks = currentRoutine.filter(t => t.completed);
  const progress = currentRoutine.length > 0 ? (completedTasks.length / currentRoutine.length) * 100 : 0;
  const totalMinutes = completedTasks.reduce((acc, t) => acc + parseDuration(t.duration), 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const getFilteredTemplates = () => {
    let sorted = [...taskTemplates];
    if (templateFilter === 'popular') sorted.sort((a,b) => (b.usageCount||0) - (a.usageCount||0));
    if (templateFilter === 'recent') sorted.sort((a,b) => new Date(b.lastUsed||0) - new Date(a.lastUsed||0));
    return sorted;
  };

  const weeklyData = history.slice(-7).map(h => ({ day: formatDate(h.date), score: h.score }));

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <Header 
        title={zenMode ? "Modo Zen" : "LifeHub"} 
        subtitle="Sistema de Productividad" 
        onBack={onBack}
        rightContent={
          <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-white/10">
            <button onClick={() => setViewMode('today')} className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === 'today' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>Agenda</button>
            <button onClick={() => setViewMode('stats')} className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === 'stats' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>Estadísticas</button>
            <button onClick={() => setZenMode(!zenMode)} className={`p-2 rounded-lg text-sm transition-all ${zenMode ? 'bg-emerald-500 text-white' : 'text-white/50 hover:text-white'}`}>{zenMode ? <Eye size={18}/> : <EyeOff size={18}/>}</button>
          </div>
        }
      />

      {/* --- AI MODAL COMPONENT --- */}
      <AIModal isOpen={aiModal.open} onClose={() => setAiModal({...aiModal, open: false})} title={aiModal.title} content={aiModal.content} isLoading={aiModal.loading} />

      {/* --- NEW SUMMARY MODAL --- */}
      {summaryModal.open && summaryModal.data && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
           <Card className="max-w-md w-full bg-slate-900 border-2 border-blue-500/30 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none"></div>
              
              <div className="relative z-10 text-center">
                 <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                    <Trophy size={40} className="text-white"/>
                 </div>
                 
                 <h2 className="text-3xl font-bold text-white mb-1">¡Día Completado!</h2>
                 <p className="text-white/50 mb-6 text-sm uppercase tracking-wider">{formatDate(summaryModal.data.date)}</p>

                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-4xl font-bold text-blue-400 mb-1">{summaryModal.data.score}%</div>
                        <div className="text-xs text-white/40">Efectividad</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-4xl font-bold text-emerald-400 mb-1">{summaryModal.data.completedCount}</div>
                        <div className="text-xs text-white/40">Tareas Listas</div>
                    </div>
                 </div>

                 <p className="text-white/70 italic mb-8">"El éxito es la suma de pequeños esfuerzos repetidos día tras día."</p>

                 <Button variant="primary" className="w-full py-4 text-lg shadow-blue-500/40" onClick={finishCloseDay}>
                    Continuar a Mañana <ArrowRight size={20}/>
                 </Button>
              </div>
           </Card>
        </div>
      )}

      {/* --- DATE NAVIGATION --- */}
      {!zenMode && viewMode === 'today' && (
        <div className="flex justify-between items-center mb-6 animate-fade-in-down">
            <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-white/10">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white/10 rounded-xl"><ChevronLeft size={20}/></button>
            <div className="flex flex-col items-center w-32">
                <span className="text-xs text-white/40 uppercase font-bold">Agenda del</span>
                <span className="font-bold text-lg">{currentDate === getTodayString() ? 'HOY' : formatDate(currentDate)}</span>
            </div>
            <button onClick={() => changeDate(1)} className="p-2 hover:bg-white/10 rounded-xl"><ChevronRight size={20}/></button>
            </div>
            
            <div className="flex gap-2">
               {/* AI BUTTON */}
               {currentRoutine.length > 0 && (
                   <Button size="sm" variant="ai" onClick={handleAIOptimize}>
                       <Sparkles size={16}/> Optimizar Rutina
                   </Button>
               )}
               {currentDate !== getTodayString() && (
                <Button size="sm" variant="secondary" onClick={() => setCurrentDate(getTodayString())}>
                    Volver a Hoy
                </Button>
               )}
            </div>
        </div>
      )}

      {/* --- MODAL TASK --- */}
      {modal.open && modal.type === 'task' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in-up">
           <Card className="max-w-lg w-full border border-white/10 bg-slate-900/80 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="text-2xl font-bold text-white mb-1">{modal.data?.id ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
                   <p className="text-white/40 text-sm">Configura los detalles para {formatDate(currentDate)}</p>
                 </div>
                 <button onClick={() => setModal({ open: false, type: '' })} className="text-white/40 hover:text-white"><X size={24}/></button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); saveTask({ 
                  title: e.target.title.value, 
                  time: e.target.time.value, 
                  duration: e.target.duration.value, 
                  iconName: 'Target', 
                  repeat: e.target.repeat.value
                }); 
              }}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">Título</label>
                    <input name="title" defaultValue={modal.data?.title} placeholder="Ej: Estudiar React" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" autoFocus />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">Hora Inicio</label>
                      <input type="time" name="time" defaultValue={modal.data?.time || '09:00'} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">Duración</label>
                      <input name="duration" defaultValue={modal.data?.duration || '30 min'} placeholder="Ej: 1h" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">Repetición</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['none', 'daily', 'weekly', 'interval'].map(r => (
                        <label key={r} className={`cursor-pointer border rounded-lg p-2 text-center text-sm transition-all ${modal.data?.repeat === r ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/10 hover:bg-white/5 text-white/60'}`}>
                          <input type="radio" name="repeat" value={r} defaultChecked={modal.data?.repeat === r || (r==='none' && !modal.data?.repeat)} className="hidden"/>
                          {r === 'none' ? 'No' : r === 'daily' ? 'Diaria' : r === 'weekly' ? 'Semanal' : 'Intervalo'}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center pt-6 border-t border-white/10">
                   <Button type="button" variant="secondary" onClick={() => setModal({ open: true, type: 'templates' })} className="text-sm px-4 py-2 flex gap-2 items-center border-dashed border-white/30 hover:border-white/60 hover:bg-white/5 shadow-none">
                      <LayoutTemplate size={16}/> Usar Plantilla
                   </Button>
                   <div className="flex gap-3">
                     <Button type="button" variant="ghost" onClick={() => setModal({ open: false, type: '' })}>Cancelar</Button>
                     <Button type="submit" variant="primary" className="px-8">Guardar</Button>
                   </div>
                </div>
              </form>
           </Card>
        </div>
      )}

      {/* --- MODAL TEMPLATES --- */}
      {modal.open && modal.type === 'templates' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in-up">
           <Card className="max-w-4xl w-full h-[80vh] border border-white/10 bg-slate-900 flex flex-col">
              <div className="flex justify-between items-center mb-6 flex-shrink-0">
                 <div>
                   <h3 className="text-2xl font-bold text-white flex items-center gap-2"><LayoutTemplate className="text-purple-400"/> Gestión de Plantillas</h3>
                   <p className="text-white/40">Selecciona o administra tus tareas frecuentes</p>
                 </div>
                 <button onClick={() => setModal({ open: false, type: '' })}><X size={24} className="text-white/50 hover:text-white"/></button>
              </div>

              <div className="flex justify-between items-center mb-6 flex-shrink-0">
                 <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                    {['all', 'recent', 'popular'].map(f => (
                      <button key={f} onClick={() => setTemplateFilter(f)} className={`px-4 py-1.5 rounded-md text-sm capitalize transition-all ${templateFilter === f ? 'bg-purple-600 text-white shadow' : 'text-white/50 hover:text-white'}`}>
                        {f === 'all' ? 'Todas' : f === 'recent' ? 'Recientes' : 'Populares'}
                      </button>
                    ))}
                 </div>
                 <Button size="sm" variant="secondary"><Plus size={16}/> Nueva Plantilla</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto p-2 custom-scrollbar flex-1 content-start">
                 {getFilteredTemplates().map(tpl => (
                   <div key={tpl.id} className="group bg-slate-800/50 border border-white/5 hover:border-purple-500/50 hover:bg-slate-800 p-4 rounded-2xl transition-all relative">
                      <div className="flex justify-between items-start mb-3">
                         <div className="p-3 bg-slate-700 rounded-xl text-purple-300 group-hover:bg-purple-500/20 transition-colors">
                           {getIcon(tpl.iconName)}
                         </div>
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button className="p-1.5 hover:bg-white/10 rounded text-white/70"><Edit2 size={14}/></button>
                            <button onClick={(e) => { e.stopPropagation(); deleteTemplate(tpl.id) }} className="p-1.5 hover:bg-red-500/20 rounded text-red-400"><Trash2 size={14}/></button>
                         </div>
                      </div>
                      <h4 className="font-bold text-lg mb-1">{tpl.title}</h4>
                      <p className="text-xs text-white/40 mb-4 flex items-center gap-2"><Clock size={12}/> {tpl.duration}</p>
                      <Button variant="secondary" className="w-full justify-center text-sm border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-200" onClick={() => applyTemplate(tpl)}>
                         Aplicar
                      </Button>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      )}

      {/* --- ZEN MODE & DASHBOARD --- */}
      {zenMode ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
           <div className="text-center">
             <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse text-emerald-400"><Focus size={48}/></div>
             <h2 className="text-5xl font-bold mb-4 text-white">Modo Zen</h2>
             <p className="text-xl text-white/50 mb-8">Solo tú y tu próxima tarea.</p>
             <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/10 max-w-md mx-auto">
                {currentRoutine.filter(t => !t.completed).length > 0 ? (
                    <>
                        <h3 className="text-2xl font-bold text-white mb-2">{currentRoutine.filter(t => !t.completed)[0].title}</h3>
                        <div className="flex items-center justify-center gap-2 text-white/40 mb-6">
                            <Clock size={16}/> {currentRoutine.filter(t => !t.completed)[0].time}
                        </div>
                        <Button variant="zen" className="w-full justify-center" onClick={() => toggleTask(currentRoutine.filter(t => !t.completed)[0].id)}>
                            Completar Tarea
                        </Button>
                    </>
                ) : (
                    <div className="text-emerald-400 font-bold">¡Todo listo por hoy! Disfruta tu descanso.</div>
                )}
             </div>
           </div>
        </div>
      ) : (
        <>
          {viewMode === 'today' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
              {/* LEFT: DASHBOARD */}
              <div className="lg:col-span-1 space-y-6">
                {/* Main Progress Card */}
                <Card className="relative overflow-hidden border-blue-500/30">
                  <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                  <div className="relative z-10">
                    <span className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-2 block">Progreso {currentDate === getTodayString() ? 'Diario' : formatDate(currentDate)}</span>
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-6xl font-bold text-white">{Math.round(progress)}%</span>
                      <span className="text-white/40 mb-2 text-sm">completado</span>
                    </div>
                    <ProgressBar current={completedTasks.length} total={currentRoutine.length} color="bg-gradient-to-r from-blue-500 to-purple-500" />
                    <div className="flex justify-between mt-4 text-sm text-white/60">
                       <div className="flex flex-col"><span className="font-bold text-white">{completedTasks.length}/{currentRoutine.length}</span><span className="text-xs">Tareas</span></div>
                       <div className="flex flex-col text-right"><span className="font-bold text-white">{hours}h {mins}m</span><span className="text-xs">Tiempo Productivo</span></div>
                    </div>
                  </div>
                </Card>

                {/* Close Day Action */}
                <Card className="bg-slate-800/50 border-white/5 hover:border-white/10 transition-all">
                   <h3 className="font-bold mb-2 flex items-center gap-2"><Moon size={18} className="text-indigo-400"/> Finalizar Jornada</h3>
                   <p className="text-xs text-white/40 mb-4">Guarda las estadísticas de este día. Las tareas de mañana se prepararán automáticamente.</p>
                   <Button className="w-full justify-center" onClick={closeDay}>Cerrar Día</Button>
                </Card>
              </div>

              {/* RIGHT: TASK LIST */}
              <div className="lg:col-span-2 space-y-4">
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold">Tu Agenda</h3>
                    <Button variant="secondary" size="sm" onClick={() => setModal({ open: true, type: 'task', data: null })}><Plus size={16}/> Añadir Tarea</Button>
                 </div>

                 <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-2 min-h-[400px] space-y-2">
                    {currentRoutine.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-64 text-white/30">
                        <List size={48} className="mb-4 opacity-50"/>
                        <p>No hay tareas para {currentDate === getTodayString() ? 'hoy' : 'este día'}</p>
                        <p className="text-xs mt-2 opacity-50">Añade una o espera a que se copien del día anterior.</p>
                      </div>
                    )}
                    {currentRoutine.sort((a,b)=>a.time.localeCompare(b.time)).map(task => (
                      <div key={task.id} className={`group relative p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${task.completed ? 'bg-emerald-900/10 border-emerald-500/20 opacity-60' : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'}`}>
                         {/* Icon */}
                         <div className={`p-3 rounded-xl flex-shrink-0 ${task.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-white/60'}`}>
                            {getIcon(task.iconName)}
                         </div>
                         
                         {/* Info */}
                         <div className="flex-1 cursor-pointer" onClick={() => toggleTask(task.id)}>
                            <h4 className={`font-bold text-lg ${task.completed ? 'line-through text-white/40' : 'text-white'}`}>{task.title}</h4>
                            <div className="flex gap-3 text-xs text-white/40 mt-1">
                               <span className="flex items-center gap-1"><Clock size={12}/> {task.time} ({task.duration})</span>
                               {task.repeat !== 'none' && <span className="flex items-center gap-1 text-blue-400"><Repeat size={12}/> {task.repeat}</span>}
                            </div>
                         </div>

                         {/* Actions */}
                         <div className="flex items-center gap-2">
                            <button onClick={() => setModal({ open: true, type: 'task', data: task })} className="p-2 text-white/20 hover:text-white hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Edit2 size={18}/></button>
                            <button onClick={() => deleteTask(task.id)} className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                            <div onClick={() => toggleTask(task.id)} className={`cursor-pointer w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-white/20 hover:border-emerald-500/50 text-transparent'}`}>
                               <CheckSquare size={16} fill="currentColor"/>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          ) : (
            // STATS VIEW
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
               <Card>
                  <h3 className="font-bold mb-6 flex items-center gap-2"><BarChart2 size={20} className="text-blue-400"/> Rendimiento Semanal</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false}/>
                        <XAxis dataKey="day" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false}/>
                        <Tooltip contentStyle={{background: '#1e293b', border: 'none', borderRadius: '8px'}} cursor={{fill: '#ffffff05'}}/>
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                          {weeklyData.map((e, i) => (
                            <Cell key={i} fill={e.score >= 80 ? '#10b981' : '#3b82f6'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </Card>
               
               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <Card className="flex flex-col items-center justify-center py-8 bg-purple-900/10 border-purple-500/20">
                        <span className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-2">Total Tareas</span>
                        <span className="text-4xl font-bold text-white">{history.reduce((a,b) => a + (b.completedCount||0), 0)}</span>
                     </Card>
                     <Card className="flex flex-col items-center justify-center py-8 bg-orange-900/10 border-orange-500/20">
                        <span className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">Horas Productivas</span>
                        <span className="text-4xl font-bold text-white">{(history.reduce((a,b) => a + (b.timeSpent||0), 0) / 60).toFixed(1)}h</span>
                     </Card>
                  </div>
               </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};


/**
 * APP 2: MY HEALTH BOARD (ADVANCED)
 */
const HealthBoard = ({ onBack }) => {
  // -- PERSISTENT STATE --
  const [profile, setProfile] = useLocalStorage('nexus_health_profile', { 
    weight: 75, height: 180, age: 25, gender: 'male', activity: 1.55, goal: 'maintain' 
  });
  
  const [logs, setLogs] = useLocalStorage('nexus_health_logs', {});
  const [currentDate, setCurrentDate] = useState(getTodayString());
  
  // -- UI STATE --
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'analytics'
  const [aiModal, setAiModal] = useState({ open: false, loading: false, content: '', title: '' });
  
  // -- HELPER: Get Log for Current Date --
  const currentLog = logs[currentDate] || { 
    protein: 0, carbs: 0, fats: 0, water: 0, sleep: 7, creatine: false, weight: profile.weight, notes: '', isClosed: false 
  };

  const updateLog = (field, value) => {
    if (currentLog.isClosed && field !== 'isClosed') return; // Prevent editing if closed
    const newLog = { ...currentLog, [field]: value };
    setLogs({ ...logs, [currentDate]: newLog });
  };

  // -- CALCULATIONS (Mifflin-St Jeor) --
  const calculateTargets = () => {
    const s = profile.gender === 'male' ? 5 : -161;
    let bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + s;
    let tdee = bmr * profile.activity;

    // Goal Adjustment
    if (profile.goal === 'cut') tdee -= 500;
    else if (profile.goal === 'bulk') tdee += 300;

    // Macros (Simplified Logic)
    const protein = Math.round(profile.weight * (profile.goal === 'cut' ? 2.2 : 2.0));
    const fats = Math.round(profile.weight * 0.9);
    const carbs = Math.round((tdee - (protein * 4) - (fats * 9)) / 4);

    return {
      calories: Math.round(tdee),
      protein,
      carbs,
      fats,
      water: Math.round(profile.weight * 35), // 35ml/kg
      creatine: Math.round(profile.weight * 0.1),
      sleep: 8
    };
  };

  const targets = calculateTargets();
  const currentCalories = (currentLog.protein * 4) + (currentLog.carbs * 4) + (currentLog.fats * 9);

  // -- ANALYTICS HELPERS --
  const getWeeklyData = () => {
    const days = [];
    const end = new Date(currentDate);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = logs[dateStr] || { water: 0, sleep: 0, weight: 0 };
      days.push({ name: formatDate(dateStr), ...log });
    }
    return days;
  };

  const handleAIInsight = async () => {
    setAiModal({ open: true, loading: true, content: '', title: 'Coach de Salud IA' });
    const weekly = getWeeklyData();
    const avgSleep = weekly.reduce((a,b) => a + (b.sleep||0),0) / 7;
    const prompt = `Actúa como un coach de salud deportivo. Analiza mis datos de los últimos 7 días:
    - Sueño promedio: ${avgSleep.toFixed(1)}h (Meta: 8h)
    - Objetivo: ${profile.goal}
    - Peso actual: ${profile.weight}kg
    Dame 3 consejos muy específicos y accionables para mejorar mi recuperación y progreso esta semana.`;
    
    const result = await callGemini(prompt);
    setAiModal({ open: true, loading: false, content: result, title: 'Análisis del Coach' });
  };

  // -- NAVIGATION --
  const changeDate = (days) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <Header 
        title="MyHealth Board" 
        subtitle={viewMode === 'daily' ? "Registro Diario y Control" : "Analíticas de Evolución"}
        onBack={onBack} 
        rightContent={
          <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-white/10">
            <button onClick={() => setViewMode('daily')} className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === 'daily' ? 'bg-emerald-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>Diario</button>
            <button onClick={() => setViewMode('analytics')} className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === 'analytics' ? 'bg-emerald-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>Analíticas</button>
          </div>
        }
      />
      
      <AIModal isOpen={aiModal.open} onClose={() => setAiModal({...aiModal, open: false})} title={aiModal.title} content={aiModal.content} isLoading={aiModal.loading} />

      {viewMode === 'daily' ? (
        <div className="animate-fade-in-up">
          {/* DATE NAVIGATION & CONTROLS */}
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-white/10">
                <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white/10 rounded-xl"><ChevronLeft size={20}/></button>
                <div className="flex flex-col items-center w-32">
                   <span className="text-xs text-white/40 uppercase font-bold">Registro del</span>
                   <span className="font-bold text-lg">{currentDate === getTodayString() ? 'HOY' : formatDate(currentDate)}</span>
                </div>
                <button onClick={() => changeDate(1)} disabled={currentDate === getTodayString()} className="p-2 hover:bg-white/10 rounded-xl disabled:opacity-30"><ArrowRight size={20}/></button>
             </div>

             <div className="flex gap-3">
                {currentLog.isClosed ? (
                  <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20">
                    <Lock size={16}/> Día Cerrado
                    <button onClick={() => updateLog('isClosed', false)} className="text-xs underline opacity-70 hover:opacity-100 ml-2">Reabrir</button>
                  </div>
                ) : (
                  <Button variant="secondary" onClick={() => updateLog('isClosed', true)}><Unlock size={16}/> Cerrar Día</Button>
                )}
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: MACROS & CALORIES */}
            <div className="lg:col-span-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* CALORIES CARD */}
                  <Card className="md:col-span-3 bg-gradient-to-r from-slate-900 to-emerald-900/20 border-emerald-500/20">
                     <div className="flex justify-between items-end mb-4">
                       <div>
                         <h3 className="text-emerald-400 font-bold flex items-center gap-2"><Utensils size={18}/> Calorías Hoy</h3>
                         <p className="text-xs text-white/50">Objetivo: {profile.goal.toUpperCase()}</p>
                       </div>
                       <div className="text-right">
                         <span className="text-4xl font-bold">{currentCalories}</span>
                         <span className="text-white/40 text-sm"> / {targets.calories} kcal</span>
                       </div>
                     </div>
                     <ProgressBar current={currentCalories} total={targets.calories} color={currentCalories > targets.calories ? "bg-red-500" : "bg-emerald-500"} />
                  </Card>

                  {/* MACRO INPUTS */}
                  {[
                    { label: 'Proteína', key: 'protein', target: targets.protein, color: 'text-blue-400', bar: 'bg-blue-500' },
                    { label: 'Carbos', key: 'carbs', target: targets.carbs, color: 'text-yellow-400', bar: 'bg-yellow-500' },
                    { label: 'Grasas', key: 'fats', target: targets.fats, color: 'text-pink-400', bar: 'bg-pink-500' }
                  ].map(m => (
                    <Card key={m.key} className="relative overflow-hidden">
                       <div className="flex justify-between mb-2">
                         <span className={`font-bold ${m.color}`}>{m.label}</span>
                         <span className="text-xs text-white/40">{m.target}g</span>
                       </div>
                       <div className="text-3xl font-bold mb-4">{currentLog[m.key]}g</div>
                       <div className="flex gap-2">
                          <button onClick={() => updateLog(m.key, Math.max(0, currentLog[m.key] - 5))} className="flex-1 bg-white/5 hover:bg-white/10 rounded py-1 text-sm">-</button>
                          <button onClick={() => updateLog(m.key, currentLog[m.key] + 5)} className="flex-1 bg-white/5 hover:bg-white/10 rounded py-1 text-sm">+</button>
                       </div>
                       <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
                         <div className={`h-full ${m.bar}`} style={{width: `${Math.min(100, (currentLog[m.key]/m.target)*100)}%`}}></div>
                       </div>
                    </Card>
                  ))}
               </div>

               {/* NOTES */}
               <Card>
                 <h4 className="font-bold mb-2 text-sm flex items-center gap-2"><FileText size={16}/> Notas del Día</h4>
                 <textarea 
                   value={currentLog.notes} 
                   onChange={(e) => updateLog('notes', e.target.value)}
                   placeholder="¿Cómo te sentiste hoy? Energía, digestión..."
                   className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white resize-none h-24 focus:border-emerald-500 outline-none"
                 />
               </Card>
            </div>

            {/* RIGHT: HYDRATION & SLEEP & WEIGHT */}
            <div className="lg:col-span-4 space-y-6">
               {/* WATER */}
               <Card>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-cyan-400 flex items-center gap-2"><Droplets size={18}/> Agua</h3>
                   <span className="text-xs text-white/40">Meta: {targets.water}ml</span>
                 </div>
                 <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90 absolute">
                      <circle cx="50%" cy="50%" r="70" stroke="#1e293b" strokeWidth="10" fill="transparent" />
                      <circle cx="50%" cy="50%" r="70" stroke="#06b6d4" strokeWidth="10" fill="transparent" strokeDasharray={`${(Math.min(currentLog.water, targets.water)/targets.water)*440} 440`} strokeLinecap="round" />
                    </svg>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-white block">{currentLog.water}</span>
                      <span className="text-xs text-cyan-300">ml</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    {[250, 500, 1000].map(v => (
                      <button key={v} onClick={() => updateLog('water', currentLog.water + v)} className="bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-300 py-2 rounded-lg text-xs font-bold transition-all">+{v}</button>
                    ))}
                 </div>
               </Card>

               {/* SLEEP & CREATINE */}
               <Card>
                 <h3 className="font-bold text-purple-400 flex items-center gap-2 mb-4"><Moon size={18}/> Sueño & Suplementos</h3>
                 <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Horas dormidas</span>
                      <span className="font-bold text-purple-300">{currentLog.sleep}h</span>
                    </div>
                    <input 
                      type="range" min="0" max="12" step="0.5" 
                      value={currentLog.sleep} 
                      onChange={(e) => updateLog('sleep', parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                 </div>
                 
                 <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl mb-3">
                    <span className="text-sm flex items-center gap-2"><Zap size={16} className="text-yellow-400"/> Creatina ({targets.creatine}g)</span>
                    <button onClick={() => updateLog('creatine', !currentLog.creatine)} className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${currentLog.creatine ? 'bg-yellow-500 border-yellow-500' : 'border-white/30'}`}>
                      {currentLog.creatine && <CheckSquare size={14} className="text-black"/>}
                    </button>
                 </div>

                 <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl">
                    <span className="text-sm flex items-center gap-2"><Scale size={16} className="text-emerald-400"/> Peso Hoy (kg)</span>
                    <input 
                      type="number" 
                      value={currentLog.weight || ''} 
                      placeholder={profile.weight}
                      onChange={(e) => updateLog('weight', parseFloat(e.target.value))}
                      className="w-20 bg-transparent border-b border-white/20 text-right font-bold focus:border-emerald-500 outline-none"
                    />
                 </div>
               </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in-up">
           {/* ANALYTICS HEADER */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="flex flex-col justify-center items-center bg-emerald-900/10 border-emerald-500/20">
                 <h4 className="text-emerald-400 text-sm font-bold uppercase">Promedio Sueño (7d)</h4>
                 <span className="text-4xl font-bold mt-2">{(getWeeklyData().reduce((a,b)=>a+b.sleep,0)/7).toFixed(1)}h</span>
              </Card>
              <Card className="flex flex-col justify-center items-center bg-cyan-900/10 border-cyan-500/20">
                 <h4 className="text-cyan-400 text-sm font-bold uppercase">Promedio Agua (7d)</h4>
                 <span className="text-4xl font-bold mt-2">{Math.round(getWeeklyData().reduce((a,b)=>a+b.water,0)/7)}ml</span>
              </Card>
              <Card className="flex justify-center items-center p-0">
                 <Button variant="ai" className="w-full h-full rounded-3xl" onClick={handleAIInsight}>
                    <div className="flex flex-col items-center gap-2">
                       <Sparkles size={24}/>
                       <span>Generar Informe Semanal con IA</span>
                    </div>
                 </Button>
              </Card>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                 <h3 className="font-bold mb-6">Evolución de Peso</h3>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={getWeeklyData()}>
                       <defs>
                         <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <XAxis dataKey="name" stroke="#ffffff50" fontSize={12}/>
                       <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide/>
                       <Tooltip contentStyle={{background: '#1e293b', border: 'none'}}/>
                       <Area type="monotone" dataKey="weight" stroke="#10b981" fillOpacity={1} fill="url(#colorWeight)" />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
              </Card>

              <Card>
                 <h3 className="font-bold mb-6">Hábitos (Sueño vs Agua)</h3>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <ComposedChart data={getWeeklyData()}>
                       <XAxis dataKey="name" stroke="#ffffff50" fontSize={12}/>
                       <YAxis yAxisId="left" hide/>
                       <YAxis yAxisId="right" orientation="right" hide/>
                       <Tooltip contentStyle={{background: '#1e293b', border: 'none'}}/>
                       <Bar yAxisId="left" dataKey="water" fill="#06b6d4" radius={[4,4,0,0]} barSize={20} />
                       <Line yAxisId="right" type="monotone" dataKey="sleep" stroke="#a855f7" strokeWidth={3} />
                     </ComposedChart>
                   </ResponsiveContainer>
                 </div>
              </Card>
           </div>
        </div>
      )}
    </div>
  );
};

/**
 * APP 3: STUDY MASTER (Ultimate Calendar & Event Manager)
 */
const StudyMaster = ({ onBack }) => {
  // -- STATE --
  const [subjects, setSubjects] = useLocalStorage('nexus_study_subjects_v3', [
    { 
        id: 1, name: 'Matemáticas', color: 'from-blue-500 to-cyan-500', 
        weights: { theory: 60, practice: 40 }, 
        grades: [
            { id: 'g1', type: 'theory', name: 'Parcial 1', score: 8.5, weight: 20 },
            { id: 'g2', type: 'practice', name: 'Práctica 1', score: 9.0, weight: 50 }
        ]
    }
  ]);
  
  const [events, setEvents] = useLocalStorage('nexus_study_events', []); 
  const [selectedSubject, setSelectedSubject] = useLocalStorage('nexus_selected_subject_v3', null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // UI State
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [modal, setModal] = useState({ open: false, type: '', data: null }); 
  const [activeTab, setActiveTab] = useState('chat'); 

  // AI Chat State
  const [chatInput, setChatInput] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // -- HELPERS --
  const getSubjectColor = (colorClass) => {
     if(colorClass.includes('blue')) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
     if(colorClass.includes('orange')) return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
     if(colorClass.includes('emerald')) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
     if(colorClass.includes('purple')) return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
     return 'text-white border-white/30 bg-white/10';
  };

  const calculateFinalGrade = (subj) => {
      if (!subj.grades || subj.grades.length === 0) return 0;
      const theoryGrades = subj.grades.filter(g => g.type === 'theory');
      const theoryTotalWeight = theoryGrades.reduce((acc, g) => acc + g.weight, 0) || 1;
      const theoryScore = theoryGrades.reduce((acc, g) => acc + (g.score * g.weight), 0) / theoryTotalWeight;
      const practiceGrades = subj.grades.filter(g => g.type === 'practice');
      const practiceTotalWeight = practiceGrades.reduce((acc, g) => acc + g.weight, 0) || 1;
      const practiceScore = practiceGrades.reduce((acc, g) => acc + (g.score * g.weight), 0) / practiceTotalWeight;
      const final = (theoryScore * (subj.weights.theory / 100)) + (practiceScore * (subj.weights.practice / 100));
      return isNaN(final) ? 0 : final.toFixed(2);
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay(); 
  const changeMonth = (offset) => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + offset)));
  const getSubjectName = (id) => subjects.find(s => s.id == id)?.name || 'General';

  // -- ACTIONS --
  const saveSubject = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const newSubject = {
          id: generateId(),
          name: formData.get('name'),
          color: formData.get('color'),
          weights: { theory: Number(formData.get('w_theory')), practice: Number(formData.get('w_practice')) },
          grades: []
      };
      setSubjects([...subjects, newSubject]);
      setModal({ open: false, type: '' });
  };

  const saveEvent = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newEvent = {
        id: generateId(),
        title: formData.get('title'),
        date: formData.get('date'),
        type: formData.get('type'),
        subjectId: formData.get('subjectId')
    };
    setEvents([...events, newEvent]);
    setModal({ open: false, type: '' });
  };

  const deleteEvent = (id) => {
      if(confirm('¿Borrar evento?')) setEvents(events.filter(e => e.id !== id));
  };

  const saveGrade = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const newGrade = {
          id: generateId(),
          name: formData.get('name'),
          score: Number(formData.get('score')),
          weight: Number(formData.get('weight')),
          type: formData.get('type')
      };
      const updatedSubject = { ...selectedSubject, grades: [...selectedSubject.grades, newGrade] };
      setSelectedSubject(updatedSubject);
      setSubjects(subjects.map(s => s.id === selectedSubject.id ? updatedSubject : s));
      setModal({ open: false, type: '' });
  };

  const handleAiMessage = async (e) => {
    e.preventDefault();
    if(!chatInput.trim()) return;
    const userMsg = { role: 'user', text: chatInput };
    setAiChatHistory([...aiChatHistory, userMsg]);
    setChatInput('');
    setIsTyping(true);
    const response = await callGemini(`Tutor de ${selectedSubject.name}. Responde brevemente: ${userMsg.text}`);
    setAiChatHistory(prev => [...prev, { role: 'ai', text: response }]);
    setIsTyping(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-white min-h-screen flex flex-col">
      <style>{`input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}input[type=number]{-moz-appearance:textfield;}`}</style>

      <Header 
        title={selectedSubject ? selectedSubject.name : "StudyMaster"} 
        subtitle={selectedSubject ? "Gestión de Asignatura" : "Panel Académico"} 
        onBack={selectedSubject ? () => { setSelectedSubject(null); setAiChatHistory([]); } : onBack} 
        rightContent={!selectedSubject && (
            <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setCalendarOpen(!calendarOpen)}>
                   <CalendarDays size={16}/> {calendarOpen ? 'Ocultar Calendario' : 'Ver Calendario'}
                </Button>
                <Button size="sm" variant="primary" onClick={() => setModal({open: true, type: 'event'})}>
                   <Plus size={16}/> Nuevo Evento
                </Button>
            </div>
        )}
      />

      {/* --- PRO CALENDAR --- */}
      {!selectedSubject && calendarOpen && (
          <div className="mb-8 bg-slate-900 border border-white/10 rounded-3xl p-6 animate-fade-in-down shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl capitalize flex items-center gap-2">
                      <CalendarDays className="text-purple-400"/> 
                      {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                      <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-md transition-all"><ChevronLeft size={20}/></button>
                      <div className="w-px h-6 bg-white/10 self-center"></div>
                      <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-md transition-all"><ChevronRight size={20}/></button>
                  </div>
              </div>
              
              <div className="grid grid-cols-7 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden">
                  {/* Headers */}
                  {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
                      <div key={d} className="bg-slate-900 p-3 text-center text-xs font-bold uppercase text-white/40 tracking-wider">
                          {d}
                      </div>
                  ))}

                  {/* Empty cells */}
                  {Array.from({length: (getFirstDayOfMonth(currentDate) + 6) % 7}).map((_,i) => (
                      <div key={`empty-${i}`} className="bg-slate-900/50 min-h-[100px]"></div>
                  ))}
                  
                  {/* Days */}
                  {Array.from({length: getDaysInMonth(currentDate)}).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                      const dayEvents = events.filter(e => e.date === dateStr);
                      const isToday = dateStr === getTodayString();

                      return (
                          <div key={day} className={`bg-slate-900 min-h-[100px] p-2 transition-all hover:bg-slate-800 group border-t border-white/5 ${isToday ? 'bg-purple-900/10' : ''}`}>
                              <div className={`text-right mb-1`}>
                                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${isToday ? 'bg-purple-500 text-white' : 'text-white/40'}`}>{day}</span>
                              </div>
                              <div className="flex flex-col gap-1">
                                  {dayEvents.map(ev => (
                                      <div key={ev.id} className={`text-[10px] p-1.5 rounded-md border flex flex-col shadow-sm ${
                                          ev.type === 'exam' 
                                          ? 'bg-red-500/10 border-red-500/20 text-red-200' 
                                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                                      }`}>
                                          <span className="font-bold truncate">{ev.title}</span>
                                          <span className="opacity-60 truncate text-[9px] uppercase">{getSubjectName(ev.subjectId)}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )
                  })}
              </div>
          </div>
      )}

      {selectedSubject ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 animate-fade-in-up">
           <div className="lg:col-span-1 space-y-6">
              <Card className={`bg-gradient-to-br ${selectedSubject.color} border-none relative overflow-hidden min-h-[220px] flex flex-col justify-between`}>
                 <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-1">{selectedSubject.name}</h2>
                    <div className="flex gap-4 mt-4">
                        <div>
                            <p className="text-xs text-white/60 uppercase mb-1">Nota Actual</p>
                            <p className="text-4xl font-bold text-white">{calculateFinalGrade(selectedSubject)}</p>
                        </div>
                        <div className="h-12 w-px bg-white/10"></div>
                        <div>
                            <p className="text-xs text-white/60 uppercase mb-1">Pesos</p>
                            <p className="text-sm text-white/80">Teoría: {selectedSubject.weights.theory}%</p>
                            <p className="text-sm text-white/80">Práctica: {selectedSubject.weights.practice}%</p>
                        </div>
                    </div>
                 </div>
              </Card>
              
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-1 flex gap-1">
                  <button onClick={() => setActiveTab('chat')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                      <Sparkles size={16}/> Chat
                  </button>
                  <button onClick={() => setActiveTab('grades')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'grades' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                      <BarChart2 size={16}/> Notas
                  </button>
                  <button onClick={() => setActiveTab('events')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'events' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                      <CalendarDays size={16}/> Eventos
                  </button>
              </div>
           </div>

           <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden h-[600px] flex flex-col relative">
              
              {activeTab === 'grades' && (
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold text-lg">Desglose de Calificaciones</h3>
                          <Button size="sm" variant="primary" onClick={() => setModal({open: true, type: 'grade'})}><Plus size={16}/> Añadir Nota</Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
                              <h4 className="text-blue-400 font-bold uppercase text-xs mb-4 border-b border-white/5 pb-2">Teoría ({selectedSubject.weights.theory}%)</h4>
                              <div className="space-y-3">
                                  {selectedSubject.grades.filter(g => g.type === 'theory').map(g => (
                                      <div key={g.id} className="flex justify-between items-center bg-black/20 p-3 rounded-xl">
                                          <div>
                                              <p className="font-bold text-sm text-white">{g.name}</p>
                                              <p className="text-xs text-white/40">Vale un {g.weight}%</p>
                                          </div>
                                          <div className="text-xl font-bold text-white">{g.score}</div>
                                      </div>
                                  ))}
                                  {selectedSubject.grades.filter(g => g.type === 'theory').length === 0 && <p className="text-white/20 text-sm text-center py-4">Sin exámenes teóricos</p>}
                              </div>
                          </div>
                          <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
                              <h4 className="text-emerald-400 font-bold uppercase text-xs mb-4 border-b border-white/5 pb-2">Práctica ({selectedSubject.weights.practice}%)</h4>
                              <div className="space-y-3">
                                  {selectedSubject.grades.filter(g => g.type === 'practice').map(g => (
                                      <div key={g.id} className="flex justify-between items-center bg-black/20 p-3 rounded-xl">
                                          <div>
                                              <p className="font-bold text-sm text-white">{g.name}</p>
                                              <p className="text-xs text-white/40">Vale un {g.weight}%</p>
                                          </div>
                                          <div className="text-xl font-bold text-white">{g.score}</div>
                                      </div>
                                  ))}
                                  {selectedSubject.grades.filter(g => g.type === 'practice').length === 0 && <p className="text-white/20 text-sm text-center py-4">Sin entregas prácticas</p>}
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'events' && (
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold text-lg">Próximos Eventos</h3>
                          <Button size="sm" variant="primary" onClick={() => setModal({open: true, type: 'event'})}><Plus size={16}/> Añadir Evento</Button>
                      </div>
                      
                      <div className="space-y-3">
                        {events.filter(e => e.subjectId == selectedSubject.id).length === 0 && (
                            <div className="text-center py-12 text-white/20">
                                <CalendarDays size={48} className="mx-auto mb-4 opacity-50"/>
                                <p>No hay exámenes ni entregas programadas.</p>
                            </div>
                        )}
                        
                        {events.filter(e => e.subjectId == selectedSubject.id)
                            .sort((a,b) => new Date(a.date) - new Date(b.date))
                            .map(ev => (
                            <div key={ev.id} className="bg-slate-800/60 border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-800 transition-all group">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${ev.type === 'exam' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'}`}>
                                    {new Date(ev.date).getDate()}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white">{ev.title}</h4>
                                    <div className="flex gap-4 text-xs text-white/40 mt-1">
                                        <span className="uppercase font-bold">{new Date(ev.date).toLocaleString('es-ES', {month: 'long'})}</span>
                                        <span className="flex items-center gap-1 capitalize"><div className={`w-1.5 h-1.5 rounded-full ${ev.type === 'exam' ? 'bg-red-500' : 'bg-emerald-500'}`}></div> {ev.type === 'exam' ? 'Examen' : 'Entrega'}</span>
                                    </div>
                                </div>
                                <button onClick={() => deleteEvent(ev.id)} className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                            </div>
                        ))}
                      </div>
                  </div>
              )}

              {activeTab === 'chat' && (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {aiChatHistory.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-white/20 opacity-60">
                                <Brain size={48} className="mb-4"/>
                                <p>Chat Académico activo.</p>
                            </div>
                        )}
                        {aiChatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-200'}`}>{msg.text}</div>
                            </div>
                        ))}
                        {isTyping && <div className="p-4 text-white/40 text-xs animate-pulse">Escribiendo...</div>}
                    </div>
                    <form onSubmit={handleAiMessage} className="p-4 bg-slate-900 border-t border-white/5 flex gap-2">
                        <input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Pregunta sobre la asignatura..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:border-purple-500 outline-none"/>
                        <Button type="submit" className="aspect-square flex items-center justify-center bg-purple-600"><ArrowRight size={20}/></Button>
                    </form>
                  </>
              )}
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {subjects.map(subject => (
                <div key={subject.id} onClick={() => setSelectedSubject(subject)} className="group cursor-pointer relative overflow-hidden rounded-3xl bg-slate-800 border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 rounded-2xl ${getSubjectColor(subject.color)}`}><BookOpen size={24}/></div>
                        <div className="bg-black/30 px-3 py-1 rounded-lg border border-white/5">
                            <span className="text-sm font-bold text-white/80">Nota: {calculateFinalGrade(subject)}</span>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{subject.name}</h3>
                    <div className="mt-4 text-xs text-white/40 flex gap-4">
                        <span>Teoría: {subject.weights.theory}%</span>
                        <span>Práctica: {subject.weights.practice}%</span>
                    </div>
                </div>
            ))}
            <button onClick={() => setModal({open: true, type: 'subject'})} className="group rounded-3xl border-2 border-dashed border-white/10 hover:border-purple-500/50 bg-white/5 hover:bg-purple-500/5 flex flex-col items-center justify-center text-white/30 hover:text-purple-400 transition-all min-h-[200px] gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-purple-500/20 flex items-center justify-center transition-all"><Plus size={24}/></div>
                <span className="font-bold">Nueva Asignatura</span>
            </button>
        </div>
      )}

      {modal.open && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
              <Card className="max-w-md w-full border-purple-500/30 bg-slate-900">
                  <h3 className="text-xl font-bold text-white mb-6">
                      {modal.type === 'subject' && 'Nueva Asignatura'}
                      {modal.type === 'event' && 'Nuevo Evento'}
                      {modal.type === 'grade' && 'Registrar Calificación'}
                  </h3>
                  
                  {modal.type === 'subject' && (
                      <form onSubmit={saveSubject} className="space-y-4">
                          <input name="name" required placeholder="Nombre Asignatura" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white"/>
                          <div className="grid grid-cols-2 gap-4">
                              <div><label className="text-xs uppercase text-white/50 block mb-1">Peso Teoría %</label><input name="w_theory" type="number" defaultValue="60" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-center"/></div>
                              <div><label className="text-xs uppercase text-white/50 block mb-1">Peso Práctica %</label><input name="w_practice" type="number" defaultValue="40" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-center"/></div>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                              {['from-blue-500 to-cyan-500', 'from-orange-500 to-red-500', 'from-emerald-500 to-teal-500', 'from-purple-500 to-pink-500'].map((c,i) => (
                                  <label key={i} className="cursor-pointer aspect-square rounded-lg overflow-hidden relative"><input type="radio" name="color" value={c} defaultChecked={i===0} className="peer hidden"/><div className={`absolute inset-0 bg-gradient-to-br ${c} opacity-50 peer-checked:opacity-100`}></div></label>
                              ))}
                          </div>
                          <div className="flex gap-2 pt-4"><Button type="button" variant="ghost" onClick={() => setModal({open:false})} className="flex-1">Cancelar</Button><Button type="submit" variant="primary" className="flex-1">Guardar</Button></div>
                      </form>
                  )}

                  {modal.type === 'event' && (
                      <form onSubmit={saveEvent} className="space-y-4">
                          <input name="title" required placeholder="Título (Ej: Entrega Final)" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white"/>
                          <div className="grid grid-cols-2 gap-4">
                              <input name="date" type="date" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white/70"/>
                              <select name="type" className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 outline-none text-white">
                                  <option value="exam">Examen</option>
                                  <option value="delivery">Entrega</option>
                              </select>
                          </div>
                          <select name="subjectId" defaultValue={selectedSubject ? selectedSubject.id : ''} className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 outline-none text-white">
                              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                          <div className="flex gap-2 pt-4"><Button type="button" variant="ghost" onClick={() => setModal({open:false})} className="flex-1">Cancelar</Button><Button type="submit" variant="primary" className="flex-1">Añadir</Button></div>
                      </form>
                  )}

                  {modal.type === 'grade' && (
                      <form onSubmit={saveGrade} className="space-y-4">
                          <input name="name" required placeholder="Nombre (Ej: Parcial 1)" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white"/>
                          <div className="grid grid-cols-2 gap-4">
                              <div><label className="text-xs uppercase text-white/50 block mb-1">Nota (0-10)</label><input name="score" type="number" step="0.01" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-center"/></div>
                              <div><label className="text-xs uppercase text-white/50 block mb-1">Peso %</label><input name="weight" type="number" required defaultValue="20" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-center"/></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                              <label className="cursor-pointer border border-white/10 rounded-xl p-3 text-center hover:bg-white/5 has-[:checked]:bg-blue-500 transition-all">
                                  <input type="radio" name="type" value="theory" defaultChecked className="hidden"/> <span className="text-sm font-bold">Teoría</span>
                              </label>
                              <label className="cursor-pointer border border-white/10 rounded-xl p-3 text-center hover:bg-white/5 has-[:checked]:bg-emerald-500 transition-all">
                                  <input type="radio" name="type" value="practice" className="hidden"/> <span className="text-sm font-bold">Práctica</span>
                              </label>
                          </div>
                          <div className="flex gap-2 pt-4"><Button type="button" variant="ghost" onClick={() => setModal({open:false})} className="flex-1">Cancelar</Button><Button type="submit" variant="primary" className="flex-1">Guardar</Button></div>
                      </form>
                  )}
              </Card>
          </div>
      )}
    </div>
  );
};


/**
 * APP 4: MONEY FLOW (Smart Increment Logic)
 */
const MoneyFlow = ({ onBack }) => {
  const [view, setView] = useState('overview');
  const [debts, setDebts] = useLocalStorage('nexus_debts', []);
  const [goals, setGoals] = useLocalStorage('nexus_goals', [{id: 1, name: 'PC Gamer', target: 2000, current: 850}]);
  const [cash, setCash] = useLocalStorage('nexus_cash', 2450.50);

  const [modal, setModal] = useState({ open: false, data: {} }); 

  const moneyLent = debts.filter(d => d.type === 'lent').reduce((acc, c) => acc + c.amount, 0);
  const moneyOwed = debts.filter(d => d.type === 'borrowed').reduce((acc, c) => acc + c.amount, 0);
  const netWorth = cash + moneyLent - moneyOwed;

  const saveGoal = () => {
    if(!modal.data.name) return;
    if(modal.data.id) {
       setGoals(goals.map(g => g.id === modal.data.id ? {...g, ...modal.data} : g));
    } else {
       setGoals([...goals, { id: generateId(), current: 0, ...modal.data }]);
    }
    setModal({ open: false, data: {} });
  };
  
  const deleteGoal = (id) => {
    if(confirm("¿Eliminar esta meta?")) setGoals(goals.filter(g => g.id !== id));
  };

  // Helper function for smart increment
  const handleIncrement = (goal) => {
      const remaining = goal.target - goal.current;
      // Si falta menos de 50, sumamos solo lo que falta. Si no, sumamos 50.
      const amountToAdd = remaining < 50 ? remaining : 50;
      
      if (amountToAdd <= 0) return; // Ya está completa

      setGoals(goals.map(g => g.id === goal.id ? {...g, current: g.current + amountToAdd} : g));
      setCash(cash - amountToAdd); // Restamos del efectivo disponible
  };

  const handleDecrement = (goal) => {
      const amountToRemove = goal.current < 50 ? goal.current : 50;
      
      if (amountToRemove <= 0) return;

      setGoals(goals.map(g => g.id === goal.id ? {...g, current: g.current - amountToRemove} : g));
      setCash(cash + amountToRemove); // Devolvemos al efectivo
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      {/* CSS HACK TO HIDE INPUT SPINNERS */}
      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      <Header title="MoneyFlow" subtitle="Finanzas Personales" onBack={onBack} />
      
      {/* GOAL MODAL */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
           <Card className="max-w-sm w-full border-amber-500/30">
             <h3 className="font-bold mb-4 text-xl text-amber-400">
                {modal.data.id ? 'Editar Meta' : 'Nueva Meta de Ahorro'}
             </h3>
             <div className="space-y-4">
               <div>
                 <label className="text-xs font-bold text-white/60 uppercase mb-1 block">Nombre del Objetivo</label>
                 <input 
                    className="w-full bg-slate-900 border border-white/10 focus:border-amber-500 rounded-xl p-3 outline-none transition-all" 
                    placeholder="Ej: Viaje a Japón"
                    value={modal.data.name || ''} 
                    onChange={e => setModal({...modal, data: {...modal.data, name: e.target.value}})} 
                    autoFocus
                 />
               </div>
               <div>
                 <label className="text-xs font-bold text-white/60 uppercase mb-1 block">Meta Total ($)</label>
                 <div className="relative">
                    <span className="absolute left-4 top-3 text-white/40">$</span>
                    <input 
                        type="number" 
                        className="w-full bg-slate-900 border border-white/10 focus:border-amber-500 rounded-xl p-3 pl-8 outline-none transition-all font-mono" 
                        placeholder="0.00"
                        value={modal.data.target || ''} 
                        onChange={e => setModal({...modal, data: {...modal.data, target: Number(e.target.value)}})} 
                    />
                 </div>
               </div>
             </div>
             <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/5">
               <Button variant="ghost" onClick={() => setModal({open: false, data: {}})}>Cancelar</Button>
               <Button onClick={saveGoal} className="bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20">Guardar Meta</Button>
             </div>
           </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:col-span-1 flex flex-row lg:flex-col gap-2">
          <button onClick={() => setView('overview')} className={`flex-1 p-4 rounded-xl text-left transition-all group ${view === 'overview' ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'bg-white/5 hover:bg-white/10'}`}>
            <div className="flex items-center gap-3 mb-1 font-bold"><Wallet size={20}/> Resumen</div>
            <div className={`text-xs ${view === 'overview' ? 'text-slate-800/70' : 'text-white/40 group-hover:text-white/60'}`}>Patrimonio y Metas</div>
          </button>
          <button onClick={() => setView('debts')} className={`flex-1 p-4 rounded-xl text-left transition-all group ${view === 'debts' ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'bg-white/5 hover:bg-white/10'}`}>
            <div className="flex items-center gap-3 mb-1 font-bold"><UserMinus size={20}/> Deudas</div>
            <div className={`text-xs ${view === 'debts' ? 'text-slate-800/70' : 'text-white/40 group-hover:text-white/60'}`}>Préstamos y Cobros</div>
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3">
          {view === 'overview' ? (
            <div className="space-y-6 animate-fade-in-up">
              {/* NET WORTH CARD */}
              <Card className="bg-gradient-to-br from-slate-900 to-amber-900/20 border-amber-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="relative z-10">
                    <span className="text-amber-400/80 text-xs font-bold uppercase tracking-widest mb-2 block">Patrimonio Neto Real</span>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-6xl font-bold text-white tracking-tight">${netWorth.toLocaleString()}</h2>
                        <span className="text-white/40 font-medium">total</span>
                    </div>
                    
                    <div className="mt-8 flex flex-wrap gap-4">
                        <div className="flex items-center gap-4 bg-slate-950/50 border border-white/10 p-3 rounded-2xl pr-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400"><DollarSign size={20}/></div>
                            <div>
                                <div className="text-xs text-white/50 uppercase font-bold">Efectivo Disponible</div>
                                <div className="text-xl font-bold flex items-center gap-2">
                                    ${cash}
                                    <div className="flex flex-col ml-2 gap-0.5">
                                        <button onClick={() => setCash(cash + 10)} className="w-4 h-4 flex items-center justify-center bg-white/10 hover:bg-emerald-500 hover:text-white rounded text-[10px] transition-colors">▲</button>
                                        <button onClick={() => setCash(cash - 10)} className="w-4 h-4 flex items-center justify-center bg-white/10 hover:bg-red-500 hover:text-white rounded text-[10px] transition-colors">▼</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              </Card>

              {/* GOALS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {goals.map(g => (
                   <Card key={g.id} className="group hover:border-amber-500/30 transition-all">
                     <div className="flex justify-between items-center mb-3">
                       <h3 className="font-bold flex items-center gap-2 text-lg"><Target className="text-amber-400" size={18}/> {g.name}</h3>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setModal({open: true, data: g}) }} className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white"><Edit2 size={16}/></button>
                          <button onClick={() => deleteGoal(g.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-white/50 hover:text-red-400"><Trash2 size={16}/></button>
                       </div>
                     </div>
                     
                     <div className="mb-4">
                        <div className="flex justify-between text-xs text-white/50 mb-1">
                            <span>Progreso</span>
                            <span>{Math.round((g.current / g.target) * 100)}%</span>
                        </div>
                        <ProgressBar current={g.current} total={g.target} color="bg-amber-500" />
                        <div className="flex justify-between mt-2 font-mono text-sm">
                            <span className="text-white font-bold">${g.current}</span>
                            <span className="text-white/40">/ ${g.target}</span>
                        </div>
                     </div>

                     {/* SMART INCREMENT CONTROLS */}
                     <div className="flex items-center bg-slate-950/50 rounded-xl p-1 border border-white/5">
                        <button 
                            onClick={() => handleDecrement(g)}
                            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >-</button>
                        <div className="flex-1 text-center text-xs text-white/40 font-medium">Ajustar Fondos</div>
                        <button 
                            onClick={() => handleIncrement(g)}
                            className="w-8 h-8 flex items-center justify-center text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors"
                        >+</button>
                     </div>
                   </Card>
                 ))}

                 {/* 'NEW GOAL' BUTTON */}
                 <button 
                    onClick={() => setModal({open: true, data: {}})} 
                    className="group relative rounded-3xl border-2 border-dashed border-white/10 hover:border-amber-500/50 bg-white/5 hover:bg-amber-500/5 flex flex-col items-center justify-center text-white/30 hover:text-amber-400 transition-all min-h-[220px] gap-4 overflow-hidden"
                 >
                    <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-amber-500/20 flex items-center justify-center transition-all group-hover:scale-110">
                        <Plus size={32}/>
                    </div>
                    <span className="font-bold text-lg">Crear Nueva Meta</span>
                 </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <button onClick={() => setDebts([...debts, {id: generateId(), person: 'Nuevo', amount: 0, type: 'lent', date: 'Hoy'}])} className="p-4 rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 flex items-center justify-center gap-2 text-emerald-400 transition-all active:scale-95">
                    <UserPlus size={18}/> Añadir Préstamo (Activo)
                 </button>
                 <button onClick={() => setDebts([...debts, {id: generateId(), person: 'Nuevo', amount: 0, type: 'borrowed', date: 'Hoy'}])} className="p-4 rounded-2xl border border-dashed border-red-500/30 bg-red-500/5 hover:bg-red-500/10 flex items-center justify-center gap-2 text-red-400 transition-all active:scale-95">
                    <AlertCircle size={18}/> Añadir Deuda (Pasivo)
                 </button>
               </div>

               <div className="space-y-3">
                 {debts.length === 0 && (
                    <div className="text-center py-12 text-white/30">
                        <p>No tienes deudas registradas.</p>
                    </div>
                 )}
                 {debts.map(debt => (
                   <div key={debt.id} className="bg-slate-800/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between border border-white/5 gap-4 hover:border-white/10 transition-all">
                     <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${debt.type === 'lent' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {debt.type === 'lent' ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                       </div>
                       <div>
                          <input 
                            value={debt.person} 
                            onChange={(e) => setDebts(debts.map(d => d.id === debt.id ? {...d, person: e.target.value} : d))} 
                            className="font-bold text-white bg-transparent w-full outline-none border-b border-transparent focus:border-white/30 transition-all placeholder-white/30"
                            placeholder="Nombre Persona"
                          />
                          <p className="text-xs text-white/40 mt-1">{debt.date} • {debt.type === 'lent' ? 'Te deben' : 'Debes'}</p>
                       </div>
                     </div>

                     <div className="flex items-center gap-3 self-end sm:self-auto bg-black/20 p-1.5 rounded-xl pl-4">
                        <span className={`font-bold text-sm mr-2 ${debt.type === 'lent' ? 'text-emerald-400' : 'text-red-400'}`}>$</span>
                        
                        {/* INPUT FOR DEBT AMOUNT (NO SPINNERS) */}
                        <input 
                            type="number"
                            value={debt.amount}
                            onChange={(e) => setDebts(debts.map(d => d.id === debt.id ? {...d, amount: Number(e.target.value)} : d))}
                            className={`bg-transparent w-20 font-mono font-bold text-right outline-none ${debt.type === 'lent' ? 'text-emerald-400' : 'text-red-400'}`}
                        />

                        <div className="h-6 w-px bg-white/10 mx-1"></div>
                        
                        <button onClick={() => { if(confirm("¿Borrar registro?")) setDebts(debts.filter(d => d.id !== debt.id)) }} className="text-white/20 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-all">
                            <Trash2 size={16}/>
                        </button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


/**
 * MAIN LAUNCHER
 */
const Launcher = ({ onLaunch }) => {
  const apps = [
    { id: 'lifehub', name: 'LifeHub', icon: LayoutDashboard, color: 'text-blue-400', bg: 'hover:bg-blue-500/10 hover:border-blue-500/50', desc: 'Rutinas que NO se borran' },
    { id: 'health', name: 'MyHealth', icon: Activity, color: 'text-emerald-400', bg: 'hover:bg-emerald-500/10 hover:border-emerald-500/50', desc: 'Entrenador y Chef IA' },
    { id: 'study', name: 'StudyMaster', icon: GraduationCap, color: 'text-pink-400', bg: 'hover:bg-pink-500/10 hover:border-pink-500/50', desc: 'Tutor Inteligente' },
    { id: 'finance', name: 'MoneyFlow', icon: Wallet, color: 'text-amber-400', bg: 'hover:bg-amber-500/10 hover:border-amber-500/50', desc: 'Tu dinero real' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-200">NEXUS v6.0</h1>
        <p className="text-xl text-blue-200/50 flex items-center justify-center gap-2">Ecosistema Completo de Gestión Personal <Sparkles size={16} className="text-purple-400"/></p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {apps.map((app, index) => (
          <button key={app.id} onClick={() => onLaunch(app.id)} className={`group relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl text-left ${app.bg}`} style={{ animationDelay: `${index * 100}ms` }}>
            <div className={`p-4 rounded-2xl bg-white/5 w-fit mb-6 ${app.color} group-hover:scale-110 transition-transform`}><app.icon size={32} /></div>
            <h2 className="text-2xl font-bold text-white mb-2">{app.name}</h2><p className="text-white/40">{app.desc}</p><div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="text-white/30" /></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [currentApp, setCurrentApp] = useState('launcher');
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px]"></div>
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[100px]"></div>
      </div>
      <div className="relative z-10">
        {currentApp === 'launcher' && <Launcher onLaunch={setCurrentApp} />}
        {currentApp === 'lifehub' && <LifeHub onBack={() => setCurrentApp('launcher')} />}
        {currentApp === 'health' && <HealthBoard onBack={() => setCurrentApp('launcher')} />}
        {currentApp === 'study' && <StudyMaster onBack={() => setCurrentApp('launcher')} />}
        {currentApp === 'finance' && <MoneyFlow onBack={() => setCurrentApp('launcher')} />}
      </div>
    </div>
  );
}