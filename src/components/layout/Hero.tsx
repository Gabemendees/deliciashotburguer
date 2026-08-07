import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-blue-900 py-12 md:py-20 lg:py-28">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-white z-10"
        >
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            SEU LANCHE FAVORITO <br />
            <span className="text-[#FFD700]">ESTÁ AQUI 🍔</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 text-blue-100">
            Escolha seu lanche, monte seu pedido e receba onde estiver.
          </p>
          <Button 
            variant="burger" 
            size="xl" 
            className="w-full md:w-auto"
            onClick={() => {
              document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            FAZER MEU PEDIDO
          </Button>
          
          <div className="mt-12 space-y-2">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/50 p-3 rounded-lg backdrop-blur-sm">
              <span className="text-xl">⚠️</span>
              <p className="font-bold text-sm text-red-200 uppercase tracking-wide">
                NÃO TROCAMOS ITENS NOS LANCHES
              </p>
            </div>
            <p className="text-xs text-blue-300 ml-1">
              Os ingredientes dos lanches seguem a descrição do cardápio.
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative flex justify-center"
        >
          <div className="absolute inset-0 bg-[#FFD700] rounded-full blur-[100px] opacity-20 scale-150" />
          <img 
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop" 
            alt="Hambúrguer Apetitoso" 
            className="relative z-10 w-full max-w-md drop-shadow-2xl hover:rotate-2 transition-transform duration-500"
          />
        </motion.div>
      </div>
    </section>
  );
}
