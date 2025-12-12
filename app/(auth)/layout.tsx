export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorativo (AURA Glow) */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#ffd000]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#ffd000]/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Container Central */}
      <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl shadow-2xl relative z-10 overflow-hidden">
        {/* Faixa Dourada Superior */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#ffd000] to-transparent opacity-50"></div>
        
        {children}
      </div>
    </div>
  );
}