import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/layout/Hero";
import { Menu } from "@/components/menu/Menu";
import { Toaster } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-[#fcfbf8] flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Menu />
      </main>
      
      {/* Footer minimalista como solicitado */}
      <footer className="bg-blue-950 text-blue-200 py-12 border-t border-blue-900">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center mb-6">
            <span className="text-2xl font-black text-red-500">DELÍCIA'S</span>
            <span className="text-sm font-bold text-white tracking-widest">HOT BURGUER'S</span>
          </div>
          <p className="text-sm opacity-60">
            © 2026 Delícia's Hot Burguer's. <br />
            Todos os direitos reservados.
          </p>
        </div>
      </footer>
      
      <Toaster position="top-center" />
    </div>
  );
}
