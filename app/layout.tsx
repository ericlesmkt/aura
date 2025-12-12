import type { Metadata, Viewport } from "next"; // Importe Viewport
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AURA.AI",
  description: "Seu estrategista de conteúdo com IA.",
  manifest: "/manifest.json", // Prepara o terreno para PWA
};

// CONFIGURAÇÃO ESSENCIAL PARA MOBILE
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Impede zoom ao clicar em inputs
  userScalable: false, // Impede zoom com pinça
  themeColor: "#000000", // Pinta a barra de status do celular de preto
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <ToastProvider>
            {children}
        </ToastProvider>
      </body>
    </html>
  );
}