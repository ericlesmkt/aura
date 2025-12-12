"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Clock, AlignLeft, 
  Wand2, Copy, Check, Loader2, Quote, CheckCircle, RefreshCw, Zap, Save, Bell
} from 'lucide-react';
import FeedSkeleton from '@/components/aura/skeletons/FeedSkeleton';
import { useToast } from '@/context/ToastContext';

// Frases de Loading
const LOADING_STEPS = [
  "Consultando o Oráculo...",
  "Analisando padrões virais...",
  "Aplicando Neuromarketing...",
  "Calibrando a agressividade...",
  "Misturando desejo e lógica...",
  "Polindo os ganchos mentais...",
  "Finalizando a estratégia..."
];

export default function FeedPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { addToast } = useToast();

  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [offer, setOffer] = useState('');
  const [mandatoryPhrase, setMandatoryPhrase] = useState('');
  const [duration, setDuration] = useState('30s');
  
  const [loading, setLoading] = useState(false);
  const [remixingBlock, setRemixingBlock] = useState<string | null>(null);
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);

  // Estado do Dropdown de Notificações
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const profileId = localStorage.getItem('active_profile_id');
      if (!profileId) { router.push('/lobby'); return; }
      
      const { data } = await supabase.from('profiles').select('*').eq('id', profileId).single();
      if (data) setActiveProfile(data);
      setIsProfileLoading(false);
    };
    loadProfile();
  }, [supabase, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingIndex(0);
      interval = setInterval(() => {
        setLoadingIndex((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!offer.trim()) {
        addToast("Por favor, descreva a oferta ou tópico do vídeo.", "info");
        return;
    }
    setLoading(true);
    setGeneratedScript(null);
    setHasChanges(false);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: activeProfile.id, offer, mandatoryPhrase, duration })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setGeneratedScript(data);
      addToast("Roteiro gerado com sucesso!", "success");

    } catch (error: any) {
      addToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemixBlock = async (blockKey: string) => {
    if (!generatedScript) return;
    setRemixingBlock(blockKey);

    try {
        const res = await fetch('/api/remix', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                profileId: activeProfile.id, 
                blockKey,
                context: offer 
            })
        });
        
        const newContent = await res.json();
        if (newContent.error) throw new Error(newContent.error);

        setGeneratedScript((prev: any) => ({
            ...prev,
            content: {
                ...prev.content,
                [blockKey]: newContent
            }
        }));
        
        setHasChanges(true);
        addToast("Bloco atualizado com IA!", "success");

    } catch (error: any) {
        addToast("Erro ao remixar: " + error.message, "error");
    } finally {
        setRemixingBlock(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!generatedScript) return;
    setIsSavingChanges(true);

    try {
        const { error } = await supabase
            .from('scripts')
            .update({ content: generatedScript.content })
            .eq('id', generatedScript.id);

        if (error) throw error;
        
        setHasChanges(false);
        addToast("Alterações salvas no banco de dados.", "success");

    } catch (error: any) {
        addToast("Erro ao salvar: " + error.message, "error");
    } finally {
        setIsSavingChanges(false);
    }
  };

  const handleCopy = () => {
    if (!generatedScript) return;
    const content = generatedScript.content;
    const profileName = activeProfile?.name || "Meu Negócio";
    const gancho = generatedScript.gancho_type || "AURA";

    const text = 
`🎬 *ROTEIRO AURA: ${profileName}*
🎯 *Gancho:* ${gancho}

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
    addToast("Roteiro copiado para a área de transferência!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isProfileLoading) return <FeedSkeleton />;

  return (
    <div className="relative h-full w-full p-5 flex flex-col gap-6 animate-in fade-in duration-500 overflow-y-auto pb-32 hide-scrollbar">
      
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#ffd000]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* HEADER - CORREÇÃO AQUI: z-50 para ficar acima do resto */}
      <div className="relative z-50 shrink-0 flex justify-between items-start">
         <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Co-Criação <Sparkles className="text-[#ffd000] fill-[#ffd000]" size={20} />
            </h1>
            <p className="text-gray-400 text-xs mt-1">
            Estratégia para: <strong className="text-white">{activeProfile?.name || '...'}</strong>
            </p>
         </div>

         {/* ÁREA DE NOTIFICAÇÃO (SININHO) */}
         <div className="relative">
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#ffd000]/50 transition-all relative"
            >
                <Bell size={18} />
                {/* Indicador de não lido */}
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#ffd000] rounded-full"></span>
            </button>

            {/* DROPDOWN */}
            {showNotifications && (
                <>
                    {/* Backdrop invisível para fechar ao clicar fora */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                    
                    <div className="absolute right-0 top-12 w-72 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl p-4 animate-in zoom-in-95 z-50">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Notificações</h3>
                            <button className="text-[9px] text-[#ffd000] hover:underline">Limpar</button>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex gap-3 items-start border-b border-white/5 pb-2">
                                <div className="w-8 h-8 rounded-full bg-[#ffd000]/10 flex items-center justify-center text-[#ffd000] shrink-0">
                                    <Zap size={14} fill="#ffd000" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-200 leading-tight">Créditos renovados! Crie novos roteiros agora.</p>
                                    <span className="text-[9px] text-gray-600">Há 2 horas</span>
                                </div>
                            </div>

                            <div className="flex gap-3 items-start">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                    <Sparkles size={14} />
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-200 leading-tight">Dica: Vídeos sensoriais retém 30% mais atenção.</p>
                                    <span className="text-[9px] text-gray-600">Ontem</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
         </div>
      </div>

      {/* FORMULÁRIO */}
      <div className="bg-[#121212]/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-xl space-y-5 relative z-10 shrink-0">
          
          <div className="space-y-2 group">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2 group-focus-within:text-[#ffd000] transition-colors">
                  <AlignLeft size={12} /> Qual é a Oferta ou Tópico?
              </label>
              <textarea 
                  value={offer}
                  onChange={e => setOffer(e.target.value)}
                  placeholder="Ex: Promoção de Limpeza de Pele com 20% off..."
                  className="w-full h-24 bg-black/50 border border-white/10 rounded-2xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ffd000]/50 focus:shadow-[0_0_20px_rgba(255,208,0,0.1)] transition-all resize-none text-sm leading-relaxed"
              />
          </div>

          <div className="space-y-2 group">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2 group-focus-within:text-[#ffd000] transition-colors">
                  <Quote size={12} /> Frase Obrigatória
              </label>
              <input 
                  value={mandatoryPhrase}
                  onChange={e => setMandatoryPhrase(e.target.value)}
                  placeholder="Ex: Link na Bio"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ffd000]/50 transition-all text-sm"
              />
          </div>

          <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
                  <Clock size={12} /> Tempo de Vídeo
              </label>
              <div className="grid grid-cols-4 gap-2">
                  {['30s', '45s', '60s', '90s'].map((t) => (
                      <button
                          key={t}
                          onClick={() => setDuration(t)}
                          className={`py-2 rounded-xl text-[10px] font-bold transition-all border ${
                              duration === t 
                              ? 'bg-[#ffd000] text-black border-[#ffd000] shadow-[0_0_10px_rgba(255,208,0,0.2)]' 
                              : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                          }`}
                      >
                          {t}
                      </button>
                  ))}
              </div>
          </div>

          <button
              onClick={handleGenerate}
              disabled={loading || !offer}
              className="
                group w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                bg-[#ffd000] text-black shadow-[0_0_15px_rgba(255,208,0,0.1)]
                hover:bg-[#ffdb4d] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(255,208,0,0.4)]
                active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed
              "
          >
              {loading ? <Loader2 className="animate-spin text-black" size={16} /> : <Wand2 className="fill-black text-black" size={16} />}
              {loading ? "CRIANDO AURA..." : "GERAR ROTEIRO"}
          </button>
      </div>

      {/* ÁREA DE RESULTADO */}
      <div className="flex-1 relative z-10 min-h-[200px]">
        
        {loading ? (
            <div className="flex flex-col items-center justify-center pt-8 text-center space-y-4 animate-pulse">
                <div className="w-14 h-14 rounded-full bg-[#ffd000]/10 flex items-center justify-center border border-[#ffd000]/20 shadow-[0_0_15px_rgba(255,208,0,0.2)]">
                    <Sparkles className="text-[#ffd000] animate-spin-slow" size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white transition-all duration-500 fade-in">
                        {LOADING_STEPS[loadingIndex]}
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-1">Aguarde a construção do roteiro...</p>
                </div>
            </div>
        ) : generatedScript ? (
            <div className="bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500 mb-6">
                
                {/* HEADER DO CARD */}
                <div className="bg-white/5 p-4 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#ffd000]/10 text-[#ffd000] text-[9px] font-bold border border-[#ffd000]/20 uppercase">
                            {generatedScript.gancho_type || "AURA"}
                        </span>
                        
                        {hasChanges ? (
                            <button 
                                onClick={handleSaveChanges}
                                disabled={isSavingChanges}
                                className="flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-500 text-black text-[9px] font-bold border border-yellow-600 uppercase hover:bg-yellow-400 transition-all shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                            >
                                {isSavingChanges ? <Loader2 size={10} className="animate-spin"/> : <Save size={10} />}
                                {isSavingChanges ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[9px] font-bold border border-green-500/20 uppercase animate-in fade-in">
                                <CheckCircle size={10} /> Salvo
                            </span>
                        )}
                    </div>
                    
                    <button onClick={handleCopy} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${copied ? 'bg-green-500 text-white border-green-500' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'}`}>
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? "COPIADO!" : "COPIAR TUDO"}
                    </button>
                </div>

                {/* BLOCOS DO ROTEIRO */}
                <div className="p-4 space-y-4">
                    <ScriptBlock 
                        letter="A" title="Abertura" content={generatedScript.content.a} color="text-cyan-400" 
                        onRemix={() => handleRemixBlock('a')} isRemixing={remixingBlock === 'a'}
                    />
                    <ScriptBlock 
                        letter="U" title="Universo" content={generatedScript.content.u} color="text-fuchsia-500" 
                        onRemix={() => handleRemixBlock('u')} isRemixing={remixingBlock === 'u'}
                    />
                    <ScriptBlock 
                        letter="R" title="Retenção" content={generatedScript.content.r} color="text-fuchsia-500" 
                        onRemix={() => handleRemixBlock('r')} isRemixing={remixingBlock === 'r'}
                    />
                    <ScriptBlock 
                        letter="A" title="Ação" content={generatedScript.content.a_final} color="text-cyan-400" 
                        onRemix={() => handleRemixBlock('a_final')} isRemixing={remixingBlock === 'a_final'}
                    />
                </div>

                <div className="p-3 bg-black/40 border-t border-white/5 text-center">
                    <p className="text-[10px] text-gray-500">
                        {hasChanges 
                            ? "Você tem alterações pendentes. Salve para garantir." 
                            : <span>O roteiro foi salvo automaticamente no <button onClick={() => router.push('/library')} className="text-[#ffd000] hover:underline">Acervo</button>.</span>
                        }
                    </p>
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-8 opacity-50">
                <Zap className="text-gray-600 mb-3" size={24} />
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                    Aguardando Briefing
                </p>
            </div>
        )}
      </div>
    </div>
  );
}

