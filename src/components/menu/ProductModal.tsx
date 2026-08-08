import { useState, useMemo } from "react";
import { Product, Addition } from "@/types/burger";
import { ADDITIONS } from "@/lib/data";
import { formatCurrency, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/store";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";


interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAdditions, setSelectedAdditions] = useState<Addition[]>([]);
  const addItem = useCart((state) => state.addItem);
  const navigate = useNavigate();


  if (!product) return null;

  const totalPrice = useMemo(() => {
    const additionsPrice = selectedAdditions.reduce((acc, curr) => acc + curr.price, 0);
    return (product.price + additionsPrice) * quantity;
  }, [product, quantity, selectedAdditions]);

  const toggleAddition = (addition: Addition) => {
    setSelectedAdditions((prev) =>
      prev.some((a) => a.name === addition.name)
        ? prev.filter((a) => a.name !== addition.name)
        : [...prev, addition]
    );
  };

  const handleAddToCart = () => {
    addItem(product, quantity, selectedAdditions);
    toast.success(`${product.name} adicionado ao carrinho!`, {
      description: `Quantidade: ${quantity}`,
      duration: 2000,
    });
    setQuantity(1);
    setSelectedAdditions([]);
    onClose();
    navigate({ to: '/carrinho' });
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[32px] border-none shadow-2xl">
        <div className="relative h-64">
          <img
            src={product.image || "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000&auto=format&fit=crop"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/70 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl font-black text-blue-900 leading-tight">
                  {product.name}
                </DialogTitle>
                <p className="text-gray-500 mt-2 text-sm italic">{product.description}</p>
              </div>
              <span className="text-2xl font-black text-blue-900 whitespace-nowrap ml-4">
                {product.price > 0 ? formatCurrency(product.price) : '--'}
              </span>
            </div>
          </DialogHeader>

          {/* Adicionais */}
          <div className="mb-8">
            <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Plus size={16} className="text-red-600" />
              Adicionais
            </h4>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 no-scrollbar">
              {ADDITIONS.map((addition) => (
                <button
                  key={addition.name}
                  onClick={() => toggleAddition(addition)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-2xl border transition-all text-xs font-bold",
                    selectedAdditions.some((a) => a.name === addition.name)
                      ? "bg-red-50 border-red-200 text-red-700 shadow-sm shadow-red-100"
                      : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                  )}
                >
                  <span className="truncate">{addition.name}</span>
                  <span className="ml-1 opacity-60">+{formatCurrency(addition.price)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade e Botão */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t">
            <div className="flex items-center bg-gray-100 p-1 rounded-2xl">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 text-gray-500 hover:text-blue-900 hover:bg-white rounded-xl transition-all"
              >
                <Minus size={20} />
              </button>
              <span className="w-12 text-center font-black text-xl text-blue-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 text-gray-500 hover:text-blue-900 hover:bg-white rounded-xl transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <Button
              variant="burger"
              size="lg"
              className="flex-1 w-full h-14"
              onClick={handleAddToCart}
            >
              ADICIONAR — {formatCurrency(totalPrice)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
