import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, Circle, Plus, Trash2, TrendingUp, 
  Sun, Moon, Award, RefreshCw, LayoutDashboard, ListTodo, 
  UserCircle, LogOut, PieChart as PieChartIcon, Users, 
  AlignLeft, Activity, Edit2, X, Check, ShieldCheck,
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Lock, Mail, BookOpen, ArrowRight, Brain, Utensils, Dumbbell
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signOut, onAuthStateChanged, updateProfile, signInAnonymously
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

// --- BACKGROUND IMAGE COMPONENT ---
const BackgroundImage = ({ darkMode }) => {
  const [bgError, setBgError] = useState(false);
  const [bgSource, setBgSource] = useState('background.png'); 
  
  const handleError = () => { 
    if (bgSource === 'background.png') setBgSource('background.jpg'); 
    else setBgError(true); 
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-slate-900">
      {/* Fallback gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${darkMode ? 'from-slate-900 via-indigo-950 to-purple-950' : 'from-indigo-50 via-purple-50 to-white'} opacity-100`} />
      
      {!bgError && (
        <img 
          src={bgSource} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 opacity-80" 
          onError={handleError} 
        />
      )}
      
      {/* Overlay: Balanced so image is visible but text pops */}
      <div className={`absolute inset-0 transition-all duration-700 ${darkMode ? 'bg-slate-900/75 backdrop-blur-[2px]' : 'bg-white/60 backdrop-blur-[3px]'}`} />
    </div>
  );
};

// --- SPIDER GRAPH COMPONENT ---
const SpiderGraph = ({ data, label, color }) => {
  // Data expects 5 points: [Energy, Focus, Mood, Health, Sleep] (0-100)
  const size = 200;
  const center = size / 2;
  const radius = 80;
  const angleSlice = (Math.PI * 2) / 5;

  const getPoints = (values) => {
    return values.map((val, i) => {
      const r = (val / 100) * radius;
      const x = center + r * Math.cos(i * angleSlice - Math.PI / 2);
      const y = center + r * Math.sin(i * angleSlice - Math.PI / 2);
      return `${x},${y}`;
    }).join(' ');
  };

  const axisLabels = ["Energy", "Focus", "Mood", "Health", "Sleep"];
  const polyPoints = getPoints(data);
  const fullPolyPoints = getPoints([100, 100, 100, 100, 100]); // Outer ring

  return (
    <div className="flex flex-col items-center animate-fadeIn">
      <h4 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color }}>{label} Benefits</h4>
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid Background */}
        {[25, 50, 75, 100].map(p => (
          <polygon key={p} points={getPoints([p,p,p,p,p])} fill="none" stroke="currentColor" strokeOpacity="0.1" />
        ))}
        {/* Axes */}
        {[0, 1, 2, 3, 4].map(i => {
          const x = center + radius * Math.cos(i * angleSlice - Math.PI / 2);
          const y = center + radius * Math.sin(i * angleSlice - Math.PI / 2);
          return (
            <g key={i}>
              <line x1={center} y1={center} x2={x} y2={y} stroke="currentColor" strokeOpacity="0.1" />
              <text x={x * 1.15 - center * 0.15} y={y * 1.15 - center * 0.15} fontSize="10" textAnchor="middle" fill="currentColor" className="opacity-60 uppercase font-bold">{axisLabels[i]}</text>
            </g>
          );
        })}
        {/* Data Shape */}
        <polygon points={polyPoints} fill={color} fillOpacity="0.4" stroke={color} strokeWidth="2" />
        {/* Dots */}
        {data.map((val, i) => {
          const r = (val / 100) * radius;
          const x = center + r * Math.cos(i * angleSlice - Math.PI / 2);
          const y = center + r * Math.sin(i * angleSlice - Math.PI / 2);
          return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
        })}
      </svg>
      <p className="text-xs mt-4 opacity-60 text-center max-w-[200px]">
        Adopting this habit significantly boosts your <span className="font-bold">Focus</span> and <span className="font-bold">Health</span> metrics.
      </p>
    </div>
  );
};

