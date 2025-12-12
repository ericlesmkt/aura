"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import LibraryCard from '@/components/aura/LibraryCard';
import ScriptModal from '@/components/aura/ScriptModal';
import SwipeableItem from '@/components/aura/SwipeableItem';
import { Search, Loader2, Layers, Trash2, Trophy } from 'lucide-react';
import LibrarySkeleton from '@/components/aura/skeletons/LibrarySkeleton';
// 1. Importar Toast
import { useToast } from '@/context/ToastContext';

const FILTERS = ['🏆 Campeões', 'Todos', 'Salvos', 'Rascunhos', 'Arquivados'];

export default function LibraryPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  // 2. Inicializar Hook
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [scripts, setScripts] = useState<any[]>([]);
  const [activeProfile, setActiveProfile] = useState<{id: string, name: string} | null>(null);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedScript, setSelectedScript] = useState<any | null>(null);

  useEffect(() => {
    const init = async () => {
      const profileId = localStorage.getItem('active_profile_id');
      if (!profileId) { router.push('/lobby'); return; }

      const { data: profile } = await supabase.from('profiles').select('id, name').eq('id', profileId).single();
      if (profile) setActiveProfile(profile);

      const { data: realScripts } = await supabase
        .from('scripts')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (realScripts) setScripts(realScripts);
      setLoading(false);
    };

    init();
  }, [supabase, router]);

  const archivedCount = scripts.filter(s => s.status === 'rejected').length;

  const handleArchive = async (id: string): Promise<boolean> => {
    const script = scripts.find(s => s.id === id);
    
    // Se já está arquivado, deleta permanentemente
    if (script && script.status === 'rejected') {
        const confirmDelete = window.confirm("Isso apagará o roteiro permanentemente. Tem certeza?");
        if (!confirmDelete) return false;
        
        await supabase.from('scripts').delete().eq('id', id);
        setScripts(prev => prev.filter(s => s.id !== id));
        addToast("Roteiro excluído definitivamente.", "success");
        return true;
    }

    // Se não, move para lixeira (arquivar)
    setScripts(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
    await supabase.from('scripts').update({ status: 'rejected' }).eq('id', id);
    addToast("Roteiro movido para a lixeira.", "info");
    return true;
  };

  const handleRestore = async (id: string): Promise<boolean> => {
    setScripts(prev => prev.map(s => s.id === id ? { ...s, status: 'draft' } : s));
    await supabase.from('scripts').update({ status: 'draft' }).eq('id', id);
    addToast("Roteiro restaurado para rascunhos!", "success");
    return true;
  };

  const handleClearArchive = async () => {
    if (archivedCount === 0) return;
    const confirmDelete = window.confirm(`ATENÇÃO: Você vai apagar ${archivedCount} roteiros para sempre.\n\nEssa ação não pode ser desfeita. Continuar?`);
    if (!confirmDelete) return;

    setIsClearing(true);
    const { error } = await supabase.from('scripts').delete().eq('profile_id', activeProfile?.id).eq('status', 'rejected');

    if (error) {
        addToast("Erro ao limpar: " + error.message, "error");
    } else {
        setScripts(prev => prev.filter(s => s.status !== 'rejected'));
        addToast("Lixeira esvaziada com sucesso.", "success");
    }
    setIsClearing(false);
  };

  const handleRemixInModal = async (blockKey: string) => {
    if (!activeProfile || !selectedScript) return;
    const context = selectedScript.content?.a?.audio || "Conteúdo genérico";
    try {
        const response = await fetch('/api/remix', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ profileId: activeProfile.id, blockKey, context })
        });
        const newVar = await response.json();
        if(!response.ok) throw new Error(newVar.error);
        
        addToast("Bloco remixado com IA!", "success");
        return newVar;

    } catch(e: any) { 
        addToast(e.message, "error"); 
        throw e; 
    }
  };

  const handleScriptUpdate = (updatedScript: any) => {
    setScripts(prev => prev.map(s => s.id === updatedScript.id ? { 
        ...s, 
        content: updatedScript.content, 
        status: updatedScript.status,
        is_viral: updatedScript.isViral 
    } : s));
    setSelectedScript(updatedScript); 
  };

  const filteredScripts = scripts.filter(script => {
    const contentString = JSON.stringify(script.content).toLowerCase();
    const matchesSearch = contentString.includes(searchTerm.toLowerCase()) || 
                          script.gancho_type.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === '🏆 Campeões') return script.is_viral === true;
    if (activeFilter === 'Todos') return script.status !== 'rejected';
    if (activeFilter === 'Salvos') return script.status === 'ready';
    if (activeFilter === 'Rascunhos') return script.status === 'draft';
    if (activeFilter === 'Arquivados') return script.status === 'rejected';
    
    return true;
  });

  const adaptScriptToCard = (realScript: any) => ({
    id: realScript.id,
    status: realScript.status,
    gancho: realScript.gancho_type,
    title: realScript.content?.a?.audio || "Roteiro sem título", 
    scene: realScript.content?.a?.visual || "Sem descrição visual",
    date: new Date(realScript.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    fullContent: realScript.content,
    profileName: activeProfile?.name,
    isViral: realScript.is_viral
  });

  if (loading) {
    return (
      <div className="flex flex-col h-full pt-6 px-6 overflow-hidden">
         <div className="flex justify-between items-end mb-6">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-white/5 animate-pulse rounded-lg"></div>
              <div className="h-3 w-32 bg-white/5 animate-pulse rounded-lg"></div>
            </div>
            <div className="h-8 w-32 bg-white/5 animate-pulse rounded-full"></div>
         </div>
         <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
            {[1,2,3,4].map(i => <div key={i} className="h-7 w-20 bg-white/5 animate-pulse rounded-full shrink-0"></div>)}
         </div>
         <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((i) => <LibrarySkeleton key={i} />)}
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300 pb-24 pt-6 px-6 relative">
      
      <div className="flex justify-between items-end mb-6">
        <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
                Roteiros <span className="text-[#ffd000]">AURA</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
                Produção de <strong className="text-white">{activeProfile?.name}</strong>
            </p>
        </div>
        
        <div className="relative group">
            <button className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Search size={14} />
            </button>
            <input 
                type="text" 
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:border-[#ffd000] outline-none transition-all w-32 focus:w-48 placeholder-gray-600"
            />
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-2 shrink-0">
        {FILTERS.map(filter => {
          const isActive = activeFilter === filter;
          const isChampionTab = filter === '🏆 Campeões';
          
          return (
            <button 
                key={filter} 
                onClick={() => setActiveFilter(filter)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all ${
                isActive 
                    ? (isChampionTab ? 'bg-[#ffd000] text-black border-[#ffd000] font-bold' : 'bg-white text-black border-white')
                    : (isChampionTab ? 'bg-[#ffd000]/10 text-[#ffd000] border-[#ffd000]/20 hover:bg-[#ffd000]/20' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10')
                }`}
            >
                {filter}
                {filter === 'Arquivados' && archivedCount > 0 && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center justify-center min-w-[18px] ${isActive ? 'bg-black/20 text-black' : 'bg-red-500/20 text-red-500 border border-red-500/20'}`}>
                        {archivedCount}
                    </span>
                )}
            </button>
          );
        })}
      </div>

      {activeFilter === 'Arquivados' && archivedCount > 0 && (
        <div className="mb-4 animate-in slide-in-from-top-2 shrink-0">
            <button 
                onClick={handleClearArchive}
                disabled={isClearing}
                className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-500/20 transition active:scale-95"
            >
                {isClearing ? <Loader2 className="animate-spin" size={14}/> : <Trash2 size={14} />}
                {isClearing ? "Excluindo..." : `Esvaziar Lixeira (${archivedCount})`}
            </button>
        </div>
      )}

      <div className="flex flex-col overflow-y-auto pb-10 hide-scrollbar flex-1">
        {filteredScripts.length > 0 ? (
          filteredScripts.map((script) => (
            <SwipeableItem 
                key={script.id} 
                onSwipeLeft={() => handleArchive(script.id)}
                labelLeft={activeFilter === 'Arquivados' ? "APAGAR DE VEZ" : "ARQUIVAR"}
                onSwipeRight={activeFilter === 'Arquivados' ? () => handleRestore(script.id) : undefined}
                labelRight="RESTAURAR"
            >
                <div onClick={() => setSelectedScript(adaptScriptToCard(script))}>
                    <LibraryCard script={adaptScriptToCard(script)} />
                </div>
            </SwipeableItem>
          ))
        ) : (
          <div className="text-center py-20 opacity-50 flex flex-col items-center">
            {activeFilter === '🏆 Campeões' ? <Trophy size={40} className="mb-2 text-[#ffd000]"/> : <Layers size={40} className="mb-2 text-gray-600"/>}
            <p className="text-sm text-gray-500">
                {activeFilter === 'Arquivados' ? "Nada por aqui." : (activeFilter === '🏆 Campeões' ? "Nenhum campeão ainda." : "Nenhum roteiro encontrado.")}
            </p>
            {activeFilter !== 'Todos' && (
                <button onClick={() => setActiveFilter('Todos')} className="text-xs text-[#ffd000] mt-2 underline">
                    Limpar filtros
                </button>
            )}
          </div>
        )}
      </div>

      {selectedScript && (
        <ScriptModal 
          script={selectedScript} 
          onClose={() => setSelectedScript(null)}
          onUpdate={handleScriptUpdate} 
          onRemix={handleRemixInModal} 
        />
      )}

    </div>
  );
}