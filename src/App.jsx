import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, Circle, Plus, Trash2, TrendingUp, 
  Sun, Moon, Award, RefreshCw, LayoutDashboard, ListTodo, 
  UserCircle, LogOut, PieChart as PieChartIcon, Users, 
  AlignLeft, Activity, Edit2, X, Check, ShieldCheck,
  Calendar as CalendarIcon, ChevronLeft, ChevronRight
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

// --- BACKGROUND IMAGE COMPONENT ---
const BackgroundImage = ({ darkMode }) => {
  const [bgError, setBgError] = useState(false);
  const [bgSource, setBgSource] = useState('/background.png'); 
  
  const handleError = () => { 
    if (bgSource === '/background.png') setBgSource('/background.jpg'); 
    else setBgError(true); 
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      {!bgError && (
        <img 
          src={bgSource} 
          alt="Background" 
          className="w-full h-full object-cover transition-opacity duration-1000 opacity-90" 
          onError={handleError} 
        />
      )}
      <div className={`absolute inset-0 transition-colors duration-500 ${darkMode ? 'bg-black/50' : 'bg-white/40'}`} />
      <div className="absolute inset-0 backdrop-blur-[1px]" />
    </div>
  );
};

// --- CHART COMPONENT ---
const SimplePieChart = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) return <div className="flex items-center justify-center h-48 bg-white/10 rounded-full text-xs text-white/50 backdrop-blur-sm">No Data 💤</div>;
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
          const segment = <path key={i} d={pathData} fill={item.color} className="transition-all duration-500 hover:opacity-80 stroke-white/10 stroke-1" />;
          currentAngle += angle;
          return segment;
        })}
      </svg>
    );
};

