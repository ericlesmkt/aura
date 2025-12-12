"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Building, MapPin, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

// 1. COMPONENTE INTERNO COM A LÓGICA (ONDE USAMOS SEARCH PARAMS)
function ProfileContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNewMode, setIsNewMode] = useState(false);

  const [formData, setFormData] = useState({
    id: null as string | null,
    name: '',
    niche: '',
    city: '',
    tone_of_voice: 50,
  });

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // Verifica se estamos criando um novo (vimos do Lobby clicando no +)
      const mode = searchParams.get('mode');
      
      if (mode === 'new') {
        setIsNewMode(true);
        setFormData(prev => ({ ...prev, name: "Novo Negócio" }));
        setLoading(false);
        return;
      }

      // Se for edição, pegamos o ID do localStorage
      const activeProfileId = localStorage.getItem('active_profile_id');

      if (activeProfileId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', activeProfileId)
          .single();

        if (profile) {
          setFormData({
            id: profile.id,
            name: profile.name,
            niche: profile.niche || '',
            city: profile.city || '',
            tone_of_voice: profile.tone_of_voice || 50,
          });
        }
      } 
      // Se não tiver ID nem modo new, manda pro Lobby escolher
      else {
        router.push('/lobby');
      }
      
      setLoading(false);
    };

    init();
  }, [supabase, router, searchParams]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
        addToast("O nome do negócio é obrigatório.", "info");
        return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const payload = {
      account_id: user.id,
      name: formData.name,
      niche: formData.niche,
      city: formData.city,
      tone_of_voice: formData.tone_of_voice,
    };

    let result;

    if (formData.id && !isNewMode) {
      // Update
      result = await supabase.from('profiles').update(payload).eq('id', formData.id).select().single();
    } else {
      // Insert
      result = await supabase.from('profiles').insert([payload]).select().single();
    }

    if (result.error) {
      addToast("Erro ao salvar: " + result.error.message, "error");
    } else {
      // Se criou novo, define como ativo agora
      if (result.data) {
        localStorage.setItem('active_profile_id', result.data.id);
      }
      addToast("Perfil salvo com sucesso!", "success");
      router.push('/lobby'); // Volta pro lobby para ver o novo card brilhando
    }
    setSaving(false);
  };

  if (loading) {
      return (
        <div className="h-full flex items-center justify-center text-[#ffd000]">
            <Loader2 className="animate-spin"/>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto hide-scrollbar animate-in slide-in-from-right duration-300">
      
      {/* Header com Voltar */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/lobby')} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition">
            <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-white">
          {isNewMode ? "Novo Perfil" : "Configurar Perfil"}
        </h1>
      </div>

      {/* Cartão do Perfil */}
      <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ffd000] to-orange-500 flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-orange-500/20">
          {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'NO'}
        </div>
        <div className="flex-1">
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="bg-transparent border-none outline-none text-lg font-bold text-white w-full placeholder-gray-500 focus:ring-0 p-0"
            placeholder="Nome do Negócio"
          />
          <p className="text-xs text-gray-500">{isNewMode ? 'Criando novo perfil...' : 'Editando perfil existente'}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Nicho de Atuação</label>
          <div className="flex items-center gap-3 bg-[#121212] p-3 rounded-xl border border-white/10 focus-within:border-[#ffd000] transition-colors group">
            <Building size={18} className="text-gray-500 group-focus-within:text-[#ffd000]" />
            <input type="text" value={formData.niche} onChange={(e) => setFormData({...formData, niche: e.target.value})} className="bg-transparent w-full text-white outline-none text-sm placeholder-gray-600" placeholder="Ex: Hamburgueria Artesanal"/>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Cidade / Local</label>
          <div className="flex items-center gap-3 bg-[#121212] p-3 rounded-xl border border-white/10 focus-within:border-[#ffd000] transition-colors group">
            <MapPin size={18} className="text-gray-500 group-focus-within:text-[#ffd000]" />
            <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="bg-transparent w-full text-white outline-none text-sm placeholder-gray-600" placeholder="Ex: São Paulo, SP"/>
          </div>
        </div>

         {/* Slider Tom de Voz */}
         <div className="space-y-3 pt-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold flex justify-between">
                Tom de Voz da IA
                <span className="text-[#ffd000]">{formData.tone_of_voice > 50 ? (formData.tone_of_voice > 80 ? "Hype Master 🔥" : "Descontraído 😎") : "Mentor Sério 🧐"}</span>
            </label>
            <input 
              type="range" min="0" max="100" value={formData.tone_of_voice}
              onChange={(e) => setFormData({...formData, tone_of_voice: parseInt(e.target.value)})}
              className="w-full accent-[#ffd000] bg-gray-800 h-2 rounded-lg cursor-pointer" 
            />
            <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase">
                <span>Sério / Técnico</span>
                <span>Varejo / Viral</span>
            </div>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <button onClick={handleSave} disabled={saving} className="w-full h-14 rounded-xl bg-[#ffd000] text-black font-black tracking-widest flex items-center justify-center gap-2 hover:bg-[#ffdb4d] transition active:scale-95 shadow-[0_0_20px_rgba(255,208,0,0.2)]">
          {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          <span>SALVAR PERFIL</span>
        </button>
      </div>
    </div>
  );
}

// 2. COMPONENTE PRINCIPAL (EXPORT DEFAULT) QUE ENVIA O SUSPENSE
export default function ProfilePage() {
  return (
    <Suspense 
      fallback={
        <div className="h-full flex items-center justify-center text-[#ffd000]">
            <Loader2 className="animate-spin"/>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}