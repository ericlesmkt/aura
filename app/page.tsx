import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redireciona o usuário para a tela de seleção de perfil
  redirect('/lobby');
}