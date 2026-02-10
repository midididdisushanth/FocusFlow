import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, Circle, Plus, Trash2, TrendingUp, 
  Sun, Moon, Award, RefreshCw, LayoutDashboard, ListTodo, 
  UserCircle, LogOut, PieChart as PieChartIcon, Users, 
  AlignLeft, Activity, Edit2, X, Check, ShieldCheck,
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Lock, Mail, Home as HomeIcon, BookOpen, ArrowRight
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
    <div className="fixed inset-0 z-0 overflow-hidden bg-black">
      {/* Fallback gradient if image fails */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-red-950 opacity-100" />
      
      {!bgError && (
        <img 
          src={bgSource} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 opacity-60 mix-blend-overlay grayscale contrast-125" 
          onError={handleError} 
        />
      )}
      
      {/* Red/Black Gradient Overlay */}
      <div className={`absolute inset-0 transition-all duration-700 ${darkMode ? 'bg-gradient-to-b from-black/80 via-black/60 to-red-950/40 backdrop-blur-[2px]' : 'bg-white/80 backdrop-blur-[5px]'}`} />
    </div>
  );
};

// --- CALENDAR COMPONENT ---
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
      
      // --- GREEN LOGIC (As requested previously) ---
      let bgClass = "bg-white/5 hover:bg-white/10 text-zinc-500"; 
      
      if (score !== undefined) {
        if (score === 100) {
          bgClass = "bg-emerald-700 text-white font-bold border border-emerald-500"; 
        } else if (score >= 50) {
          bgClass = "bg-emerald-600/60 text-white border border-emerald-500/30"; 
        } else {
          bgClass = "bg-emerald-900/30 text-emerald-200/50 border border-emerald-900/20"; 
        }
      }

      const isToday = new Date().toDateString() === currentDayDate.toDateString();
      if (isToday) bgClass += " ring-2 ring-red-500 ring-offset-2 ring-offset-black";

      days.push(
        <div key={d} className={`h-10 w-10 flex items-center justify-center rounded-lg text-sm cursor-pointer transition-all duration-300 ${bgClass}`} title={score !== undefined ? `Score: ${score}%` : 'No Data'}>
          {d}
        </div>
      );
    }
    return days;
  };

  return (
    <div className={`p-6 rounded-none border-l-4 border-red-600 ${glassClass}`}>
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevMonth} className="p-2 rounded hover:bg-white/10 transition-colors"><ChevronLeft/></button>
        <h2 className="text-xl font-black tracking-wider uppercase text-white">{monthNames[month]} {year}</h2>
        <button onClick={nextMonth} className="p-2 rounded hover:bg-white/10 transition-colors"><ChevronRight/></button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center mb-4">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="text-xs font-bold uppercase tracking-wider text-red-500">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2 place-items-center">
        {renderDays()}
      </div>
    </div>
  );
};

// --- CHART COMPONENT ---
const SimplePieChart = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) return <div className="flex items-center justify-center h-48 w-48 bg-zinc-900 rounded-full text-xs text-zinc-500 border border-zinc-800">No Data</div>;
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
          const segment = <path key={i} d={pathData} fill={item.color} className="transition-all duration-500 hover:opacity-90 stroke-black stroke-2" />;
          currentAngle += angle;
          return segment;
        })}
      </svg>
    );
};

