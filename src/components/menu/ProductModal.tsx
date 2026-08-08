import { useState, useMemo, useEffect } from "react";
import { Product, Addition } from "@/types/burger";
import { formatCurrency, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ShoppingCart, CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { Textarea } from "@/components/ui/textarea";
import { ADDITIONS } from "@/lib/data";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [observation, setObservation] = useState("");
  const [selectedAdditions, setSelectedAdditions] = useState<Addition[]>([]);
  const addItem = useCart((state) => state.addItem);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setObservation("");
      setSelectedAdditions([]);
    }
  }, [isOpen]);

  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    const additionsTotal = selectedAdditions.reduce((acc, curr) => acc + curr.price, 0);
    return product.price + additionsTotal;
  }, [product, selectedAdditions]);

  if (!product) return null;

  const handleToggleAddition = (addition: Addition) => {
    setSelectedAdditions(prev => 
      prev.find(a => a.name === addition.name)
        ? prev.filter(a => a.name !== addition.name)
        : [...prev, addition]
    );
  };

  const handleAddToCart = () => {
    addItem(product, 1, selectedAdditions, observation);
    setObservation("");
    setSelectedAdditions([]);
    onClose();
    navigate({ to: '/carrinho' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-[40px] border-none shadow-2xl bg-[#fcfbf8] max-h-[90vh] flex flex-col">
        {/* Header com Imagem */}
        <div className="relative h-56 shrink-0">
          <img
            src={product.image || "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000&auto=format&fit=crop"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
          {/* Informações do Produto */}
          <div className="mb-8">
             <div className="flex justify-between items-start gap-4 mb-3">
               <p className="text-gray-500 text-sm font-medium italic flex-1">
                 {product.description}
               </p>
               <div className="text-right">
                 <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Preço Base</p>
                 <span className="text-xl font-black text-blue-900 whitespace-nowrap">
                   {formatCurrency(product.price)}
                 </span>
               </div>
             </div>
          </div>

          <div className="space-y-8">
            {/* Seção: DESEJA REMOVER ALGO? */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-l-4 border-yellow-400 pl-4">
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">
                  DESEJA REMOVER ALGO?
                </h3>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase">Opcional</span>
              </div>
              
              <Textarea 
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Deseja remover algo ou fazer alguma observação? Ex: Sem cebola, sem milho, sem salada..."
                className="rounded-2xl border-gray-200 min-h-[100px] focus-visible:ring-yellow-400 bg-white shadow-sm resize-none p-4"
              />
              <p className="text-[10px] text-gray-400 font-medium italic">
                Exemplos: "Sem cebola", "Sem tomate", "Caprichar no molho"...
              </p>
            </div>

            {/* Seção: ADICIONE AO SEU LANCHE */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-l-4 border-blue-900 pl-4">
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">
                  ADICIONE AO SEU LANCHE
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ADDITIONS.map((addition) => {
                  const isSelected = selectedAdditions.some(a => a.name === addition.name);
                  return (
                    <div 
                      key={addition.name}
                      onClick={() => handleToggleAddition(addition)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group",
                        isSelected 
                          ? "border-yellow-400 bg-yellow-50/50 shadow-md shadow-yellow-100" 
                          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                          isSelected ? "bg-yellow-400 border-yellow-400 text-blue-900" : "border-gray-300 bg-white"
                        )}>
                          {isSelected && <CheckCircle2 size={14} className="fill-current" />}
                        </div>
                        <span className={cn(
                          "text-sm font-black transition-colors",
                          isSelected ? "text-blue-900" : "text-gray-600 group-hover:text-blue-900"
                        )}>
                          {addition.name}
                        </span>
                      </div>
                      <span className={cn(
                        "text-xs font-black px-2 py-1 rounded-lg",
                        isSelected ? "bg-yellow-400 text-blue-900" : "bg-gray-100 text-gray-500"
                      )}>
                        + {formatCurrency(addition.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer com Preço e Botão */}
        <div className="p-8 bg-white border-t border-gray-100 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Valor Total</p>
              <span className="text-3xl font-black text-red-600 drop-shadow-sm">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            
            <Button
              variant="burger"
              size="xl"
              className="w-full sm:w-auto px-10 h-16 rounded-2xl shadow-xl shadow-yellow-200 group text-lg"
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