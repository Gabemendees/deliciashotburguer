import { useState, useEffect } from "react";
import { Category, Product } from "@/types/burger";
import { PRODUCTS } from "@/lib/data";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";




const CATEGORIES: { id: Category; icon: string; label: string }[] = [
  { id: 'HOT DOGS', icon: '🌭', label: 'HOT DOGS' },
  { id: 'HAMBÚRGUERES', icon: '🍔', label: 'HAMBÚRGUERES' },
  { id: 'BEBIDAS', icon: '🥤', label: 'BEBIDAS' },
];

export function Menu() {
  const [activeCategory, setActiveCategory] = useState<Category>('HOT DOGS');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const addItem = useCart(state => state.addItem);
  const navigate = useNavigate();

  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);


  const handleProductClick = (product: Product) => {
    if (product.category === 'HAMBÚRGUERES' || product.category === 'HOT DOGS') {
      setSelectedProduct(product);
    } else {
      addItem(product, 1, []);
      navigate({ to: '/carrinho' });
    }
  };


  return (
    <section id="menu" className="py-12 bg-[#fcfbf8]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-black text-blue-900 mb-8 text-center uppercase tracking-tighter italic">
          Nosso Cardápio
        </h2>

        {/* Categories Bar */}
        <div className="sticky top-16 z-40 -mx-4 px-4 py-4 bg-[#fcfbf8]/80 backdrop-blur-sm overflow-x-auto no-scrollbar flex items-center gap-3 md:justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-full font-bold transition-all shadow-sm",
                activeCategory === cat.id
                  ? "bg-red-600 text-white scale-105 shadow-red-200"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.filter(p => p.category === activeCategory).map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>

        <ProductModal 
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </div>
    </section>
  );
}