// Subcomponente de Bloco
const ScriptBlock = ({ letter, title, content, color, onRemix, isRemixing }: any) => (
    <div className="flex gap-3 group">
        <div className={`w-6 h-6 shrink-0 rounded-md bg-white/5 flex items-center justify-center font-black text-xs ${color} border border-white/5 group-hover:border-${color.split('-')[1]}-500/50 transition-colors`}>
            {letter}
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex justify-between items-center">
                <h4 className={`text-[10px] font-bold uppercase tracking-wide ${color}`}>{title}</h4>
                <button 
                    onClick={onRemix}
                    disabled={isRemixing}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-white/5 bg-white/5 hover:bg-[#ffd000]/10 hover:border-[#ffd000]/30 transition-all disabled:opacity-50 group/remix"
                >
                    {isRemixing ? <RefreshCw size={10} className="animate-spin text-[#ffd000]" /> : <Wand2 size={10} className="text-gray-400 group-hover/remix:text-[#ffd000]" />}
                    <span className="text-[9px] font-bold text-gray-400 group-hover/remix:text-[#ffd000]">{isRemixing ? "Recriando..." : "Remixar"}</span>
                </button>
            </div>
            <div className={`bg-black/30 rounded-xl p-3 border space-y-2 transition-all ${isRemixing ? 'border-[#ffd000]/50 shadow-[0_0_10px_rgba(255,208,0,0.1)]' : 'border-white/5 group-hover:border-white/10'}`}>
                <div>
                    <span className="text-[8px] text-gray-600 uppercase font-bold mb-0.5 block">Visual</span>
                    <p className="text-gray-400 text-xs italic leading-snug">{content.visual}</p>
                </div>
                <div>
                    <span className="text-[8px] text-gray-600 uppercase font-bold mb-0.5 block">Áudio</span>
                    <p className="text-white text-xs font-medium leading-relaxed">"{content.audio}"</p>
                </div>
            </div>
        </div>
    </div>
);