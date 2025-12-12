"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Sparkles } from 'lucide-react';
import ProfileModal from '@/components/aura/ProfileModal';

// Cores "Aura" disponíveis
const AURA_COLORS = [
  { from: 'from-purple-600', to: 'to-blue-900', text: 'text-purple-300', glow: 'bg-purple-500' },
  { from: 'from-emerald-600', to: 'to-teal-900', text: 'text-emerald-300', glow: 'bg-emerald-500' },
  { from: 'from-rose-600', to: 'to-pink-900', text: 'text-rose-300', glow: 'bg-rose-500' },
  { from: 'from-amber-500', to: 'to-orange-900', text: 'text-amber-300', glow: 'bg-amber-500' },
  { from: 'from-cyan-600', to: 'to-blue-900', text: 'text-cyan-300', glow: 'bg-cyan-500' },
  { from: 'from-fuchsia-600', to: 'to-purple-900', text: 'text-fuchsia-300', glow: 'bg-fuchsia-500' },
];

export default function LobbyPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  
  const MAX_PROFILES = 5;

  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isManaging, setIsManaging] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('account_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setProfiles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, [supabase, router]);

  // Função para pegar estilo consistente baseado no nome
  const getProfileStyle = (name: string) => {
    if (!name) return AURA_COLORS[0];
    const index = name.length % AURA_COLORS.length;
    return AURA_COLORS[index];
  };

  const handleProfileClick = (profile: any) => {
    if (isManaging) {
        setEditingProfile(profile);
        setIsModalOpen(true);
    } else {
        localStorage.setItem('active_profile_id', profile.id);
        router.push('/feed');
    }
  };

  const handleCreate = () => {
    if (profiles.length >= MAX_PROFILES) return;
    setEditingProfile(null); 
    setIsModalOpen(true);
  };

  const canCreate = profiles.length < MAX_PROFILES;

  if (loading) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 animate-pulse">
           <div className="h-8 w-48 bg-white/5 rounded-full mb-12"></div>
           <div className="flex flex-wrap justify-center gap-8 w-full">
              {[1, 2].map((i) => <div key={i} className="w-32 h-32 bg-white/5 rounded-3xl"></div>)}
           </div>
        </div>
      );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 animate-in fade-in duration-700 w-full relative overflow-hidden">
      
      {/* Background Decorativo Sutil */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="flex flex-col items-center w-full max-w-[400px] z-10">

        <h1 className="text-xl font-medium text-white mb-10 tracking-wide text-center opacity-90">
            {isManaging ? "Gerenciar Perfis:" : "Quem vai criar hoje?"}
        </h1>

        {/* GRID DE PERFIS */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-10 w-full">
            
            {profiles.map(profile => {
                const style = getProfileStyle(profile.name);
                
                return (
                    <div 
                        key={profile.id}
                        onClick={() => handleProfileClick(profile)}
                        className="group flex flex-col items-center cursor-pointer w-32"
                    >
                        {/* Avatar com Aura */}
                        <div className={`
                            relative w-32 h-32 rounded-3xl 
                            flex items-center justify-center shadow-2xl transition-all duration-300
                            ${!isManaging 
                                ? 'group-hover:-translate-y-2 group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)]' 
                                : 'opacity-60 scale-95'
                            }
                        `}>
                            {/* Fundo Gradiente */}
                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${style.from} to-black border border-white/10 overflow-hidden`}>
                                {/* Brilho Interno (Aura) */}
                                <div className={`absolute -bottom-10 -right-10 w-24 h-24 ${style.glow} blur-[40px] opacity-40 group-hover:opacity-60 transition-opacity duration-500`}></div>
                                <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                            </div>
                            
                            {/* Letras Iniciais */}
                            <span className={`relative z-10 text-4xl font-black select-none tracking-tight ${style.text} drop-shadow-md`}>
                                {profile.name ? profile.name.substring(0, 2).toUpperCase() : '??'}
                            </span>

                            {/* Ícone de Edição */}
                            {isManaging && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 border-2 border-white/20 rounded-3xl backdrop-blur-sm">
                                    <Pencil size={28} className="text-white drop-shadow-md" />
                                </div>
                            )}
                        </div>

                        {/* Nome do Perfil */}
                        <span className={`
                            mt-4 text-xs font-bold tracking-wide text-center truncate w-full transition-colors
                            ${isManaging ? 'text-gray-600' : 'text-gray-400 group-hover:text-white'}
                        `}>
                            {profile.name}
                        </span>
                    </div>
                );
            })}

            {/* BOTÃO ADICIONAR */}
            {canCreate && (
                <div 
                    onClick={handleCreate}
                    className="group flex flex-col items-center cursor-pointer w-32"
                >
                    <div className="w-32 h-32 rounded-3xl flex items-center justify-center bg-white/5 border-2 border-dashed border-white/10 group-hover:bg-white/10 group-hover:border-[#ffd000]/50 transition-all duration-300">
                        <Plus size={32} className="text-gray-600 group-hover:text-[#ffd000] transition-colors" />
                    </div>
                    <span className="mt-4 text-xs font-bold text-gray-600 group-hover:text-[#ffd000] tracking-wide text-center transition-colors">
                        Adicionar
                    </span>
                </div>
            )}

        </div>

        {/* BOTÃO GERENCIAR */}
        <div className="mt-16">
            <button
                onClick={() => setIsManaging(!isManaging)}
                className={`
                    px-6 py-2 rounded-full border text-[10px] font-bold tracking-[0.2em] uppercase transition-all
                    ${isManaging 
                        ? 'bg-white text-black border-white hover:bg-gray-200' 
                        : 'bg-transparent text-gray-600 border-gray-800 hover:text-gray-400 hover:border-gray-600'
                    }
                `}
            >
                {isManaging ? "Concluído" : "Gerenciar"}
            </button>
        </div>

      </div>

      <ProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProfiles} 
        profileToEdit={editingProfile}
      />
    </div>
  );
}