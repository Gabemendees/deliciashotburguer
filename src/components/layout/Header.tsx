import { ShoppingCart, ChevronDown, Clock } from "lucide-react";
import { useCart } from "@/lib/store";
import { formatCurrency, cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStoreConfig } from "@/lib/database.functions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


export function Header() {
  const { items, getSubtotal, isHydrated } = useCart();
  
  useEffect(() => {
    if (!isHydrated) {
      useCart.persist.rehydrate();
    }
  }, [isHydrated]);

  const { data: config } = useQuery({
    queryKey: ['store-config'],
    queryFn: () => getStoreConfig(),
  });

  const isStoreOpen = config?.['is_store_open'] ?? true;
  const storeHours = config?.['store_hours'] ?? { open: "18:00", close: "23:30" };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const currentSubtotal = getSubtotal();


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#2B1710] shadow-md">
      <div className="container mx-auto px-4 h-24 lg:h-16 flex items-center justify-between">
        <Link to="/" className="flex flex-col">
          <span className="text-xl font-black text-[#FFF4E6] leading-none">DELÍCIA'S</span>
          <span className="text-sm font-bold text-[#E87524] tracking-tighter">HOT BURGUER'S</span>
        </Link>
        
        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[50%] py-2">
          <Link to="/" className="text-[10px] font-bold text-[#F3E2CC] uppercase whitespace-nowrap px-2 py-1 bg-[#4A2618] rounded">Início</Link>
          <Link to="/" hash="menu" search={{ category: 'HOT DOGS' }} className="text-[10px] font-bold text-[#F3E2CC] uppercase whitespace-nowrap px-2 py-1 bg-[#4A2618] rounded">Hot Dogs</Link>
          <Link to="/" hash="menu" search={{ category: 'HAMBÚRGUERES' }} className="text-[10px] font-bold text-[#F3E2CC] uppercase whitespace-nowrap px-2 py-1 bg-[#4A2618] rounded">Burgers</Link>
          <Link to="/" hash="menu" search={{ category: 'BEBIDAS' }} className="text-[10px] font-bold text-[#F3E2CC] uppercase whitespace-nowrap px-2 py-1 bg-[#4A2618] rounded">Bebidas</Link>
          <Link to="/" hash="menu" search={{ category: 'SOBREMESAS' }} className="text-[10px] font-bold text-[#F3E2CC] uppercase whitespace-nowrap px-2 py-1 bg-[#4A2618] rounded">Sobremesas</Link>
        </div>
        
        <nav className="hidden lg:flex items-center gap-6">
          <Link to="/" className="text-xs font-bold text-[#F3E2CC] uppercase tracking-widest hover:text-[#E87524] transition-colors">Início</Link>
          
          <Link to="/" hash="menu" search={{ category: 'HOT DOGS' }} className="text-xs font-bold text-[#F3E2CC] uppercase tracking-widest hover:text-[#E87524] transition-colors">Hot Dogs</Link>
          <Link to="/" hash="menu" search={{ category: 'HAMBÚRGUERES' }} className="text-xs font-bold text-[#F3E2CC] uppercase tracking-widest hover:text-[#E87524] transition-colors">Hambúrgueres</Link>
          <Link to="/" hash="menu" search={{ category: 'BEBIDAS' }} className="text-xs font-bold text-[#F3E2CC] uppercase tracking-widest hover:text-[#E87524] transition-colors">Bebidas</Link>
          <Link to="/" hash="menu" search={{ category: 'SOBREMESAS' }} className="text-xs font-bold text-[#F3E2CC] uppercase tracking-widest hover:text-[#E87524] transition-colors">Sobremesas</Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-[#4A2618] px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-[#F3E2CC] uppercase tracking-tighter">Aberto</span>
          </div>

          <Link to="/carrinho" className="relative flex items-center gap-2 bg-[#FFF4E6] border-2 border-[#E87524] rounded-2xl h-11 px-4 hover:bg-[#F3E2CC] transition-all">
            <span className="text-xl">🛒</span>
            {itemCount > 0 && (
              <>
                <span className="hidden lg:inline text-xs font-black text-[#2B1710]">
                  {itemCount} — {formatCurrency(currentSubtotal)}
                </span>
                <span className="absolute -top-2 -right-2 bg-[#E87524] text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-[#2B1710]">
                  {itemCount}
                </span>
              </>
            )}
            {itemCount === 0 && <span className="hidden lg:inline text-xs font-black text-[#2B1710]">CARRINHO</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}

