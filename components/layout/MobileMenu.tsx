"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Library, Sparkles, Settings } from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Co-Criação', icon: Sparkles, path: '/feed' },
  { name: 'Roteiros', icon: Library, path: '/library' },
  { name: 'Lobby', icon: LayoutGrid, path: '/lobby' },
  { name: 'Config', icon: Settings, path: '/settings' },
];

export default function MobileMenu() {
  const pathname = usePathname();

  return (
    // AJUSTE IPHONE: 
    // 1. h-20 (80px): Aumentamos a altura total
    // 2. pb-6: Empurramos o conteúdo pra cima (foge da barra do iPhone)
    // 3. pt-2: Centraliza visualmente o ícone no espaço que sobrou
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0a0a0a] border-t border-white/10 z-50 flex items-center justify-around px-2 pb-6 pt-2 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      {MENU_ITEMS.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link 
            key={item.path} 
            href={item.path}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors active:scale-95 ${
              isActive ? 'text-[#ffd000]' : 'text-gray-500 hover:text-white'
            }`}
          >
            <item.icon size={20} className={isActive ? 'fill-[#ffd000]/20' : ''} />
            <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}