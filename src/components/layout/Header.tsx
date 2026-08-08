import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";


export function Header() {
  const { items, subtotal } = useCart();
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
    useCart.persist.rehydrate();
  }, []);

  const itemCount = isHydrated ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const currentSubtotal = isHydrated ? subtotal : 0;


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex flex-col">
          <span className="text-xl font-black text-red-600 leading-none">DELÍCIA'S</span>
          <span className="text-sm font-bold text-blue-900 tracking-tighter">HOT BURGUER'S</span>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-6">
          <Link to="/" className="text-xs font-bold text-blue-900 uppercase tracking-widest hover:text-red-600 transition-colors">Início</Link>
          <Link to="/#menu" className="text-xs font-bold text-blue-900 uppercase tracking-widest hover:text-red-600 transition-colors">Cardápio</Link>
          <Link to="/#menu" className="text-xs font-bold text-blue-900 uppercase tracking-widest hover:text-red-600 transition-colors">Hot Dogs</Link>
          <Link to="/#menu" className="text-xs font-bold text-blue-900 uppercase tracking-widest hover:text-red-600 transition-colors">Hambúrgueres</Link>
          <Link to="/#menu" className="text-xs font-bold text-blue-900 uppercase tracking-widest hover:text-red-600 transition-colors">Bebidas</Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-yellow-800 uppercase tracking-tighter">Aberto</span>
          </div>

          
          <Link to="/carrinho" className="relative flex items-center gap-2 bg-white border-2 border-yellow-400 rounded-2xl h-11 px-4 hover:bg-yellow-50 transition-all">


            <span className="text-xl">🛒</span>
            {itemCount > 0 && (
              <>
                <span className="hidden lg:inline text-xs font-black text-blue-900">
                  {itemCount} {itemCount === 1 ? 'item' : 'itens'} — {formatCurrency(currentSubtotal)}
                </span>

                <span className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
                  {itemCount}
                </span>
              </>
            )}
            {itemCount === 0 && <span className="hidden lg:inline text-xs font-black text-blue-900">CARRINHO</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}

