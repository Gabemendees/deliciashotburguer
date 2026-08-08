import { useState, useMemo, useEffect } from "react";
import { Product, Addition } from "@/types/burger";
import { formatCurrency, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ShoppingCart, CheckCircle2, Minus, Plus, Loader2 } from "lucide-react";
import { useCart } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { getPublicAdditions } from "@/lib/database.functions";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [observation, setObservation] = useState("");
  const [selectedAdditions, setSelectedAdditions] = useState<Addition[]>([]);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((state) => state.addItem);
  const navigate = useNavigate();

  const { data: additions = [], isLoading: isLoadingAdditions } = useQuery({
    queryKey: ['public-additions'],
    queryFn: () => getPublicAdditions(),
  });

  useEffect(() => {
    if (isOpen) {
      setObservation("");
      setSelectedAdditions([]);
      setQuantity(1);
    }
  }, [isOpen]);

  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    const additionsTotal = selectedAdditions.reduce((acc, curr) => acc + curr.price, 0);
    return (product.price + additionsTotal) * quantity;
  }, [product, selectedAdditions, quantity]);

  if (!product) return null;

  const handleToggleAddition = (addition: Addition) => {
    setSelectedAdditions(prev => 
      prev.find(a => a.name === addition.name)
        ? prev.filter(a => a.name !== addition.name)
        : [...prev, addition]
    );
  };

  const handleAddToCart = () => {
    addItem(product, quantity, selectedAdditions, observation);
    setObservation("");
    setSelectedAdditions([]);
    setQuantity(1);
    onClose();
    navigate({ to: '/carrinho' });
  };

  const activeAdditions = additions.filter((a: any) => a.is_available);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-[40px] border-none shadow-2xl bg-[#FFF4E6] max-h-[90vh] flex flex-col">
        {/* Header com Imagem */}
        <div className="relative h-56 shrink-0">
          <img
            src={product.image || "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000&auto=format&fit=crop"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B1710]/80 to-transparent" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full backdrop-blur-md hover:bg-white/40 transition-all z-10"
          >
            <X size={20} />
          </button>
          
          <div className="absolute bottom-6 left-8 right-8">
            <h2 className="text-3xl font-black text-white leading-tight drop-shadow-lg uppercase italic tracking-tighter">
              {product.name}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-6">
          <div className="flex items-center justify-between mb-6 border-b border-[#F3E2CC] pb-4">
            <h1 className="text-xl font-black text-[#2B1710] uppercase tracking-widest">MONTE SEU LANCHE</h1>
            
            <div className="flex items-center bg-[#FFF4E6] rounded-xl p-1 border border-[#F3E2CC]">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 hover:bg-white rounded-lg transition-all text-[#4A2618] hover:text-[#2B1710]"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-black text-[#2B1710]">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-1.5 hover:bg-white rounded-lg transition-all text-[#4A2618] hover:text-[#2B1710]"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          {/* Informações do Produto */}
          <div className="mb-8">
             <div className="flex justify-between items-start gap-4 mb-3">
               <p className="text-[#4A2618] text-sm font-medium italic flex-1">
                 {product.description}
               </p>
               <div className="text-right">
                 <p className="text-xs font-black text-[#4A2618]/60 uppercase tracking-widest mb-1">Preço Base</p>
                 <span className="text-xl font-black text-[#2B1710] whitespace-nowrap">
                   {formatCurrency(product.price)}
                 </span>
               </div>
             </div>
          </div>

          <div className="space-y-8">
            {/* Seção: DESEJA REMOVER ALGO? */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-l-4 border-[#E87524] pl-4">
                <h3 className="text-sm font-black text-[#2B1710] uppercase tracking-widest">
                  DESEJA REMOVER ALGO?
                </h3>
              </div>
              
              <Textarea 
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Deseja remover algo ou fazer alguma observação?"
                className="rounded-2xl border-[#F3E2CC] min-h-[100px] focus-visible:ring-[#E87524] bg-white shadow-sm resize-none p-4 text-[#2B1710]"
              />
            </div>

            {/* Seção: ADICIONE AO SEU LANCHE */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-l-4 border-[#2B1710] pl-4">
                <h3 className="text-sm font-black text-[#2B1710] uppercase tracking-widest">
                  ADICIONE AO SEU LANCHE
                </h3>
              </div>
              
              {isLoadingAdditions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-[#E87524]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeAdditions.map((addition: any) => {
                    const isSelected = selectedAdditions.some(a => a.name === addition.name);
                    return (
                      <div 
                        key={addition.id}
                        onClick={() => handleToggleAddition(addition)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group",
                          isSelected 
                            ? "border-[#E87524] bg-[#FFF4E6] shadow-md shadow-[#E87524]/10" 
                            : "border-[#F3E2CC] bg-white hover:border-[#EBD8C1] hover:shadow-sm"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                            isSelected ? "bg-[#E87524] border-[#E87524] text-white" : "border-[#F3E2CC] bg-white"
                          )}>
                            {isSelected && <CheckCircle2 size={14} className="fill-current" />}
                          </div>
                          <span className={cn(
                            "text-sm font-black transition-colors",
                            isSelected ? "text-[#E87524]" : "text-[#4A2618] group-hover:text-[#2B1710]"
                          )}>
                            {addition.name}
                          </span>
                        </div>
                        <span className={cn(
                          "text-xs font-black px-2 py-1 rounded-lg",
                          isSelected ? "bg-[#E87524] text-white" : "bg-[#F3E2CC] text-[#4A2618]"
                        )}>
                          + {formatCurrency(Number(addition.price))}
                        </span>
                      </div>
                    );
                  })}
                  {activeAdditions.length === 0 && (
                    <div className="col-span-full text-center py-4 text-[#4A2618]/40 font-bold uppercase text-[10px] tracking-widest">
                      Nenhum acréscimo disponível.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer com Preço e Botão */}
        <div className="p-8 bg-white border-t border-[#F3E2CC] shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-black text-[#4A2618]/60 uppercase tracking-[0.2em] mb-1">TOTAL DO PEDIDO</p>
              <span className="text-3xl font-black text-[#E87524] drop-shadow-sm">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            
            <Button
              variant="burger"
              size="xl"
              className="w-full sm:w-auto px-10 h-16 rounded-2xl shadow-xl shadow-[#E87524]/20 group text-lg"
              onClick={handleAddToCart}
            >
              ADICIONAR AO CARRINHO
              <ShoppingCart className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
