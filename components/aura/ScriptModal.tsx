"use client";

import React, { useState } from 'react';
import { 
  X, Copy, Check, Calendar, Save, Edit3, Magnet, Globe, Eye, Zap, 
  Loader2, Sparkles, CheckCircle2, CircleDashed, Trophy 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ScriptModalProps {
  script: any;
  onClose: () => void;
  onUpdate?: (updatedScript: any) => void;
  onRemix?: (blockKey: string) => Promise<any>;
}

export default function ScriptModal({ script, onClose, onUpdate, onRemix }: ScriptModalProps) {
  const supabase = createClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingBlock, setLoadingBlock] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState(script.fullContent || script.content);
  const [status, setStatus] = useState(script.status); 
  const [isViral, setIsViral] = useState(script.isViral || false); // Recebe do pai
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleChange = (blockKey: string, field: 'audio' | 'visual', value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [blockKey]: { ...prev[blockKey], [field]: value }
    }));
  };

  const handleBlockRemix = async (blockKey: string) => {
    if (!onRemix) return;
    setLoadingBlock(blockKey);
    try {
        const newContent = await onRemix(blockKey);
        setFormData((prev: any) => ({
            ...prev,
            [blockKey]: newContent
        }));
    } catch (error) {
        console.error(error);
    } finally {
        setLoadingBlock(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('scripts').update({ content: formData }).eq('id', script.id);
    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      setIsEditing(false);
      if (onUpdate) onUpdate({ ...script, content: formData, status, isViral: isViral });
    }
    setIsSaving(false);
  };

  const handleToggleStatus = async () => {
    setUpdatingStatus(true);
    const newStatus = status === 'draft' ? 'ready' : 'draft';
    const { error } = await supabase.from('scripts').update({ status: newStatus }).eq('id', script.id);
    if (!error) {
        setStatus(newStatus);
        if (onUpdate) onUpdate({ ...script, content: formData, status: newStatus, isViral: isViral });
    }
    setUpdatingStatus(false);
  };

  // --- ALTERNAR STATUS DE CAMPEÃO ---
  const handleToggleViral = async () => {
    const newVal = !isViral;
    setIsViral(newVal); 
    
    const { error } = await supabase
        .from('scripts')
        .update({ is_viral: newVal })
        .eq('id', script.id);

    if (error) {
        setIsViral(!newVal);
        alert("Erro ao atualizar.");
    } else {
        if (onUpdate) onUpdate({ ...script, content: formData, status, isViral: newVal });
    }
  };

  const handleCopy = () => {
    const content = formData;
    const text = 
`🎬 *ROTEIRO AURA: ${script.profileName || "Meu Negócio"}*
🎯 *Gancho:* ${script.gancho || "AURA"}

*1️⃣ (A) ABERTURA*
🎥: ${content.a.visual}
🗣️: "${content.a.audio}"

*2️⃣ (U) UNIVERSO*
🎥: ${content.u.visual}
🗣️: "${content.u.audio}"

*3️⃣ (R) RETENÇÃO*
🎥: ${content.r.visual}
🗣️: "${content.r.audio}"

*4️⃣ (A) AÇÃO*
🎥: ${content.a_final.visual}
🗣️: "${content.a_final.audio}"

_Gerado por AURA AI_ 🚀`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleBackdropClick}>
      
      <div className={`bg-[#121212] w-full max-w-2xl max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200 transition-all ${isViral ? 'border-[#ffd000] shadow-[#ffd000]/20' : 'border-white/10'}`}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 rounded-t-3xl shrink-0">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-3 mb-2">
                <button 
                    onClick={handleToggleStatus}
                    disabled={updatingStatus}
                    className={`
                        flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide transition-all
                        ${status === 'ready' 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20'
                        }
                    `}
                >
                    {updatingStatus ? <Loader2 size={10} className="animate-spin"/> : (
                        status === 'ready' ? <CheckCircle2 size={12} /> : <CircleDashed size={12} />
                    )}
                    {status === 'ready' ? 'PRONTO' : 'RASCUNHO'}
                </button>
                
                <span className="text-gray-500 text-[10px] flex items-center gap-1">
                    <Calendar size={10} /> {script.date}
                </span>

                {isViral && (
                    <span className="flex items-center gap-1 text-[#ffd000] text-[10px] font-black uppercase tracking-widest animate-pulse">
                        <Trophy size={10} fill="#ffd000"/> CAMPEÃO
                    </span>
                )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight line-clamp-1">{script.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"><X size={20} /></button>
        </div>

        {/* CONTEÚDO */}
        <div className="overflow-y-auto p-6 space-y-6 hide-scrollbar flex-1">
          {/* BARRA DE CLASSIFICAÇÃO (Aparece se estiver salvo) */}
          {!isEditing && status === 'ready' && (
             <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isViral ? 'bg-[#ffd000]/10 border-[#ffd000]/30' : 'bg-white/5 border-white/5'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isViral ? 'bg-[#ffd000] text-black' : 'bg-gray-800 text-gray-400'}`}>
                        <Trophy size={16} fill={isViral ? "black" : "none"} />
                    </div>
                    <div>
                        <p className={`text-xs font-bold ${isViral ? 'text-[#ffd000]' : 'text-white'}`}>
                            {isViral ? "Roteiro Campeão!" : "Performance do Roteiro"}
                        </p>
                        <p className="text-[10px] text-gray-500">
                            {isViral ? "Esse roteiro é uma referência de sucesso." : "Esse vídeo trouxe resultados reais?"}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={handleToggleViral}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${isViral ? 'bg-[#ffd000] text-black hover:bg-[#ffdb4d]' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'}`}
                >
                    {isViral ? "Desmarcar" : "Marcar Campeão"}
                </button>
             </div>
          )}

          {formData && (
            <>
              <Block letter="A" title="Abertura Magnética" icon={<Magnet size={16}/>} blockKey="a" data={formData.a} color="text-cyan-400" isEditing={isEditing} onChange={handleChange} onRemix={handleBlockRemix} isLoading={loadingBlock === 'a'} />
              <Block letter="U" title="Universo" icon={<Globe size={16}/>} blockKey="u" data={formData.u} color="text-fuchsia-500" isEditing={isEditing} onChange={handleChange} onRemix={handleBlockRemix} isLoading={loadingBlock === 'u'} />
              <Block letter="R" title="Retenção" icon={<Eye size={16}/>} blockKey="r" data={formData.r} color="text-fuchsia-500" isEditing={isEditing} onChange={handleChange} onRemix={handleBlockRemix} isLoading={loadingBlock === 'r'} />
              <Block letter="A" title="Ação Inevitável" icon={<Zap size={16}/>} blockKey="a_final" data={formData.a_final} color="text-cyan-400" isEditing={isEditing} onChange={handleChange} onRemix={handleBlockRemix} isLoading={loadingBlock === 'a_final'} />
            </>
          )}
        </div>

        {/* FOOTER (Sem Teleprompter) */}
        <div className="p-6 border-t border-white/5 bg-[#121212] rounded-b-3xl shrink-0 flex flex-col gap-3">
          <div className="flex gap-3">
            {isEditing ? (
                <button onClick={handleSave} disabled={isSaving} className="flex-1 h-12 rounded-xl bg-green-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />} <span>SALVAR ALTERAÇÕES</span>
                </button>
            ) : (
                <>
                    <button onClick={() => setIsEditing(true)} className="w-14 h-12 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition"><Edit3 size={20} /></button>
                    <button onClick={handleCopy} className={`flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${copied ? 'bg-green-500 text-white' : 'bg-[#ffd000] text-black hover:bg-[#ffdb4d] shadow-[0_0_15px_rgba(255,208,0,0.2)]'}`}>
                        {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? "COPIADO" : "COPIAR ROTEIRO"}
                    </button>
                </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

const Block = ({ letter, title, icon, data, color, blockKey, isEditing, onChange, onRemix, isLoading }: any) => {
    if (!data) return null;
    return (
      <div className="flex gap-4">
        <div className={`w-8 h-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center font-black text-sm ${color} border border-white/5`}>{letter}</div>
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wide ${color}`}>{title}</span>
                {icon && <span className={`${color} opacity-50`}>{React.cloneElement(icon, { size: 12 })}</span>}
             </div>
             {isEditing && (
                <button onClick={() => onRemix(blockKey)} disabled={isLoading} className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition border ${isLoading ? 'bg-white/5 text-gray-500 border-transparent' : 'bg-[#ffd000]/10 text-[#ffd000] border-[#ffd000]/20 hover:bg-[#ffd000]/20'}`}>
                    {isLoading ? <Loader2 size={10} className="animate-spin"/> : <Sparkles size={10} />}
                    {isLoading ? "CRIANDO..." : "REMIXAR COM IA"}
                </button>
             )}
          </div>
          <div className={`rounded-xl p-3 border ${isEditing ? 'border-[#ffd000]/50 bg-[#ffd000]/5' : 'border-white/5 bg-black/40'} space-y-3 transition-colors`}>
            <div>
              <span className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Visual</span>
              {isEditing ? <textarea value={data.visual} onChange={(e) => onChange(blockKey, 'visual', e.target.value)} className="w-full bg-black/50 text-white text-sm p-2 rounded-lg outline-none border border-white/10 focus:border-[#ffd000] min-h-[60px]" /> : <p className="text-gray-400 text-sm italic leading-relaxed">{data.visual}</p>}
            </div>
            <div>
              <span className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Áudio</span>
              {isEditing ? <textarea value={data.audio} onChange={(e) => onChange(blockKey, 'audio', e.target.value)} className="w-full bg-black/50 text-white text-sm p-2 rounded-lg outline-none border border-white/10 focus:border-[#ffd000] min-h-[80px]" /> : <p className="text-white text-sm font-medium leading-relaxed">"{data.audio}"</p>}
            </div>
          </div>
        </div>
      </div>
    );
};