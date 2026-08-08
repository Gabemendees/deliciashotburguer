import { useState, useEffect } from "react";
import { Category, Product } from "@/types/burger";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/store";
import { useNavigate, getRouteApi } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPublicProducts, getPublicCategories } from "@/lib/database.functions";
import { Loader2 } from "lucide-react";

const routeApi = getRouteApi('/');

export function Menu() {
  const navigate = useNavigate();
  const search = routeApi.useSearch();
  const initialCategoryParam = search.category as string | undefined;
  
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["public-products"],
    queryFn: () => getPublicProducts(),
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["public-categories"],
    queryFn: () => getPublicCategories(),
  });

  const [activeCategory, setActiveCategory] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const addItem = useCart(state => state.addItem);

  useEffect(() => {
    if (categories.length > 0) {
      if (initialCategoryParam) {
        const found = categories.find(c => c.name === initialCategoryParam);
        if (found) {
          setActiveCategory(found.name);
          return;
        }
      }
      if (!activeCategory) {
        setActiveCategory(categories[0]?.name || "");
      }
    }
  }, [categories, initialCategoryParam]);

  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);

  const handleProductClick = (product: any) => {
    // We treat almost all products as customizable now except maybe drinks if they don't have additions
    // but the instruction implies a full management center.
    // For drinks, we can still show the modal or add directly.
    const catName = product?.categories?.name;
    const desc = product?.description;
    if (catName === 'BEBIDAS' && !(desc && desc.includes('personalização'))) {
       // Direct add for simple items
       addItem({
         id: product.id,
         name: product.name,
         description: product.description,
         price: product.price,
         image: product.image_url,
         category: product.categories?.name
       } as any, 1, []);
       navigate({ to: '/carrinho' });
    } else {
      setSelectedProduct(product);
    }
  };

  if (isLoadingProducts || isLoadingCategories) {
    return (
      <div className="flex justify-center p-24">
        <Loader2 className="animate-spin text-[#E87524]" size={48} />
      </div>
    );
  }

  const filteredProducts = products.filter(p => p.categories?.name === activeCategory && p.is_available);

  return (
    <section id="menu" className="py-12 bg-[#FFF4E6]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-black text-[#2B1710] mb-2 text-center uppercase tracking-tighter italic">
          Nosso Cardápio
        </h2>
        <div className="w-20 h-1 bg-[#E87524] mx-auto mb-8" />

        {/* Categories Bar */}
        <div className="sticky top-16 z-40 -mx-4 px-4 py-4 bg-[#FFF4E6]/80 backdrop-blur-sm overflow-x-auto no-scrollbar flex items-center gap-3 md:justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-full font-bold transition-all shadow-sm uppercase text-xs tracking-widest",
                activeCategory === cat.name
                  ? "bg-[#E87524] text-white scale-105 shadow-[#E87524]/20"
                  : "bg-[#F3E2CC] text-[#2B1710] hover:bg-[#EBD8C1] border border-[#EBD8C1]"
              )}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={{
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                image: product.image_url,
                category: product.categories?.name
              } as any} 
              onClick={() => handleProductClick(product)}
            />
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12 text-[#4A2618]/40 font-bold uppercase tracking-widest">
              Nenhum produto disponível nesta categoria no momento.
            </div>
          )}
        </div>

        <ProductModal 
          product={selectedProduct ? {
            id: selectedProduct.id,
            name: selectedProduct.name,
            description: selectedProduct.description,
            price: selectedProduct.price,
            image: selectedProduct.image_url,
            category: selectedProduct.categories?.name
          } as any : null}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </div>
    </section>
  );
}
