"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Building, MapPin, LogOut, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  
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
      if (!user) return router.push('/login');

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
          .eq('id', activeProfileId) // Busca ESPECIFICAMENTE este perfil
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
      alert("Erro: " + result.error.message);
    } else {
      // Se criou novo, define como ativo agora
      if (result.data) {
        localStorage.setItem('active_profile_id', result.data.id);
      }
      alert("Perfil salvo!");
      router.push('/lobby'); // Volta pro lobby
    }
    setSaving(false);
  };

  if (loading) return <div className="h-full flex items-center justify-center text-[#ffd000]"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto hide-scrollbar">
      
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
        <div className="w-16 h-16 rounded-full bg-[#ffd000] flex items-center justify-center text-black font-bold text-2xl">
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
          <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Nicho</label>
          <div className="flex items-center gap-3 bg-[#121212] p-3 rounded-xl border border-white/10 focus-within:border-[#ffd000] transition-colors">
            <Building size={18} className="text-gray-500" />
            <input type="text" value={formData.niche} onChange={(e) => setFormData({...formData, niche: e.target.value})} className="bg-transparent w-full text-white outline-none text-sm" placeholder="Ex: Hamburgueria"/>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Cidade</label>
          <div className="flex items-center gap-3 bg-[#121212] p-3 rounded-xl border border-white/10 focus-within:border-[#ffd000] transition-colors">
            <MapPin size={18} className="text-gray-500" />
            <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="bg-transparent w-full text-white outline-none text-sm" placeholder="Ex: São Paulo"/>
          </div>
        </div>

         {/* Slider Tom de Voz (Simplificado) */}
         <div className="space-y-2">
            <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Tom de Voz</label>
            <input 
              type="range" min="0" max="100" value={formData.tone_of_voice}
              onChange={(e) => setFormData({...formData, tone_of_voice: parseInt(e.target.value)})}
              className="w-full accent-[#ffd000] bg-gray-800 h-2 rounded-lg cursor-pointer" 
            />
            <div className="flex justify-between text-[10px] text-gray-500"><span>Sério</span><span>Descontraído</span></div>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <button onClick={handleSave} disabled={saving} className="w-full h-14 rounded-xl bg-[#ffd000] text-black font-bold flex items-center justify-center gap-2 hover:bg-[#ffdb4d] transition active:scale-95">
          {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          <span>SALVAR</span>
        </button>
      </div>
    </div>
  );
}