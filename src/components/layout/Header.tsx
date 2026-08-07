import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Cart } from "@/components/cart/Cart";


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xl font-black text-red-600 leading-none">DELÍCIA'S</span>
          <span className="text-sm font-bold text-blue-900 tracking-tighter">HOT BURGUER'S</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-yellow-800 uppercase tracking-tighter">Aberto</span>
          </div>
          <Cart />
        </div>

      </div>
    </header>
  );
}
