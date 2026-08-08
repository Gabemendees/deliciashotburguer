import { useCart } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";


export function Cart() {
  const { items, subtotal } = useCart();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    useCart.persist.rehydrate();
  }, []);

  if (!isHydrated) return null;

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);


  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 z-40 lg:hidden">
      <Link to="/carrinho">
        <Button 
          variant="burger" 
          size="xl" 
          className="w-full shadow-2xl shadow-yellow-200 flex justify-between px-8"
        >
          <div className="flex items-center gap-3">
            <div className="bg-black text-yellow-400 w-7 h-7 rounded-full flex items-center justify-center text-xs">
              {itemCount}
            </div>
            <span>VER CARRINHO</span>
          </div>
          <span className="font-black">{formatCurrency(subtotal)}</span>
        </Button>
      </Link>
    </div>
  );
}

