import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, Circle, Plus, Trash2, TrendingUp, Calendar, 
  Sun, Moon, Award, RefreshCw, LayoutDashboard, ListTodo, 
  UserCircle, LogOut, PieChart as PieChartIcon, Users, 
  Copy, UserPlus, AlignLeft, Activity, Edit2, X, Check, 
  Mail, Bell, ShieldCheck, Utensils, Brain, Dumbbell,
  ChevronLeft, ChevronRight
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
      Breakfast: "100g Paneer + 50g Oats + 6 Almonds + 1 Fruit",
      Lunch: "2 Rotis + 1 cup Dal + 1 cup Mixed Veg + 100g Salad",
      Snacks: "1 bowl Sprouts (150g) + 250ml Buttermilk",
      Dinner: "2 Rotis + 150g Veg Curry + 150g Curd"
    },
    backup: null
  },
  Tuesday: {
    type: "Non-Veg 🍗",
    meals: {
      Breakfast: "3 Whole Eggs + 2 Whites + 50g Oats",
      Lunch: "150-200g Chicken + 2 Rotis + 150g Veg",
      Snacks: "2 Boiled Eggs OR 1 scoop Whey",
      Dinner: "150g Fish/Chicken + 200g Veg + 100g Rice (opt)"
    },
    backup: {
      Breakfast: "100g Paneer + 50g Oats",
      Lunch: "150g Paneer OR 100g Soy Chunks + 2 Rotis + 150g Veg",
      Snacks: "1 scoop Whey",
      Dinner: "150g Tofu + 200g Veg + 100g Rice (opt)"
    }
  },
  Wednesday: {
    type: "Non-Veg 🍗",
    meals: {
      Breakfast: "3 Whole Eggs + 2 Whites + 50g Oats",
      Lunch: "150-200g Chicken + 2 Rotis + 150g Veg",
      Snacks: "2 Boiled Eggs OR 1 scoop Whey",
      Dinner: "150g Fish/Chicken + 200g Veg + 100g Rice (opt)"
    },
    backup: {
      Breakfast: "100g Paneer + 50g Oats",
      Lunch: "150g Paneer OR 100g Soy Chunks + 2 Rotis + 150g Veg",
      Snacks: "1 scoop Whey",
      Dinner: "150g Tofu + 200g Veg + 100g Rice (opt)"
    }
  },
  Thursday: {
    type: "Non-Veg 🍗",
    meals: {
      Breakfast: "3 Whole Eggs + 2 Whites + 50g Oats",
      Lunch: "150-200g Chicken + 2 Rotis + 150g Veg",
      Snacks: "2 Boiled Eggs OR 1 scoop Whey",
      Dinner: "150g Fish/Chicken + 200g Veg + 100g Rice (opt)"
    },
    backup: {
      Breakfast: "100g Paneer + 50g Oats",
      Lunch: "150g Paneer OR 100g Soy Chunks + 2 Rotis + 150g Veg",
      Snacks: "1 scoop Whey",
      Dinner: "150g Tofu + 200g Veg + 100g Rice (opt)"
    }
  },
  Friday: {
    type: "Non-Veg 🍗",
    meals: {
      Breakfast: "3 Whole Eggs + 2 Whites + 50g Oats",
      Lunch: "150-200g Chicken + 2 Rotis + 150g Veg",
      Snacks: "2 Boiled Eggs OR 1 scoop Whey",
      Dinner: "150g Fish/Chicken + 200g Veg + 100g Rice (opt)"
    },
    backup: {
      Breakfast: "100g Paneer + 50g Oats",
      Lunch: "150g Paneer OR 100g Soy Chunks + 2 Rotis + 150g Veg",
      Snacks: "1 scoop Whey",
      Dinner: "150g Tofu + 200g Veg + 100g Rice (opt)"
    }
  },
  Saturday: {
    type: "Veg 🥗",
    meals: {
      Breakfast: "120g Paneer + 50g Oats",
      Lunch: "1 cup Dal + 2 Rotis + 150g Veg",
      Snacks: "150g Sprouts",
      Dinner: "250ml Veg Soup + 80g Paneer"
    },
    backup: null
  },
  Sunday: {
    type: "Mix 🍲",
    meals: {
      Breakfast: "3 Whole Eggs + 2 Whites + 50g Oats",
      Lunch: "150g Chicken + 1 cup Dal + 2 Rotis",
      Snacks: "1 Fruit + 5 Almonds",
      Dinner: "Moderate Veg Meal + 150g Curd"
    },
    backup: null
  },
  Notes: "🎯 DAILY TARGETS:\n- Calories: 2100–2300 kcal\n- Protein: 130–150g\n- Water: 3.2–3.8 L\n\n🌿 VEG BACKUP RULES:\n- 150g Chicken = 150g Paneer OR 100g Soy chunks\n- 150g Fish = 150g Tofu\n- 2 Eggs snack = 1 scoop Whey"
};

