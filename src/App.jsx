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

// --- FONT INJECTION ---
const FontStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap');
      body { font-family: 'Manrope', sans-serif; }
    `}
  </style>
);

// --- BACKGROUND IMAGE COMPONENT ---
const BackgroundImage = ({ darkMode }) => {
  const [bgError, setBgError] = useState(false);
  const [bgSource, setBgSource] = useState('background.png'); 
  
  const handleError = () => { 
    if (bgSource === 'background.png') setBgSource('background.jpg'); 
    else setBgError(true); 
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-slate-50">
      {/* Fallback gradient if image fails */}
      <div className={`absolute inset-0 bg-gradient-to-br ${darkMode ? 'from-slate-900 via-blue-950 to-slate-900' : 'from-blue-50 via-white to-orange-50'} opacity-100`} />
      
      {!bgError && (
        <img 
          src={bgSource} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 opacity-20 mix-blend-overlay grayscale" 
          onError={handleError} 
        />
      )}
      
      {/* Overlay to tint the background */}
      <div className={`absolute inset-0 transition-all duration-700 ${darkMode ? 'bg-slate-900/90 backdrop-blur-[2px]' : 'bg-white/80 backdrop-blur-[5px]'}`} />
    </div>
  );
};

// --- CALENDAR COMPONENT ---
const CalendarView = ({ dailyHistory, glassClass, darkMode }) => {
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
      
      // --- BLUE/ORANGE SCALE LOGIC ---
      let bgClass = darkMode ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"; 
      
      if (score !== undefined) {
        if (score === 100) {
          bgClass = "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30"; 
        } else if (score >= 50) {
          bgClass = "bg-blue-400/80 text-white"; 
        } else {
          bgClass = darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-500"; 
        }
      }

      const isToday = new Date().toDateString() === currentDayDate.toDateString();
      if (isToday) bgClass += " ring-2 ring-orange-500 ring-offset-2 ring-offset-transparent font-bold";

      days.push(
        <div key={d} className={`h-10 w-10 flex items-center justify-center rounded-lg text-sm cursor-pointer transition-all duration-300 ${bgClass}`} title={score !== undefined ? `Score: ${score}%` : 'No Data'}>
          {d}
        </div>
      );
    }
    return days;
  };

  return (
    <div className={`p-8 rounded-none border-l-4 border-orange-500 ${glassClass}`}>
      <div className="flex justify-between items-center mb-8">
        <button onClick={prevMonth} className={`p-2 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}><ChevronLeft/></button>
        <h2 className={`text-2xl font-extrabold tracking-tight uppercase ${darkMode ? 'text-white' : 'text-slate-800'}`}>{monthNames[month]} <span className="text-blue-600">{year}</span></h2>
        <button onClick={nextMonth} className={`p-2 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}><ChevronRight/></button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center mb-4">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="text-xs font-bold uppercase tracking-widest text-orange-500">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2 place-items-center">
        {renderDays()}
      </div>
    </div>
  );
};

// --- CHART COMPONENT ---
const SimplePieChart = ({ data, darkMode }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) return <div className={`flex items-center justify-center h-48 w-48 rounded-full text-xs font-bold uppercase tracking-widest border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>No Data</div>;
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
          const segment = <path key={i} d={pathData} fill={item.color} className="transition-all duration-500 hover:opacity-90 stroke-white stroke-2" />;
          currentAngle += angle;
          return segment;
        })}
      </svg>
    );
};