// --- WELLNESS SECTION COMPONENT ---
const WellnessSection = ({ glassClass, darkMode }) => {
  const [selectedTopic, setSelectedTopic] = useState(null);

  const topics = [
    { 
      id: 'mental', 
      title: "Mental Well-being", 
      icon: <Brain size={20} />, 
      color: "#8b5cf6", // Violet
      graphData: [60, 95, 90, 70, 85],
      tips: ["Meditate 10m daily", "Journal thoughts", "Digital detox after 9 PM"]
    },
    { 
      id: 'food', 
      title: "Food Habits", 
      icon: <Utensils size={20} />, 
      color: "#10b981", // Emerald
      graphData: [90, 80, 75, 95, 70],
      tips: ["Prioritize protein", "Hydrate (3L/day)", "Avoid processed sugar"]
    },
    { 
      id: 'exercise', 
      title: "Exercise Routine", 
      icon: <Dumbbell size={20} />, 
      color: "#f59e0b", // Amber
      graphData: [95, 85, 80, 100, 90],
      tips: ["30m Zone 2 cardio", "Strength training 3x/week", "Daily stretching"]
    }
  ];

  return (
    <div className={`p-6 rounded-3xl ${glassClass} transition-all`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2">🌱 Wellness Hub</h3>
      </div>

      {selectedTopic ? (
        <div className="relative">
          <button 
            onClick={() => setSelectedTopic(null)} 
            className="absolute -top-12 right-0 text-xs font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
          >
            Close ✕
          </button>
          <SpiderGraph 
            data={selectedTopic.graphData} 
            label={selectedTopic.title} 
            color={selectedTopic.color} 
          />
          <div className="mt-6 pt-6 border-t border-white/10">
            <h5 className="font-bold text-sm mb-3">Actionable Tips:</h5>
            <ul className="space-y-2">
              {selectedTopic.tips.map((tip, i) => (
                <li key={i} className="flex items-center gap-2 text-sm opacity-80">
                  <CheckCircle2 size={14} style={{ color: selectedTopic.color }} /> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {topics.map(topic => (
            <button 
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className={`p-4 rounded-2xl border transition-all flex flex-col items-center text-center gap-3 hover:scale-105 ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/50 border-white/40 hover:bg-white/80'}`}
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-sm" style={{ color: topic.color }}>
                {topic.icon}
              </div>
              <span className="text-xs font-bold">{topic.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- CALENDAR COMPONENT ---
const CalendarView = ({ dailyHistory, glassClass }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const historyMap = useMemo(() => {
    const map = {};
    dailyHistory.forEach(item => { map[item.date] = item.score; });
    return map;
  }, [dailyHistory]);

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = new Date(year, month, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const score = historyMap[dateString];
      let bgClass = "bg-white/5 hover:bg-white/10";
      if (score !== undefined) {
        if (score === 100) bgClass = "bg-emerald-500 shadow-lg shadow-emerald-500/30 text-white font-bold";
        else if (score >= 50) bgClass = "bg-emerald-500/50 text-white";
        else bgClass = "bg-emerald-900/30 text-emerald-200/50";
      }
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
      if (isToday) bgClass += " ring-2 ring-indigo-400";
      days.push(<div key={d} className={`h-10 w-10 flex items-center justify-center rounded-xl text-sm cursor-pointer transition-all ${bgClass}`} title={score !== undefined ? `Score: ${score}%` : 'No Data'}>{d}</div>);
    }
    return days;
  };

  return (
    <div className={`p-6 rounded-3xl ${glassClass}`}>
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-white/10 rounded-full"><ChevronLeft/></button>
        <h2 className="text-lg font-bold">{monthNames[month]} {year}</h2>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-white/10 rounded-full"><ChevronRight/></button>
      </div>
      <div className="grid grid-cols-7 gap-2 place-items-center">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-xs font-bold opacity-50">{d}</div>)}{renderDays()}</div>
    </div>
  );
};

// --- CHART COMPONENT ---
const SimplePieChart = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) return <div className="flex items-center justify-center h-48 w-48 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs opacity-50">No Data</div>;
    let currentAngle = 0;
    return (
      <svg viewBox="0 0 100 100" className="w-48 h-48 transform -rotate-90 drop-shadow-xl">
        {data.map((item, i) => {
          const angle = (item.value / total) * 360;
          const x1 = 50 + 50 * Math.cos((Math.PI * currentAngle) / 180);
          const y1 = 50 + 50 * Math.sin((Math.PI * currentAngle) / 180);
          const x2 = 50 + 50 * Math.cos((Math.PI * (currentAngle + angle)) / 180);
          const y2 = 50 + 50 * Math.sin((Math.PI * (currentAngle + angle)) / 180);
          const pathData = item.value === total ? `M 50 50 m -50, 0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0` : `M 50 50 L ${x1} ${y1} A 50 50 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
          const segment = <path key={i} d={pathData} fill={item.color} className="transition-all duration-500 hover:opacity-90 stroke-white/5 stroke-1" />;
          currentAngle += angle;
          return segment;
        })}
      </svg>
    );
};

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('home'); 
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [dailyHistory, setDailyHistory] = useState([]);
  
  const [newTaskText, setNewTaskText] = useState("");
  const [bulkTaskText, setBulkTaskText] = useState("");
  const [newHabitText, setNewHabitText] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); 
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
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
        if (data.savedDate) setCurrentDate(new Date(data.savedDate));
      } else {
        setDoc(userDocRef, { tasks: [], habits: [], dailyHistory: [], savedDate: new Date().toISOString() });
      }
    });
    return () => unsubscribe();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const userName = user?.displayName || user?.email?.split('@')[0] || "Friend";
    if (hour < 12) return `Good Morning, ${userName}`;
    if (hour < 18) return `Good Afternoon, ${userName}`;
    return `Good Evening, ${userName}`;
  };

  const saveData = async (newTasks, newHabits, newHistory, newDate) => {
    if (!user) return;
    const t = newTasks !== undefined ? newTasks : tasks;
    const h = newHabits !== undefined ? newHabits : habits;
    const hist = newHistory !== undefined ? newHistory : dailyHistory;
    const d = newDate || currentDate;
    const userDocRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'plannerData'), 'daily');
    await setDoc(userDocRef, { tasks: t, habits: h, dailyHistory: hist, savedDate: d.toISOString() }, { merge: true });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setEmail(""); setPassword(""); setName("");
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') setAuthError("Wrong credentials.");
      else setAuthError(err.message.replace("Firebase: ", ""));
    }
  };

  const handleLogout = () => signOut(auth);
  const addTask = (e) => { e.preventDefault(); if (!newTaskText.trim()) return; const updated = [...tasks, { id: Date.now(), text: newTaskText, completed: false }]; setTasks(updated); setNewTaskText(""); saveData(updated); };
  const addBulkTasks = (e) => { e.preventDefault(); if (!bulkTaskText.trim()) return; const lines = bulkTaskText.split('\n').filter(line => line.trim() !== ""); const newItems = lines.map((text, index) => ({ id: Date.now() + index, text: text.trim(), completed: false })); const updated = [...tasks, ...newItems]; setTasks(updated); setBulkTaskText(""); setIsBulkMode(false); saveData(updated); };
  const toggleTask = (id) => { const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t); setTasks(updated); saveData(updated); };
  const deleteTask = (id) => { const updated = tasks.filter(t => t.id !== id); setTasks(updated); saveData(updated); };
  const addHabit = (e) => { e.preventDefault(); if (!newHabitText.trim()) return; const updated = [...habits, { id: Date.now(), text: newHabitText, streak: 0, completedToday: false, history: [] }]; setHabits(updated); setNewHabitText(""); saveData(undefined, updated); };
  const toggleHabit = (id) => { const updated = habits.map(h => { if (h.id === id) { const isNowCompleted = !h.completedToday; const newStreak = isNowCompleted ? h.streak + 1 : Math.max(0, h.streak - 1); return { ...h, completedToday: isNowCompleted, streak: newStreak }; } return h; }); setHabits(updated); saveData(undefined, updated); };
  const deleteHabit = (id) => { const updated = habits.filter(h => h.id !== id); setHabits(updated); saveData(undefined, updated); };
  const startEditing = (id, text) => { setEditingId(id); setEditText(text); };
  const saveEdit = (id, isHabit) => { if (!editText.trim()) return; if (isHabit) { const updated = habits.map(h => h.id === id ? { ...h, text: editText } : h); setHabits(updated); saveData(undefined, updated); } else { const updated = tasks.map(t => t.id === id ? { ...t, text: editText } : t); setTasks(updated); saveData(updated); } setEditingId(null); setEditText(""); };
  const clearCompletedTasks = () => { if (confirm("Clear all completed tasks?")) { const updated = tasks.filter(t => !t.completed); setTasks(updated); saveData(updated); } };

  const simulateEndDay = () => {
    const total = tasks.length + habits.length; const done = tasks.filter(t => t.completed).length + habits.filter(h => h.completedToday).length; const score = total === 0 ? 0 : Math.round((done / total) * 100);
    const newHist = { date: currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), score };
    const updHist = [...dailyHistory, newHist];
    const updHabits = habits.map(h => ({ ...h, completedToday: false, streak: h.completedToday ? h.streak : 0, history: [...h.history, h.completedToday ? 1 : 0] }));
    const updTasks = tasks.filter(t => !t.completed); 
    const nextDay = new Date(currentDate); nextDay.setDate(nextDay.getDate() + 1);
    setTasks(updTasks); setHabits(updHabits); setDailyHistory(updHist); setCurrentDate(nextDay);
    saveData(updTasks, updHabits, updHist, nextDay);
  };
  const completionRate = useMemo(() => { const total = tasks.length + habits.length; if (total === 0) return 0; const done = tasks.filter(t => t.completed).length + habits.filter(h => h.completedToday).length; return Math.round((done / total) * 100); }, [tasks, habits]);
  const pieData = [ { name: 'Tasks', value: tasks.filter(t => t.completed).length, color: '#8b5cf6' }, { name: 'Habits', value: habits.filter(h => h.completedToday).length, color: '#ec4899' }, { name: 'Left', value: tasks.filter(t => !t.completed).length + habits.filter(h => !h.completedToday).length, color: darkMode ? '#334155' : '#cbd5e1' }, ].filter(d => d.value > 0);

  // --- STYLING ---
  const glassClass = `backdrop-blur-xl border border-white/20 shadow-xl transition-all duration-300 ${darkMode ? 'bg-slate-900/60 text-slate-100' : 'bg-white/70 text-slate-900'}`;
  const inputClass = `w-full p-4 rounded-xl border outline-none transition-all placeholder:text-slate-400 font-medium ${darkMode ? 'bg-black/20 border-white/10 focus:border-indigo-500' : 'bg-white/50 border-slate-200 focus:border-indigo-600'}`;
  const btnGradient = "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5";

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-indigo-400 font-bold tracking-widest uppercase animate-pulse">Loading FocusFlow...</div>;

  if (!user) {
    return (
      <div className={`font-sans min-h-screen flex items-center justify-center relative overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <BackgroundImage darkMode={darkMode} />
        <div className={`relative z-10 w-full max-w-md p-10 ${glassClass} rounded-3xl`}>
          <div className="text-center mb-10">
            <div className={`w-16 h-16 mx-auto flex items-center justify-center shadow-lg mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl`}>
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">FocusFlow</h1>
            <p className="text-xs font-bold tracking-widest opacity-60 uppercase">{isRegistering ? 'Begin Journey' : 'Welcome Back'}</p>
          </div>
          {authError && (<div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 text-red-200 text-sm rounded-xl text-center flex items-center justify-center gap-2"><X size={14} /> {authError}</div>)}
          <form onSubmit={handleAuth} className="space-y-5">
            {isRegistering && (<div className="relative group"><UserCircle className="absolute left-4 top-4 opacity-50" size={20} /><input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={`${inputClass} pl-12`} /></div>)}
            <div className="relative group"><Mail className="absolute left-4 top-4 opacity-50" size={20} /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={`${inputClass} pl-12`} /></div>
            <div className="relative group"><Lock className="absolute left-4 top-4 opacity-50" size={20} /><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={`${inputClass} pl-12`} /></div>
            <button type="submit" className={`w-full py-4 font-bold tracking-wide rounded-xl ${btnGradient}`}>{isRegistering ? 'Sign Up' : 'Login'}</button>
          </form>
          <div className="mt-8 text-center"><button onClick={() => setIsRegistering(!isRegistering)} className="text-xs font-bold opacity-60 hover:opacity-100 uppercase tracking-widest transition-colors">{isRegistering ? 'Login instead' : 'Create Account'}</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`font-sans relative min-h-screen ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      <BackgroundImage darkMode={darkMode} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className={`sticky top-0 z-20 backdrop-blur-md border-b ${darkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white/50 border-white/20'}`}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div><h1 className="font-bold text-2xl tracking-tight">{getGreeting()}</h1><p className="text-[10px] mt-1 font-bold opacity-60 uppercase tracking-widest hidden sm:block">Stay Consistent</p></div>
              <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                {['home', 'planner', 'tracker', 'calendar', 'stats'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === tab ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}>{tab}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={simulateEndDay} className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-500/20 rounded-lg transition-all">End Day</button>
              <div className="flex items-center gap-3">
                <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
                <button onClick={() => setActiveTab('profile')} className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg ring-2 ring-white/20">{(user.displayName || user.email || 'U')[0].toUpperCase()}</button>
              </div>
            </div>
          </div>
          <div className="md:hidden flex justify-between px-6 pb-3 pt-1 overflow-x-auto border-t border-white/5">{['home', 'planner', 'tracker', 'stats'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab ? 'text-indigo-400 border-b-2 border-indigo-400' : 'opacity-60'}`}>{tab}</button>))}</div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 space-y-8 flex-1 w-full animate-fadeIn">
          {activeTab === 'home' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className={`p-8 ${glassClass} flex flex-col items-center justify-center rounded-3xl`}>
                  <h2 className="text-xl font-bold uppercase tracking-wide mb-6 opacity-80">Daily Progress</h2>
                  <SimplePieChart data={pieData} />
                  <div className="mt-8 flex gap-8"><div className="text-center"><span className="block text-3xl font-bold text-purple-500">{tasks.filter(t => t.completed).length}</span><span className="text-[10px] uppercase tracking-widest opacity-60">Tasks</span></div><div className="w-px bg-white/10"></div><div className="text-center"><span className="block text-3xl font-bold text-pink-500">{habits.filter(h => h.completedToday).length}</span><span className="text-[10px] uppercase tracking-widest opacity-60">Habits</span></div></div>
                </div>
                <div className={`p-6 ${glassClass} rounded-3xl`}>
                  <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-sm uppercase tracking-widest opacity-60">Pending</h3><button onClick={() => setActiveTab('planner')} className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-white transition-colors">Go to Planner &rarr;</button></div>
                  {tasks.filter(t => !t.completed).length > 0 ? (<ul className="space-y-2">{tasks.filter(t => !t.completed).slice(0, 3).map(task => (<li key={task.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"><Circle size={14} className="opacity-50" /><span className="text-sm font-medium truncate">{task.text}</span></li>))}</ul>) : (<p className="text-xs opacity-50 italic">Nothing pending.</p>)}
                </div>
              </div>
              <div className="space-y-6">
                <WellnessSection glassClass={glassClass} darkMode={darkMode} />
              </div>
            </div>
          )}

          {activeTab === 'planner' && (
            <div className="space-y-6">
              <div className={`p-6 ${glassClass} rounded-3xl`}><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg">Daily Tasks</h3><div className="flex gap-2">{tasks.some(t => t.completed) && (<button onClick={clearCompletedTasks} className="text-[10px] px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg uppercase font-bold tracking-wider transition-all">Clear Done</button>)}<button onClick={() => setIsBulkMode(!isBulkMode)} className={`text-[10px] px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg uppercase font-bold tracking-wider transition-all`}>{isBulkMode ? "Single" : "Bulk"}</button></div></div>{isBulkMode ? (<form onSubmit={addBulkTasks}><textarea value={bulkTaskText} onChange={(e) => setBulkTaskText(e.target.value)} placeholder="One task per line..." className={`${inputClass} h-32 mb-4 text-sm`} /><button type="submit" className={`w-full py-3 font-bold uppercase tracking-wide rounded-xl ${btnGradient}`}>Add Tasks</button></form>) : (<form onSubmit={addTask} className="relative group"><input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Add a new task..." className={`${inputClass} pr-12`} /><button type="submit" className={`absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 transition-all text-white rounded-lg`}><Plus size={20} /></button></form>)}</div>
              <div className="space-y-3">{tasks.length === 0 && (<div className="text-center py-20 opacity-30"><p className="text-lg">No tasks yet.</p></div>)}{tasks.map(task => (<div key={task.id} className={`group flex items-center justify-between p-4 ${glassClass} rounded-2xl ${task.completed ? 'opacity-50' : 'hover:-translate-y-1'}`}><div className="flex items-center gap-4 flex-1"><button onClick={() => toggleTask(task.id)} className={`transition-all ${task.completed ? 'text-emerald-400' : 'opacity-40 hover:opacity-100 hover:text-indigo-400'}`}>{task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}</button>{editingId === task.id ? (<div className="flex-1 flex gap-2"><input autoFocus type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 bg-transparent border-b border-indigo-500 outline-none" /><button onClick={() => saveEdit(task.id, false)} className="text-emerald-400"><Check size={18}/></button><button onClick={() => setEditingId(null)} className="text-red-400"><X size={18}/></button></div>) : (<span className={`text-base font-medium flex-1 break-all ${task.completed ? 'line-through' : ''}`}>{task.text}</span>)}</div><div className="flex items-center opacity-0 group-hover:opacity-100 transition-all gap-1"><button onClick={() => startEditing(task.id, task.text)} className="p-2 opacity-50 hover:opacity-100 hover:text-indigo-400"><Edit2 size={16} /></button><button onClick={() => deleteTask(task.id)} className="p-2 opacity-50 hover:opacity-100 hover:text-red-400"><Trash2 size={16} /></button></div></div>))}</div>
            </div>
          )}

          {activeTab === 'tracker' && (
            <div className="space-y-6">
              <div className={`p-6 ${glassClass} rounded-3xl`}><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg">Habit Tracker</h3></div><form onSubmit={addHabit} className="flex gap-3"><input type="text" value={newHabitText} onChange={(e) => setNewHabitText(e.target.value)} placeholder="New habit..." className={`${inputClass} flex-1`} /><button type="submit" className={`px-6 py-2 font-bold uppercase tracking-wider rounded-xl ${btnGradient}`}>Add</button></form></div>
              <div className="grid gap-4 sm:grid-cols-2">{habits.map(habit => (<div key={habit.id} className={`p-6 rounded-2xl border transition-all duration-300 relative group ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-white/60 border-white/40'} ${habit.completedToday ? 'border-indigo-500/50' : ''}`}>{habit.completedToday && <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none rounded-2xl" />}<div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3 flex-1"><div className={`p-2 rounded-lg bg-white/5`}><TrendingUp size={20} className="text-indigo-400" /></div><div className="flex-1"><h3 className="font-bold text-base">{habit.text}</h3><p className="text-xs font-mono mt-1 opacity-60">Streak: <span className="text-indigo-400 font-bold">{habit.streak}</span></p></div></div><div className="flex gap-2"><button onClick={() => toggleHabit(habit.id)} className={`flex-1 py-2 px-4 text-[10px] font-bold uppercase tracking-wider transition-all border rounded-lg ${habit.completedToday ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10'}`}>{habit.completedToday ? 'Done' : 'Mark'}</button><button onClick={() => deleteHabit(habit.id)} className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all rounded-lg"><Trash2 size={16} /></button></div></div><div className="mt-2 flex gap-1 justify-center opacity-40">{[...habit.history, habit.completedToday ? 1 : 0].slice(-7).map((status, idx) => (<div key={idx} className={`h-1 flex-1 rounded-full transition-all ${status ? 'bg-indigo-500' : 'bg-white/10'}`} />))}</div></div>))}</div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="animate-fadeIn">
              <CalendarView dailyHistory={dailyHistory} glassClass={glassClass} />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className={`p-8 ${glassClass} flex flex-col items-center rounded-3xl`}><h2 className="text-lg font-bold mb-8 uppercase tracking-widest opacity-80">Analytics</h2><SimplePieChart data={pieData} /><div className="mt-8 flex gap-8 flex-wrap justify-center">{pieData.map((d, i) => (<div key={i} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-sm font-bold opacity-60">{d.name} <span className={`ml-1 ${darkMode ? 'text-white' : 'text-black'}`}>{d.value}</span></span></div>))}</div></div>
              <div className={`p-8 ${glassClass} rounded-3xl`}><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">Consistency Score</h2><span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{completionRate}%</span></div><div className="w-full h-4 bg-black/20 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${completionRate}%` }} /></div></div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={`max-w-md mx-auto p-8 ${glassClass} rounded-3xl text-center`}>
              {user && !user.isAnonymous && (
                <div className="space-y-8">
                  <div className="relative w-24 h-24 mx-auto"><div className={`w-full h-full flex items-center justify-center text-4xl font-bold text-white rounded-full shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600`}>{(user.displayName || user.email || 'U')[0].toUpperCase()}</div><div className="absolute bottom-0 right-0 p-2 bg-emerald-500 border-4 border-slate-900 rounded-full"><ShieldCheck size={16} className="text-white" /></div></div>
                  <div><h2 className="text-2xl font-bold">{user.displayName || "User"}</h2><p className="text-xs font-mono opacity-50 mt-1 uppercase tracking-widest">{user.email}</p></div>
                  <div className="grid grid-cols-2 gap-4"><div className="p-4 bg-white/5 rounded-xl border border-white/5"><p className="text-3xl font-bold text-purple-400">{tasks.filter(t => t.completed).length}</p><p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Tasks</p></div><div className="p-4 bg-white/5 rounded-xl border border-white/5"><p className="text-3xl font-bold text-pink-400">{habits.filter(h => h.streak > 0).length}</p><p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Streaks</p></div></div>
                  <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-4 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all font-bold tracking-widest uppercase text-xs rounded-xl">Sign Out <LogOut size={16} /></button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
