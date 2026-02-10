import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, Circle, Plus, Trash2, TrendingUp, 
  Sun, Moon, Award, RefreshCw, LayoutDashboard, ListTodo, 
  UserCircle, LogOut, PieChart as PieChartIcon, Users, 
  AlignLeft, Activity, Edit2, X, Check, ShieldCheck,
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Lock, Mail
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
  // Uses relative path to work on both Localhost and GitHub Pages
  const [bgSource, setBgSource] = useState('background.png'); 
  
  const handleError = () => { 
    if (bgSource === 'background.png') setBgSource('background.jpg'); 
    else setBgError(true); 
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#0f0c29]">
      {/* Fallback gradient if image fails */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] opacity-100" />
      
      {!bgError && (
        <img 
          src={bgSource} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 opacity-80 mix-blend-overlay" 
          onError={handleError} 
        />
      )}
      
      {/* Rich Gradient Overlay for text readability */}
      <div className={`absolute inset-0 transition-all duration-700 ${darkMode ? 'bg-slate-950/70 backdrop-blur-[3px]' : 'bg-white/60 backdrop-blur-[8px]'}`} />
    </div>
  );
};

// --- CALENDAR COMPONENT (Rich Green Logic) ---
const CalendarView = ({ dailyHistory, glassClass }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const historyMap = useMemo(() => {
    const map = {};
    dailyHistory.forEach(item => {
      map[item.date] = item.score; 
    });
    return map;
  }, [dailyHistory]);

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDayDate = new Date(year, month, d);
      const dateString = currentDayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const score = historyMap[dateString];
      
      // --- RICH COLOR LOGIC ---
      let bgClass = "bg-white/5 hover:bg-white/10 text-slate-400"; // Default
      
      if (score !== undefined) {
        if (score === 100) {
          // Dark Rich Green
          bgClass = "bg-emerald-600 text-white font-bold shadow-[0_0_15px_rgba(5,150,105,0.5)] border border-emerald-400"; 
        } else if (score >= 50) {
          // Medium Vivid Green
          bgClass = "bg-emerald-500/40 text-emerald-100 border border-emerald-500/50"; 
        } else {
          // Light Soft Green
          bgClass = "bg-emerald-900/30 text-emerald-300/70 border border-emerald-900/30"; 
        }
      }

      const isToday = new Date().toDateString() === currentDayDate.toDateString();
      if (isToday) bgClass += " ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent";

      days.push(
        <div key={d} className={`h-10 w-10 flex items-center justify-center rounded-xl text-sm cursor-pointer transition-all duration-300 ${bgClass}`} title={score !== undefined ? `Score: ${score}%` : 'No Data'}>
          {d}
        </div>
      );
    }
    return days;
  };

  return (
    <div className={`p-6 rounded-3xl ${glassClass}`}>
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-white/10 transition-colors"><ChevronLeft/></button>
        <h2 className="text-xl font-bold tracking-wide bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">{monthNames[month]} {year}</h2>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-white/10 transition-colors"><ChevronRight/></button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-xs font-bold uppercase tracking-wider opacity-60">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2 place-items-center">
        {renderDays()}
      </div>
      <div className="mt-8 flex justify-center gap-6 text-xs font-medium opacity-80">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div> Perfect</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/50"></div> Good</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-900/30 border border-emerald-900/30"></div> Low</div>
      </div>
    </div>
  );
};

