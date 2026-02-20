import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, Circle, Plus, Trash2, TrendingUp, Calendar, 
  Sun, Moon, Award, RefreshCw, LayoutDashboard, ListTodo, 
  UserCircle, LogOut, PieChart as PieChartIcon, Users, 
  Copy, UserPlus, AlignLeft, Activity, Edit2, X, Check, 
  Mail, Bell, ShieldCheck, Utensils
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signOut, onAuthStateChanged, signInAnonymously 
} from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, onSnapshot, collection 
} from 'firebase/firestore';

// --- FIREBASE SETUP ---
const firebaseConfig = {
  apiKey: "AIzaSyAGLJLk3wzCmZrfQLSri0cLkZlBJnCIi-0",
  authDomain: "focusflow-d5411.firebaseapp.com",
  projectId: "focusflow-d5411",
  storageBucket: "focusflow-d5411.firebasestorage.app",
  messagingSenderId: "870983180050",
  appId: "1:870983180050:web:38a6ecbbd089b9d6bcddcb",
  measurementId: "G-E3QGBE2B1H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- DEFAULT DIET PLAN DATA ---
const defaultDietPlan = {
  Monday: {
    type: "Veg 🥦",
    meals: {
      Breakfast: "100g paneer + 50g oats + 5 almonds + 1 fruit",
      Lunch: "2 rotis + dal + mixed veg + salad",
      Snacks: "Sprouts bowl + buttermilk",
      Dinner: "2 rotis + veg curry + curd"
    },
    backup: null
  },
  Tuesday: {
    type: "Non-Veg 🍗",
    meals: {
      Breakfast: "3 whole eggs + 2 whites + oats",
      Lunch: "150g chicken + 2 rotis + veg",
      Snacks: "2 boiled eggs / whey",
      Dinner: "150g fish + stir fry veg"
    },
    backup: {
      Breakfast: "100g paneer + oats",
      Lunch: "150g paneer + 1 cup dal + 2 rotis",
      Snacks: "Whey / roasted chana",
      Dinner: "Tofu/paneer + veg + curd"
    }
  },
  Wednesday: {
    type: "Non-Veg 🍗",
    meals: {
      Breakfast: "Eggs + oats",
      Lunch: "200g chicken + salad",
      Snacks: "Roasted chana",
      Dinner: "150g chicken + veg"
    },
    backup: {
      Breakfast: "Paneer + oats",
      Lunch: "Rajma + paneer + salad",
      Snacks: "Roasted chana",
      Dinner: "Soy chunks + veg"
    }
  },
  Thursday: {
    type: "Non-Veg 🍗",
    meals: {
      Breakfast: "Eggs + oats",
      Lunch: "Fish + small rice + veg",
      Snacks: "Whey + almonds",
      Dinner: "Chicken + veg"
    },
    backup: {
      Breakfast: "Paneer + oats",
      Lunch: "Dal + tofu + small rice",
      Snacks: "Whey + almonds",
      Dinner: "Paneer bhurji + veg"
    }
  },
  Friday: {
    type: "Non-Veg 🍗",
    meals: {
      Breakfast: "Eggs + oats",
      Lunch: "Chicken + 2 rotis + veg",
      Snacks: "Boiled eggs",
      Dinner: "Fish + veg"
    },
    backup: {
      Breakfast: "Paneer + oats",
      Lunch: "Chole + 2 rotis + paneer",
      Snacks: "Sprouts",
      Dinner: "Tofu + veg + curd"
    }
  },
  Saturday: {
    type: "Veg 🥗",
    meals: {
      Breakfast: "Paneer + oats",
      Lunch: "Dal + 2 rotis + veg + curd",
      Snacks: "Sprouts + fruit",
      Dinner: "Veg soup + paneer"
    },
    backup: null
  },
  Sunday: {
    type: "Mix 🍲",
    meals: {
      Breakfast: "Eggs + oats",
      Lunch: "Chicken + dal + 2 rotis",
      Snacks: "Fruit + nuts",
      Dinner: "Veg meal + curd"
    },
    backup: null
  },
  Notes: "🔥 Protein Target:\n- Non-veg days: 140–150g\n- Veg fallback days: 125–135g\n- Veg only days: 115–125g\n\n💡 To Maintain Protein on Veg Days:\nIf needed, add 1 scoop whey (25g protein) OR 50g extra paneer."
};

// --- HELPER COMPONENTS ---
const BackgroundImage = ({ darkMode }) => {
  const [bgError, setBgError] = useState(false);
  const [bgSource, setBgSource] = useState('/background.png'); 
  const handleError = () => { if (bgSource === '/background.png') setBgSource('/background.jpg'); else setBgError(true); };
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {!bgError && <img src={bgSource} alt="Background" className="w-full h-full object-cover transition-opacity duration-1000" onError={handleError} />}
      <div className={`absolute inset-0 transition-colors duration-500 ${darkMode ? 'bg-slate-900/80' : 'bg-slate-50/80'}`} />
    </div>
  );
};