// --- GLOBAL STYLES (Includes Pouring Animation) ---
const GlobalStyles = () => (
  <style>
    {`
      @keyframes pourEffect {
        0% { top: -20px; height: 0%; opacity: 0; }
        15% { top: -20px; height: 100%; opacity: 1; }
        85% { top: -20px; height: 100%; opacity: 1; }
        100% { top: 100%; height: 0%; opacity: 0; }
      }
      .animate-pour {
        animation: pourEffect 0.8s ease-in-out forwards;
      }
    `}
  </style>
);

// --- HELPER COMPONENTS ---
const BackgroundImage = ({ darkMode }) => {
  const [bgError, setBgError] = useState(false);
  const [bgSource, setBgSource] = useState('background.png'); 
  const handleError = () => { if (bgSource === 'background.png') setBgSource('background.jpg'); else setBgError(true); };
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

const SimplePieChart = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let currentAngle = 0;
  if (total === 0) return <div className="flex items-center justify-center h-48 w-48 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs opacity-50">No Data 📭</div>;
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

// --- SPIDER GRAPH COMPONENT ---
const SpiderGraph = ({ data, label, color }) => {
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
    <div className={`p-6 rounded-3xl mt-6 ${glassClass} transition-all`}>
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
              className={`p-4 rounded-2xl border transition-all flex flex-col items-center text-center gap-3 hover:scale-105 ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'}`}
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-white/10 to-transparent shadow-sm" style={{ color: topic.color, borderColor: topic.color, borderWidth: 1 }}>
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

// --- MAIN APP COMPONENT ---
export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- STATE ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [realTime, setRealTime] = useState(new Date()); // Live ticking clock
  const [activeTab, setActiveTab] = useState('planner');
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Data States
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [dailyHistory, setDailyHistory] = useState([]);
  const [dietPlan, setDietPlan] = useState(defaultDietPlan);
  const [waterIntake, setWaterIntake] = useState(0); // Max 6 (3000ml)

  // UI States
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [bulkTaskText, setBulkTaskText] = useState("");
  const [newHabitText, setNewHabitText] = useState("");
  const [isEditingDiet, setIsEditingDiet] = useState(false);
  const [isPouring, setIsPouring] = useState(false);

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
    // Real-time clock interval
    const timer = setInterval(() => setRealTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsOfflineMode(false);
        setLoading(false);
      } else {
        signInAnonymously(auth).then(() => {
          setLoading(false);
        }).catch((error) => {
          console.warn("Guest login unavailable:", error.message);
          setIsOfflineMode(true);
          const localData = localStorage.getItem('focusFlowData');
          if (localData) {
            const parsed = JSON.parse(localData);
            setTasks(parsed.tasks || []);
            setHabits(parsed.habits || []);
            setDailyHistory(parsed.dailyHistory || []);
            setDietPlan(parsed.dietPlan || defaultDietPlan);
            setWaterIntake(parsed.waterIntake || 0);
          }
          setLoading(false);
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
        setWaterIntake(data.waterIntake || 0);
        if (data.savedDate) setCurrentDate(new Date(data.savedDate));
      } else {
        const defaults = {
          tasks: [{ id: 1, text: "Welcome! Add your first task. ✨", completed: false, category: "General" }],
          habits: [{ id: 1, text: "Check App 📱", streak: 0, completedToday: false, history: [] }],
          dietPlan: defaultDietPlan,
          waterIntake: 0,
          dailyHistory: [],
          savedDate: new Date().toISOString()
        };
        setDoc(userDocRef, defaults);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const getGreeting = () => {
    const hour = realTime.getHours();
    const userName = user?.displayName || user?.email?.split('@')[0] || "Friend";
    if (hour < 12) return `Good morning, ${userName}`;
    if (hour < 18) return `Good afternoon, ${userName}`;
    return `Good evening, ${userName}`;
  };

  const saveData = async (newTasks, newHabits, newHistory, newDate, newDietPlan, newWaterIntake) => {
    const t = newTasks !== undefined ? newTasks : tasks;
    const h = newHabits !== undefined ? newHabits : habits;
    const hist = newHistory !== undefined ? newHistory : dailyHistory;
    const d = newDate || currentDate;
    const dp = newDietPlan !== undefined ? newDietPlan : dietPlan;
    const w = newWaterIntake !== undefined ? newWaterIntake : waterIntake;

    const localPayload = { tasks: t, habits: h, dailyHistory: hist, savedDate: d, dietPlan: dp, waterIntake: w };
    localStorage.setItem('focusFlowData', JSON.stringify(localPayload));

    if (user) {
      const userDocRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'plannerData'), 'daily');
      await setDoc(userDocRef, { tasks: t, habits: h, dailyHistory: hist, savedDate: d.toISOString(), dietPlan: dp, waterIntake: w }, { merge: true });
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
      return { ...prev, [day]: { ...dayData, [mealType]: { ...dayData[mealType], [field]: value } } };
    });
  };

  const saveDietPlanData = () => {
    setIsEditingDiet(false);
    saveData(undefined, undefined, undefined, undefined, dietPlan, undefined);
  };

  const handleDrinkWater = () => {
    if (waterIntake >= 6 || isPouring) return;
    setIsPouring(true);

    // Increment after stream starts falling
    setTimeout(() => {
      const newIntake = waterIntake + 1;
      setWaterIntake(newIntake);
      saveData(undefined, undefined, undefined, undefined, undefined, newIntake);
    }, 250);

    // Turn off stream
    setTimeout(() => {
      setIsPouring(false);
    }, 800);
  };

  const undoWater = (e) => {
    e.stopPropagation();
    const newIntake = Math.max(0, waterIntake - 1);
    setWaterIntake(newIntake);
    saveData(undefined, undefined, undefined, undefined, undefined, newIntake);
  };

  const simulateEndDay = () => {
    const totalItems = tasks.length + habits.length; const completedItems = tasks.filter(t => t.completed).length + habits.filter(h => h.completedToday).length; const dayScore = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
    const newHistoryItem = { date: currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), score: dayScore };
    const updatedHistory = [...dailyHistory, newHistoryItem];
    const updatedHabits = habits.map(h => ({ ...h, completedToday: false, streak: h.completedToday ? h.streak : 0, history: [...h.history, h.completedToday ? 1 : 0] }));
    const updatedTasks = tasks.filter(t => !t.completed); const nextDay = new Date(currentDate); nextDay.setDate(nextDay.getDate() + 1);
    setTasks(updatedTasks); setHabits(updatedHabits); setDailyHistory(updatedHistory); setCurrentDate(nextDay); setWaterIntake(0);
    saveData(updatedTasks, updatedHabits, updatedHistory, nextDay, dietPlan, 0);
  };

  const completionRate = useMemo(() => { const total = tasks.length + habits.length; if (total === 0) return 0; const done = tasks.filter(t => t.completed).length + habits.filter(h => h.completedToday).length; return Math.round((done / total) * 100); }, [tasks, habits]);
  
  // Reverted to Purple Theme Colors
  const pieData = [
    { name: 'Tasks 📝', value: tasks.filter(t => t.completed).length, color: '#8b5cf6' }, 
    { name: 'Habits 🔥', value: habits.filter(h => h.completedToday).length, color: '#ec4899' }, 
    { name: 'Left ⏳', value: tasks.filter(t => !t.completed).length + habits.filter(h => !h.completedToday).length, color: darkMode ? '#334155' : '#cbd5e1' },
  ].filter(d => d.value > 0);

  // Purple Glass Styling defaults
  const glassClass = `backdrop-blur-xl border border-white/20 shadow-xl transition-all duration-300 ${darkMode ? 'bg-slate-900/60 text-slate-100' : 'bg-white/70 text-slate-900'}`;
  const inputClass = `w-full p-4 rounded-xl border outline-none transition-all placeholder:text-slate-400 font-medium ${darkMode ? 'bg-black/20 border-white/10 focus:border-indigo-500' : 'bg-white/50 border-slate-200 focus:border-indigo-600'}`;
  const btnGradient = "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5";

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-indigo-400 font-bold tracking-widest uppercase animate-pulse">Loading FocusFlow...</div>;

  // --- LOGIN PORTAL ---
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
    <div className={`font-sans relative min-h-screen overflow-x-hidden ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      <GlobalStyles />
      <BackgroundImage darkMode={darkMode} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className={`sticky top-0 z-30 backdrop-blur-md border-b ${darkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white/50 border-white/20'}`}>
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            {/* LEFT: Dynamic Greeting & Welcome */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl backdrop-blur-sm ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100/80 text-indigo-600'}`}>
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h1 className="font-bold text-lg sm:text-xl leading-none drop-shadow-sm tracking-tight">
                  {getGreeting()} {realTime.getHours() < 12 ? '🌅' : realTime.getHours() < 18 ? '☀️' : '🌙'}
                </h1>
                <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Welcome to FocusFlow 🌊
                </p>
              </div>
            </div>

            {/* RIGHT: Clock, Controls & Profile */}
            <div className="flex items-center gap-3">
              
              {/* Live Clock & Date */}
              <div className="hidden sm:flex flex-col items-end mr-1 text-right">
                <span className="font-bold text-sm leading-none drop-shadow-sm">
                  {realTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className={`text-[10px] font-medium mt-1 uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {realTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} 📅
                </span>
              </div>

              <button onClick={simulateEndDay} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hidden md:flex backdrop-blur-sm ${darkMode ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' : 'bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`} title="Finish today and start tomorrow"><RefreshCw size={14} /> End Day 🌅</button>
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition-colors backdrop-blur-sm hidden sm:block ${darkMode ? 'hover:bg-slate-800/50 text-slate-300' : 'hover:bg-white/50 text-slate-600'}`}>{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>

              {/* Profile Icon */}
              <button onClick={() => setActiveTab('profile')} className="w-10 h-10 ml-1 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg ring-2 ring-white/20 hover:scale-105 transition-transform" title="My Profile">
                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 flex-1 w-full">
          {/* TABS NAVIGATION */}
          <div className={`flex p-1 rounded-xl overflow-x-auto backdrop-blur-md shadow-sm ${darkMode ? 'bg-slate-800/60 border border-slate-700/50' : 'bg-slate-200/60 border border-slate-200/50'}`}>
            {NAV_TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-all capitalize whitespace-nowrap ${activeTab === tab.id ? (darkMode ? 'bg-indigo-600 text-white shadow-lg shadow-black/20' : 'bg-indigo-500 text-white shadow-sm') : (darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-slate-700 hover:bg-black/5')}`}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB: PLANNER */}
          {activeTab === 'planner' && (
            <div className="space-y-6 animate-fadeIn">
              <div className={`rounded-xl p-4 transition-all ${glassClass}`}>
                <div className="flex justify-between items-center mb-4"><h3 className="font-medium text-sm opacity-80">Daily Tasks 📋</h3><div className="flex gap-2">{tasks.some(t => t.completed) && (<button onClick={clearCompletedTasks} className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-red-400 flex items-center gap-1 transition-colors"><Trash2 size={12} /> Clear Done 🧹</button>)}<button onClick={() => setIsBulkMode(!isBulkMode)} className={`text-xs px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-500 flex items-center gap-1`}><AlignLeft size={12} /> {isBulkMode ? "Single Add ✏️" : "Bulk Add 📚"}</button></div></div>
                {isBulkMode ? (<form onSubmit={addBulkTasks}><textarea value={bulkTaskText} onChange={(e) => setBulkTaskText(e.target.value)} placeholder="Enter multiple tasks, one per line... 📝" className={`${inputClass} h-32 mb-3`} /><button type="submit" className={`w-full py-3 rounded-xl font-bold uppercase tracking-wide transition-all ${btnGradient}`}>Add All Tasks 🚀</button></form>) : (<form onSubmit={addTask} className="relative"><input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="What needs to be done today? 🤔" className={`${inputClass} pr-12`} /><button type="submit" className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/20"><Plus size={20} /></button></form>)}
              </div>
              <div className="space-y-3">{tasks.length === 0 && (<div className={`text-center py-12 border-2 border-dashed rounded-xl backdrop-blur-sm ${darkMode ? 'border-slate-700/50 text-slate-500 bg-slate-800/30' : 'border-slate-300/50 text-slate-400 bg-white/30'}`}><p>No tasks yet. Start planning your day! 🎯</p></div>)}{tasks.map(task => (<div key={task.id} className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 backdrop-blur-sm ${task.completed ? (darkMode ? 'bg-slate-800/40 border-slate-700/50 opacity-75' : 'bg-slate-50/60 border-slate-200/50 text-slate-500') : (darkMode ? 'bg-slate-800/80 border-slate-700/80 hover:border-indigo-500/50' : 'bg-white/80 border-slate-200 hover:border-indigo-300 hover:shadow-sm')}`}><div className="flex items-center gap-4 flex-1"><button onClick={() => toggleTask(task.id)} className={`flex-shrink-0 transition-colors ${task.completed ? 'text-emerald-500' : (darkMode ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-300 hover:text-indigo-500')}`}>{task.completed ? <CheckCircle2 size={24} className="fill-emerald-500/10" /> : <Circle size={24} />}</button><span className={`text-base flex-1 break-all ${task.completed ? 'line-through' : ''}`}>{task.text}</span></div><div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => deleteTask(task.id)} className={`p-2 rounded-lg transition-all ${darkMode ? 'text-slate-500 hover:text-red-400 hover:bg-red-400/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}><Trash2 size={18} /></button></div></div>))}</div>
            </div>
          )}

          {/* TAB: TRACKER & HYDRATION */}
          {activeTab === 'tracker' && (
            <div className="space-y-8 animate-fadeIn">

              {/* WATER TRACKER HERO */}
              <div className={`p-8 rounded-3xl ${glassClass} flex flex-col items-center`}>
                <div className="text-center mb-6">
                  <h3 className="font-black text-2xl uppercase tracking-widest text-indigo-400">Hydration Protocol 💧</h3>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60 mt-1">Goal: 3000ml / Day</p>
                </div>

                {/* Glass Visualizer */}
                <div className="relative w-40 h-64 sm:w-48 sm:h-72 mx-auto cursor-pointer group" onClick={handleDrinkWater}>
                  {/* Outer Glass Shell */}
                  <div className={`absolute inset-0 rounded-b-xl border-4 border-t-0 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.1)] overflow-hidden ${darkMode ? 'border-white/30 bg-white/5' : 'border-slate-300 bg-slate-200/40'}`}
                    style={{ clipPath: 'polygon(10% 0%, 90% 0%, 80% 100%, 20% 100%)' }}>

                    {/* Glass Facets (Vertical Lines) */}
                    <div className="absolute inset-0 flex justify-evenly opacity-30 pointer-events-none mix-blend-overlay">
                      <div className={`w-px h-full ${darkMode ? 'bg-white' : 'bg-slate-400'}`}></div>
                      <div className={`w-px h-full ${darkMode ? 'bg-white' : 'bg-slate-400'}`}></div>
                      <div className={`w-px h-full ${darkMode ? 'bg-white' : 'bg-slate-400'}`}></div>
                    </div>

                    {/* Water Fill */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600/90 to-blue-400/80 transition-all duration-[800ms] ease-out shadow-[0_-5px_15px_rgba(59,130,246,0.4)]"
                      style={{ height: `${(waterIntake / 6) * 100}%` }}>
                      {/* Water Surface reflection */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-200/60 rounded-full blur-[1px]"></div>
                    </div>

                    {/* Cross-section Scale / Volume Marks */}
                    <div className="absolute inset-0 flex flex-col-reverse justify-between py-[16.66%] pointer-events-none">
                      {[1, 2, 3, 4, 5].map(mark => (
                        <div key={mark} className="w-full h-[1px] bg-white/30 dark:bg-white/20 flex items-center px-2">
                          <span className={`text-[9px] font-bold ${darkMode ? 'text-white/60' : 'text-slate-500'}`}>{mark * 500}ml</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pouring Animation Stream */}
                  {isPouring && (
                    <div className="absolute left-1/2 -translate-x-1/2 w-4 bg-blue-400/80 rounded-full animate-pour z-10 blur-[1px]" />
                  )}

                  {/* Overlay Interaction Text */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <div className="bg-black/60 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-sm shadow-xl">
                      {waterIntake >= 6 ? 'Fully Hydrated! 🎉' : 'Click to Drink 💧'}
                    </div>
                  </div>
                </div>

                {/* Water Controls & Stats */}
                <div className="mt-8 text-center relative">
                  <p className="text-4xl font-black text-indigo-400">{waterIntake * 500} <span className="text-sm font-semibold opacity-60 text-slate-500">/ 3000 ml</span></p>
                  {waterIntake > 0 && (
                    <button onClick={undoWater} className="absolute -right-12 top-2 text-xs font-bold opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1 text-slate-500">
                      Undo ↩️
                    </button>
                  )}
                </div>
              </div>

              {/* HABIT TRACKER GRID */}
              <div className="space-y-4 pt-4 border-t border-slate-500/20">
                <form onSubmit={addHabit} className="flex gap-2"><input type="text" value={newHabitText} onChange={(e) => setNewHabitText(e.target.value)} placeholder="New habit to track... 🌱" className={`${inputClass} flex-1`} /><button type="submit" className={`px-6 py-2 font-bold uppercase tracking-wider rounded-xl ${btnGradient}`}>Add ➕</button></form>
                <div className="grid gap-4 sm:grid-cols-2">{habits.map(habit => (<div key={habit.id} className={`p-5 rounded-2xl border transition-all backdrop-blur-sm ${habit.completedToday ? (darkMode ? 'bg-indigo-900/40 border-indigo-500/30' : 'bg-indigo-50/80 border-indigo-200') : (darkMode ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white/80 border-slate-200')}`}><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3 flex-1"><div className={`p-2 rounded-lg ${habit.completedToday ? 'bg-indigo-500 text-white' : (darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400')}`}><TrendingUp size={20} /></div><div className="flex-1"><h3 className={`font-semibold ${habit.completedToday ? (darkMode ? 'text-indigo-300' : 'text-indigo-900') : ''}`}>{habit.text}</h3><p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{habit.streak} day streak 🔥</p></div></div><div className="flex gap-2"><button onClick={() => toggleHabit(habit.id)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${habit.completedToday ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600' : (darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}`}>{habit.completedToday ? 'Done ✅' : 'Mark ⭕'}</button><button onClick={() => deleteHabit(habit.id)} className={`p-2 rounded-full transition-all ${darkMode ? 'text-slate-600 hover:bg-red-900/20 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-500'}`}><Trash2 size={16} /></button></div></div><div className="flex gap-1 justify-end">{[...habit.history, habit.completedToday ? 1 : 0].slice(-7).map((status, idx) => (<div key={idx} className={`w-2 h-6 rounded-sm ${status ? 'bg-indigo-500' : (darkMode ? 'bg-slate-700' : 'bg-slate-200')}`} />))}</div></div>))}</div>
              </div>
            </div>
          )}

          {/* TAB: DIET PLANNER */}
          {activeTab === 'diet' && (
            <div className="space-y-6 animate-fadeIn">
              <div className={`p-5 rounded-2xl flex justify-between items-center ${glassClass}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
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
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-1 ${isEditingDiet
                      ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                      : darkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                    }`}
                >
                  {isEditingDiet ? 'Save Plan 💾' : 'Edit Plan ✏️'}
                </button>
              </div>

              {/* Days Grid */}
              <div className="grid gap-6">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div key={day} className={`p-5 rounded-2xl ${glassClass}`}>
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
                    onChange={(e) => setDietPlan({ ...dietPlan, Notes: e.target.value })}
                    className={`w-full h-48 p-3 text-sm rounded-xl border bg-transparent ${darkMode ? 'border-amber-500/30 text-amber-100 focus:border-amber-500' : 'border-amber-300 text-amber-900 focus:border-amber-500'}`}
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
              <div className={`p-6 rounded-2xl flex flex-col items-center ${glassClass}`}><h2 className="text-lg font-semibold mb-6">Today's Breakdown 🥧</h2><SimplePieChart data={pieData} /><div className="mt-8 flex gap-6 flex-wrap justify-center">{pieData.map((d, i) => (<div key={i} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /><span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{d.name} ({d.value})</span></div>))}</div></div>
              <div className={`p-6 rounded-2xl border ${glassClass}`}><div className="flex items-center gap-3 mb-4"><Award className="text-amber-500" /><h2 className="text-lg font-semibold">Consistency Score 🏆</h2></div><div className="flex items-end gap-2"><span className="text-4xl font-bold">{completionRate}%</span><span className="text-slate-500 mb-1">completed today 🎯</span></div><div className={`w-full h-2 mt-4 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}><div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-500/50" style={{ width: `${completionRate}%` }} /></div></div>
              
              {/* Wellness Hub Section */}
              <WellnessSection glassClass={glassClass} darkMode={darkMode} />
            </div>
          )}

          {/* TAB: PROFILE / AUTH */}
          {activeTab === 'profile' && (
            <div className={`max-w-md mx-auto p-6 rounded-2xl ${glassClass} animate-fadeIn`}>
              {user && !user.isAnonymous ? (
                <div className="text-center space-y-6">
                  <div className="relative w-24 h-24 mx-auto"><div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl text-white font-bold shadow-lg shadow-indigo-500/30">{(user.email || 'U')[0].toUpperCase()}</div><div className="absolute bottom-0 right-0 p-2 bg-emerald-500 rounded-full border-4 border-slate-800"><ShieldCheck size={16} className="text-white" /></div></div>
                  <div><h2 className="text-xl font-bold">{user.email}</h2><p className="text-slate-500 text-sm">Account Verified ✅</p></div>
                  
                  {/* Summary row for profile */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="p-3 bg-indigo-500/10 rounded-lg">
                      <p className="text-lg font-bold text-indigo-500">{tasks.filter(t => t.completed).length}</p>
                      <p className="text-[10px] uppercase opacity-70">Tasks</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                      <p className="text-lg font-bold text-emerald-500">{habits.filter(h => h.completedToday).length}</p>
                      <p className="text-[10px] uppercase opacity-70">Habits</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <p className="text-lg font-bold text-blue-500">{waterIntake * 500}<span className="text-xs">ml</span></p>
                      <p className="text-[10px] uppercase opacity-70">Water</p>
                    </div>
                  </div>

                  <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50/50 transition-colors"><LogOut size={18} /> Sign Out 🚪</button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center"><h2 className="text-2xl font-bold mb-2">{isRegistering ? 'Create Account 🚀' : 'Welcome Back 👋'}</h2><p className="text-slate-500 text-sm">{isRegistering ? 'Start tracking your journey today. ✨' : 'Login to sync your data across devices. 🔄'}</p>{isOfflineMode && (<div className="mt-2 p-2 bg-amber-500/20 text-amber-300 text-xs rounded border border-amber-500/30">Note: Running in offline mode. Tasks are saved to this device only. ⚠️</div>)}</div>
                  {authError && (<div className="p-3 bg-red-50/90 text-red-600 text-sm rounded-lg border border-red-100">{authError}</div>)}
                  <form onSubmit={handleAuth} className="space-y-4"><div><label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Email 📧</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full p-3 rounded-lg border bg-transparent ${darkMode ? 'border-slate-600 text-white' : 'border-slate-300 text-slate-900'}`} /></div><div><label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Password 🔒</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full p-3 rounded-lg border bg-transparent ${darkMode ? 'border-slate-600 text-white' : 'border-slate-300 text-slate-900'}`} /></div><button type="submit" className={`w-full py-3 font-bold rounded-xl transition-all ${btnGradient}`}>{isRegistering ? 'Sign Up ✨' : 'Login 🔑'}</button></form>
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