// --- CHART COMPONENT ---
const SimplePieChart = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) return <div className="flex items-center justify-center h-48 bg-white/5 rounded-full text-xs text-white/40 border border-white/10 backdrop-blur-sm">No Activity 💤</div>;
    let currentAngle = 0;
    return (
      <svg viewBox="0 0 100 100" className="w-48 h-48 transform -rotate-90 drop-shadow-2xl">
        {data.map((item, i) => {
          const angle = (item.value / total) * 360;
          const x1 = 50 + 50 * Math.cos((Math.PI * currentAngle) / 180);
          const y1 = 50 + 50 * Math.sin((Math.PI * currentAngle) / 180);
          const x2 = 50 + 50 * Math.cos((Math.PI * (currentAngle + angle)) / 180);
          const y2 = 50 + 50 * Math.sin((Math.PI * (currentAngle + angle)) / 180);
          const pathData = item.value === total ? `M 50 50 m -50, 0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0` : `M 50 50 L ${x1} ${y1} A 50 50 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
          const segment = <path key={i} d={pathData} fill={item.color} className="transition-all duration-500 hover:opacity-90 stroke-[#1a1a1a] stroke-1" />;
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
  
  // --- STATE ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('planner'); 
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [dailyHistory, setDailyHistory] = useState([]);
  
  // Inputs & Auth
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

  // --- INITIALIZATION ---
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
        const defaults = { tasks: [], habits: [], dailyHistory: [], savedDate: new Date().toISOString() };
        setDoc(userDocRef, defaults);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // --- LOGIC ---
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
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setAuthError("Wrong credentials. Please enter the correct credentials.");
      } else {
        setAuthError(err.message.replace("Firebase: ", ""));
      }
    }
  };

  const handleLogout = () => signOut(auth);
  
  // Handlers
  const addTask = (e) => { e.preventDefault(); if (!newTaskText.trim()) return; const updated = [...tasks, { id: Date.now(), text: newTaskText, completed: false }]; setTasks(updated); setNewTaskText(""); saveData(updated); };
  const addBulkTasks = (e) => { e.preventDefault(); if (!bulkTaskText.trim()) return; const lines = bulkTaskText.split('\n').filter(line => line.trim() !== ""); const newItems = lines.map((text, index) => ({ id: Date.now() + index, text: text.trim(), completed: false })); const updated = [...tasks, ...newItems]; setTasks(updated); setBulkTaskText(""); setIsBulkMode(false); saveData(updated); };
  const toggleTask = (id) => { const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t); setTasks(updated); saveData(updated); };
  const deleteTask = (id) => { const updated = tasks.filter(t => t.id !== id); setTasks(updated); saveData(updated); };
  const addHabit = (e) => { e.preventDefault(); if (!newHabitText.trim()) return; const updated = [...habits, { id: Date.now(), text: newHabitText, streak: 0, completedToday: false, history: [] }]; setHabits(updated); setNewHabitText(""); saveData(undefined, updated); };
  const toggleHabit = (id) => { const updated = habits.map(h => { if (h.id === id) { const isNowCompleted = !h.completedToday; const newStreak = isNowCompleted ? h.streak + 1 : Math.max(0, h.streak - 1); return { ...h, completedToday: isNowCompleted, streak: newStreak }; } return h; }); setHabits(updated); saveData(undefined, updated); };
  const deleteHabit = (id) => { const updated = habits.filter(h => h.id !== id); setHabits(updated); saveData(undefined, updated); };
  const startEditing = (id, text) => { setEditingId(id); setEditText(text); };
  const saveEdit = (id, isHabit) => {
    if (!editText.trim()) return;
    if (isHabit) { const updated = habits.map(h => h.id === id ? { ...h, text: editText } : h); setHabits(updated); saveData(undefined, updated); } 
    else { const updated = tasks.map(t => t.id === id ? { ...t, text: editText } : t); setTasks(updated); saveData(updated); }
    setEditingId(null); setEditText("");
  };
  const clearCompletedTasks = () => { if (confirm("Remove completed tasks?")) { const updated = tasks.filter(t => !t.completed); setTasks(updated); saveData(updated); } };

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
  
  // Premium Colors
  const pieData = [ { name: 'Tasks', value: tasks.filter(t => t.completed).length, color: '#d946ef' }, { name: 'Habits', value: habits.filter(h => h.completedToday).length, color: '#8b5cf6' }, { name: 'Left', value: tasks.filter(t => !t.completed).length + habits.filter(h => !h.completedToday).length, color: '#64748b' }, ].filter(d => d.value > 0);

  // --- STYLING ---
  // Premium Glassmorphism: Deep blurs, subtle white borders, high contrast
  const glassClass = `backdrop-blur-xl border transition-all duration-300 ${darkMode ? 'bg-slate-900/60 border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-slate-100' : 'bg-white/60 border-white/40 shadow-xl text-slate-900'}`;
  
  const inputClass = `w-full p-4 rounded-xl border bg-transparent outline-none transition-all placeholder:text-slate-500 font-medium ${darkMode ? 'border-white/10 focus:border-fuchsia-500 focus:bg-white/5' : 'border-slate-300 focus:border-violet-500 focus:bg-white/50'}`;
  
  const btnGradient = "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/30";

  // --- RENDER ---
  
  if (loading) return <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center text-white/50">Loading Portal...</div>;

  // 1) LOGIN PORTAL VIEW
  if (!user) {
    return (
      <div className="font-sans min-h-screen flex items-center justify-center relative overflow-hidden">
        <BackgroundImage darkMode={true} />
        <div className={`relative z-10 w-full max-w-md p-8 rounded-3xl ${glassClass} animate-fadeIn border-t border-l border-white/20`}>
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-2xl mb-4 ${btnGradient}`}>
              <ShieldCheck size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">FocusFlow</h1>
            <p className="text-sm font-medium text-slate-400">{isRegistering ? 'Start Your Legacy' : 'Welcome Back, Achiever'}</p>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-xl text-center flex items-center justify-center gap-2 backdrop-blur-sm">
              <X size={16} /> {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {isRegistering && (
              <div className="relative">
                <UserCircle className="absolute left-4 top-4 text-slate-500" size={20} />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className={`${inputClass} pl-12`} />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-500" size={20} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className={`${inputClass} pl-12`} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-500" size={20} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`${inputClass} pl-12`} />
            </div>
            <button type="submit" className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all transform hover:scale-[1.02] ${btnGradient}`}>
              {isRegistering ? 'Create Account 🚀' : 'Enter Portal ✨'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
              {isRegistering ? 'Already have an account? Login' : 'New here? Create Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2) MAIN DASHBOARD VIEW
  return (
    <div className={`font-sans relative min-h-screen ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      <BackgroundImage darkMode={darkMode} />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* HEADER */}
        <header className={`sticky top-0 z-20 backdrop-blur-xl border-b ${darkMode ? 'bg-black/20 border-white/5' : 'bg-white/40 border-white/20'}`}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* LEFT: Name + Tabs */}
            <div className="flex items-center gap-8">
              <div>
                <h1 className="font-bold text-2xl leading-none tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{getGreeting()}</h1>
                <p className="text-xs mt-1 font-medium opacity-60 uppercase tracking-widest hidden sm:block">Stay Consistent</p>
              </div>
              
              {/* Desktop Nav - Next to Name */}
              <div className="hidden md:flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                {['planner', 'tracker', 'calendar', 'stats'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab ? `bg-white/10 text-white shadow-inner border border-white/10` : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: Profile + Controls */}
            <div className="flex items-center gap-4">
              <button onClick={simulateEndDay} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                End Day <RefreshCw size={14} />
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <button onClick={() => setDarkMode(!darkMode)} className={`p-2.5 rounded-full transition-all ${darkMode ? 'bg-white/5 hover:bg-white/10 text-amber-300' : 'bg-black/5 hover:bg-black/10 text-indigo-600'}`}>
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                <button onClick={() => setActiveTab('profile')} className="group relative">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg ring-2 ring-white/20 group-hover:ring-fuchsia-500 transition-all ${btnGradient}`}>
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Nav */}
          <div className="md:hidden flex justify-between px-6 pb-4 pt-2 overflow-x-auto">
             {['planner', 'tracker', 'calendar', 'stats', 'profile'].map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition-all whitespace-nowrap mr-2 ${activeTab === tab ? 'border-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/10' : 'border-transparent text-slate-500'}`}>
                 {tab}
               </button>
             ))}
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 flex-1 w-full animate-fadeIn">
          
          {activeTab === 'planner' && (
            <div className="space-y-6">
              <div className={`rounded-3xl p-6 ${glassClass}`}>
                <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-sm opacity-60 uppercase tracking-widest flex items-center gap-2"><ListTodo className="text-fuchsia-400" /> Daily Tasks</h3><div className="flex gap-2">{tasks.some(t => t.completed) && (<button onClick={clearCompletedTasks} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 flex items-center gap-1 transition-colors"><Trash2 size={12} /> Clear Done</button>)}<button onClick={() => setIsBulkMode(!isBulkMode)} className={`text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1 transition-all`}><AlignLeft size={12} /> {isBulkMode ? "Single" : "Bulk"}</button></div></div>
                {isBulkMode ? (<form onSubmit={addBulkTasks}><textarea value={bulkTaskText} onChange={(e) => setBulkTaskText(e.target.value)} placeholder="One task per line..." className={`${inputClass} h-40 mb-4 font-mono text-sm`} /><button type="submit" className={`w-full py-3 rounded-xl font-bold uppercase tracking-wide transition-all ${btnGradient}`}>Add Tasks</button></form>) : (<form onSubmit={addTask} className="relative group"><input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="What is your focus today?" className={`${inputClass} pr-14`} /><button type="submit" className={`absolute right-2 top-2 p-2.5 rounded-lg transition-all hover:scale-105 ${btnGradient}`}><Plus size={20} /></button></form>)}
              </div>
              <div className="space-y-3">{tasks.length === 0 && (<div className="text-center py-20 opacity-40"><p className="text-xl font-light">Your canvas is empty.</p><p className="text-sm mt-2">Add a task to begin.</p></div>)}{tasks.map(task => (<div key={task.id} className={`group flex items-center justify-between p-5 rounded-2xl transition-all duration-300 ${glassClass} ${task.completed ? 'opacity-50 grayscale' : 'hover:-translate-y-1 hover:border-fuchsia-500/30'}`}><div className="flex items-center gap-5 flex-1"><button onClick={() => toggleTask(task.id)} className={`transition-all duration-300 ${task.completed ? 'text-emerald-400 scale-110' : 'text-slate-500 hover:text-fuchsia-400'}`}>{task.completed ? <CheckCircle2 size={26} className="fill-emerald-500/20" /> : <Circle size={26} />}</button>{editingId === task.id ? (<div className="flex-1 flex gap-2"><input autoFocus type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 bg-transparent border-b border-fuchsia-500 outline-none pb-1" /><button onClick={() => saveEdit(task.id, false)} className="text-emerald-400"><Check size={20}/></button><button onClick={() => setEditingId(null)} className="text-red-400"><X size={20}/></button></div>) : (<span className={`text-lg font-medium flex-1 break-all ${task.completed ? 'line-through decoration-2 decoration-white/20' : ''}`}>{task.text}</span>)}</div><div className="flex items-center opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => startEditing(task.id, task.text)} className="p-2 opacity-60 hover:opacity-100 hover:text-fuchsia-400"><Edit2 size={18} /></button><button onClick={() => deleteTask(task.id)} className="p-2 opacity-60 hover:opacity-100 hover:text-red-400"><Trash2 size={18} /></button></div></div>))}</div>
            </div>
          )}

          {activeTab === 'tracker' && (
            <div className="space-y-8 animate-fadeIn">
              <div className={`rounded-3xl p-6 ${glassClass}`}><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-sm opacity-60 uppercase tracking-widest flex items-center gap-2"><Activity className="text-amber-400" /> Habit Tracker</h3></div><form onSubmit={addHabit} className="flex gap-3"><input type="text" value={newHabitText} onChange={(e) => setNewHabitText(e.target.value)} placeholder="New habit to build..." className={`${inputClass} flex-1`} /><button type="submit" className={`px-8 py-2 rounded-xl font-bold uppercase tracking-wide transition-all hover:scale-105 ${btnGradient}`}>Add</button></form></div>
              <div className="grid gap-4 sm:grid-cols-2">{habits.map(habit => (<div key={habit.id} className={`p-6 rounded-3xl transition-all duration-300 relative overflow-hidden group ${glassClass} ${habit.completedToday ? 'border-emerald-500/30' : ''}`}><div className={`absolute top-0 right-0 p-3 rounded-bl-2xl bg-white/5 backdrop-blur-md transition-all ${habit.completedToday ? 'text-emerald-400' : 'text-slate-600'}`}><TrendingUp size={20} /></div><div className="mb-6"><h3 className="font-bold text-xl">{habit.text}</h3><p className="text-xs font-mono mt-1 opacity-60 flex items-center gap-1"><span className="text-amber-400">🔥</span> {habit.streak} Day Streak</p></div><div className="flex gap-2"><button onClick={() => toggleHabit(habit.id)} className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${habit.completedToday ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/5 hover:bg-white/10 text-slate-400'}`}>{habit.completedToday ? 'Done' : 'Check In'}</button><button onClick={() => deleteHabit(habit.id)} className="p-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"><Trash2 size={18} /></button></div><div className="mt-4 flex gap-1 justify-center opacity-40">{[...habit.history, habit.completedToday ? 1 : 0].slice(-7).map((status, idx) => (<div key={idx} className={`h-1.5 flex-1 rounded-full transition-all ${status ? 'bg-emerald-500' : 'bg-slate-700'}`} />))}</div></div>))}</div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="animate-fadeIn">
              <CalendarView dailyHistory={dailyHistory} glassClass={glassClass} />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6 animate-fadeIn">
              <div className={`p-8 rounded-3xl flex flex-col items-center ${glassClass}`}><h2 className="text-xl font-bold mb-8 tracking-tight uppercase opacity-80">Daily Breakdown</h2><SimplePieChart data={pieData} /><div className="mt-10 flex gap-8 flex-wrap justify-center">{pieData.map((d, i) => (<div key={i} className="flex items-center gap-3"><div className="w-4 h-4 rounded-md shadow-lg" style={{ backgroundColor: d.color }} /><span className="text-sm font-bold opacity-80">{d.name} ({d.value})</span></div>))}</div></div>
              <div className={`p-8 rounded-3xl ${glassClass}`}><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><Award className="text-amber-400" size={28} /><h2 className="text-xl font-bold">Daily Consistency</h2></div><span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">{completionRate}%</span></div><div className="w-full h-4 rounded-full bg-black/40 border border-white/5 overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(192,38,211,0.5)] relative" style={{ width: `${completionRate}%` }}><div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[1px]"></div></div></div></div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={`max-w-md mx-auto p-8 rounded-3xl ${glassClass} text-center`}>
              {user && !user.isAnonymous && (
                <div className="space-y-8">
                  <div className="relative w-32 h-32 mx-auto"><div className={`w-full h-full rounded-full flex items-center justify-center text-5xl text-white font-black shadow-2xl ring-4 ring-white/10 ${btnGradient}`}>{(user.displayName || user.email || 'U')[0].toUpperCase()}</div><div className="absolute bottom-1 right-1 p-2.5 bg-emerald-500 rounded-full border-4 border-slate-900 shadow-lg"><ShieldCheck size={20} className="text-white" /></div></div>
                  <div><h2 className="text-3xl font-bold tracking-tight">{user.displayName || "User"}</h2><p className="text-sm font-mono opacity-50 mt-1">{user.email}</p></div>
                  <div className="grid grid-cols-2 gap-4"><div className="p-4 rounded-2xl bg-white/5 border border-white/10"><p className="text-2xl font-bold text-fuchsia-400">{tasks.filter(t => t.completed).length}</p><p className="text-xs uppercase opacity-50 mt-1">Tasks Done</p></div><div className="p-4 rounded-2xl bg-white/5 border border-white/10"><p className="text-2xl font-bold text-emerald-400">{habits.filter(h => h.streak > 0).length}</p><p className="text-xs uppercase opacity-50 mt-1">Active Habits</p></div></div>
                  <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all font-bold tracking-wide uppercase text-sm"><LogOut size={18} /> Sign Out</button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
