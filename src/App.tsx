/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  History, 
  Info, 
  LogOut, 
  Coins, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  User as UserIcon,
  ChevronRight,
  Zap,
  ShoppingBag,
  Users,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface HistoryItem {
  id: string;
  type: 'claim' | 'bonus' | 'spend';
  amount: number;
  timestamp: number;
  label: string;
}

interface UserData {
  username: string;
  balance: number;
  lastClaim: number | null;
}

type Page = 'dashboard' | 'history' | 'about' | 'login';

// --- Components ---

const AdBanner = ({ id, label = "Ad" }: { id: number, label?: string, key?: React.Key }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [adContent, setAdContent] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Simulate "Ad Code" script execution and content injection
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setAdContent(`AD_UNIT_${id}_CONTENT_LOADED`);
    }, 200 + Math.random() * 600);
    return () => clearTimeout(timer);
  }, [id]);

  return (
    <div className="bento-card p-1 flex items-center justify-center border-dashed border-[#232328] bg-white/[0.01] min-h-[45px] group hover:border-[#00FF94]/20 transition-all overflow-hidden relative">
      {!isLoaded ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-[#00FF94]/10 border-t-[#00FF94] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="text-center animate-in zoom-in-95 duration-300">
          <div className="text-[6px] font-black uppercase tracking-[0.2em] text-[#00FF94]/40 leading-none mb-0.5">
            {label}
          </div>
          <div className="text-[8px] font-mono text-[#8E8E93] truncate max-w-[100px]">
            {adContent}
          </div>
        </div>
      )}
      {/* This hidden div represents where the actual ad code would inject its iframe/content */}
      <div id={`ad-slot-${id}`} className="hidden ad-slot-container" data-ad-unit={id}></div>
    </div>
  );
};

const AdRail = ({ count, side, startId }: { count: number, side: 'top' | 'bottom' | 'left' | 'right', startId: number }) => (
  <div className="w-full grid grid-cols-6 gap-2 my-2">
    {Array.from({ length: count }).map((_, i) => (
      <AdBanner key={startId + i} id={startId + i} label={side.toUpperCase()} />
    ))}
  </div>
);

