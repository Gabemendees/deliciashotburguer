import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/layout/Hero";
import { Menu } from "@/components/menu/Menu";
import { Cart } from "@/components/cart/Cart";

import { Toaster } from "sonner";
import { useCart } from "@/lib/store";
import { useEffect } from "react";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cardápio Digital - Delícia's Hot Burguer's" },
      { name: "description", content: "Explore nosso cardápio de hot dogs e hambúrgueres artesanais. Faça seu pedido pelo WhatsApp!" },
      { property: "og:title", content: "Cardápio Digital - Delícia's Hot Burguer's" },
      { property: "og:description", content: "Os melhores lanches estão aqui. Veja nosso cardápio e faça seu pedido agora." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop" },
      { name: "twitter:image", content: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);


  return (
      <div className="min-h-screen bg-[#FFF4E6] flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <div id="menu">
          <Menu />
        </div>
      </main>
      
      <Cart />
      
      <footer className="bg-[#2B1710] text-[#F3E2CC] py-12 border-t border-[#4A2618]">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center mb-6">
            <span className="text-2xl font-black text-[#FFF4E6]">DELÍCIA'S</span>
            <span className="text-sm font-bold text-[#E87524] tracking-widest">HOT BURGUER'S</span>
          </div>
          <div className="space-y-2 text-sm">
            <p>WhatsApp: 9.9701-3096</p>
            <p>Segunda a sábado: 19:00 às 00:00</p>
            <p className="opacity-60 mt-4">
              © 2026 Delícia's Hot Burguer's. <br />
              Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
      
      <Toaster position="top-center" />
    </div>
  );
}
