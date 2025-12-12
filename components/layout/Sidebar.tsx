"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  LayoutGrid, 
  Library, 
  Settings, 
  LogOut, 
  Sparkles, 
  Flame,
  Zap
} from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Co-Criação', icon: Sparkles, path: '/feed' },
  { name: 'Roteiros', icon: Library, path: '/library' },
  { name: 'Lobby', icon: LayoutGrid, path: '/lobby' },
  { name: 'Configurações', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [streak, setStreak] = useState(0);
  const [credits, setCredits] = useState<number | null>(null);
  const [limit, setLimit] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: account } = await supabase
        .from('saas_accounts')
        .select('current_streak, credits_used_today, daily_credits_limit')
        .eq('id', user.id)
        .single();

      if (account) {
        setStreak(account.current_streak || 0);
        setLimit(account.daily_credits_limit);
        setCredits(account.daily_credits_limit - account.credits_used_today);
      }
    };

    fetchData();
  }, [supabase]); 

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const isPro = limit > 100; 

  // MUDANÇA IMPORTANTE: hidden no mobile (md:flex mostra só no desktop)
  return (
    <aside className="hidden md:flex w-64 h-screen bg-[#0a0a0a] border-r border-white/5 flex-col fixed left-0 top-0 z-50">
      
      {/* LOGO */}
      <div className="h-20 flex items-center px-8 border-b border-white/5">
        <h1 className="text-xl font-bold tracking-tighter text-white flex items-center gap-2">
          AURA<span className="text-[#ffd000]">AI</span>
        </h1>
      </div>

      {/* STATS */}
      <div className="px-6 py-6">
        <div className="bg-[#121212] rounded-xl p-4 border border-white/5 flex flex-col gap-3">
            
            {/* Fogo / Streak */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${streak > 0 ? 'bg-orange-500/20 text-orange-500' : 'bg-gray-800 text-gray-600'}`}>
                        <Flame size={16} className={streak > 0 ? "fill-orange-500 animate-pulse" : ""} />
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 block font-medium">Ofensiva</span>
                        <span className="text-sm font-bold text-white leading-none">{streak} dias</span>
                    </div>
                </div>
            </div>

            {/* Barra de Créditos */}
            {credits !== null && (
                <div className="pt-2 border-t border-white/5">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-medium">
                        <span className="flex items-center gap-1"><Zap size={10}/> Créditos</span>
                        {isPro ? (
                           <span className="text-[#ffd000] font-bold">ILIMITADO</span>
                        ) : (
                           <span className={credits === 0 ? "text-red-500" : "text-[#ffd000]"}>{credits} restam</span>
                        )}
                    </div>
                    
                    {!isPro && (
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#ffd000]" 
                                style={{ width: `${Math.min(100, (credits / limit) * 100)}%` }} 
                            ></div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-[#ffd000] text-black shadow-[0_0_15px_rgba(255,208,0,0.1)] font-bold' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} className={isActive ? 'stroke-[2.5]' : ''} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>

    </aside>
  );
}