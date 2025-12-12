"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RefreshCw, Grid, Settings } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const baseClass = "flex flex-col items-center gap-1 transition-all duration-300";
  const activeClass = "text-aura-gold scale-110";
  const inactiveClass = "text-gray-600 hover:text-gray-400";

  return (
    <nav className="h-20 bg-aura-black/90 backdrop-blur-xl border-t border-aura-border flex items-center justify-around px-6 pb-2">
      
      <Link href="/feed" className={`${baseClass} ${isActive('/feed') ? activeClass : inactiveClass}`}>
        <RefreshCw size={24} strokeWidth={isActive('/feed') ? 2.5 : 2} />
        <span className="text-[10px] font-bold tracking-widest">GERAR</span>
      </Link>

      <div className="w-[1px] h-8 bg-aura-border/50"></div>

      <Link href="/library" className={`${baseClass} ${isActive('/library') ? activeClass : inactiveClass}`}>
        <Grid size={24} strokeWidth={isActive('/library') ? 2.5 : 2} />
        <span className="text-[10px] font-bold tracking-widest">ACERVO</span>
      </Link>

      <div className="w-[1px] h-8 bg-aura-border/50"></div>
      
      <Link href="/profile" className={`${baseClass} ${isActive('/profile') ? activeClass : inactiveClass}`}>
        <Settings size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
        <span className="text-[10px] font-bold tracking-widest">PERFIL</span>
      </Link>

    </nav>
  );
}