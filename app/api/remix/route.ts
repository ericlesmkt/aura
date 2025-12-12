import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await request.json(); } catch (e) { return NextResponse.json({ error: 'Body inválido' }, { status: 400 }); }
  
  const { profileId, blockKey, context } = body; 

  // 1. CHECAGEM DE CRÉDITOS
  const { data: account } = await supabase
    .from('saas_accounts')
    .select('credits_used_today, daily_credits_limit')
    .eq('id', user.id)
    .single();

  if (!account || account.credits_used_today >= account.daily_credits_limit) {
    return NextResponse.json({ error: 'Sem créditos para remix!' }, { status: 403 });
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', profileId).single();
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

  // 2. RAG INTELIGENTE (ADICIONADO NO REMIX TAMBÉM)
  // Busca referências de estilo para manter a consistência, priorizando os VIRAIS
  let { data: history } = await supabase
    .from('scripts')
    .select('content')
    .eq('profile_id', profileId)
    .eq('is_viral', true) 
    .order('created_at', { ascending: false })
    .limit(3);

  if (!history || history.length === 0) {
      const { data: fallbackHistory } = await supabase
        .from('scripts')
        .select('content')
        .eq('profile_id', profileId)
        .eq('status', 'ready')
        .order('created_at', { ascending: false })
        .limit(3);
      history = fallbackHistory;
  }

  let userExamples = "";
  if (history && history.length > 0) {
    userExamples = `
    REFERÊNCIAS DE ESTILO (PADRÃO DE QUALIDADE DO USUÁRIO):
    Ao reescrever o bloco, mantenha o mesmo tom, agressividade e tamanho de frase destes exemplos aprovados:
    ${history.map((h, i) => `[REF ${i+1}]: ${h.content.a.audio.substring(0, 100)}...`).join('\n')}
    `;
  }

  // 3. DEFINIÇÃO DE PERSONA (Sincronizada)
  const toneValue = profile.tone_of_voice ?? 50;
  let personaInstruction = "";

  if (toneValue <= 40) {
    personaInstruction = `
    SUA PERSONA: MENTOR ESTRATEGISTA (REALISTA/SÉRIO)
    - Estilo: "Papo reto". Sem rodeios.
    - Comece com uma verdade dura.
    - Use pausas dramáticas e linguagem seca.
    `;
  } else if (toneValue >= 70) {
    personaInstruction = `
    SUA PERSONA: VAREJO POPULAR (HYPE/TIKTOK)
    - LINGUAGEM POPULAR: Fale como alguém normal, não como um poeta.
    - REAJA, NÃO DESCREVA: "Escuta só esse estalo!" em vez de "O som crepitante".
    - USE PLACEHOLDERS SE NÃO SOUBER: "(FALE O DIFERENCIAL DA SUA MASSA)".
    - Foco: Fome, Desejo, Pressa.
    `;
  } else {
    personaInstruction = `
    SUA PERSONA: PROFISSIONAL EQUILIBRADO
    - Seguro e confiante. Foco no benefício claro.
    `;
  }

  // 4. INSTRUÇÃO ESPECÍFICA DO BLOCO
  let blockInstruction = "";
  switch (blockKey) {
    case 'a':
      blockInstruction = "OBJETIVO: GANCHO VISUAL OU AFIRMAÇÃO CHOCANTE. Nada de perguntas óbvias ('Gosta de pizza?'). Quebre o padrão nos primeiros 3 segundos. Se for Hype, use uma reação exagerada.";
      break;
    case 'u':
      blockInstruction = "OBJETIVO: CONEXÃO SENSORIAL. Descreva o cenário. Se não souber o detalhe técnico, use um PLACEHOLDER em caixa alta: (EXPLIQUE AQUI O PROCESSO).";
      break;
    case 'r':
      blockInstruction = "OBJETIVO: LÓGICA E RETENÇÃO. Justifique a oferta. Use escassez real ('Só tem 10 unidades'). Nada de 'Imperdível' ou 'Incrível'.";
      break;
    case 'a_final':
      blockInstruction = "OBJETIVO: CHAMADA PARA AÇÃO (CTA). Seja grosso/direto. 'Clica no link', 'Pede agora'. Nada de 'venha saborear'.";
      break;
    default:
      blockInstruction = "Reescreva este trecho com mais impacto.";
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
          Você é um Criador de Conteúdo Viral especialista no MÉTODO AURA.
          Você está REMIXANDO (Reescrevendo) apenas um bloco específico.
          
          ${personaInstruction}

          ${userExamples}

          ${blockInstruction}

          ---
          🚨 LISTA NEGRA DE PALAVRAS (ANTI-POESIA & ANTI-RÁDIO):
          PROIBIDO: 
          - "Sinfonia", "Dançando", "Embalar", "Reluzindo", "Crepitando", "Aconchegante".
          - "Experiência única", "Inigualável", "Divisor de águas", "Fenomenal", "Explosão de sabores".
          - "Venha conferir", "Estamos te esperando", "Convite ao paladar".
          - "Delicie-se", "Saboreie", "Sinta o aroma".

          COMO CONSERTAR:
          - Em vez de inventar poesia, USE UM PLACEHOLDER EM CAIXA ALTA: "(EXPLIQUE AQUI COMO VOCÊ FAZ)".
          - Em vez de "Sinta o aroma", diga "O cheiro disso aqui tá absurdo."

          CONTEXTO DO VÍDEO (OFERTA/TEMA):
          "${context || 'Oferta geral do nicho ' + profile.niche}"

          Gere APENAS o JSON deste bloco: { audio: "...", visual: "..." }
          `
        },
        {
          role: "user",
          content: `Reescreva o bloco '${blockKey.toUpperCase()}' seguindo sua Persona e as referências de estilo.`
        }
      ],
      temperature: 0.9, 
    });

    const aiContent = completion.choices[0].message.content;
    if (!aiContent) throw new Error("A IA falhou.");
    
    const newBlockContent = JSON.parse(aiContent);

    // Consumir crédito
    await supabase.from('saas_accounts').update({ 
        credits_used_today: account.credits_used_today + 1
    }).eq('id', user.id);

    return NextResponse.json(newBlockContent);

  } catch (error: any) {
    console.error("❌ ERRO REMIX:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}