import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/layout/Hero";
import { Menu } from "@/components/menu/Menu";
import { Cart } from "@/components/cart/Cart";
import { z } from "zod";
import { Toaster } from "sonner";
import { useCart } from "@/lib/store";
import { useEffect, useState } from "react";
import { getStoreConfig } from "@/lib/database.functions";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  validateSearch: (search) => z.object({
    category: z.string().optional(),
  }).parse(search),
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
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    useCart.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  const { data: config } = useQuery({
    queryKey: ['store-config'],
    queryFn: () => getStoreConfig(),
  });

  const isStoreOpen = config?.['is_store_open'] ?? true;
  const storeHours = config?.['store_hours'] ?? { open: "18:00", close: "23:30" };

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-[#FFF4E6] flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        
        {!isStoreOpen && (
          <div className="container mx-auto px-4 mt-8">
            <div className="bg-red-50 border-2 border-red-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-red-700 uppercase tracking-tighter italic">Estamos fechados no momento</h2>
                <p className="text-red-600 font-bold">Nosso horário de funcionamento é das {storeHours.open} às {storeHours.close}.</p>
              </div>
              <div className="md:ml-auto flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 rounded-2xl font-black text-xs tracking-widest uppercase">
                <Clock size={16} />
                ABRIREMOS ÀS {storeHours.open}
              </div>
            </div>
          </div>
        )}

        <div id="menu" className={cn(!isStoreOpen && "opacity-60 pointer-events-none grayscale-[0.5]")}>
          <Menu />
        </div>
      </main>
      
      {isStoreOpen && <Cart />}
      
      <footer className="bg-[#2B1710] text-[#F3E2CC] py-12 border-t border-[#4A2618]">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center mb-6">
            <span className="text-2xl font-black text-[#FFF4E6]">DELÍCIA'S</span>
            <span className="text-sm font-bold text-[#E87524] tracking-widest">HOT BURGUER'S</span>
          </div>
          <div className="space-y-2 text-sm">
            <p>WhatsApp: 9.9701-3096</p>
            <p>Horário: {storeHours.open} às {storeHours.close}</p>
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
