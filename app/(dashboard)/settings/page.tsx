"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  User, CreditCard, Shield, LogOut, Zap, CheckCircle, ExternalLink, 
  Settings, CalendarClock, AlertTriangle, RefreshCcw, Copy 
} from 'lucide-react';
import SettingsSkeleton from '@/components/aura/skeletons/SettingsSkeleton';
// 1. Importar Toast
import { useToast } from '@/context/ToastContext';

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  // 2. Inicializar Hook
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserEmail(user.email || '');

      const { data: acc, error } = await supabase
        .from('saas_accounts')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
          console.error(error);
          addToast("Erro ao carregar dados da conta.", "error");
      }

      setAccount(acc);
      setLoading(false);
    };
    init();
  }, [supabase, router, addToast]);

  const handleLogout = async () => {
    try {
        await supabase.auth.signOut();
        addToast("Você saiu da conta.", "info");
        router.push('/login');
    } catch (error: any) {
        addToast("Erro ao sair: " + error.message, "error");
    }
  };

  const handleRenewNow = () => {
    addToast("Redirecionando para pagamento seguro...", "info");
    // Simulação de delay para parecer processamento
    setTimeout(() => {
        window.open('https://checkout.stripe.com/seulink...', '_blank');
    }, 1000);
  };

  // Nova função utilitária
  const handleCopyId = () => {
      if (account?.id) {
          navigator.clipboard.writeText(account.id);
          addToast("ID copiado para a área de transferência!", "success");
      }
  };

  const getNextRenewalDate = (createdAt: string) => {
    if (!createdAt) return '...';
    const createdDate = new Date(createdAt);
    const billingDay = createdDate.getDate();
    const now = new Date();
    let nextDate = new Date(now.getFullYear(), now.getMonth(), billingDay);
    if (now > nextDate) {
        nextDate = new Date(now.getFullYear(), now.getMonth() + 1, billingDay);
    }
    return nextDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) return <SettingsSkeleton />;

  const isPro = account?.daily_credits_limit > 100;
  const isPastDue = account?.subscription_status === 'past_due';

  return (
    <div className="flex flex-col h-full w-full p-5 gap-6 overflow-y-auto pb-32 hide-scrollbar animate-in fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Configurações <Settings className="text-[#ffd000]" size={20} />
        </h1>
        <p className="text-gray-400 text-xs mt-1">Gerencie sua conta e assinatura.</p>
      </div>

      {/* 1. CARTÃO DE PLANO */}
      <div className={`
        border rounded-3xl p-5 relative overflow-hidden shadow-xl shrink-0 transition-all
        ${isPastDue 
            ? 'bg-red-500/10 border-red-500/30' 
            : 'bg-[#121212] border-white/10'    
        }
      `}>
            {/* Aura de Fundo */}
            {isPro && !isPastDue && <div className="absolute top-0 right-0 w-40 h-40 bg-[#ffd000]/20 blur-3xl -mr-10 -mt-10 pointer-events-none"></div>}
            {isPastDue && <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 blur-3xl -mr-10 -mt-10 pointer-events-none animate-pulse"></div>}

            {/* Cabeçalho do Card */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h2 className={`text-sm font-bold flex items-center gap-2 ${isPastDue ? 'text-red-400' : 'text-white'}`}>
                        {isPastDue ? <AlertTriangle size={16}/> : <CreditCard size={16} className="text-[#ffd000]"/>}
                        {isPastDue ? "Problema no Pagamento" : "Plano Atual"}
                    </h2>
                </div>
                <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide 
                    ${isPastDue 
                        ? 'bg-red-500 text-white border-red-500' 
                        : (isPro ? 'bg-[#ffd000] text-black border-[#ffd000]' : 'bg-white/10 text-white border-white/10')
                    }`}>
                    {isPastDue ? 'ATRASADO' : (isPro ? 'AURA PRO' : 'GRATUITO')}
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Créditos */}
                    <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                        <div className="text-gray-500 text-[9px] font-bold uppercase mb-1">Créditos Diários</div>
                        <div className="text-sm font-bold text-white flex items-center gap-1">
                            {isPro ? <Zap size={14} className="fill-[#ffd000] text-[#ffd000]" /> : null} 
                            {isPro ? "ILIMITADO" : `${account?.daily_credits_limit}`}
                        </div>
                    </div>

                    {/* Data de Renovação */}
                    <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                        <div className="text-gray-500 text-[9px] font-bold uppercase mb-1">
                            {isPastDue ? "Vencido desde" : "Renova em"}
                        </div>
                        <div className={`text-sm font-bold flex items-center gap-1.5 ${isPastDue ? "text-red-400" : "text-white"}`}>
                            <CalendarClock size={14} className={isPro && !isPastDue ? "text-[#ffd000]" : (isPastDue ? "text-red-500" : "text-gray-400")} />
                            {isPastDue ? "Pagamento pendente" : getNextRenewalDate(account?.created_at)}
                        </div>
                    </div>
                </div>

                {/* Ações */}
                {isPastDue ? (
                     <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 space-y-3">
                        <p className="text-red-200 text-[10px] leading-relaxed">
                            Não conseguimos renovar sua assinatura. Atualize seu cartão para não perder acesso ao AURA PRO.
                        </p>
                        <button 
                            onClick={handleRenewNow}
                            className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-wide transition shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <RefreshCcw size={12} /> RENOVAR AGORA
                        </button>
                    </div>
                ) : (
                    !isPro ? (
                        <div className="bg-gradient-to-br from-[#ffd000]/10 to-orange-500/10 border border-[#ffd000]/30 rounded-2xl p-4 space-y-3">
                            <div>
                                <h3 className="text-[#ffd000] font-bold text-xs mb-2">Seja PRO por R$ 69 🚀</h3>
                                <ul className="space-y-1">
                                    <li className="flex items-center gap-2 text-[10px] text-gray-300"><CheckCircle size={10} className="text-[#ffd000]"/> Roteiros Ilimitados</li>
                                    <li className="flex items-center gap-2 text-[10px] text-gray-300"><CheckCircle size={10} className="text-[#ffd000]"/> Remix com IA Ilimitado</li>
                                </ul>
                            </div>
                            <button className="w-full py-2 bg-[#ffd000] hover:bg-[#ffdb4d] text-black font-bold rounded-xl text-[10px] uppercase tracking-wide transition shadow-lg shadow-orange-500/20 active:scale-95">
                                Quero ser PRO
                            </button>
                        </div>
                    ) : (
                        <div className="text-center pt-2">
                            <p className="text-gray-500 text-[10px] mb-2">Sua assinatura está ativa e saudável.</p>
                            <button className="text-[10px] text-white underline hover:text-[#ffd000]">Gerenciar Assinatura</button>
                        </div>
                    )
                )}
            </div>
      </div>

      {/* 2. DADOS DA CONTA */}
      <div className="bg-[#121212] border border-white/10 rounded-3xl p-5 shrink-0">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <User size={16} className="text-gray-400"/> 
                Sua Conta
            </h2>
            
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 font-bold uppercase">Email de Acesso</label>
                    <div className="bg-black/30 border border-white/5 rounded-xl px-3 py-2 text-gray-300 text-xs truncate">
                        {userEmail}
                    </div>
                </div>
                
                {/* ID COM CLIQUE PARA COPIAR */}
                <div className="space-y-1 group cursor-pointer" onClick={handleCopyId}>
                    <label className="text-[9px] text-gray-500 font-bold uppercase flex justify-between">
                        ID do Usuário 
                        <span className="text-[#ffd000] opacity-0 group-hover:opacity-100 transition-opacity text-[8px] flex items-center gap-1">
                            <Copy size={8} /> Copiar
                        </span>
                    </label>
                    <div className="bg-black/30 border border-white/5 rounded-xl px-3 py-2 text-gray-500 text-[10px] font-mono truncate group-hover:text-white group-hover:border-white/20 transition-all">
                        {account?.id}
                    </div>
                </div>
            </div>
      </div>

      {/* 3. RODAPÉ */}
      <div className="flex flex-col gap-3 pt-2 shrink-0">
            <a 
                href="https://wa.me/5511999999999" 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-white/5 border border-white/10 h-12 rounded-xl text-gray-300 font-medium text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition"
            >
                <Shield size={14} /> Suporte via WhatsApp <ExternalLink size={10}/>
            </a>

            <button 
                onClick={handleLogout}
                className="w-full h-12 rounded-xl text-red-500/80 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20"
            >
                <LogOut size={14} /> Sair da Conta
            </button>
      </div>

    </div>
  );
}