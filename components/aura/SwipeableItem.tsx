"use client";

import React, { useState } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Trash2, RotateCcw } from 'lucide-react';

interface SwipeableItemProps {
  children: React.ReactNode;
  
  /** Ação ao arrastar para a ESQUERDA (Padrão: Arquivar/Deletar) */
  onSwipeLeft: () => Promise<boolean>; 
  labelLeft?: string;
  
  /** Ação ao arrastar para a DIREITA (Opcional: Restaurar) */
  onSwipeRight?: () => Promise<boolean>;
  labelRight?: string;
  
  bgClass?: string; // Para customizar a cor do fundo vermelho (Opcional)
}

export default function SwipeableItem({ 
  children, 
  onSwipeLeft, 
  labelLeft = "Arquivar", 
  onSwipeRight,
  labelRight = "Restaurar",
  bgClass = "bg-red-500/20 border-red-500/20 text-red-500"
}: SwipeableItemProps) {
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = async (event: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100; // Distância mínima para ativar a ação
    
    // 1. ARRASTOU PARA ESQUERDA (Deletar/Arquivar)
    if (info.offset.x < -threshold) {
      const success = await onSwipeLeft();
      
      if (!success) {
        // Se cancelou (retornou false), volta para o centro
        controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 25 } });
      } 
      // Se deu sucesso (true), NÃO FAZEMOS NADA. 
      // O componente pai vai remover este item da lista e ele vai desmontar sozinho.
      // Tentar animar aqui causaria o erro "component has unmounted".
    } 
    
    // 2. ARRASTOU PARA DIREITA (Restaurar) - Só se a função existir
    else if (onSwipeRight && info.offset.x > threshold) {
      const success = await onSwipeRight();
      
      if (!success) {
        controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 25 } });
      }
      // Mesmo motivo: se restaurou, ele sai da lista de arquivados, então não animamos.
    } 
    
    // 3. NÃO ARRASTOU O SUFICIENTE
    else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 25 } });
    }
  };

  return (
    <div className="relative w-full mb-3 touch-pan-y group select-none">
      
      {/* FUNDO VERDE (Restaurar) - Fica "embaixo" na esquerda */}
      {onSwipeRight && (
        <div className="absolute inset-0 bg-green-500/20 rounded-2xl flex items-center justify-start pl-6 border border-green-500/20 z-0">
            <div className="flex items-center gap-2 text-green-500 font-bold text-xs uppercase animate-pulse">
                <RotateCcw size={20} />
                <span>{labelRight}</span>
            </div>
        </div>
      )}

      {/* FUNDO VERMELHO (Arquivar) - Fica "embaixo" na direita */}
      <div className={`absolute inset-0 rounded-2xl flex items-center justify-end pr-6 border z-0 ${bgClass}`}>
        <div className="flex items-center gap-2 font-bold text-xs uppercase animate-pulse">
            <span>{labelLeft}</span>
            <Trash2 size={20} />
        </div>
      </div>

      {/* CARD DESLIZANTE (Fica por cima) */}
      <motion.div
        drag="x"
        // Constraints em 0 cria o efeito de "elástico" (sempre tenta voltar)
        dragConstraints={{ left: 0, right: 0 }} 
        // Se não tiver ação na direita, o elástico é "duro" (0.05), impedindo o arrasto
        dragElastic={{ left: 0.5, right: onSwipeRight ? 0.5 : 0.05 }} 
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={controls}
        whileTap={{ cursor: "grabbing" }}
        className="relative bg-[#121212] rounded-2xl cursor-grab active:cursor-grabbing shadow-xl z-10"
        style={{ touchAction: "pan-y" }}
      >
        {/* Desabilita cliques internos enquanto arrasta */}
        <div className={isDragging ? 'pointer-events-none' : ''}>
           {children}
        </div>
      </motion.div>
    </div>
  );
}