// --- ARTICLES COMPONENT ---
const FitnessArticles = ({ glassClass, darkMode }) => {
  const articles = [
    { title: "The Consistency Effect", desc: "Small blue steps lead to big waves.", time: "5 min read", icon: "🌊" },
    { title: "Morning Momentum", desc: "Start your day with high energy.", time: "15 min routine", icon: "☀️" },
    { title: "Brain Food", desc: "Nutrition to keep you sharp and focused.", time: "8 min read", icon: "🫐" }
  ];

  return (
    <div className={`p-8 rounded-none border-l-4 border-blue-500 ${glassClass}`}>
      <h3 className="font-extrabold text-xl uppercase tracking-tight mb-6 flex items-center gap-3"><BookOpen size={24} className="text-orange-500"/> Daily Reads</h3>
      <div className="space-y-4">
        {articles.map((art, i) => (
          <div key={i} className={`group flex items-start gap-5 p-5 border transition-all cursor-pointer ${darkMode ? 'bg-slate-800/50 border-slate-700 hover:border-orange-500/50 hover:bg-slate-800' : 'bg-white border-slate-200 hover:border-orange-400 hover:shadow-md'}`}>
            <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-lg ${darkMode ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-600'}`}>{art.icon}</div>
            <div className="flex-1">
              <h4 className={`font-bold group-hover:text-orange-500 transition-colors uppercase tracking-wide text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{art.title}</h4>
              <p className={`text-xs mt-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{art.desc}</p>
              <div className="flex items-center gap-2 mt-3 text-[10px] uppercase tracking-widest font-bold text-blue-500">
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
  const [darkMode, setDarkMode] = useState(false); // Default to Light Mode for white/blue feel
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- STATE ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('home'); 
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
        setAuthError("Wrong credentials. Please check your email or password.");
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
  
  // Blue/Orange/White Palette
  const pieData = [ { name: 'Tasks', value: tasks.filter(t => t.completed).length, color: '#2563EB' }, { name: 'Habits', value: habits.filter(h => h.completedToday).length, color: '#F97316' }, { name: 'Left', value: tasks.filter(t => !t.completed).length + habits.filter(h => !h.completedToday).length, color: darkMode ? '#334155' : '#cbd5e1' }, ].filter(d => d.value > 0);

  // --- STYLING ---
  const glassClass = `backdrop-blur-xl border-y border-white/20 shadow-xl transition-all duration-300 ${darkMode ? 'bg-slate-900/70 text-slate-100 border-slate-700' : 'bg-white/80 text-slate-900 border-white'}`;
  
  const inputClass = `w-full p-4 border-l-4 outline-none transition-all placeholder:text-slate-400 font-bold uppercase tracking-wider text-sm ${darkMode ? 'bg-slate-800/50 border-slate-600 focus:border-blue-500 focus:bg-slate-800' : 'bg-slate-50 border-slate-300 focus:border-blue-600 focus:bg-white'}`;
  
  const btnGradient = "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5";

  // --- RENDER ---
  
  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-blue-600 font-black tracking-[0.3em] uppercase animate-pulse">Initializing...</div>;

  // 1) LOGIN PORTAL VIEW
  if (!user) {
    return (
      <div className={`font-sans min-h-screen flex items-center justify-center relative overflow-hidden ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <FontStyles />
        <BackgroundImage darkMode={darkMode} />
        <div className={`relative z-10 w-full max-w-md p-10 ${glassClass} border-l-4 border-blue-600 rounded-lg shadow-2xl`}>
          <div className="text-center mb-10">
            <div className={`w-16 h-16 mx-auto flex items-center justify-center shadow-lg mb-6 bg-blue-600 rounded-2xl rotate-3`}>
              <ShieldCheck size={32} className="text-white -rotate-3" />
            </div>
            <h1 className={`text-5xl font-black tracking-tighter mb-2 uppercase italic ${darkMode ? 'text-white' : 'text-slate-900'}`}>Focus<span className="text-blue-600">Flow</span></h1>
            <p className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">{isRegistering ? 'Start Your Journey' : 'Welcome Back'}</p>
          </div>

          {authError && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-3">
              <X size={14} /> {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            {isRegistering && (
              <div className="relative group">
                <UserCircle className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="NAME" className={`${inputClass} pl-12`} />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="EMAIL" className={`${inputClass} pl-12`} />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="PASSWORD" className={`${inputClass} pl-12`} />
            </div>
            <button type="submit" className={`w-full py-4 font-black uppercase tracking-[0.2em] text-sm rounded-lg ${btnGradient}`}>
              {isRegistering ? 'Sign Up' : 'Login'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-[10px] font-bold text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-colors">
              {isRegistering ? 'Already have an account? Login' : 'First time? Create Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2) MAIN DASHBOARD VIEW
  return (
    <div className={`font-sans relative min-h-screen ${darkMode ? 'text-slate-100 bg-slate-900' : 'text-slate-900 bg-slate-50'}`}>
      <FontStyles />
      <BackgroundImage darkMode={darkMode} />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* HEADER */}
        <header className={`sticky top-0 z-20 backdrop-blur-md border-b ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            {/* LEFT: Name + Tabs */}
            <div className="flex items-center gap-10">
              <div>
                <h1 className="font-black text-2xl leading-none tracking-tighter uppercase italic">{getGreeting()}</h1>
                <p className="text-[10px] mt-1 font-bold text-orange-500 uppercase tracking-[0.3em] hidden sm:block">Stay Consistent</p>
              </div>
              
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-1">
                {['home', 'planner', 'tracker', 'calendar', 'stats'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest skew-x-[-15deg] transition-all border-b-2 ${activeTab === tab ? `bg-blue-600 text-white border-blue-600` : `text-slate-500 hover:text-blue-600 hover:bg-blue-50 border-transparent`}`}
                  >
                    <span className="block skew-x-[15deg]">{tab}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: Profile */}
            <div className="flex items-center gap-6">
              <button onClick={simulateEndDay} className="hidden sm:flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all rounded-full">
                End Day
              </button>
              
              <div className="flex items-center gap-4">
                <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full transition-all ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                
                <button onClick={() => setActiveTab('profile')} className="group relative">
                  <div className={`w-10 h-10 flex items-center justify-center text-lg font-black text-white rounded-full transition-all bg-blue-600 shadow-md group-hover:scale-110`}>
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Nav */}
          <div className={`md:hidden flex justify-between px-6 pb-4 pt-2 overflow-x-auto border-t ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
             {['home', 'planner', 'tracker', 'stats'].map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap mr-2 ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>
                 {tab}
               </button>
             ))}
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-10 space-y-10 flex-1 w-full animate-fadeIn">
          
          {/* --- HOME TAB --- */}
          {activeTab === 'home' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Chart & Quick Stats */}
              <div className="space-y-8">
                <div className={`p-10 ${glassClass} flex flex-col items-center justify-center border-t-4 border-blue-600 rounded-xl`}>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8 text-slate-800 dark:text-white">Daily Status</h2>
                  <SimplePieChart data={pieData} darkMode={darkMode} />
                  <div className="mt-8 flex gap-12">
                     <div className="text-center">
                       <span className="block text-4xl font-black text-blue-600">{tasks.filter(t => t.completed).length}</span>
                       <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Tasks</span>
                     </div>
                     <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
                     <div className="text-center">
                       <span className="block text-4xl font-black text-orange-500">{habits.filter(h => h.completedToday).length}</span>
                       <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Habits</span>
                     </div>
                  </div>
                </div>
                
                {/* To-Do Summary */}
                <div className={`p-8 ${glassClass} rounded-xl`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400">Pending Tasks</h3>
                    <button onClick={() => setActiveTab('planner')} className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:underline transition-colors">View All &rarr;</button>
                  </div>
                  {tasks.filter(t => !t.completed).length > 0 ? (
                    <ul className="space-y-3">
                      {tasks.filter(t => !t.completed).slice(0, 3).map(task => (
                        <li key={task.id} className={`flex items-center gap-4 p-4 border-l-4 border-orange-400 transition-colors ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                          <Circle size={16} className="text-slate-400" />
                          <span className="text-sm font-bold uppercase tracking-wide truncate">{task.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-center">
                        <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase">All caught up!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Articles */}
              <div className="space-y-8">
                <FitnessArticles glassClass={glassClass} darkMode={darkMode} />
              </div>
            </div>
          )}

          {activeTab === 'planner' && (
            <div className="space-y-8">
              <div className={`p-8 ${glassClass} border-l-4 border-blue-600 rounded-xl`}>
                <div className="flex justify-between items-center mb-8"><h3 className="font-black text-2xl uppercase italic tracking-tighter">Mission Log</h3><div className="flex gap-3">{tasks.some(t => t.completed) && (<button onClick={clearCompletedTasks} className="text-[10px] px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white uppercase font-black tracking-widest transition-all rounded">Clear Done</button>)}<button onClick={() => setIsBulkMode(!isBulkMode)} className={`text-[10px] px-4 py-2 ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'} hover:bg-blue-600 hover:text-white uppercase font-black tracking-widest transition-all rounded`}>{isBulkMode ? "Single" : "Bulk"}</button></div></div>
                {isBulkMode ? (<form onSubmit={addBulkTasks}><textarea value={bulkTaskText} onChange={(e) => setBulkTaskText(e.target.value)} placeholder="COMMANDS (ONE PER LINE)..." className={`${inputClass} h-48 mb-6 font-mono text-sm`} /><button type="submit" className={`w-full py-4 font-black uppercase tracking-[0.2em] rounded-lg ${btnGradient}`}>Execute</button></form>) : (<form onSubmit={addTask} className="relative group"><input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="NEW OBJECTIVE..." className={`${inputClass} pr-16 uppercase`} /><button type="submit" className={`absolute right-3 top-3 p-2 bg-blue-600 hover:bg-blue-700 transition-all text-white rounded`}><Plus size={20} /></button></form>)}
              </div>
              <div className="space-y-4">{tasks.length === 0 && (<div className="text-center py-24 opacity-40"><p className="text-5xl font-black uppercase italic tracking-tighter text-slate-300">Empty</p></div>)}{tasks.map(task => (<div key={task.id} className={`group flex items-center justify-between p-6 border-l-4 transition-all duration-300 rounded-r-xl ${task.completed ? 'border-green-500 opacity-50 grayscale bg-green-50/50 dark:bg-green-900/10' : 'border-blue-500 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md'}`}><div className="flex items-center gap-6 flex-1"><button onClick={() => toggleTask(task.id)} className={`transition-all duration-300 ${task.completed ? 'text-green-600' : 'text-slate-400 hover:text-blue-500'}`}>{task.completed ? <CheckCircle2 size={28} /> : <Circle size={28} />}</button>{editingId === task.id ? (<div className="flex-1 flex gap-2"><input autoFocus type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 bg-transparent border-b-2 border-blue-600 outline-none pb-2 uppercase font-bold text-lg" /><button onClick={() => saveEdit(task.id, false)} className="text-green-500"><Check size={24}/></button><button onClick={() => setEditingId(null)} className="text-slate-400"><X size={24}/></button></div>) : (<span className={`text-xl font-bold uppercase tracking-wide flex-1 break-all ${task.completed ? 'line-through text-slate-400' : darkMode ? 'text-white' : 'text-slate-800'}`}>{task.text}</span>)}</div><div className="flex items-center opacity-0 group-hover:opacity-100 transition-all gap-2"><button onClick={() => startEditing(task.id, task.text)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 size={18} /></button><button onClick={() => deleteTask(task.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button></div></div>))}</div>
            </div>
          )}

          {activeTab === 'tracker' && (
            <div className="space-y-8">
              <div className={`p-8 ${glassClass} border-l-4 border-orange-500 rounded-xl`}><div className="flex justify-between items-center mb-8"><h3 className="font-black text-2xl uppercase italic tracking-tighter">Habit Protocol</h3></div><form onSubmit={addHabit} className="flex gap-4"><input type="text" value={newHabitText} onChange={(e) => setNewHabitText(e.target.value)} placeholder="NEW PROTOCOL..." className={`${inputClass} flex-1 uppercase`} /><button type="submit" className={`px-10 py-2 font-black uppercase tracking-[0.2em] rounded-lg ${btnGradient}`}>Init</button></form></div>
              <div className="grid gap-6 sm:grid-cols-2">{habits.map(habit => (<div key={habit.id} className={`p-8 rounded-xl border transition-all duration-300 relative group ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'} ${habit.completedToday ? 'border-orange-500 ring-1 ring-orange-500' : ''}`}>{habit.completedToday && <div className="absolute inset-0 bg-orange-500/5 pointer-events-none rounded-xl" />}<div className="flex items-center justify-between mb-8"><div className="flex items-center gap-4 flex-1"><div className={`p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600`}><TrendingUp size={24} /></div><div className="flex-1"><h3 className="font-bold text-xl uppercase tracking-wide">{habit.text}</h3><p className="text-xs font-mono mt-2 text-slate-500 uppercase tracking-widest">Streak <span className="text-orange-500 font-bold text-sm ml-1">{habit.streak}</span></p></div></div><div className="flex gap-2"><button onClick={() => toggleHabit(habit.id)} className={`flex-1 py-3 px-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all border rounded ${habit.completedToday ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 border-transparent hover:bg-slate-200'}`}>{habit.completedToday ? 'Done' : 'Mark'}</button><button onClick={() => deleteHabit(habit.id)} className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-red-100 hover:text-red-500 text-slate-400 transition-all rounded"><Trash2 size={18} /></button></div></div><div className="mt-4 flex gap-1 justify-center opacity-40">{[...habit.history, habit.completedToday ? 1 : 0].slice(-7).map((status, idx) => (<div key={idx} className={`h-1.5 flex-1 rounded-full transition-all ${status ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'}`} />))}</div></div>))}</div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="animate-fadeIn">
              <CalendarView dailyHistory={dailyHistory} glassClass={`${glassClass} rounded-xl`} darkMode={darkMode} />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-8">
              <div className={`p-10 ${glassClass} flex flex-col items-center border-t-4 border-blue-600 rounded-xl`}><h2 className="text-2xl font-black mb-10 tracking-tighter uppercase italic">Analytics</h2><SimplePieChart data={pieData} darkMode={darkMode} /><div className="mt-12 flex gap-10 flex-wrap justify-center">{pieData.map((d, i) => (<div key={i} className="flex items-center gap-4"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-sm font-bold uppercase tracking-widest text-slate-500">{d.name} <span className={`ml-2 font-black text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>{d.value}</span></span></div>))}</div></div>
              <div className={`p-10 ${glassClass} border-b-4 border-orange-500 rounded-xl`}><div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-black uppercase italic tracking-tighter">Consistency</h2><span className="text-5xl font-black text-blue-600">{completionRate}%</span></div><div className="w-full h-8 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-1"><div className="h-full bg-gradient-to-r from-blue-500 to-orange-500 rounded-full transition-all duration-1000" style={{ width: `${completionRate}%` }} /></div></div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={`max-w-md mx-auto p-10 ${glassClass} border-t-4 border-blue-600 text-center rounded-xl`}>
              {user && !user.isAnonymous && (
                <div className="space-y-10">
                  <div className="relative w-32 h-32 mx-auto"><div className={`w-full h-full flex items-center justify-center text-5xl font-black bg-blue-600 text-white rounded-full shadow-xl`}>{(user.displayName || user.email || 'U')[0].toUpperCase()}</div><div className="absolute bottom-0 right-0 p-2 bg-white border-4 border-slate-100 rounded-full shadow-sm"><ShieldCheck size={20} className="text-blue-600" /></div></div>
                  <div><h2 className="text-3xl font-black uppercase tracking-wide">{user.displayName || "User"}</h2><p className="text-xs font-mono text-slate-500 mt-2 uppercase tracking-widest">{user.email}</p></div>
                  <div className="grid grid-cols-2 gap-4"><div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl"><p className="text-4xl font-black text-blue-600">{tasks.filter(t => t.completed).length}</p><p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-2">Tasks</p></div><div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl"><p className="text-4xl font-black text-orange-500">{habits.filter(h => h.streak > 0).length}</p><p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-2">Streaks</p></div></div>
                  <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full py-5 border-2 border-slate-200 dark:border-slate-700 hover:border-red-500 hover:text-red-500 transition-all font-black tracking-[0.2em] uppercase text-xs rounded-lg text-slate-400">Sign Out <LogOut size={16} /></button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
