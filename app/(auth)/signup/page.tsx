"use client";
import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight, Zap, Mail, CheckCircle } from 'lucide-react';

export default function SignUpPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false); // Novo estado para controlar a tela de sucesso

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Cria o usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Importante: A URL para onde ele volta após clicar no e-mail
        emailRedirectTo: `${location.origin}/auth/callback`, 
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Se deu certo e não tem sessão ativa, significa que precisa confirmar email
      if (data.user && !data.session) {
        setSuccess(true);
      } else {
        // Caso raro onde a confirmação está desligada, ele já loga direto
        router.push('/lobby');
      }
      setLoading(false);
    }
  };

  // --- TELA DE SUCESSO (VERIFICAÇÃO DE EMAIL) ---
  if (success) {
    return (
      <div className="p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ffd000]/10 text-[#ffd000] mb-6 border border-[#ffd000]/20 shadow-[0_0_30px_rgba(255,208,0,0.2)]">
          <Mail size={32} className="stroke-[1.5]" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Verifique seu e-mail</h2>
        
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Enviamos um link de confirmação para:<br/>
          <strong className="text-white">{email}</strong>
        </p>

        <div className="bg-[#ffd000]/5 border border-[#ffd000]/10 rounded-xl p-4 mb-8 text-xs text-gray-500">
          <p>Não recebeu? Verifique sua caixa de Spam ou Lixo Eletrônico.</p>
        </div>

        <Link 
          href="/login"
          className="w-full h-12 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/5"
        >
          Voltar para Login
        </Link>
      </div>
    );
  }

  // --- TELA DE FORMULÁRIO (PADRÃO) ---
  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#ffd000]/10 text-[#ffd000] mb-4 border border-[#ffd000]/20">
          <Zap size={24} className="fill-[#ffd000]" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Crie sua conta</h1>
        <p className="text-gray-500 text-sm mt-2">Comece a gerar roteiros virais hoje.</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        {error && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">E-mail</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-white focus:border-[#ffd000] outline-none transition-colors"
            placeholder="seu@email.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Senha</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-white focus:border-[#ffd000] outline-none transition-colors"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <button 
          disabled={loading}
          className="w-full h-12 bg-[#ffd000] hover:bg-[#ffdb4d] text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-6 shadow-[0_0_20px_rgba(255,208,0,0.2)]"
        >
          {loading ? <Loader2 className="animate-spin" /> : <>Começar Grátis <ArrowRight size={18}/></>}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-[#ffd000] hover:underline font-bold">
          Entrar agora
        </Link>
      </div>
    </div>
  );
}