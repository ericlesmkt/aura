import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  
  // O Supabase envia um código único na URL
  const code = searchParams.get('code')
  
  // "next" é para onde o usuário vai depois de logar (padrão: /lobby agora, já que temos multiperfil)
  const next = searchParams.get('next') ?? '/lobby'

  if (code) {
    // ✅ CORREÇÃO AQUI: Adicionado 'await'
    const supabase = await createClient()
    
    // Troca o código por uma sessão de usuário (cookies)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Sucesso! Redireciona para o app logado
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Se der erro (link expirado, inválido), manda pro login com erro
  return NextResponse.redirect(`${origin}/login?error=Link expirado ou inválido. Tente novamente.`)
}