// --- CALENDAR COMPONENT ---
const CalendarView = ({ dailyHistory, darkMode, glassClass }) => {
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

  // Map history to simple date strings for lookup
  const historyMap = useMemo(() => {
    const map = {};
    dailyHistory.forEach(item => {
      // Assuming item.date is stored as "Mon, Feb 2" or similar from toLocaleDateString
      // Ideally we'd store ISO strings, but working with what we have:
      map[item.date] = item.score; 
    });
    return map;
  }, [dailyHistory]);

  const renderDays = () => {
    const days = [];
    // Empty slots for days before start of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }
    
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      // Construct a key to match dailyHistory format "ShortDay, ShortMonth Day" roughly
      // Note: Matching exact strings across locales is tricky. 
      // For this demo, we check if the day is "today" or has a history entry.
      const currentDayDate = new Date(year, month, d);
      const dateString = currentDayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const score = historyMap[dateString];
      
      let bgClass = "bg-white/5 hover:bg-white/10";
      if (score !== undefined) {
        if (score >= 80) bgClass = "bg-emerald-500/80 shadow-lg shadow-emerald-500/30 text-white font-bold";
        else if (score >= 50) bgClass = "bg-amber-500/80 shadow-lg shadow-amber-500/30 text-white";
        else bgClass = "bg-red-500/50 text-white";
      }

      const isToday = new Date().toDateString() === currentDayDate.toDateString();
      if (isToday) bgClass += " border-2 border-indigo-400";

      days.push(
        <div key={d} className={`h-10 w-10 flex items-center justify-center rounded-full text-sm cursor-pointer transition-all ${bgClass}`} title={score !== undefined ? `Score: ${score}%` : ''}>
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
        <h2 className="text-xl font-bold tracking-wide">{monthNames[month]} {year}</h2>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-white/10 transition-colors"><ChevronRight/></button>
      </div>
      
      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs font-bold opacity-50 uppercase">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2 place-items-center">
        {renderDays()}
      </div>

      <div className="mt-6 flex justify-center gap-4 text-xs opacity-70">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Great</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Good</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Low</div>
      </div>
    </div>
  );
};

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // --- STATE ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('planner'); 
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [dailyHistory, setDailyHistory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [bulkTaskText, setBulkTaskText] = useState("");
  const [newHabitText, setNewHabitText] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");

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
        if (data.savedDate) setCurrentDate(new Date(data.savedDate));
      } else {
        const defaults = {
          tasks: [{ id: 1, text: "Welcome! 👋 Add your first task.", completed: false, category: "General" }],
          habits: [{ id: 1, text: "Check App 📱", streak: 0, completedToday: false, history: [] }],
          dailyHistory: [],
          savedDate: new Date().toISOString()
        };
        setDoc(userDocRef, defaults);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const saveData = async (newTasks, newHabits, newHistory, newDate) => {
    const t = newTasks !== undefined ? newTasks : tasks;
    const h = newHabits !== undefined ? newHabits : habits;
    const hist = newHistory !== undefined ? newHistory : dailyHistory;
    const d = newDate || currentDate;
    const localPayload = { tasks: t, habits: h, dailyHistory: hist, savedDate: d };
    localStorage.setItem('focusFlowData', JSON.stringify(localPayload));
    if (user) {
      const userDocRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'plannerData'), 'daily');
      await setDoc(userDocRef, { tasks: t, habits: h, dailyHistory: hist, savedDate: d.toISOString() }, { merge: true });
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
  
  const addTask = (e) => { e.preventDefault(); if (!newTaskText.trim()) return; const updated = [...tasks, { id: Date.now(), text: newTaskText, completed: false, category: "General" }]; setTasks(updated); setNewTaskText(""); saveData(updated); };
  const addBulkTasks = (e) => { e.preventDefault(); if (!bulkTaskText.trim()) return; const lines = bulkTaskText.split('\n').filter(line => line.trim() !== ""); const newItems = lines.map((text, index) => ({ id: Date.now() + index, text: text.trim(), completed: false, category: "General" })); const updated = [...tasks, ...newItems]; setTasks(updated); setBulkTaskText(""); setIsBulkMode(false); saveData(updated); };
  const toggleTask = (id) => { const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t); setTasks(updated); saveData(updated); };
  const deleteTask = (id) => { const updated = tasks.filter(t => t.id !== id); setTasks(updated); saveData(updated); };
  const clearCompletedTasks = () => { if (confirm("Remove completed tasks?")) { const updated = tasks.filter(t => !t.completed); setTasks(updated); saveData(updated); } };
  
  const startEditing = (id, text) => { setEditingId(id); setEditText(text); };
  const saveEdit = (id, isHabit) => {
    if (!editText.trim()) return;
    if (isHabit) {
      const updated = habits.map(h => h.id === id ? { ...h, text: editText } : h);
      setHabits(updated); saveData(undefined, updated);
    } else {
      const updated = tasks.map(t => t.id === id ? { ...t, text: editText } : t);
      setTasks(updated); saveData(updated);
    }
    setEditingId(null); setEditText("");
  };

  const addHabit = (e) => { e.preventDefault(); if (!newHabitText.trim()) return; const updated = [...habits, { id: Date.now(), text: newHabitText, streak: 0, completedToday: false, history: [] }]; setHabits(updated); setNewHabitText(""); saveData(undefined, updated); };
  const toggleHabit = (id) => { const updated = habits.map(h => { if (h.id === id) { const isNowCompleted = !h.completedToday; const newStreak = isNowCompleted ? h.streak + 1 : Math.max(0, h.streak - 1); return { ...h, completedToday: isNowCompleted, streak: newStreak }; } return h; }); setHabits(updated); saveData(undefined, updated); };
  const deleteHabit = (id) => { const updated = habits.filter(h => h.id !== id); setHabits(updated); saveData(undefined, updated); };
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
  const pieData = [ { name: 'Tasks', value: tasks.filter(t => t.completed).length, color: '#10b981' }, { name: 'Habits', value: habits.filter(h => h.completedToday).length, color: '#6366f1' }, { name: 'Left', value: tasks.filter(t => !t.completed).length + habits.filter(h => !h.completedToday).length, color: '#94a3b8' }, ].filter(d => d.value > 0);

  const glassClass = `backdrop-blur-md border shadow-lg transition-all duration-300 ${darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-white/40 border-white/40 text-gray-900'}`;
  const inputClass = `w-full p-3 rounded-xl border bg-transparent outline-none transition-all placeholder:text-gray-400 ${darkMode ? 'border-white/20 focus:border-indigo-400' : 'border-black/10 focus:border-indigo-500'}`;

  return (
    <div className={`font-sans relative min-h-screen ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <BackgroundImage darkMode={darkMode} />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className={`sticky top-0 z-20 backdrop-blur-lg border-b ${darkMode ? 'bg-black/20 border-white/5' : 'bg-white/30 border-white/20'}`}>
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl backdrop-blur-md ${darkMode ? 'bg-white/10 text-indigo-300' : 'bg-white/50 text-indigo-600'}`}>
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h1 className="font-bold text-xl leading-none drop-shadow-sm tracking-tight">FocusFlow 🌊</h1>
                <p className="text-xs mt-1 font-medium opacity-70">
                  {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={simulateEndDay} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-md border ${darkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20 hover:bg-emerald-500/20'}`} title="Finish today"><RefreshCw size={14} /> End Day</button>
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition-colors backdrop-blur-md border ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/40 border-white/20 hover:bg-white/60'}`}>{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8 space-y-8 flex-1 w-full">
          <div className={`flex p-1 rounded-2xl overflow-x-auto ${glassClass}`}>
            {['planner', 'tracker', 'calendar', 'stats', 'profile'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-bold rounded-xl transition-all capitalize whitespace-nowrap ${activeTab === tab ? (darkMode ? 'bg-white/10 text-white shadow-inner' : 'bg-white/60 text-black shadow-sm') : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}>
                {tab === 'planner' && <ListTodo size={16} />} 
                {tab === 'tracker' && <TrendingUp size={16} />} 
                {tab === 'calendar' && <CalendarIcon size={16} />}
                {tab === 'stats' && <PieChartIcon size={16} />} 
                {tab === 'profile' && <UserCircle size={16} />} 
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'planner' && (
            <div className="space-y-6 animate-fadeIn">
              <div className={`rounded-2xl p-5 ${glassClass}`}>
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-sm opacity-70 uppercase tracking-wider">📝 To-Do List</h3><div className="flex gap-2">{tasks.some(t => t.completed) && (<button onClick={clearCompletedTasks} className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 flex items-center gap-1 transition-colors"><Trash2 size={12} /> Clear Done</button>)}<button onClick={() => setIsBulkMode(!isBulkMode)} className={`text-xs px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 flex items-center gap-1`}><AlignLeft size={12} /> {isBulkMode ? "Single Mode" : "Bulk Mode"}</button></div></div>
                {isBulkMode ? (<form onSubmit={addBulkTasks}><textarea value={bulkTaskText} onChange={(e) => setBulkTaskText(e.target.value)} placeholder="Enter tasks (one per line)..." className={`${inputClass} h-32 mb-3`} /><button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all">Add All Tasks 🚀</button></form>) : (<form onSubmit={addTask} className="relative group"><input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="What's the plan today? ✨" className={`${inputClass} pr-12`} /><button type="submit" className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/20"><Plus size={20} /></button></form>)}
              </div>
              <div className="space-y-3">{tasks.length === 0 && (<div className={`text-center py-16 border-2 border-dashed rounded-2xl ${darkMode ? 'border-white/10 bg-white/5 text-white/40' : 'border-black/10 bg-white/20 text-black/40'}`}><p className="text-lg">No tasks yet! 🌴</p><p className="text-sm mt-1">Add something to get started.</p></div>)}{tasks.map(task => (<div key={task.id} className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${glassClass} ${task.completed ? 'opacity-60 grayscale' : 'hover:-translate-y-1'}`}><div className="flex items-center gap-4 flex-1"><button onClick={() => toggleTask(task.id)} className={`flex-shrink-0 transition-all duration-300 ${task.completed ? 'text-emerald-400 scale-110' : 'opacity-40 hover:opacity-100'}`}>{task.completed ? <CheckCircle2 size={24} className="fill-emerald-500/20" /> : <Circle size={24} />}</button>{editingId === task.id ? (<div className="flex-1 flex gap-2"><input autoFocus type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 bg-transparent border-b border-indigo-500 outline-none" /><button onClick={() => saveEdit(task.id, false)} className="text-emerald-400"><Check size={18}/></button><button onClick={() => setEditingId(null)} className="text-red-400"><X size={18}/></button></div>) : (<span className={`text-base flex-1 break-all ${task.completed ? 'line-through decoration-2 decoration-white/30' : ''}`}>{task.text}</span>)}</div><div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => startEditing(task.id, task.text)} className="p-2 opacity-50 hover:opacity-100 hover:text-indigo-400 transition-all"><Edit2 size={16} /></button><button onClick={() => deleteTask(task.id)} className="p-2 opacity-50 hover:opacity-100 hover:text-red-400 transition-all"><Trash2 size={18} /></button></div></div>))}</div>
            </div>
          )}

          {activeTab === 'tracker' && (
            <div className="space-y-8 animate-fadeIn">
              <form onSubmit={addHabit} className="flex gap-2"><input type="text" value={newHabitText} onChange={(e) => setNewHabitText(e.target.value)} placeholder="New habit to build... 🌱" className={`${inputClass} flex-1`} /><button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all">Add</button></form>
              <div className="space-y-4">{habits.map(habit => (<div key={habit.id} className={`p-5 rounded-2xl transition-all duration-300 ${glassClass} ${habit.completedToday ? 'border-indigo-500/50 shadow-indigo-500/10' : ''}`}><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3 flex-1"><div className={`p-3 rounded-xl ${habit.completedToday ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/10'}`}><TrendingUp size={20} /></div><div className="flex-1"><h3 className="font-bold text-lg">{habit.text}</h3><p className="text-xs opacity-60 font-mono mt-0.5">🔥 {habit.streak} Day Streak</p></div></div><div className="flex gap-2"><button onClick={() => toggleHabit(habit.id)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${habit.completedToday ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/10 hover:bg-white/20'}`}>{habit.completedToday ? 'Completed! 🎉' : 'Mark Done'}</button><button onClick={() => deleteHabit(habit.id)} className="p-2 opacity-40 hover:opacity-100 hover:text-red-400 transition-all"><Trash2 size={16} /></button></div></div><div className="flex gap-1.5 justify-end">{[...habit.history, habit.completedToday ? 1 : 0].slice(-7).map((status, idx) => (<div key={idx} className={`w-2 h-8 rounded-full transition-all duration-500 ${status ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-white/10'}`} title={status ? 'Done' : 'Missed'} />))}</div></div>))}</div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6 animate-fadeIn">
              <CalendarView dailyHistory={dailyHistory} darkMode={darkMode} glassClass={glassClass} />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6 animate-fadeIn">
              <div className={`p-8 rounded-3xl flex flex-col items-center ${glassClass}`}><h2 className="text-xl font-bold mb-8 tracking-tight">📊 Today's Breakdown</h2><SimplePieChart data={pieData} /><div className="mt-8 flex gap-6 flex-wrap justify-center">{pieData.map((d, i) => (<div key={i} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: d.color, backgroundColor: d.color }} /><span className="text-sm font-medium opacity-80">{d.name} ({d.value})</span></div>))}</div></div>
              <div className={`p-8 rounded-3xl ${glassClass}`}><div className="flex items-center gap-3 mb-2"><Award className="text-amber-400" /><h2 className="text-xl font-bold">Daily Score</h2></div><div className="flex items-end gap-2 mb-6"><span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">{completionRate}%</span><span className="text-sm opacity-60 mb-2 font-medium">completed</span></div><div className="w-full h-3 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${completionRate}%` }} /></div></div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={`max-w-md mx-auto p-8 rounded-3xl ${glassClass}`}>
              {user && !user.isAnonymous ? (
                <div className="text-center space-y-6">
                  <div className="relative w-24 h-24 mx-auto"><div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-4xl text-white font-black shadow-2xl shadow-indigo-500/40">{(user.email || 'U')[0].toUpperCase()}</div><div className="absolute bottom-0 right-0 p-2 bg-emerald-500 rounded-full border-4 border-black/50 backdrop-blur-sm"><ShieldCheck size={16} className="text-white" /></div></div>
                  <div><h2 className="text-2xl font-bold">{user.email}</h2><p className="text-sm opacity-60 mt-1">Verified Member ✨</p></div>
                  <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors font-bold"><LogOut size={18} /> Sign Out</button>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="text-center"><h2 className="text-2xl font-bold mb-2">{isRegistering ? 'Create Account 🚀' : 'Welcome Back 👋'}</h2><p className="text-sm opacity-60">{isRegistering ? 'Start your journey to consistency.' : 'Login to sync your data.'}</p>{isOfflineMode && (<div className="mt-4 p-3 bg-amber-500/20 text-amber-300 text-xs rounded-xl border border-amber-500/30">⚠️ Offline Mode: Data saved locally.</div>)}</div>
                   {authError && (<div className="p-3 bg-red-500/20 text-red-200 text-sm rounded-xl border border-red-500/30 text-center">{authError}</div>)}
                   <form onSubmit={handleAuth} className="space-y-4"><div><label className="block text-xs font-bold uppercase opacity-50 mb-1 ml-1">Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} /></div><div><label className="block text-xs font-bold uppercase opacity-50 mb-1 ml-1">Password</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} /></div><button type="submit" className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02]">{isRegistering ? 'Sign Up' : 'Login'}</button></form>
                   <div className="text-center"><button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline">{isRegistering ? 'Have an account? Login' : 'New here? Create Account'}</button></div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