const Card = ({ children, className = "", title }: { children: React.ReactNode, className?: string, title?: string }) => (
  <div className={`bento-card p-6 flex flex-col ${className}`}>
    {title && <div className="text-[10px] uppercase tracking-[0.1em] text-[#8E8E93] mb-4 font-bold">{title}</div>}
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className = "" 
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'outline' | 'danger',
  disabled?: boolean,
  className?: string
}) => {
  const variants = {
    primary: 'bg-[#00FF94] text-[#0A0A0C] hover:opacity-90 shadow-lg shadow-[#00FF94]/20',
    secondary: 'bg-white/5 text-white hover:bg-white/10 border border-[#232328]',
    outline: 'border border-[#232328] text-white hover:bg-white/5',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 text-sm ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default function App() {
  const [page, setPage] = useState<Page>('login');
  const [user, setUser] = useState<UserData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('reward_user');
    const savedHistory = localStorage.getItem('reward_history');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setPage('dashboard');
    }
    
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    setIsLoaded(true);
  }, []);

  // Sync data to localStorage
  useEffect(() => {
    if (isLoaded && user) {
      localStorage.setItem('reward_user', JSON.stringify(user));
    }
  }, [user, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('reward_history', JSON.stringify(history));
    }
  }, [history, isLoaded]);

  const handleLogin = (username: string) => {
    const newUser: UserData = {
      username,
      balance: 100, // Starting bonus
      lastClaim: null
    };
    setUser(newUser);
    setHistory([{
      id: Math.random().toString(36).substr(2, 9),
      type: 'bonus',
      amount: 100,
      timestamp: Date.now(),
      label: 'Welcome Bonus'
    }]);
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('reward_user');
    localStorage.removeItem('reward_history');
    setUser(null);
    setHistory([]);
    setPage('login');
  };

  const handleClaim = () => {
    if (!user) return;
    
    const now = Date.now();
    const claimAmount = 50;
    
    setUser({
      ...user,
      balance: user.balance + claimAmount,
      lastClaim: now
    });
    
    setHistory([
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'claim',
        amount: claimAmount,
        timestamp: now,
        label: 'Daily Reward'
      },
      ...history
    ]);
  };

  const canClaim = () => {
    if (!user?.lastClaim) return true;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - user.lastClaim > twentyFourHours;
  };

  const getTimeUntilNextClaim = () => {
    if (!user?.lastClaim) return "";
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const nextClaim = user.lastClaim + twentyFourHours;
    const diff = nextClaim - Date.now();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen flex bg-[#0A0A0C] text-white font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      {user && page !== 'login' && (
        <aside className="w-60 border-r border-[#232328] flex flex-col py-8 px-6 shrink-0">
          <div className="flex items-center gap-2.5 font-black text-lg tracking-wider text-[#00FF94] mb-12">
            <Zap className="w-6 h-6 fill-current" />
            REWARD.LY
          </div>
          
          <nav className="flex flex-col gap-2 flex-1">
            <button 
              onClick={() => setPage('dashboard')}
              className={`flex items-center gap-3 py-3 px-1 text-sm font-semibold transition-colors ${page === 'dashboard' ? 'text-white' : 'text-[#8E8E93] hover:text-[#00FF94]'}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button 
              className="flex items-center gap-3 py-3 px-1 text-sm font-semibold text-[#8E8E93] hover:text-[#00FF94] transition-colors cursor-not-allowed opacity-50"
            >
              <ArrowUpRight className="w-5 h-5" />
              Quests
            </button>
            <button 
              className="flex items-center gap-3 py-3 px-1 text-sm font-semibold text-[#8E8E93] hover:text-[#00FF94] transition-colors cursor-not-allowed opacity-50"
            >
              <ShoppingBag className="w-5 h-5" />
              Marketplace
            </button>
            <button 
              className="flex items-center gap-3 py-3 px-1 text-sm font-semibold text-[#8E8E93] hover:text-[#00FF94] transition-colors cursor-not-allowed opacity-50"
            >
              <Users className="w-5 h-5" />
              Referrals
            </button>
            <button 
              onClick={() => setPage('history')}
              className={`flex items-center gap-3 py-3 px-1 text-sm font-semibold transition-colors ${page === 'history' ? 'text-white' : 'text-[#8E8E93] hover:text-[#00FF94]'}`}
            >
              <History className="w-5 h-5" />
              History
            </button>
            <button 
              onClick={() => setPage('about')}
              className={`flex items-center gap-3 py-3 px-1 text-sm font-semibold transition-colors ${page === 'about' ? 'text-white' : 'text-[#8E8E93] hover:text-[#00FF94]'}`}
            >
              <Info className="w-5 h-5" />
              About
            </button>
          </nav>

          <div className="mt-auto pt-8 border-t border-[#232328] flex flex-col gap-2">
            <button className="flex items-center gap-3 py-3 px-1 text-sm font-semibold text-[#8E8E93] hover:text-white transition-colors cursor-not-allowed opacity-50">
              <Settings className="w-5 h-5" />
              Settings
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 py-3 px-1 text-sm font-semibold text-[#8E8E93] hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {page === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col items-center justify-center p-8 overflow-y-auto"
            >
              <div className="max-w-4xl w-full flex flex-col items-center gap-2">
                <AdRail count={6} side="top" startId={1} />
                <AdRail count={6} side="left" startId={7} />

                <Card className="max-w-md w-full text-center py-12 px-10 my-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#00FF94] mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-[#00FF94]/20">
                    <Zap className="w-8 h-8 text-[#0A0A0C] fill-current" />
                  </div>
                  <h1 className="text-3xl font-black mb-3">Welcome Back</h1>
                  <p className="text-[#8E8E93] mb-10 text-sm font-medium">Enter your name to access your dashboard</p>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const name = (e.currentTarget.elements.namedItem('username') as HTMLInputElement).value;
                    if (name.trim()) handleLogin(name);
                  }}>
                    <div className="text-left mb-8">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E93] mb-3 block">Username</label>
                      <input 
                        name="username"
                        type="text" 
                        placeholder="e.g. Alex Rivet"
                        required
                        className="w-full bg-[#0A0A0C] border border-[#232328] rounded-xl px-4 py-4 focus:outline-none focus:border-[#00FF94] transition-all text-sm font-medium"
                      />
                    </div>
                    <Button className="w-full py-4 text-base rounded-2xl">
                      Get Started
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </form>
                </Card>

                <AdRail count={6} side="right" startId={13} />
                <AdRail count={6} side="bottom" startId={19} />
              </div>
            </motion.div>
          )}

          {page === 'dashboard' && user && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 max-w-7xl mx-auto flex flex-col gap-2"
            >
              <AdRail count={6} side="top" startId={1} />
              <AdRail count={6} side="left" startId={7} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-4">
                {/* Header Bar */}
                <div className="md:col-span-3 flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold">Overview</h1>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#141417] border border-[#232328] rounded-full py-2 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00FF94] to-[#00BFFF]" />
                      <span className="text-sm font-bold">{user.username}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="p-2.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Balance Card (Bento span 2) */}
                <Card 
                  title="Current Balance" 
                  className="md:col-span-2 bg-[radial-gradient(circle_at_top_right,rgba(0,255,148,0.1),transparent)]"
                >
                  <div className="flex items-baseline gap-2 mb-2">
                    <h3 className="text-5xl font-bold text-glow-accent">{user.balance.toLocaleString()}</h3>
                    <span className="text-[#00FF94] font-bold text-lg">PTS</span>
                  </div>
                  <p className="text-[#8E8E93] text-sm mb-8">≈ ${(user.balance / 100).toFixed(2)} USD Available for withdrawal</p>
                  <Button 
                    onClick={handleClaim} 
                    disabled={!canClaim()}
                    className="mt-auto w-full py-3.5"
                  >
                    {canClaim() ? `Claim Daily Reward (+50 PTS)` : `Locked (Next in ${getTimeUntilNextClaim()})`}
                  </Button>
                </Card>

                {/* Quick Stats Card */}
                <Card title="Quick Stats" className="md:col-span-1">
                  <div className="flex-1 flex flex-col justify-center gap-1">
                    {[
                      { label: 'Lifetime Earned', value: (user.balance + 500).toLocaleString() },
                      { label: 'Quests Done', value: '12' },
                      { label: 'Rank', value: 'Silver II', color: '#00BFFF' },
                      { label: 'Next Tier', value: '450 PTS' }
                    ].map((stat, i) => (
                      <div key={i} className="flex justify-between py-3.5 border-b border-[#232328] last:border-0">
                        <span className="text-sm text-[#8E8E93] font-medium">{stat.label}</span>
                        <span className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* History Card (Bento span 2) */}
                <Card title="Transaction History" className="md:col-span-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="pb-4 text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">Action</th>
                          <th className="pb-4 text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">Date</th>
                          <th className="pb-4 text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">Status</th>
                          <th className="pb-4 text-[10px] font-bold uppercase tracking-wider text-[#8E8E93] text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#232328]">
                        {history.slice(0, 4).map((item) => (
                          <tr key={item.id}>
                            <td className="py-4 text-sm font-bold">{item.label}</td>
                            <td className="py-4 text-sm text-[#8E8E93]">{new Date(item.timestamp).toLocaleDateString()}</td>
                            <td className="py-4 text-sm text-[#00FF94] font-medium">Completed</td>
                            <td className={`py-4 text-sm text-right font-bold ${item.amount > 0 ? 'text-[#00FF94]' : 'text-red-500'}`}>
                              {item.amount > 0 ? '+' : ''}{item.amount}
                            </td>
                          </tr>
                        ))}
                        {history.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-[#8E8E93] text-sm">No transactions yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Daily Streak Card */}
                <Card title="Daily Streak" className="md:col-span-1 bg-gradient-to-br from-[#1A1A20] to-[#141417] items-center justify-center text-center">
                  <div className="text-6xl font-black text-[#FFB800] leading-none mb-2">
                    {user.lastClaim ? '1' : '0'}
                  </div>
                  <div className="text-sm font-bold text-[#8E8E93] mb-6">Days Active</div>
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                      <div 
                        key={i} 
                        className={`w-3 h-3 rounded-full ${i === 1 && user.lastClaim ? 'bg-[#FFB800] shadow-[0_0_10px_rgba(255,184,0,0.4)]' : 'bg-[#232328]'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-[#8E8E93] font-medium">
                    Claim 6 more days for <span className="text-[#FFB800]">Super Bonus</span>
                  </p>
                </Card>
              </div>

              <AdRail count={6} side="right" startId={13} />
              <AdRail count={6} side="bottom" startId={19} />
            </motion.div>
          )}

          {page === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 max-w-4xl mx-auto space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Transaction History</h1>
                <Button variant="outline" onClick={() => setPage('dashboard')}>
                  Back to Dashboard
                </Button>
              </div>

              <Card className="p-0 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="p-5 text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">Type</th>
                      <th className="p-5 text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">Label</th>
                      <th className="p-5 text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">Date</th>
                      <th className="p-5 text-[10px] font-bold uppercase tracking-wider text-[#8E8E93] text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232328]">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-5">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            item.type === 'claim' ? 'bg-[#00FF94]/20 text-[#00FF94]' : 
                            item.type === 'bonus' ? 'bg-blue-500/20 text-blue-500' : 
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="p-5 font-bold text-sm">{item.label}</td>
                        <td className="p-5 text-[#8E8E93] text-sm">
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                        <td className={`p-5 text-right font-bold text-sm ${item.amount > 0 ? 'text-[#00FF94]' : 'text-red-500'}`}>
                          {item.amount > 0 ? '+' : ''}{item.amount} PTS
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </motion.div>
          )}

          {page === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 max-w-3xl mx-auto space-y-8"
            >
              <div className="text-center">
                <h1 className="text-4xl font-black mb-4">About Reward.ly</h1>
                <p className="text-[#8E8E93] text-lg font-medium">A demonstration of a modern static web application with a Bento Grid design.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card title="Architecture">
                  <h3 className="font-bold text-lg mb-2">Static & Local</h3>
                  <p className="text-[#8E8E93] text-sm leading-relaxed">
                    This app is 100% client-side. It uses localStorage to persist your data directly in your browser, meaning no backend server is required.
                  </p>
                </Card>
                <Card title="Design System">
                  <h3 className="font-bold text-lg mb-2">Bento Grid</h3>
                  <p className="text-[#8E8E93] text-sm leading-relaxed">
                    The UI follows the Bento Grid pattern, organizing information into distinct, high-contrast tiles for maximum scannability.
                  </p>
                </Card>
              </div>

              <Card title="Technical Stack" className="bg-white/5">
                <ul className="space-y-4">
                  {[
                    { name: 'React 19', desc: 'Modern UI library' },
                    { name: 'Tailwind CSS 4', desc: 'Utility-first styling' },
                    { name: 'Motion', desc: 'Smooth animations' },
                    { name: 'Lucide Icons', desc: 'Consistent iconography' }
                  ].map((tech) => (
                    <li key={tech.name} className="flex items-start gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00FF94]" />
                      <div>
                        <span className="font-bold text-white">{tech.name}:</span>
                        <span className="text-[#8E8E93] ml-2 text-sm">{tech.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              <div className="text-center">
                <Button variant="outline" onClick={() => setPage('dashboard')}>
                  Return to Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
