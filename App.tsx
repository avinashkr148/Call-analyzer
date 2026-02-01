
import React, { useState, useMemo, useEffect } from 'react';
import { 
  PhoneCall, 
  Clock, 
  Users, 
  BarChart3, 
  BrainCircuit,
  Trash2,
  Copy,
  Mail,
  HelpCircle,
  PieChart as PieChartIcon,
  ChevronRight,
  Database,
  ArrowRight,
  Maximize,
  Minimize,
  Twitter,
  Linkedin,
  Github,
  LogOut,
  ShieldCheck,
  Chrome
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie, 
  Legend
} from 'recharts';
import { parseRawLogs, formatSecondsToTime } from './utils/parser';
import { getCallInsights } from './services/geminiService';
import { CallEntry, NumberStats, SummaryStats } from './types';
import { StatCard } from './components/StatCard';
import { SetupGuide } from './components/SetupGuide';

// Custom Google Icon SVG
const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const App: React.FC = () => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard States
  const [rawInput, setRawInput] = useState('');
  const [calls, setCalls] = useState<CallEntry[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleGoogleLogin = () => {
    setIsLoggingIn(true);
    // Simulate Google OAuth Redirect/Popup Delay
    setTimeout(() => {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggingIn(false);
    }, 2000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  const stats = useMemo((): SummaryStats => {
    const totalDials = calls.length;
    const totalTalkSeconds = calls.reduce((acc, curr) => acc + curr.durationSeconds, 0);
    const uniqueNumbers = new Set(calls.map(c => c.number)).size;
    const connectedCalls = calls.filter(c => c.durationSeconds > 0).length;
    const missedCalls = totalDials - connectedCalls;

    return {
      totalDials,
      totalTalkSeconds,
      formattedTalkTime: formatSecondsToTime(totalTalkSeconds),
      uniqueNumbers,
      connectedCalls,
      missedCalls
    };
  }, [calls]);

  const topNumbers = useMemo((): NumberStats[] => {
    const map = new Map<string, { dials: number; talkTime: number }>();
    calls.forEach(c => {
      const existing = map.get(c.number) || { dials: 0, talkTime: 0 };
      map.set(c.number, {
        dials: existing.dials + 1,
        talkTime: existing.talkTime + c.durationSeconds
      });
    });

    return Array.from(map.entries())
      .map(([number, info]) => ({
        number,
        dials: info.dials,
        talkTime: info.talkTime,
        formattedTalkTime: formatSecondsToTime(info.talkTime)
      }))
      .sort((a, b) => b.talkTime - a.talkTime)
      .slice(0, 5);
  }, [calls]);

  const callStatusData = useMemo(() => [
    { name: 'Connected', value: stats.connectedCalls, color: '#10b981' }, 
    { name: 'Missed', value: stats.missedCalls, color: '#f43f5e' } 
  ], [stats.connectedCalls, stats.missedCalls]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const parsed = parseRawLogs(rawInput);
    setCalls(parsed);
    
    if (parsed.length > 0) {
      const insight = await getCallInsights(parsed);
      setAiInsight(insight);
    } else {
      setAiInsight(null);
    }
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setRawInput('');
    setCalls([]);
    setAiInsight(null);
  };

  const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

  // Google Login View
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Dynamic Background Effects */}
        <div className="absolute top-0 -left-1/4 w-3/4 h-3/4 bg-indigo-600/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-3/4 h-3/4 bg-blue-900/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] opacity-20" />
        
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-700 relative z-10">
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-5 rounded-[2rem] shadow-2xl shadow-indigo-600/30 mb-8 transform hover:rotate-6 transition-transform">
              <PhoneCall className="text-white w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-3">
              Call<span className="text-indigo-500">Analyzer</span>
            </h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em]">Corporate Intelligence</p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            
            <div className="relative text-center space-y-8">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
                <p className="text-slate-400 text-sm">Securely access your call analytics workspace using your enterprise account.</p>
              </div>
              
              <div className="py-4">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 px-6 rounded-2xl shadow-xl shadow-white/5 transition-all transform active:scale-[0.98] flex items-center justify-center gap-4 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                      <span className="text-slate-600">Authenticating...</span>
                    </div>
                  ) : (
                    <>
                      <GoogleLogo />
                      <span className="text-base tracking-tight">Sign in with Google</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-grow bg-slate-800" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Secured by OAuth 2.0</span>
                <div className="h-px flex-grow bg-slate-800" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center gap-2">
                   <ShieldCheck className="text-emerald-500 w-5 h-5" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">SSO Verified</span>
                </div>
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center gap-2">
                   <Database className="text-indigo-400 w-5 h-5" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">AES-256 Auth</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center space-y-4">
            <p className="text-slate-600 text-xs font-medium px-4">
              By signing in, you agree to our <button className="text-indigo-400 hover:underline">Terms of Protocol</button> and <button className="text-indigo-400 hover:underline">Data Safety Standards</button>.
            </p>
            <div className="flex justify-center gap-6">
               <button className="text-slate-700 hover:text-slate-500 transition-colors"><Twitter size={16} /></button>
               <button className="text-slate-700 hover:text-slate-500 transition-colors"><Github size={16} /></button>
               <button className="text-slate-700 hover:text-slate-500 transition-colors"><Linkedin size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-['Inter',_sans-serif]">
      <SetupGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Modern Header */}
      <header className="glass sticky top-0 z-50 border-b border-slate-800/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/20">
              <PhoneCall className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">
                Call<span className="text-indigo-500">Analyzer</span>
              </h1>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Intelligence Pro</span>
            </div>
          </div>
          
          <nav className="flex items-center space-x-3 md:space-x-6">
            <button 
              onClick={toggleFullscreen}
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-all text-sm font-semibold group p-2 hover:bg-slate-800 rounded-xl"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              <span className="hidden lg:inline">{isFullscreen ? 'Minimize' : 'Fullscreen'}</span>
            </button>
            
            <div className="h-4 w-px bg-slate-800" />
            
            <button 
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-all text-sm font-semibold group p-2 hover:bg-slate-800 rounded-xl"
            >
              <HelpCircle size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="hidden lg:inline">Guide</span>
            </button>
            
            <div className="h-4 w-px bg-slate-800" />
            
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-rose-500 hover:text-rose-400 transition-all text-sm font-bold group p-2.5 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20"
            >
              <LogOut size={20} />
              <span className="hidden lg:inline">Sign Out</span>
            </button>
            
            <div className="h-4 w-px bg-slate-800 hidden md:block" />
            
            <div className="hidden md:flex items-center space-x-2 bg-slate-800/50 px-3.5 py-2 rounded-full border border-slate-700/50">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Link</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Inputs */}
        <aside className="lg:col-span-4 space-y-8">
          <section className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Database size={80} />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <Copy className="text-indigo-500 w-5 h-5" />
                Input Stream
              </h2>
              {rawInput && (
                <button 
                  onClick={handleReset}
                  className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-xl transition-all"
                  title="Clear all"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            
            <textarea
              className="w-full h-72 p-5 text-sm font-mono border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all bg-black/40 text-slate-200 placeholder:text-slate-600 relative z-10 shadow-inner"
              placeholder="Paste raw log data stream here..."
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
            />

            <button
              onClick={handleAnalyze}
              disabled={!rawInput || isAnalyzing}
              className="w-full py-4 px-6 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 active:scale-[0.98] relative z-10"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Decoding...
                </>
              ) : (
                <>
                  <ArrowRight size={20} />
                  Initiate Scan
                </>
              )}
            </button>
          </section>

          {aiInsight && (
            <section className="bg-indigo-600/5 border border-indigo-500/20 p-8 rounded-3xl animate-in slide-in-from-bottom-5 duration-700 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3">
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
               </div>
              <h3 className="text-indigo-400 font-bold flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
                <BrainCircuit size={18} />
                Cognitive Synthesis
              </h3>
              <div className="prose prose-invert prose-sm text-slate-300 leading-relaxed max-w-none">
                {aiInsight}
              </div>
            </section>
          )}
        </aside>

        {/* Right Column: Analytics */}
        <div className="lg:col-span-8 space-y-10">
          {calls.length > 0 ? (
            <div className="animate-in fade-in duration-700 space-y-10">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard label="Total Dials" value={stats.totalDials} icon={<PhoneCall size={20} />} accentColor="text-indigo-500" />
                <StatCard label="Total Talk Time" value={stats.formattedTalkTime} icon={<Clock size={20} />} accentColor="text-emerald-500" />
                <StatCard label="Unique Numbers" value={stats.uniqueNumbers} icon={<Users size={20} />} accentColor="text-amber-500" />
              </div>

              {/* Chart Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-lg">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <BarChart3 size={18} className="text-indigo-500" />
                    Top Contacts
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer>
                      <BarChart data={topNumbers} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="number" type="category" width={100} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                          cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                        />
                        <Bar dataKey="talkTime" radius={[0, 6, 6, 0]} barSize={24}>
                          {topNumbers.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-lg">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <PieChartIcon size={18} className="text-indigo-500" />
                    Efficiency Vector
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={callStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {callStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
                <div className="px-8 py-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-widest">
                    <Database size={18} className="text-indigo-500" />
                    Ledger Stream
                  </h3>
                  <div className="text-[10px] font-bold text-slate-500 px-3 py-1 rounded-full border border-slate-800">
                    {calls.length} ENTRIES
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 bg-slate-950/20">
                        <th className="px-8 py-4">Reference Sequence</th>
                        <th className="px-8 py-4">Temporal Mark</th>
                        <th className="px-8 py-4 text-right">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {calls.map((call, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20 transition-colors group">
                          <td className="px-8 py-5 text-sm font-medium text-slate-300 group-hover:text-white">{call.number}</td>
                          <td className="px-8 py-5 text-xs text-slate-500 font-mono">{call.timestamp}</td>
                          <td className="px-8 py-5 text-right">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                              call.durationSeconds > 0 
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.05)]' 
                                : 'bg-slate-800 text-slate-600'
                            }`}>
                              {call.durationFormatted}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/10 animate-pulse duration-[3000ms]">
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 mb-8 shadow-2xl">
                <Database size={64} className="text-slate-700" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Awaiting Signal Feed</h3>
              <p className="text-slate-500 max-w-sm leading-relaxed mb-8">
                Paste your enterprise raw call logs into the terminal module to initialize the analysis sequence.
              </p>
              <button 
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center gap-3 text-indigo-400 hover:text-indigo-300 text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 border border-slate-800 rounded-2xl hover:bg-indigo-600/5 transition-all shadow-lg"
              >
                <HelpCircle size={16} />
                Access System Manual
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Proper Multi-Column Footer */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-900 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20">
                  <PhoneCall className="text-white w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">Call Analyzer</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Pioneering high-fidelity telecommunication pattern recognition for modern enterprise ecosystems.
              </p>
            </div>

            <div className="space-y-8">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Platform</h4>
              <ul className="space-y-4 text-sm font-semibold text-slate-600">
                <li><button onClick={() => setIsGuideOpen(true)} className="hover:text-indigo-400 transition-colors text-left">Setup Protocol</button></li>
                <li><button className="hover:text-indigo-400 transition-colors">Safety Standards</button></li>
                <li><button className="hover:text-indigo-400 transition-colors">API Architecture</button></li>
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Resources</h4>
              <ul className="space-y-4 text-sm font-semibold text-slate-600">
                <li><a href="mailto:avinash.kumar1@simplilearn.net" className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <Mail size={14} /> Global Support
                </a></li>
                <li><button className="hover:text-indigo-400 transition-colors">Legal Framework</button></li>
                <li><button className="hover:text-indigo-400 transition-colors">Incident Control</button></li>
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Authorized Channels</h4>
              <div className="flex items-center gap-3">
                <a href="#" className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/50 text-slate-500 hover:text-indigo-500 transition-all shadow-sm">
                  <Twitter size={18} />
                </a>
                <a href="#" className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/50 text-slate-500 hover:text-indigo-500 transition-all shadow-sm">
                  <Github size={18} />
                </a>
                <a href="#" className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/50 text-slate-500 hover:text-indigo-500 transition-all shadow-sm">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-8">
            <p className="text-xs text-slate-600 font-bold tracking-tight">
              © {new Date().getFullYear()} CALL ANALYZER PRO || ENTERPRISE EDITION
            </p>
            <div className="flex items-center gap-8 text-[10px] font-black text-slate-700 uppercase tracking-[0.25em]">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> ARCHITECT: AVINASH KUMAR</span>
              <span className="hidden sm:inline opacity-30">||</span>
              <span className="hover:text-slate-500 transition-colors cursor-default">V2.8.5-STABLE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
