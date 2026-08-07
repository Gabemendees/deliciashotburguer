import { useCart } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Cart() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Sheet>
      {/* Floating Button for Mobile */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-40 lg:hidden">
        <SheetTrigger asChild>
          <Button 
            variant="burger" 
            size="xl" 
            className="w-full shadow-2xl shadow-yellow-200 flex justify-between px-8"
            disabled={items.length === 0}
          >
            <div className="flex items-center gap-3">
              <div className="bg-black text-yellow-400 w-7 h-7 rounded-full flex items-center justify-center text-xs">
                {itemCount}
              </div>
              <span>VER CARRINHO</span>
            </div>
            <span className="font-black">{formatCurrency(subtotal)}</span>
          </Button>
        </SheetTrigger>
      </div>

      {/* Trigger for Desktop Header (Optional, used in Header) */}
      <SheetTrigger asChild className="hidden lg:flex">
        <Button variant="outline" className="relative border-2 border-yellow-400 rounded-2xl h-12 px-6">
          <ShoppingCart size={20} className="mr-2" />
          <span className="font-bold">CARRINHO</span>
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-none rounded-l-[40px] overflow-hidden">
        <SheetHeader className="p-8 bg-blue-900 text-white">
          <SheetTitle className="text-2xl font-black flex items-center gap-3 text-white">
            <ShoppingCart className="text-[#FFD700]" />
            Meu Carrinho
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-8">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
              <ShoppingCart size={64} className="mb-4" />
              <p className="font-bold">Seu carrinho está vazio</p>
              <p className="text-sm">Que tal escolher um lanche delicioso?</p>
            </div>
          ) : (
            <div className="space-y-8">
              {items.map((item) => (
                <div key={item.cartId} className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
                    <img 
                      src={item.product.image || "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=200&auto=format&fit=crop"} 
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-black text-blue-900 leading-tight">{item.product.name}</h4>
                      <button 
                        onClick={() => removeItem(item.cartId)}
                        className="text-gray-300 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    {item.additions.length > 0 && (
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-3">
                        + {item.additions.map(a => a.name).join(', ')}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-gray-50 rounded-lg p-1">
                        <button 
                          onClick={() => updateQuantity(item.cartId, Math.max(1, item.quantity - 1))}
                          className="p-1 hover:bg-white rounded transition-all"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="p-1 hover:bg-white rounded transition-all"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-black text-blue-900">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-8 bg-gray-50 border-t space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-bold uppercase tracking-widest">Subtotal</span>
              <span className="font-bold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-bold uppercase tracking-widest">Taxa de entrega</span>
              <span className="text-green-600 font-black">Calculado no checkout</span>
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <span className="text-xl font-black text-blue-900 uppercase">Total</span>
              <span className="text-xl font-black text-blue-900">{formatCurrency(subtotal)}</span>
            </div>
          </div>
          
          <Button 
            variant="burger" 
            size="xl" 
            className="w-full h-16 shadow-lg shadow-yellow-200"
            disabled={items.length === 0}
            onClick={() => {
              // Navegar para checkout (vamos implementar o CheckoutModal em seguida)
              toast.info("Abrindo finalização de pedido...");
            }}
          >
            FINALIZAR PEDIDO
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