// --- ARTICLES COMPONENT ---
const FitnessArticles = ({ glassClass }) => {
  const articles = [
    { title: "The Science of Consistency", desc: "Why small daily habits beat intensity.", time: "5 min read", icon: "🧠" },
    { title: "High Intensity Cardio", desc: "Burn fat fast with this 15 min routine.", time: "15 min workout", icon: "🔥" },
    { title: "Nutrition for Focus", desc: "What to eat to stay sharp all day.", time: "8 min read", icon: "🥗" }
  ];

  return (
    <div className={`p-6 rounded-none border-l-4 border-white ${glassClass}`}>
      <h3 className="font-black text-lg uppercase tracking-widest mb-4 flex items-center gap-2"><BookOpen size={20} className="text-red-500"/> Daily Reads</h3>
      <div className="space-y-3">
        {articles.map((art, i) => (
          <div key={i} className="group flex items-start gap-4 p-4 bg-black/40 border border-white/5 hover:border-red-500/50 hover:bg-black/60 transition-all cursor-pointer">
            <div className="text-2xl bg-zinc-800 w-12 h-12 flex items-center justify-center rounded-sm">{art.icon}</div>
            <div className="flex-1">
              <h4 className="font-bold text-white group-hover:text-red-400 transition-colors">{art.title}</h4>
              <p className="text-xs text-zinc-400 mt-1">{art.desc}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] uppercase tracking-wider font-bold text-zinc-500">
                <span>{art.time}</span> <ArrowRight size={10} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- STATE ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('home'); // Default to Home
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
  
  // Red/Black/White Palette
  const pieData = [ { name: 'Tasks', value: tasks.filter(t => t.completed).length, color: '#DC2626' }, { name: 'Habits', value: habits.filter(h => h.completedToday).length, color: '#ffffff' }, { name: 'Left', value: tasks.filter(t => !t.completed).length + habits.filter(h => !h.completedToday).length, color: '#27272a' }, ].filter(d => d.value > 0);

  // --- STYLING ---
  // Sharp, Industrial, High Contrast (Red/Black)
  const glassClass = `backdrop-blur-xl border-t border-b border-white/10 bg-zinc-950/80 shadow-2xl text-white`;
  const inputClass = `w-full p-4 bg-zinc-900/50 border-l-2 border-zinc-700 outline-none transition-all placeholder:text-zinc-600 font-medium focus:border-red-600 focus:bg-black`;
  const btnGradient = "bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white shadow-lg shadow-red-900/50";

  // --- RENDER ---
  
  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black tracking-widest uppercase">Loading FocusFlow...</div>;

  // 1) LOGIN PORTAL VIEW
  if (!user) {
    return (
      <div className="font-sans min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
        <BackgroundImage darkMode={true} />
        <div className={`relative z-10 w-full max-w-md p-8 ${glassClass} border-l-4 border-red-600`}>
          <div className="text-center mb-8">
            <div className={`w-16 h-16 mx-auto flex items-center justify-center shadow-2xl mb-4 bg-red-600 rounded-sm`}>
              <ShieldCheck size={32} className="text-black" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-2 text-white uppercase italic">Focus<span className="text-red-600">Flow</span></h1>
            <p className="text-sm font-bold tracking-widest text-zinc-500 uppercase">{isRegistering ? 'Join the Ranks' : 'Access Terminal'}</p>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-950/50 border-l-2 border-red-500 text-red-200 text-sm flex items-center justify-center gap-2">
              <X size={16} /> {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {isRegistering && (
              <div className="relative">
                <UserCircle className="absolute left-4 top-4 text-zinc-500" size={20} />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="CODENAME" className={`${inputClass} pl-12 uppercase`} />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-zinc-500" size={20} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="EMAIL" className={`${inputClass} pl-12 uppercase`} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-zinc-500" size={20} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="PASSWORD" className={`${inputClass} pl-12`} />
            </div>
            <button type="submit" className={`w-full py-4 font-black uppercase tracking-widest transition-all hover:translate-x-1 ${btnGradient}`}>
              {isRegistering ? 'Initiate' : 'Login'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-xs font-bold text-zinc-500 hover:text-red-500 uppercase tracking-wide transition-colors">
              {isRegistering ? 'Already have an account? Login' : 'First time? Create Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2) MAIN DASHBOARD VIEW
  return (
    <div className="font-sans relative min-h-screen text-white bg-black selection:bg-red-600 selection:text-white">
      <BackgroundImage darkMode={true} />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* HEADER */}
        <header className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/5 bg-black/50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* LEFT: Name + Tabs */}
            <div className="flex items-center gap-8">
              <div>
                <h1 className="font-black text-2xl leading-none tracking-tighter uppercase italic">{getGreeting()}</h1>
                <p className="text-[10px] mt-1 font-bold text-red-600 uppercase tracking-[0.2em] hidden sm:block">No Excuses</p>
              </div>
              
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-1">
                {['home', 'planner', 'tracker', 'calendar', 'stats'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest skew-x-[-10deg] transition-all ${activeTab === tab ? `bg-red-600 text-black` : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                  >
                    <span className="block skew-x-[10deg]">{tab}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: Profile */}
            <div className="flex items-center gap-4">
              <button onClick={simulateEndDay} className="hidden sm:flex items-center gap-2 px-4 py-2 border border-red-900/50 bg-red-950/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-black hover:border-red-600 transition-all">
                End Day
              </button>
              
              <button onClick={() => setActiveTab('profile')} className="group relative">
                <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center text-lg font-black text-white border border-zinc-700 group-hover:border-red-600 group-hover:text-red-500 transition-all">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              </button>
            </div>
          </div>
          
          {/* Mobile Nav */}
          <div className="md:hidden flex justify-between px-6 pb-4 pt-2 overflow-x-auto border-t border-white/5 bg-black/80">
             {['home', 'planner', 'tracker', 'stats'].map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap mr-2 ${activeTab === tab ? 'text-red-500 border-b-2 border-red-500' : 'text-zinc-500'}`}>
                 {tab}
               </button>
             ))}
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 space-y-8 flex-1 w-full animate-fadeIn">
          
          {/* --- HOME TAB (NEW) --- */}
          {activeTab === 'home' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Chart & Quick Stats */}
              <div className="space-y-6">
                <div className={`p-8 ${glassClass} flex flex-col items-center justify-center border-l-4 border-red-600`}>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter mb-6">Daily Status</h2>
                  <SimplePieChart data={pieData} />
                  <div className="mt-6 flex gap-4">
                     <div className="text-center">
                       <span className="block text-2xl font-black text-red-600">{tasks.filter(t => t.completed).length}</span>
                       <span className="text-[10px] uppercase tracking-widest text-zinc-500">Tasks</span>
                     </div>
                     <div className="w-px bg-zinc-800"></div>
                     <div className="text-center">
                       <span className="block text-2xl font-black text-white">{habits.filter(h => h.completedToday).length}</span>
                       <span className="text-[10px] uppercase tracking-widest text-zinc-500">Habits</span>
                     </div>
                  </div>
                </div>
                
                {/* To-Do Summary */}
                <div className={`p-6 ${glassClass}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-400">Pending Tasks</h3>
                    <button onClick={() => setActiveTab('planner')} className="text-xs text-red-500 hover:text-white transition-colors">View All &rarr;</button>
                  </div>
                  {tasks.filter(t => !t.completed).length > 0 ? (
                    <ul className="space-y-2">
                      {tasks.filter(t => !t.completed).slice(0, 3).map(task => (
                        <li key={task.id} className="flex items-center gap-3 p-3 bg-black/40 border-l-2 border-zinc-700">
                          <Circle size={14} className="text-zinc-600" />
                          <span className="text-sm font-medium truncate">{task.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-zinc-600 italic">All caught up. Good work.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Articles */}
              <div className="space-y-6">
                <FitnessArticles glassClass={glassClass} />
              </div>
            </div>
          )}

          {activeTab === 'planner' && (
            <div className="space-y-6">
              <div className={`p-6 ${glassClass} border-l-4 border-white`}>
                <div className="flex justify-between items-center mb-6"><h3 className="font-black text-xl uppercase italic tracking-tighter">Mission Log</h3><div className="flex gap-2">{tasks.some(t => t.completed) && (<button onClick={clearCompletedTasks} className="text-xs px-3 py-1.5 bg-red-950 text-red-500 border border-red-900 hover:bg-red-600 hover:text-black uppercase font-bold tracking-wider transition-all">Clear Done</button>)}<button onClick={() => setIsBulkMode(!isBulkMode)} className={`text-xs px-3 py-1.5 bg-zinc-800 hover:bg-white hover:text-black uppercase font-bold tracking-wider transition-all`}>{isBulkMode ? "Single" : "Bulk"}</button></div></div>
                {isBulkMode ? (<form onSubmit={addBulkTasks}><textarea value={bulkTaskText} onChange={(e) => setBulkTaskText(e.target.value)} placeholder="COMMANDS (ONE PER LINE)..." className={`${inputClass} h-40 mb-4 font-mono text-sm`} /><button type="submit" className={`w-full py-3 font-black uppercase tracking-widest ${btnGradient}`}>Execute</button></form>) : (<form onSubmit={addTask} className="relative group"><input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="NEW OBJECTIVE..." className={`${inputClass} pr-14 uppercase`} /><button type="submit" className={`absolute right-2 top-2 p-2.5 bg-red-600 hover:bg-white hover:text-black transition-all text-white`}><Plus size={20} /></button></form>)}
              </div>
              <div className="space-y-3">{tasks.length === 0 && (<div className="text-center py-20 opacity-20"><p className="text-4xl font-black uppercase italic">Empty</p></div>)}{tasks.map(task => (<div key={task.id} className={`group flex items-center justify-between p-5 bg-zinc-900/50 border-l-2 transition-all duration-300 ${task.completed ? 'border-red-900 opacity-40' : 'border-white hover:border-red-600 hover:bg-black'}`}><div className="flex items-center gap-5 flex-1"><button onClick={() => toggleTask(task.id)} className={`transition-all duration-300 ${task.completed ? 'text-red-800' : 'text-zinc-600 hover:text-red-500'}`}>{task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}</button>{editingId === task.id ? (<div className="flex-1 flex gap-2"><input autoFocus type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 bg-transparent border-b border-red-600 outline-none pb-1 uppercase font-bold" /><button onClick={() => saveEdit(task.id, false)} className="text-red-500"><Check size={20}/></button><button onClick={() => setEditingId(null)} className="text-zinc-500"><X size={20}/></button></div>) : (<span className={`text-lg font-bold uppercase tracking-wide flex-1 break-all ${task.completed ? 'line-through decoration-2 decoration-red-900' : ''}`}>{task.text}</span>)}</div><div className="flex items-center opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => startEditing(task.id, task.text)} className="p-2 text-zinc-600 hover:text-white"><Edit2 size={16} /></button><button onClick={() => deleteTask(task.id)} className="p-2 text-zinc-600 hover:text-red-600"><Trash2 size={16} /></button></div></div>))}</div>
            </div>
          )}

          {activeTab === 'tracker' && (
            <div className="space-y-8">
              <div className={`p-6 ${glassClass} border-l-4 border-red-600`}><div className="flex justify-between items-center mb-6"><h3 className="font-black text-xl uppercase italic tracking-tighter">Habit Protocol</h3></div><form onSubmit={addHabit} className="flex gap-3"><input type="text" value={newHabitText} onChange={(e) => setNewHabitText(e.target.value)} placeholder="NEW PROTOCOL..." className={`${inputClass} flex-1 uppercase`} /><button type="submit" className={`px-8 py-2 font-black uppercase tracking-widest ${btnGradient}`}>Init</button></form></div>
              <div className="grid gap-4 sm:grid-cols-2">{habits.map(habit => (<div key={habit.id} className={`p-6 bg-zinc-900/80 border border-zinc-800 hover:border-red-900/50 transition-all duration-300 relative group`}>{habit.completedToday && <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />}<div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3 flex-1"><div className={`p-2 bg-black border border-zinc-800 text-red-600`}><TrendingUp size={20} /></div><div className="flex-1"><h3 className="font-bold text-lg uppercase tracking-wide">{habit.text}</h3><p className="text-xs font-mono mt-1 text-zinc-500 uppercase">Streak: <span className="text-white">{habit.streak}</span></p></div></div><div className="flex gap-2"><button onClick={() => toggleHabit(habit.id)} className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest transition-all ${habit.completedToday ? 'bg-red-600 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>{habit.completedToday ? 'Done' : 'Mark'}</button><button onClick={() => deleteHabit(habit.id)} className="p-3 bg-zinc-800 hover:bg-red-950 text-zinc-500 hover:text-red-500 transition-all"><Trash2 size={16} /></button></div></div><div className="mt-4 flex gap-1 justify-center opacity-40">{[...habit.history, habit.completedToday ? 1 : 0].slice(-7).map((status, idx) => (<div key={idx} className={`h-1 flex-1 transition-all ${status ? 'bg-red-600' : 'bg-zinc-800'}`} />))}</div></div>))}</div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="animate-fadeIn">
              <CalendarView dailyHistory={dailyHistory} glassClass={glassClass} />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className={`p-8 ${glassClass} flex flex-col items-center border-l-4 border-red-600`}><h2 className="text-xl font-black mb-8 tracking-tighter uppercase italic">Analytics</h2><SimplePieChart data={pieData} /><div className="mt-10 flex gap-8 flex-wrap justify-center">{pieData.map((d, i) => (<div key={i} className="flex items-center gap-3"><div className="w-3 h-3" style={{ backgroundColor: d.color }} /><span className="text-sm font-bold uppercase tracking-widest text-zinc-400">{d.name} <span className="text-white ml-1">{d.value}</span></span></div>))}</div></div>
              <div className={`p-8 ${glassClass} border-r-4 border-white`}><div className="flex items-center justify-between mb-4"><h2 className="text-xl font-black uppercase italic tracking-tighter">Consistency</h2><span className="text-4xl font-black text-red-600">{completionRate}%</span></div><div className="w-full h-6 bg-black border border-zinc-800"><div className="h-full bg-red-600 transition-all duration-1000" style={{ width: `${completionRate}%` }} /></div></div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={`max-w-md mx-auto p-8 ${glassClass} border-b-4 border-red-600 text-center`}>
              {user && !user.isAnonymous && (
                <div className="space-y-8">
                  <div className="relative w-32 h-32 mx-auto"><div className={`w-full h-full flex items-center justify-center text-5xl font-black bg-zinc-800 border-2 border-zinc-700`}>{(user.displayName || user.email || 'U')[0].toUpperCase()}</div><div className="absolute bottom-0 right-0 p-2 bg-red-600 border-4 border-black"><ShieldCheck size={20} className="text-black" /></div></div>
                  <div><h2 className="text-2xl font-black uppercase tracking-wide">{user.displayName || "User"}</h2><p className="text-xs font-mono text-zinc-500 mt-1 uppercase">{user.email}</p></div>
                  <div className="grid grid-cols-2 gap-4"><div className="p-4 bg-zinc-900 border border-zinc-800"><p className="text-3xl font-black text-white">{tasks.filter(t => t.completed).length}</p><p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Tasks</p></div><div className="p-4 bg-zinc-900 border border-zinc-800"><p className="text-3xl font-black text-red-600">{habits.filter(h => h.streak > 0).length}</p><p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Streaks</p></div></div>
                  <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-4 border border-zinc-700 hover:bg-red-600 hover:text-black hover:border-red-600 transition-all font-black tracking-widest uppercase text-sm">Sign Out <LogOut size={16} /></button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
