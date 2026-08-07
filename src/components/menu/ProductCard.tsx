import { Product } from "@/types/burger";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Placeholder image if not provided
  const imageUrl = product.image || "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=500&auto=format&fit=crop";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all group"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black">
          #{product.number}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-black text-blue-900 leading-tight group-hover:text-red-600 transition-colors">
            {product.name}
          </h3>
        </div>
        
        <p className="text-gray-500 text-sm mb-6 flex-1 italic">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-2xl font-black text-blue-900">
            {product.price > 0 ? formatCurrency(product.price) : '--'}
          </span>
          <button className="bg-yellow-400 hover:bg-yellow-500 text-black p-3 rounded-2xl transition-all shadow-lg active:scale-90">
            <Plus size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
