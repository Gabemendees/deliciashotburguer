import { Product } from "@/types/burger";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";


interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const imageUrl = product.image || "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=500&auto=format&fit=crop";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#F3E2CC] flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-black text-[#2B1710] leading-tight group-hover:text-[#E87524] transition-colors uppercase italic tracking-tighter">
            {product.name}
          </h3>
        </div>
        
        <p className="text-[#4A2618] text-sm mb-6 flex-1 italic opacity-80">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-2xl font-black text-[#E87524]">
            {product.price > 0 ? formatCurrency(product.price) : '--'}
          </span>
          <div className="bg-[#2B1710] group-hover:bg-[#E87524] text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest">COMPRAR</span>
            <span className="text-lg">🛒</span>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
