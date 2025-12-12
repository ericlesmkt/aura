import React from "react";
import Sidebar from "@/components/layout/Sidebar";
// AQUI ESTAVA O ERRO: Agora aponta para a pasta correta 'layout'
import MobileMenu from "@/components/layout/MobileMenu"; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-screen bg-[#050505] text-white flex overflow-hidden">
      
      {/* 1. SIDEBAR (Desktop: Visível | Mobile: Oculto) */}
      <Sidebar />

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 h-full relative flex flex-col items-center justify-center bg-grid-pattern">
        
        {/* Simulador de App Mobile no Desktop */}
        <div className="w-full h-full bg-black relative flex flex-col shadow-2xl overflow-hidden
          md:max-w-[400px] 
          md:h-[calc(100vh-2rem)] 
          md:my-4 
          md:rounded-[2.5rem] 
          md:border md:border-white/10 
        ">
            {/* O conteúdo da página entra aqui com scroll próprio */}
            {children}
        </div>

      </main>
      
      {/* 3. MOBILE MENU (Desktop: Oculto | Mobile: Visível) */}
      <MobileMenu />

    </div>
  );
}