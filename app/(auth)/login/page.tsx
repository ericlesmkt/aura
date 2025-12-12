"use client";
import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, LogIn, Eye, EyeOff, Check } from 'lucide-react';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Novos Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      // O Supabase já persiste a sessão por padrão, 
      // mas podemos controlar explicitamente se necessário no futuro.
    });

    if (error) {
      setError("Email ou senha incorretos.");
      setLoading(false);
    } else {
      router.refresh();
      router.push('/lobby');
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Bem-vindo de volta</h1>
        <p className="text-gray-500 text-sm">Acesse sua central de roteiros AURA.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {/* Input Email */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">E-mail</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-white focus:border-[#ffd000] outline-none transition-colors placeholder-gray-700"
            placeholder="seu@email.com"
          />
        </div>

        {/* Input Senha com Olhinho */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Senha</label>
            <Link href="#" className="text-[10px] text-gray-500 hover:text-[#ffd000] transition-colors">
              Esqueceu?
            </Link>
          </div>
          
          <div className="relative group">
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-white focus:border-[#ffd000] outline-none transition-colors pr-12 placeholder-gray-700"
              placeholder="••••••••"
            />
            <button
              type="button" // Importante para não submeter o form
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Checkbox Customizado "Manter Conectado" */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
            rememberMe 
              ? 'bg-[#ffd000] border-[#ffd000]' 
              : 'bg-transparent border-white/20 hover:border-white/40'
          }`}>
            {rememberMe && <Check size={14} className="text-black stroke-[3]" />}
          </div>
          <span className="text-xs text-gray-400 select-none">Manter conectado</span>
        </div>

        {/* Botão de Ação com Destaque */}
        <button 
          disabled={loading}
          className="w-full h-12 bg-[#ffd000] hover:bg-[#ffdb4d] text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(255,208,0,0.3)] hover:shadow-[0_0_30px_rgba(255,208,0,0.5)] mt-4"
        >
          {loading ? <Loader2 className="animate-spin" /> : <>Entrar <LogIn size={18} className="stroke-[2.5]"/></>}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-gray-500">
        Não tem conta?{' '}
        <Link href="/signup" className="text-[#ffd000] hover:underline font-bold tracking-wide">
          CRIAR CONTA GRÁTIS
        </Link>
      </div>
    </div>
  );
}