import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Clock, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getStoreConfig } from "@/lib/database.functions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function Hero() {
  const { data: config } = useQuery({
    queryKey: ['store-config'],
    queryFn: () => getStoreConfig(),
  });

  const isStoreOpen = config?.['is_store_open'] ?? true;
  const storeHours = config?.['store_hours'] ?? { open: "18:00", close: "23:30" };

  return (
    <section className="relative overflow-hidden bg-[#2B1710] py-12 md:py-20 lg:py-28">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[#FFF4E6] z-10"
        >
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            DELÍCIA'S <br />
            <span className="text-[#E87524]">HOT BURGUER'S 🍔</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 text-[#F3E2CC]">
            Escolha seu favorito, personalize do seu jeito e peça agora.
          </p>
          <Button 
            variant="burger" 
            size="xl" 
            className="w-full md:w-auto"
            onClick={() => {
              document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            VER CARDÁPIO
          </Button>
          
          <div className="mt-8 grid grid-cols-4 gap-2 md:gap-4">
             <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">🔥</span>
                <span className="text-[10px] font-black uppercase text-[#E87524]">Mais Pedidos</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">🍔</span>
                <span className="text-[10px] font-black uppercase text-[#E87524]">Feito na hora</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">🚀</span>
                <span className="text-[10px] font-black uppercase text-[#E87524]">Pedido rápido</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex flex-col items-center gap-2 outline-none group">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all group-hover:scale-110",
                        isStoreOpen ? "bg-green-500/20" : "bg-red-500/20"
                      )}>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          isStoreOpen ? "bg-green-500 animate-pulse" : "bg-red-500"
                        )} />
                      </div>
                      <span className="text-[10px] font-black uppercase text-[#E87524] flex items-center gap-0.5">
                        {isStoreOpen ? 'Aberto' : 'Fechado'}
                        <ChevronDown className="w-3 h-3" />
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-[#4A2618] border-[#E87524] text-[#F3E2CC] w-48 p-3 shadow-2xl z-50">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#2B1710]/50">
                      <Clock className="w-4 h-4 text-[#E87524]" />
                      <span className="text-xs font-black uppercase tracking-widest">Horário</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold opacity-70">Segunda a Sábado</span>
                        <span className="font-black text-[#E87524]">19:00 às 00:00</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold opacity-70">Domingo</span>
                        <span className="font-black text-red-400">FECHADO</span>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
             </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative flex justify-center"
        >
          <div className="absolute inset-0 bg-[#E87524] rounded-full blur-[100px] opacity-20 scale-150" />
          <img 
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop" 
            alt="Hambúrguer Apetitoso" 
            className="relative z-10 w-full max-w-md drop-shadow-2xl hover:rotate-2 transition-transform duration-500 rounded-[2rem]"
          />
        </motion.div>
      </div>
    </section>
  );
}
