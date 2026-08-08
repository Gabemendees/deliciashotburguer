import { useState, useMemo, useEffect } from "react";
import { Product, Addition } from "@/types/burger";
import { formatCurrency, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { Textarea } from "@/components/ui/textarea";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [observation, setObservation] = useState("");
  const addItem = useCart((state) => state.addItem);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setObservation("");
    }
  }, [isOpen]);

  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return product.price;
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product, 1, [], observation);
    setObservation("");
    onClose();
    navigate({ to: '/carrinho' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[32px] border-none shadow-2xl bg-white">
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

          {/* Observação */}
          <div className="mb-8">
            <label className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 block">
              OBSERVAÇÃO DO PEDIDO
            </label>
            <Textarea 
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Deseja remover algo ou fazer alguma observação? Ex: Sem cebola, sem tomate..."
              className="rounded-2xl border-gray-100 min-h-[100px] focus-visible:ring-yellow-400 bg-gray-50/50"
            />
          </div>

          <Button
            variant="burger"
            size="lg"
            className="w-full h-16 rounded-2xl shadow-xl shadow-yellow-100 group"
            onClick={handleAddToCart}
          >
            ADICIONAR AO CARRINHO — {formatCurrency(totalPrice)}
            <ShoppingCart className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
