"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, MapPin, Tag, User, Loader2, Sparkles, Trash2, Zap, Brain, Handshake } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  profileToEdit?: any;
}

export default function ProfileModal({ isOpen, onClose, onSuccess, profileToEdit }: ProfileModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [name, setName] = useState('');
  const [niche, setNiche] = useState('');
  const [city, setCity] = useState('');
  const [tone, setTone] = useState(50);

  useEffect(() => {
    if (profileToEdit) {
        setName(profileToEdit.name);
        setNiche(profileToEdit.niche);
        setCity(profileToEdit.city);
        // CORREÇÃO AQUI: Usando '??' ao invés de '||' para aceitar o valor 0
        setTone(profileToEdit.tone_of_voice ?? 50); 
    } else {
        setName('');
        setNiche('');
        setCity('');
        setTone(50);
    }
  }, [profileToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
        name,
        niche,
        city,
        tone_of_voice: tone,
        account_id: user.id
    };

    let error;

    if (profileToEdit) {
        const { error: err } = await supabase.from('profiles').update(payload).eq('id', profileToEdit.id);
        error = err;
    } else {
        const { error: err } = await supabase.from('profiles').insert([payload]);
        error = err;
    }

    setLoading(false);

    if (error) {
        alert('Erro ao salvar: ' + error.message);
    } else {
        onSuccess(); // Isso força o Lobby a recarregar os dados do banco
        onClose();
    }
  };

  const handleDelete = async () => {
    if (!profileToEdit) return;
    const confirm1 = window.confirm(`Tem certeza que deseja excluir o perfil "${name}"?`);
    if (!confirm1) return;
    
    setDeleting(true);
    const { error } = await supabase.from('profiles').delete().eq('id', profileToEdit.id);
    setDeleting(false);

    if (error) {
        alert("Erro ao excluir: " + error.message);
    } else {
        if (localStorage.getItem('active_profile_id') === profileToEdit.id) {
            localStorage.removeItem('active_profile_id');
        }
        onSuccess();
        onClose();
    }
  };

  // Lógica de Texto do Slider
  const getToneLabel = () => {
      if (tone <= 40) return { text: "Mentor Estrategista", icon: <Brain size={14}/>, color: "text-cyan-400", desc: "Verdades duras, pausas dramáticas e autoridade." };
      if (tone >= 70) return { text: "Marketeiro Enérgico", icon: <Zap size={14}/>, color: "text-orange-500", desc: "Alta energia, urgência, hype e foco em vendas." };
      return { text: "Profissional Equilibrado", icon: <Handshake size={14}/>, color: "text-[#ffd000]", desc: "Tom seguro, confiante e acolhedor." };
  };
  
  const toneInfo = getToneLabel();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121212] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center sticky top-0 backdrop-blur-md z-10">
            <h2 className="text-xl font-bold text-white">
                {profileToEdit ? "Editar Perfil" : "Novo Negócio"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            <div className="space-y-1">
                <label className="text-xs text-gray-500 font-bold uppercase flex items-center gap-1.5"><User size={12}/> Nome do Negócio</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ffd000] outline-none" placeholder="Ex: Barbearia Viking" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-bold uppercase flex items-center gap-1.5"><Tag size={12}/> Nicho</label>
                    <input required value={niche} onChange={e => setNiche(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ffd000] outline-none" placeholder="Ex: Beleza" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-bold uppercase flex items-center gap-1.5"><MapPin size={12}/> Cidade</label>
                    <input required value={city} onChange={e => setCity(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ffd000] outline-none" placeholder="Ex: São Paulo" />
                </div>
            </div>

            {/* SLIDER DE TOM DE VOZ */}
            <div className="space-y-4 pt-2 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-center">
                    <label className="text-xs text-gray-400 font-bold uppercase flex items-center gap-1.5"><Sparkles size={12}/> Personalidade da IA</label>
                    <span className={`text-xs font-bold flex items-center gap-1.5 transition-colors duration-300 ${toneInfo.color}`}>
                        {toneInfo.icon}
                        {toneInfo.text}
                    </span>
                </div>
                
                <div className="relative h-6 flex items-center">
                    <input 
                        type="range" 
                        min="0" max="100" 
                        value={tone} 
                        onChange={e => setTone(Number(e.target.value))}
                        className="
                            w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer 
                            accent-[#ffd000] z-20 relative
                        "
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 left-[20%] w-0.5 h-3 bg-gray-600 rounded-full z-10"></div>
                    <div className="absolute top-1/2 -translate-y-1/2 left-[70%] w-0.5 h-3 bg-gray-600 rounded-full z-10"></div>
                </div>
                
                <div className="flex justify-between text-[9px] text-gray-500 uppercase font-bold tracking-widest px-1">
                    <span>Sério</span>
                    <span>Hype</span>
                </div>

                <p className="text-[10px] text-gray-400 italic text-center leading-relaxed h-8 flex items-center justify-center bg-black/20 rounded-lg px-2">
                    "{toneInfo.desc}"
                </p>
            </div>

            <div className="pt-4 flex flex-col gap-3">
                <button type="submit" disabled={loading || deleting} className="w-full bg-[#ffd000] h-12 rounded-xl text-black font-bold flex items-center justify-center gap-2 hover:bg-[#ffdb4d] transition active:scale-95 disabled:opacity-50 shadow-[0_0_15px_rgba(255,208,0,0.2)]">
                    {loading ? <Loader2 className="animate-spin"/> : <Save size={18}/>}
                    {profileToEdit ? "SALVAR ALTERAÇÕES" : "CRIAR PERFIL"}
                </button>

                {profileToEdit && (
                    <button 
                        type="button"
                        onClick={handleDelete}
                        disabled={loading || deleting}
                        className="w-full bg-red-500/10 border border-red-500/20 h-12 rounded-xl text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition active:scale-95 disabled:opacity-50"
                    >
                        {deleting ? <Loader2 className="animate-spin" size={18}/> : <Trash2 size={18}/>}
                        EXCLUIR ESTE PERFIL
                    </button>
                )}
            </div>
        </form>
      </div>
    </div>
  );
}