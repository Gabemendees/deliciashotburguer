import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { useCart } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";



export const Route = createFileRoute("/carrinho")({
  component: CartPage,
});

function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCart();
  const navigate = useNavigate();
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
    useCart.persist.rehydrate();
  }, []);
  
  if (!isHydrated) return null;
  
  const subtotal = getSubtotal();
  const deliveryFee = 5.0; // Padrão inicial
  const total = subtotal + deliveryFee;



  return (
    <div className="min-h-screen bg-[#FFF4E6] flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#2B1710] flex items-center gap-3 uppercase italic tracking-tighter">
              SEU PEDIDO 🛒
            </h1>
            <p className="text-[#4A2618] font-medium">Confira seus itens antes de finalizar o pedido.</p>
          </div>
          
          <Link to="/" hash="menu" className="text-sm font-bold text-[#2B1710] hover:text-[#E87524] flex items-center gap-2 transition-colors">
            <ArrowLeft size={16} />
            + COMPRAR MAIS
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-[40px] p-12 text-center shadow-xl shadow-[#2B1710]/5 flex flex-col items-center border border-[#F3E2CC]">
            <div className="w-24 h-24 bg-[#FFF4E6] rounded-full flex items-center justify-center mb-6">
              <ShoppingCart size={48} className="text-[#E87524]" />
            </div>
            <h2 className="text-2xl font-black text-[#2B1710] mb-2 uppercase italic tracking-tighter">SEU CARRINHO ESTÁ VAZIO</h2>
            <p className="text-[#4A2618] mb-8 max-w-xs mx-auto">
              Escolha seus lanches favoritos e monte seu pedido.
            </p>
            <Button 
              variant="burger" 
              size="xl" 
              className="px-12"
              onClick={() => navigate({ to: '/', hash: 'menu' })}
            >
              VER CARDÁPIO
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-[40px] shadow-xl shadow-[#2B1710]/5 border border-[#F3E2CC] overflow-hidden">
                <ScrollArea className="h-full max-h-[60vh]">
                  <div className="p-6 md:p-8 divide-y divide-[#F3E2CC]">
                    {items.map((item) => (
                      <div key={item.cartId} className="py-6 first:pt-0 last:pb-0">
                        <div className="flex gap-4 md:gap-6">
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-[#FFF4E6] rounded-2xl overflow-hidden shrink-0">
                            <img 
                              src={item.product.image || "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=200&auto=format&fit=crop"} 
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h3 className="font-black text-lg text-[#2B1710] truncate uppercase italic tracking-tighter">
                                {item.product.name}
                              </h3>
                              <button 
                                onClick={() => removeItem(item.cartId)}
                                className="text-[#F3E2CC] hover:text-[#C95718] transition-colors p-1"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                            
                            <p className="text-xs text-[#4A2618]/70 line-clamp-2 mb-2 italic">
                              {item.product.description}
                            </p>
                            
                            <div className="mb-2">
                              <p className="text-[10px] font-black text-[#4A2618]/60 uppercase tracking-widest mb-1">Preço unitário + Acréscimos</p>
                              <div className="flex flex-wrap gap-1">
                                <span className="text-[10px] font-black bg-[#F3E2CC] text-[#2B1710] px-2 py-0.5 rounded-full uppercase">
                                  Base: {formatCurrency(item.product.price)}
                                </span>
                                {item.additions.map((add, idx) => (
                                  <span key={idx} className="text-[10px] font-black bg-[#FFF4E6] text-[#E87524] px-2 py-0.5 rounded-full uppercase">
                                    + {add.name}: {formatCurrency(add.price)}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {item.observation && (
                              <div className="mb-4 p-3 bg-[#FFF4E6] rounded-xl border border-[#F3E2CC]">
                                <p className="text-[10px] font-black text-[#E87524] uppercase tracking-tighter mb-1">Deseja remover algo?</p>
                                <p className="text-xs text-[#2B1710] font-medium italic">"{item.observation}"</p>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center bg-[#FFF4E6] rounded-xl p-1 border border-[#F3E2CC]">
                                <button 
                                  onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                  className="p-1.5 hover:bg-white rounded-lg transition-all text-[#4A2618] hover:text-[#2B1710]"
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="w-10 text-center font-black text-[#2B1710]">
                                  {item.quantity}
                                </span>
                                <button 
                                  onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                  className="p-1.5 hover:bg-white rounded-lg transition-all text-[#4A2618] hover:text-[#2B1710]"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                              <span className="font-black text-[#2B1710] text-lg">
                                {formatCurrency(item.totalPrice)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-[#2B1710]/5 border border-[#F3E2CC] sticky top-24">
                <h3 className="text-xl font-black text-[#2B1710] mb-6 uppercase tracking-wider">Resumo</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-[#4A2618] font-bold uppercase tracking-tighter text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#4A2618] font-bold uppercase tracking-tighter text-sm">
                    <span>Taxa de Entrega</span>
                    <span className="text-[#E87524]">{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="pt-4 border-t border-dashed border-[#F3E2CC] flex justify-between">
                    <span className="text-xl font-black text-[#2B1710] uppercase">Total</span>
                    <span className="text-2xl font-black text-[#E87524]">{formatCurrency(total)}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    variant="burger" 
                    size="xl" 
                    className="w-full h-16 shadow-lg shadow-[#E87524]/20 group"
                    onClick={() => navigate({ to: '/checkout' })}
                  >
                    FINALIZAR PEDIDO
                    <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full h-12 border-2 border-[#2B1710] text-[#2B1710] font-black hover:bg-[#FFF4E6]"
                    onClick={() => navigate({ to: '/', hash: 'menu' })}
                  >
                    + COMPRAR MAIS
                  </Button>
                </div>
                
                <p className="text-[10px] text-center text-[#4A2618] mt-6 font-bold uppercase tracking-widest leading-relaxed">
                  Ao clicar em fechar pedido, você será <br /> redirecionado para a entrega.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Toaster position="top-center" />
    </div>
  );
}
