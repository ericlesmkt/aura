"use client";
import React from 'react';
import { Video, RefreshCw } from 'lucide-react';
import { ScriptBlock as ScriptBlockType } from '@/types'; // Importe os tipos que criamos antes

interface ScriptBlockProps {
  label: string;
  icon: React.ReactNode;
  data: ScriptBlockType;
  blockKey: string;
  loadingBlock: string | null;
  onRegenerate: (key: string) => void;
  colorClass?: string; // Para cores específicas (Ciano/Magenta) se quiser manter
}

export default function ScriptBlock({ 
  label, icon, data, blockKey, loadingBlock, onRegenerate, colorClass = "text-aura-gold"
}: ScriptBlockProps) {
  
  const isLoading = loadingBlock === blockKey;

  return (
    <div className="relative pl-6 group">
      {/* Linha Lateral */}
      <div className={`absolute left-0 top-0 bottom-0 w-[2px] opacity-30 ${colorClass.replace('text-', 'bg-')}`}></div>
      <div className={`absolute left-[-5px] top-0 w-3 h-3 rounded-full border-2 border-aura-border bg-black z-10 ${colorClass.replace('text-', 'bg-')}`} />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Renderiza o ícone passado via props */}
          <div className={`${colorClass}`}>{icon}</div>
          <span className={`text-xs font-bold uppercase tracking-widest ${colorClass}`}>{label}</span>
        </div>
        
        {/* BOTÃO MÁGICO DE TROCAR (Regenerate) */}
        <button 
          onClick={() => onRegenerate(blockKey)}
          className={`p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition active:scale-90 border border-white/5 ${isLoading ? 'animate-spin text-aura-gold' : ''}`}
          title="Gerar nova opção para este trecho"
        >
          <RefreshCw size={12} />
        </button>
      </div>
      
      {/* Conteúdo com transição suave */}
      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
        <p className="text-gray-100 text-lg font-medium leading-relaxed mb-3">
          "{data.audio}"
        </p>
        
        <div className="flex gap-2 items-start bg-white/5 p-3 rounded-lg border border-white/5">
          <Video size={14} className="text-gray-500 mt-1 shrink-0" />
          <span className="text-gray-500 text-xs italic">{data.visual}</span>
        </div>
      </div>
    </div>
  );
}