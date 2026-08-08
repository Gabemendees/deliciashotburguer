import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Hero() {
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
            SEU LANCHE FAVORITO <br />
            <span className="text-[#E87524]">ESTÁ AQUI 🍔</span>
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
          
          <div className="mt-8 grid grid-cols-3 gap-4">
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
