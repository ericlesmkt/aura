import React from 'react';
import { Clock, PlayCircle, Video, CheckCircle2, CircleDashed, Trophy } from 'lucide-react';

interface LibraryCardProps {
  script: {
    status: string;
    gancho: string;
    title: string;
    scene: string;
    date: string;
    isViral?: boolean; // Nova prop
  };
}

export default function LibraryCard({ script }: LibraryCardProps) {
  const isDraft = script.status === 'draft';
  const isViral = script.isViral;

  return (
    <div className={`
        bg-[#121212] rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden group
        ${isViral 
            ? 'border-[#ffd000] shadow-[0_0_15px_rgba(255,208,0,0.1)]' // Destaque Dourado
            : 'border-white/5 hover:border-white/10'
        }
    `}>
      {/* Indicador de Status + Viral */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
            <div className={`
                flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide border
                ${isDraft 
                    ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' 
                    : 'bg-green-500/10 text-green-500 border-green-500/20'}
            `}>
                {isDraft ? <CircleDashed size={10} /> : <CheckCircle2 size={10} />}
                {isDraft ? 'Rascunho' : 'Pronto'}
            </div>

            {/* SELO DE CAMPEÃO */}
            {isViral && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide bg-[#ffd000] text-black border border-[#ffd000]">
                    <Trophy size={10} fill="black" /> Campeão
                </div>
            )}
        </div>
        <span className="text-[10px] text-gray-500 font-medium">{script.date}</span>
      </div>

      {/* Conteúdo */}
      <div className="space-y-2">
        <h3 className={`text-sm font-bold leading-tight line-clamp-2 ${isViral ? 'text-[#ffd000]' : 'text-white'}`}>
            {script.title}
        </h3>
        
        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
            <span className="text-gray-600 font-bold uppercase text-[9px] mr-1">Cena:</span>
            {script.scene}
        </p>
      </div>

      {/* Footer do Card */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] text-gray-400 font-medium border border-white/5 uppercase">
                {script.gancho}
            </span>
        </div>
        <PlayCircle size={16} className={`text-gray-600 transition-colors ${isViral ? 'group-hover:text-[#ffd000]' : 'group-hover:text-white'}`} />
      </div>
      
      {/* Brilho Dourado no Fundo (Apenas Campeões) */}
      {isViral && (
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#ffd000]/10 blur-2xl pointer-events-none"></div>
      )}
    </div>
  );
}