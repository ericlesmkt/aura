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
  
  const { profileId, duration = '30s', offer, mandatoryPhrase } = body;

  // 1. CHECAGEM DE CRÉDITOS E CONTA
  const { data: account } = await supabase
    .from('saas_accounts')
    .select('credits_used_today, daily_credits_limit, current_streak, last_activity_date')
    .eq('id', user.id)
    .single();

  if (!account || account.credits_used_today >= account.daily_credits_limit) {
    return NextResponse.json({ error: 'Sem créditos por hoje!' }, { status: 403 });
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', profileId).single();
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

  // 2. RAG INTELIGENTE (Prioridade: Viral > Ready)
  // Tenta buscar os CAMPEÕES (Viral)
  let { data: history } = await supabase
    .from('scripts')
    .select('content, gancho_type')
    .eq('profile_id', profileId)
    .eq('is_viral', true) 
    .order('created_at', { ascending: false })
    .limit(3);

  let ragSource = "CAMPEÕES (VIRAL)";

  // Se não tiver viral suficiente, busca os normais (Ready)
  if (!history || history.length === 0) {
      const { data: fallbackHistory } = await supabase
        .from('scripts')
        .select('content, gancho_type')
        .eq('profile_id', profileId)
        .eq('status', 'ready')
        .order('created_at', { ascending: false })
        .limit(3);
      
      history = fallbackHistory;
      ragSource = "APROVADOS (READY)";
  }

  let userExamples = "";
  let dynamicTemperature = 0.9; // Criativo se não tiver exemplos

  if (history && history.length > 0) {
    dynamicTemperature = 0.7; // Mais focado se tiver exemplos
    
    userExamples = `
    FONTE DE APRENDIZADO: ${ragSource}
    ATENÇÃO: Estes são os MELHORES roteiros deste usuário. 
    Analise a ESTRUTURA, o RITMO (frases curtas) e a AGRESSIVIDADE abaixo.
    VOCÊ DEVE SUPERAR OU IGUALAR ESSA QUALIDADE:

    ${history.map((h, i) => `
    [REFERÊNCIA ${i+1}]:
    (A): ${h.content.a.audio}
    (U): ${h.content.u.audio}
    (R): ${h.content.r.audio}
    (A): ${h.content.a_final.audio}
    `).join('\n')}
    -----------------------------------
    `;
  }

  // 3. REGRAS DE DURAÇÃO (COM PLACEHOLDERS INTELIGENTES)
  let durationRules = "";
  if (duration === '30s') {
      durationRules = "DURAÇÃO 30s: Curto e grosso. Máximo 2 frases por bloco. Foco no impacto imediato.";
  } else if (duration === '45s') {
      durationRules = "DURAÇÃO 45s: Ritmo médio. Crie conexão visual antes de vender.";
  } else if (duration === '60s') {
      durationRules = "DURAÇÃO 60s: Narrativa completa. Desenvolva o problema no bloco (U).";
  } else if (duration === '90s') {
      durationRules = `
      DURAÇÃO 90s (VÍDEO DE RETENÇÃO/BASTIDOR):
      - OBRIGATÓRIO: Conte uma HISTÓRIA ou mostre um BASTIDOR REAL.
      - PROIBIDO INVENTAR POESIA: Se você não souber o detalhe técnico (ex: qual tempero, qual técnica), NÃO INVENTE "sinfonia de sabores".
      - USE PLACEHOLDERS: Escreva assim: "(EXPLIQUE AQUI O SEGREDO DO SEU TEMPERO)" ou "(MOSTRE AQUI A PEÇA CRUA)".
      - O usuário vai completar essa parte com a autoridade dele.
      `;
  }

  // 4. PERSONAS (TONE OF VOICE)
  const toneValue = profile.tone_of_voice ?? 50;
  let personaInstruction = "";

  if (toneValue <= 40) {
    personaInstruction = `
    PERSONA: MENTOR ESTRATEGISTA (REALISTA)
    - Estilo: "Papo reto". Sem rodeios.
    - Comece com uma verdade dura ou quebra de padrão.
    - Use pausas dramáticas e linguagem seca.
    `;
  } else if (toneValue >= 70) {
    personaInstruction = `
    PERSONA: VAREJO POPULAR (HYPE/TIKTOK)
    - LINGUAGEM POPULAR: Fale como alguém normal conversando com um amigo.
    - REAJA, NÃO DESCREVA: "Escuta só esse estalo!" em vez de "O som crepitante".
    - USE PLACEHOLDERS SE NÃO SOUBER: "(FALE O DIFERENCIAL DA SUA MASSA)".
    - OBRIGATÓRIO: Usar "Você", "Teu", "A gente". 
    - Foco: Fome, Desejo, Pressa.
    `;
  } else {
    personaInstruction = `
    PERSONA: PROFISSIONAL EQUILIBRADO
    - Seguro e confiante. Foco no benefício claro.
    `;
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
          
          ${personaInstruction}
          
          ${durationRules}

          ${userExamples}

          ---
          🚨 LISTA NEGRA DE PALAVRAS (ANTI-POESIA & ANTI-RÁDIO):
          Se usar qualquer palavra abaixo, o roteiro será considerado RUIM.
          PROIBIDO: 
          - "Sinfonia", "Dançando", "Embalar", "Reluzindo", "Crepitando", "Aconchegante".
          - "Experiência única", "Inigualável", "Divisor de águas", "Fenomenal", "Explosão de sabores".
          - "Venha conferir", "Estamos te esperando", "Convite ao paladar".
          - "Delicie-se", "Saboreie", "Sinta o aroma".

          COMO CONSERTAR:
          - Em vez de inventar poesia, USE UM PLACEHOLDER EM CAIXA ALTA: "(EXPLIQUE AQUI COMO VOCÊ FAZ)".
          - Em vez de "Sinta o aroma", diga "O cheiro disso aqui tá absurdo."
          - Em vez de "Sabor inigualável", diga "Não tem nada igual na cidade."

          ---
          CONTEXTO:
          Nome: ${profile.name}
          Cidade: ${profile.city}
          OFERTA: "${offer}"
          ${mandatoryPhrase ? `FRASE OBRIGATÓRIA: "${mandatoryPhrase}"` : ''}

          Gere JSON: { gancho_type, content: { a: {audio, visual}, u: {audio, visual}, r: {audio, visual}, a_final: {audio, visual} } }
          `
        },
        {
          role: "user",
          content: `Crie um roteiro AURA de ${duration}.`
        }
      ],
      temperature: dynamicTemperature,
    });

    const aiContent = completion.choices[0].message.content;
    if (!aiContent) throw new Error("A IA falhou.");
    
    let aiData = JSON.parse(aiContent);
    // Fallback de estrutura
    if (!aiData.content && aiData.a) {
        aiData = {
            gancho_type: aiData.gancho_type || "AURA V3",
            content: { a: aiData.a, u: aiData.u, r: aiData.r, a_final: aiData.a_final || aiData.a }
        };
    }
    if (!aiData.content || !aiData.content.a) throw new Error("JSON inválido.");

    // SALVAR
    const { data: savedScript, error: saveError } = await supabase
      .from('scripts')
      .insert([{
        profile_id: profileId,
        gancho_type: aiData.gancho_type,
        content: aiData.content,
        status: 'draft',
        is_viral: false // Começa sempre como false
      }])
      .select().single();

    if (saveError) throw saveError;

    // UPDATE STREAK
    const today = new Date().toISOString().split('T')[0];
    const lastActive = account.last_activity_date;
    let newStreak = account.current_streak || 0;
    if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (lastActive === yesterdayStr) newStreak += 1;
        else newStreak = 1;
    } else {
        if (newStreak === 0) newStreak = 1;
    }
    await supabase.from('saas_accounts').update({ 
        credits_used_today: account.credits_used_today + 1,
        current_streak: newStreak,
        last_activity_date: today
    }).eq('id', user.id);

    return NextResponse.json(savedScript);

  } catch (error: any) {
    console.error("❌ ERRO API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}