const SimplePieChart = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    let currentAngle = 0;
    if (total === 0) return <div className="flex items-center justify-center h-48 bg-slate-100/50 dark:bg-slate-800/50 rounded-full text-xs text-slate-400">No Data 📭</div>;
    return (
      <svg viewBox="0 0 100 100" className="w-48 h-48 transform -rotate-90 drop-shadow-lg">
        {data.map((item, i) => {
          const angle = (item.value / total) * 360;
          const x1 = 50 + 50 * Math.cos((Math.PI * currentAngle) / 180);
          const y1 = 50 + 50 * Math.sin((Math.PI * currentAngle) / 180);
          const x2 = 50 + 50 * Math.cos((Math.PI * (currentAngle + angle)) / 180);
          const y2 = 50 + 50 * Math.sin((Math.PI * (currentAngle + angle)) / 180);
          const pathData = item.value === total ? `M 50 50 m -50, 0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0` : `M 50 50 L ${x1} ${y1} A 50 50 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
          const segment = <path key={i} d={pathData} fill={item.color} className="transition-all duration-500 hover:opacity-90" />;
          currentAngle += angle;
          return segment;
        })}
      </svg>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // --- STATE ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('planner'); 
  const [isBulkMode, setIsBulkMode] = useState(false);
  
  // Data States
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [dailyHistory, setDailyHistory] = useState([]);
  const [dietPlan, setDietPlan] = useState(defaultDietPlan);
  
  // UI States
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [bulkTaskText, setBulkTaskText] = useState("");
  const [newHabitText, setNewHabitText] = useState("");
  const [isEditingDiet, setIsEditingDiet] = useState(false);

  // Auth States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");

  // Tabs Configuration
  const NAV_TABS = [
    { id: 'planner', label: 'Planner 📝', icon: <ListTodo size={16} /> },
    { id: 'tracker', label: 'Tracker 🔥', icon: <TrendingUp size={16} /> },
    { id: 'diet', label: 'Diet 🥗', icon: <Utensils size={16} /> },
    { id: 'stats', label: 'Stats 📊', icon: <PieChartIcon size={16} /> },
    { id: 'profile', label: 'Profile 👤', icon: <UserCircle size={16} /> }
  ];

  // --- INITIALIZATION ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsOfflineMode(false);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.warn("Guest login unavailable:", error.message);
          setIsOfflineMode(true);
          const localData = localStorage.getItem('focusFlowData');
          if (localData) {
            const parsed = JSON.parse(localData);
            setTasks(parsed.tasks || []);
            setHabits(parsed.habits || []);
            setDailyHistory(parsed.dailyHistory || []);
            setDietPlan(parsed.dietPlan || defaultDietPlan);
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'plannerData'), 'daily');
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTasks(data.tasks || []);
        setHabits(data.habits || []);
        setDailyHistory(data.dailyHistory || []);
        setDietPlan(data.dietPlan || defaultDietPlan);
        if (data.savedDate) setCurrentDate(new Date(data.savedDate));
      } else {
        const defaults = {
          tasks: [{ id: 1, text: "Welcome! Add your first task. ✨", completed: false, category: "General" }],
          habits: [{ id: 1, text: "Check App 📱", streak: 0, completedToday: false, history: [] }],
          dietPlan: defaultDietPlan,
          dailyHistory: [],
          savedDate: new Date().toISOString()
        };
        setDoc(userDocRef, defaults);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const saveData = async (newTasks, newHabits, newHistory, newDate, newDietPlan) => {
    const t = newTasks !== undefined ? newTasks : tasks;
    const h = newHabits !== undefined ? newHabits : habits;
    const hist = newHistory !== undefined ? newHistory : dailyHistory;
    const d = newDate || currentDate;
    const dp = newDietPlan !== undefined ? newDietPlan : dietPlan;
    
    const localPayload = { tasks: t, habits: h, dailyHistory: hist, savedDate: d, dietPlan: dp };
    localStorage.setItem('focusFlowData', JSON.stringify(localPayload));
    
    if (user) {
      const userDocRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'plannerData'), 'daily');
      await setDoc(userDocRef, { tasks: t, habits: h, dailyHistory: hist, savedDate: d.toISOString(), dietPlan: dp }, { merge: true });
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isRegistering) { await createUserWithEmailAndPassword(auth, email, password); } 
      else { await signInWithEmailAndPassword(auth, email, password); }
      setEmail(""); setPassword("");
    } catch (err) { setAuthError(err.message.replace("Firebase: ", "")); }
  };

  const handleLogout = () => signOut(auth);
  
  // --- HANDLERS ---
  const addTask = (e) => { e.preventDefault(); if (!newTaskText.trim()) return; const updated = [...tasks, { id: Date.now(), text: newTaskText, completed: false, category: "General" }]; setTasks(updated); setNewTaskText(""); saveData(updated); };
  const addBulkTasks = (e) => { e.preventDefault(); if (!bulkTaskText.trim()) return; const lines = bulkTaskText.split('\n').filter(line => line.trim() !== ""); const newItems = lines.map((text, index) => ({ id: Date.now() + index, text: text.trim(), completed: false, category: "General" })); const updated = [...tasks, ...newItems]; setTasks(updated); setBulkTaskText(""); setIsBulkMode(false); saveData(updated); };
  const toggleTask = (id) => { const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t); setTasks(updated); saveData(updated); };
  const deleteTask = (id) => { const updated = tasks.filter(t => t.id !== id); setTasks(updated); saveData(updated); };
  const clearCompletedTasks = () => { if (confirm("Remove completed tasks? 🧹")) { const updated = tasks.filter(t => !t.completed); setTasks(updated); saveData(updated); } };
  const addHabit = (e) => { e.preventDefault(); if (!newHabitText.trim()) return; const updated = [...habits, { id: Date.now(), text: newHabitText, streak: 0, completedToday: false, history: [] }]; setHabits(updated); setNewHabitText(""); saveData(undefined, updated); };
  const toggleHabit = (id) => { const updated = habits.map(h => { if (h.id === id) { const isNowCompleted = !h.completedToday; const newStreak = isNowCompleted ? h.streak + 1 : Math.max(0, h.streak - 1); return { ...h, completedToday: isNowCompleted, streak: newStreak }; } return h; }); setHabits(updated); saveData(undefined, updated); };
  const deleteHabit = (id) => { const updated = habits.filter(h => h.id !== id); setHabits(updated); saveData(undefined, updated); };
  
  const handleDietChange = (day, mealType, field, value) => {
    setDietPlan(prev => {
      const dayData = { ...prev[day] };
      if (mealType === 'backup' && !dayData.backup) {
        dayData.backup = { Breakfast: '', Lunch: '', Snacks: '', Dinner: '' };
      }
      return {
        ...prev,
        [day]: {
          ...dayData,
          [mealType]: {
            ...dayData[mealType],
            [field]: value
          }
        }
      };
    });
  };

  const saveDietPlanData = () => {
    setIsEditingDiet(false);
    saveData(undefined, undefined, undefined, undefined, dietPlan);
  };

  const simulateEndDay = () => {
    const totalItems = tasks.length + habits.length; const completedItems = tasks.filter(t => t.completed).length + habits.filter(h => h.completedToday).length; const dayScore = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
    const newHistoryItem = { date: currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), score: dayScore };
    const updatedHistory = [...dailyHistory, newHistoryItem];
    const updatedHabits = habits.map(h => ({ ...h, completedToday: false, streak: h.completedToday ? h.streak : 0, history: [...h.history, h.completedToday ? 1 : 0] }));
    const updatedTasks = tasks.filter(t => !t.completed); const nextDay = new Date(currentDate); nextDay.setDate(nextDay.getDate() + 1);
    setTasks(updatedTasks); setHabits(updatedHabits); setDailyHistory(updatedHistory); setCurrentDate(nextDay);
    saveData(updatedTasks, updatedHabits, updatedHistory, nextDay);
  };

  const completionRate = useMemo(() => { const total = tasks.length + habits.length; if (total === 0) return 0; const done = tasks.filter(t => t.completed).length + habits.filter(h => h.completedToday).length; return Math.round((done / total) * 100); }, [tasks, habits]);
  const pieData = [ { name: 'Tasks 📝', value: tasks.filter(t => t.completed).length, color: '#10b981' }, { name: 'Habits 🔥', value: habits.filter(h => h.completedToday).length, color: '#6366f1' }, { name: 'Left ⏳', value: tasks.filter(t => !t.completed).length + habits.filter(h => !h.completedToday).length, color: '#94a3b8' }, ].filter(d => d.value > 0);

  return (
    <div className="font-sans relative min-h-screen">
      <BackgroundImage darkMode={darkMode} />
      <div className={`relative z-10 flex flex-col min-h-screen transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
        <header className={`sticky top-0 z-20 backdrop-blur-md border-b ${darkMode ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white/60 border-slate-200/50'}`}>
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl backdrop-blur-sm ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100/80 text-indigo-600'}`}>
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h1 className="font-bold text-xl leading-none drop-shadow-sm tracking-tight">FocusFlow 🌊</h1>
                <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} 📅
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={simulateEndDay} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hidden sm:flex backdrop-blur-sm ${darkMode ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' : 'bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`} title="Finish today and start tomorrow"><RefreshCw size={14} /> End Day 🌅</button>
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition-colors backdrop-blur-sm ${darkMode ? 'hover:bg-slate-800/50 text-slate-300' : 'hover:bg-white/50 text-slate-600'}`}>{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 flex-1 w-full">
          {/* TABS NAVIGATION */}
          <div className={`flex p-1 rounded-xl overflow-x-auto backdrop-blur-md ${darkMode ? 'bg-slate-800/60 border border-slate-700/50' : 'bg-slate-200/60 border border-slate-200/50'}`}>
            {NAV_TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-all capitalize whitespace-nowrap ${activeTab === tab.id ? (darkMode ? 'bg-slate-700/80 text-white shadow-lg shadow-black/20' : 'bg-white/80 text-slate-800 shadow-sm') : (darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-slate-700 hover:bg-black/5')}`}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB: PLANNER */}
          {activeTab === 'planner' && (
            <div className="space-y-6 animate-fadeIn">
              <div className={`rounded-xl p-4 border transition-all backdrop-blur-md ${darkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/70 border-slate-200/50'}`}>
                <div className="flex justify-between items-center mb-4"><h3 className="font-medium text-sm text-slate-500">Daily Tasks 📋</h3><div className="flex gap-2">{tasks.some(t => t.completed) && (<button onClick={clearCompletedTasks} className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-red-400 flex items-center gap-1 transition-colors"><Trash2 size={12} /> Clear Done 🧹</button>)}<button onClick={() => setIsBulkMode(!isBulkMode)} className={`text-xs px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-500 flex items-center gap-1`}><AlignLeft size={12} /> {isBulkMode ? "Single Add ✏️" : "Bulk Add 📚"}</button></div></div>
                {isBulkMode ? (<form onSubmit={addBulkTasks}><textarea value={bulkTaskText} onChange={(e) => setBulkTaskText(e.target.value)} placeholder="Enter multiple tasks, one per line... 📝" className={`w-full h-32 p-3 rounded-lg border-0 ring-1 ring-inset shadow-sm focus:ring-2 focus:ring-indigo-500 mb-3 bg-transparent ${darkMode ? 'ring-slate-600 text-white placeholder:text-slate-500' : 'ring-slate-300 text-slate-900 placeholder:text-slate-400'}`} /><button type="submit" className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium shadow-lg shadow-indigo-500/20">Add All Tasks 🚀</button></form>) : (<form onSubmit={addTask} className="relative"><input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="What needs to be done today? 🤔" className={`w-full p-4 pr-12 rounded-xl border-0 ring-1 ring-inset shadow-sm focus:ring-2 focus:ring-indigo-500 bg-transparent ${darkMode ? 'ring-slate-600 text-white placeholder:text-slate-500' : 'ring-slate-300 text-slate-900 placeholder:text-slate-400'}`} /><button type="submit" className="absolute right-2 top-2 p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/20"><Plus size={20} /></button></form>)}
              </div>
              <div className="space-y-3">{tasks.length === 0 && (<div className={`text-center py-12 border-2 border-dashed rounded-xl backdrop-blur-sm ${darkMode ? 'border-slate-700/50 text-slate-500 bg-slate-800/30' : 'border-slate-300/50 text-slate-400 bg-white/30'}`}><p>No tasks yet. Start planning your day! 🎯</p></div>)}{tasks.map(task => (<div key={task.id} className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 backdrop-blur-sm ${task.completed ? (darkMode ? 'bg-slate-800/40 border-slate-700/50 opacity-75' : 'bg-slate-50/60 border-slate-200/50 text-slate-500') : (darkMode ? 'bg-slate-800/80 border-slate-700/80 hover:border-slate-500' : 'bg-white/80 border-slate-200 hover:border-indigo-200 hover:shadow-sm')}`}><div className="flex items-center gap-4 flex-1"><button onClick={() => toggleTask(task.id)} className={`flex-shrink-0 transition-colors ${task.completed ? 'text-emerald-500' : (darkMode ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-300 hover:text-indigo-500')}`}>{task.completed ? <CheckCircle2 size={24} className="fill-emerald-500/10" /> : <Circle size={24} />}</button><span className={`text-base flex-1 break-all ${task.completed ? 'line-through' : ''}`}>{task.text}</span></div><div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => deleteTask(task.id)} className={`p-2 rounded-lg transition-all ${darkMode ? 'text-slate-500 hover:text-red-400 hover:bg-red-400/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}><Trash2 size={18} /></button></div></div>))}</div>
            </div>
          )}

          {/* TAB: TRACKER */}
          {activeTab === 'tracker' && (
            <div className="space-y-8 animate-fadeIn">
              <form onSubmit={addHabit} className="flex gap-2"><input type="text" value={newHabitText} onChange={(e) => setNewHabitText(e.target.value)} placeholder="New habit to track... 🌱" className={`flex-1 p-3 rounded-xl border-0 ring-1 ring-inset focus:ring-2 focus:ring-indigo-500 transition-all bg-transparent backdrop-blur-md ${darkMode ? 'ring-slate-600 text-white placeholder:text-slate-500 bg-slate-800/60' : 'ring-slate-300 text-slate-900 placeholder:text-slate-400 bg-white/70'}`} /><button type="submit" className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-700 font-medium shadow-lg">Add ➕</button></form>
              <div className="space-y-4">{habits.map(habit => (<div key={habit.id} className={`p-5 rounded-2xl border transition-all backdrop-blur-sm ${habit.completedToday ? (darkMode ? 'bg-indigo-900/40 border-indigo-500/30' : 'bg-indigo-50/80 border-indigo-200') : (darkMode ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white/80 border-slate-200')}`}><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3 flex-1"><div className={`p-2 rounded-lg ${habit.completedToday ? 'bg-indigo-500 text-white' : (darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400')}`}><TrendingUp size={20} /></div><div className="flex-1"><h3 className={`font-semibold ${habit.completedToday ? (darkMode ? 'text-indigo-300' : 'text-indigo-900') : ''}`}>{habit.text}</h3><p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{habit.streak} day streak 🔥</p></div></div><div className="flex gap-2"><button onClick={() => toggleHabit(habit.id)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${habit.completedToday ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600' : (darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}`}>{habit.completedToday ? 'Done ✅' : 'Mark ⭕'}</button><button onClick={() => deleteHabit(habit.id)} className={`p-2 rounded-full transition-all ${darkMode ? 'text-slate-600 hover:bg-red-900/20 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-500'}`}><Trash2 size={16} /></button></div></div><div className="flex gap-1 justify-end">{[...habit.history, habit.completedToday ? 1 : 0].slice(-7).map((status, idx) => (<div key={idx} className={`w-2 h-6 rounded-sm ${status ? 'bg-indigo-500' : (darkMode ? 'bg-slate-700' : 'bg-slate-200')}`} />))}</div></div>))}</div>
            </div>
          )}

          {/* TAB: DIET PLANNER */}
          {activeTab === 'diet' && (
            <div className="space-y-6 animate-fadeIn">
              <div className={`p-5 rounded-2xl flex justify-between items-center border backdrop-blur-md ${darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-slate-200/50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                    <Utensils size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">My Diet Plan 🥗</h2>
                    <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Weekly overview & protein targets 🥩</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isEditingDiet) saveDietPlanData();
                    else setIsEditingDiet(true);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-1 ${
                    isEditingDiet
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : darkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                  }`}
                >
                  {isEditingDiet ? 'Save Plan 💾' : 'Edit Plan ✏️'}
                </button>
              </div>

              {/* Days Grid */}
              <div className="grid gap-6">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                   <div key={day} className={`p-5 rounded-2xl border backdrop-blur-md ${darkMode ? 'bg-slate-800/50 border-slate-700/40' : 'bg-white/60 border-slate-200/50'}`}>
                      <div className="flex items-center justify-between mb-4 border-b border-slate-500/20 pb-3">
                         <h3 className={`font-bold text-lg ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{day} 🗓️</h3>
                         <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${dietPlan[day].type.includes('Veg') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                           {dietPlan[day].type}
                         </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                         {/* Main Plan Column */}
                         <div className="space-y-4">
                           <h4 className={`font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} border-b border-dashed border-slate-500/30 pb-1`}>Main Plan 🍛</h4>
                           {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => (
                             <div key={meal}>
                               <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{meal}</span>
                               {isEditingDiet ? (
                                 <input
                                   type="text"
                                   value={dietPlan[day].meals[meal]}
                                   onChange={(e) => handleDietChange(day, 'meals', meal, e.target.value)}
                                   className={`w-full p-2 text-sm rounded border bg-transparent ${darkMode ? 'border-slate-600 focus:border-indigo-500 text-white' : 'border-slate-300 focus:border-indigo-500 text-black'}`}
                                 />
                               ) : (
                                 <p className="text-sm font-medium leading-relaxed">{dietPlan[day].meals[meal]}</p>
                               )}
                             </div>
                           ))}
                         </div>

                         {/* Veg Backup Column */}
                         {(dietPlan[day].backup || isEditingDiet) && (
                           <div className={`space-y-4 p-4 rounded-xl border ${darkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-100'}`}>
                             <h4 className="font-semibold text-sm text-emerald-600 border-b border-dashed border-emerald-500/30 pb-1">Veg Backup Option 🌿</h4>
                             {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => (
                               <div key={meal}>
                                 <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/60 block mb-1">{meal}</span>
                                 {isEditingDiet ? (
                                   <input
                                     type="text"
                                     value={dietPlan[day].backup?.[meal] || ''}
                                     onChange={(e) => handleDietChange(day, 'backup', meal, e.target.value)}
                                     placeholder={`Add veg alternative...`}
                                     className={`w-full p-2 text-sm rounded border bg-transparent ${darkMode ? 'border-emerald-500/30 focus:border-emerald-500 text-white' : 'border-emerald-200 focus:border-emerald-500 text-black'}`}
                                   />
                                 ) : (
                                   <p className="text-sm font-medium leading-relaxed text-emerald-800 dark:text-emerald-200">{dietPlan[day].backup?.[meal] || '-'}</p>
                                 )}
                               </div>
                             ))}
                           </div>
                         )}
                      </div>
                   </div>
                ))}
              </div>

              {/* Notes Section */}
              <div className={`p-6 rounded-2xl border backdrop-blur-md ${darkMode ? 'bg-amber-900/10 border-amber-500/20' : 'bg-amber-50/80 border-amber-200/80'}`}>
                <h3 className="font-bold text-lg text-amber-600 mb-4 flex items-center gap-2">🔥 Important Notes</h3>
                {isEditingDiet ? (
                  <textarea
                    value={dietPlan.Notes}
                    onChange={(e) => setDietPlan({...dietPlan, Notes: e.target.value})}
                    className={`w-full h-40 p-3 text-sm rounded-xl border bg-transparent ${darkMode ? 'border-amber-500/30 text-amber-100 focus:border-amber-500' : 'border-amber-300 text-amber-900 focus:border-amber-500'}`}
                  />
                ) : (
                  <div className={`whitespace-pre-line text-sm leading-relaxed font-medium ${darkMode ? 'text-amber-100/80' : 'text-amber-900/80'}`}>
                    {dietPlan.Notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6 animate-fadeIn">
              <div className={`p-6 rounded-2xl flex flex-col items-center border backdrop-blur-md ${darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-slate-200/50'}`}><h2 className="text-lg font-semibold mb-6">Today's Breakdown 🥧</h2><SimplePieChart data={pieData} /><div className="mt-8 flex gap-6 flex-wrap justify-center">{pieData.map((d, i) => (<div key={i} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /><span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{d.name} ({d.value})</span></div>))}</div></div>
              <div className={`p-6 rounded-2xl border backdrop-blur-md ${darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-slate-200/50'}`}><div className="flex items-center gap-3 mb-4"><Award className="text-amber-500" /><h2 className="text-lg font-semibold">Consistency Score 🏆</h2></div><div className="flex items-end gap-2"><span className="text-4xl font-bold">{completionRate}%</span><span className="text-slate-500 mb-1">completed today 🎯</span></div><div className={`w-full h-2 mt-4 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}><div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-500/50" style={{ width: `${completionRate}%` }} /></div></div>
            </div>
          )}

          {/* TAB: PROFILE / AUTH */}
          {activeTab === 'profile' && (
            <div className={`max-w-md mx-auto p-6 rounded-2xl border backdrop-blur-md ${darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-slate-200/50'} animate-fadeIn`}>
              {user && !user.isAnonymous ? (
                <div className="text-center space-y-6">
                  <div className="relative w-24 h-24 mx-auto"><div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl text-white font-bold shadow-lg shadow-indigo-500/30">{(user.email || 'U')[0].toUpperCase()}</div><div className="absolute bottom-0 right-0 p-2 bg-emerald-500 rounded-full border-4 border-slate-800"><ShieldCheck size={16} className="text-white" /></div></div>
                  <div><h2 className="text-xl font-bold">{user.email}</h2><p className="text-slate-500 text-sm">Account Verified ✅</p></div>
                  <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50/50 transition-colors"><LogOut size={18} /> Sign Out 🚪</button>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="text-center"><h2 className="text-2xl font-bold mb-2">{isRegistering ? 'Create Account 🚀' : 'Welcome Back 👋'}</h2><p className="text-slate-500 text-sm">{isRegistering ? 'Start tracking your journey today. ✨' : 'Login to sync your data across devices. 🔄'}</p>{isOfflineMode && (<div className="mt-2 p-2 bg-amber-500/20 text-amber-300 text-xs rounded border border-amber-500/30">Note: Running in offline mode. Tasks are saved to this device only. ⚠️</div>)}</div>
                   {authError && (<div className="p-3 bg-red-50/90 text-red-600 text-sm rounded-lg border border-red-100">{authError}</div>)}
                   <form onSubmit={handleAuth} className="space-y-4"><div><label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Email 📧</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full p-3 rounded-lg border bg-transparent ${darkMode ? 'border-slate-600 text-white' : 'border-slate-300 text-slate-900'}`} /></div><div><label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Password 🔒</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full p-3 rounded-lg border bg-transparent ${darkMode ? 'border-slate-600 text-white' : 'border-slate-300 text-slate-900'}`} /></div><button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30">{isRegistering ? 'Sign Up ✨' : 'Login 🔑'}</button></form>
                   <div className="text-center"><button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-indigo-500 hover:underline">{isRegistering ? 'Already have an account? Login 🔄' : 'Need an account? Sign Up ➕'}</button></div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
