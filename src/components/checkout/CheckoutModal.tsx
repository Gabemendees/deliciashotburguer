import { useState, useMemo } from "react";
import { useCart } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { DELIVERY_AREAS, WHATSAPP_NUMBER } from "@/lib/data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState({ street: "", number: "", complement: "", reference: "" });
  const [payment, setPayment] = useState<"dinheiro" | "pix" | "credito" | "debito">("pix");
  const [needsChange, setNeedsChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState("");
  const [observation, setObservation] = useState("");

  const deliveryFee = useMemo(() => {
    if (orderType === "pickup") return 0;
    const area = DELIVERY_AREAS.find((a) => a.neighborhood === neighborhood);
    return area ? area.fee : 0;
  }, [orderType, neighborhood]);

  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Formatação da mensagem para o WhatsApp
      let message = `*NOVO PEDIDO — DELÍCIA'S HOT BURGUER'S*\n\n`;
      message += `*Nome:* ${name}\n`;
      message += `*WhatsApp:* ${phone}\n\n`;
      
      message += `*ITENS:*\n`;
      items.forEach((item) => {
        message += `• ${item.quantity}x ${item.product.name}\n`;
        if (item.additions.length > 0) {
          message += `   _Adicionais: ${item.additions.map((a) => a.name).join(", ")}_\n`;
        }
        message += `   Preço: ${formatCurrency(item.totalPrice)}\n\n`;
      });

      message += `*Subtotal:* ${formatCurrency(subtotal)}\n`;
      if (orderType === "delivery") {
        message += `*Taxa de entrega:* ${formatCurrency(deliveryFee)}\n`;
      }
      message += `*TOTAL: ${formatCurrency(total)}*\n\n`;

      if (orderType === "delivery") {
        message += `*ENDEREÇO DE ENTREGA:*\n`;
        message += `Rua: ${address.street}, ${address.number}\n`;
        message += `Bairro: ${neighborhood}\n`;
        if (address.complement) message += `Comp: ${address.complement}\n`;
        if (address.reference) message += `Ref: ${address.reference}\n\n`;
      } else {
        message += `*MODALIDADE: Retirada no local*\n\n`;
      }

      message += `*FORMA DE PAGAMENTO:* ${payment.toUpperCase()}\n`;
      if (payment === "dinheiro" && needsChange) {
        message += `Precisa de troco para: ${formatCurrency(parseFloat(changeAmount.replace(",", ".")))}\n`;
      }
      
      if (observation) {
        message += `\n*OBSERVAÇÃO:* ${observation}`;
      }

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://api.whatsapp.com/send?phone=55${WHATSAPP_NUMBER.replace(/\D/g, "")}&text=${encodedMessage}`;
      
      window.open(whatsappUrl, "_blank");
      
      toast.success("Pedido enviado com sucesso!");
      clearCart();
      onClose();
    } catch (error) {
      toast.error("Erro ao enviar pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-[32px] border-none shadow-2xl">
        <DialogHeader className="p-8 bg-blue-900 text-white">
          <DialogTitle className="text-2xl font-black text-white">Finalizar Pedido</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
          <ScrollArea className="flex-1 p-8">
            <div className="space-y-8">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest border-b pb-2">Seus Dados</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Seu Nome</Label>
                    <Input 
                      id="name" 
                      placeholder="Como podemos te chamar?" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Seu WhatsApp</Label>
                    <Input 
                      id="phone" 
                      placeholder="(00) 00000-0000" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Tipo de Pedido */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest border-b pb-2">Como prefere?</h3>
                <RadioGroup 
                  defaultValue="delivery" 
                  onValueChange={(v) => setOrderType(v as any)}
                  className="flex gap-4"
                >
                  <div className={cn(
                    "flex-1 flex items-center space-x-2 p-4 rounded-2xl border transition-all",
                    orderType === "delivery" ? "bg-red-50 border-red-200" : "bg-white border-gray-100"
                  )}>
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery" className="font-bold cursor-pointer">Entrega</Label>
                  </div>
                  <div className={cn(
                    "flex-1 flex items-center space-x-2 p-4 rounded-2xl border transition-all",
                    orderType === "pickup" ? "bg-red-50 border-red-200" : "bg-white border-gray-100"
                  )}>
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="font-bold cursor-pointer">Retirada</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Endereço (se entrega) */}
              {orderType === "delivery" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest border-b pb-2">Endereço de Entrega</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Bairro</Label>
                      <Select required onValueChange={setNeighborhood}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Selecione seu bairro" />
                        </SelectTrigger>
                        <SelectContent>
                          {DELIVERY_AREAS.map((area) => (
                            <SelectItem key={area.neighborhood} value={area.neighborhood}>
                              {area.neighborhood} ({formatCurrency(area.fee)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-3 space-y-2">
                        <Label>Rua</Label>
                        <Input 
                          required 
                          value={address.street}
                          onChange={(e) => setAddress({...address, street: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Número</Label>
                        <Input 
                          required 
                          value={address.number}
                          onChange={(e) => setAddress({...address, number: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Complemento (opcional)</Label>
                        <Input 
                          value={address.complement}
                          onChange={(e) => setAddress({...address, complement: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ponto de referência</Label>
                        <Input 
                          value={address.reference}
                          onChange={(e) => setAddress({...address, reference: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pagamento */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest border-b pb-2">Pagamento</h3>
                <RadioGroup 
                  defaultValue="pix" 
                  onValueChange={(v) => setPayment(v as any)}
                  className="grid grid-cols-2 gap-2"
                >
                  {['pix', 'dinheiro', 'credito', 'debito'].map((p) => (
                    <div key={p} className={cn(
                      "flex items-center space-x-2 p-4 rounded-2xl border transition-all",
                      payment === p ? "bg-red-50 border-red-200" : "bg-white border-gray-100"
                    )}>
                      <RadioGroupItem value={p} id={p} />
                      <Label htmlFor={p} className="font-bold cursor-pointer uppercase text-xs">{p}</Label>
                    </div>
                  ))}
                </RadioGroup>

                {payment === "dinheiro" && (
                  <div className="space-y-4 pt-2 animate-in fade-in">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="change" 
                        onCheckedChange={(checked) => setNeedsChange(checked as boolean)} 
                      />
                      <Label htmlFor="change">Precisa de troco?</Label>
                    </div>
                    {needsChange && (
                      <div className="space-y-2">
                        <Label>Troco para quanto?</Label>
                        <Input 
                          type="text" 
                          placeholder="R$ 0,00" 
                          value={changeAmount}
                          onChange={(e) => setChangeAmount(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Observação */}
              <div className="space-y-2">
                <Label htmlFor="obs">Alguma observação? (Opcional)</Label>
                <Textarea 
                  id="obs" 
                  placeholder="Ex: Tirar cebola, maionese à parte..." 
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="rounded-xl min-h-[100px]"
                />
              </div>
            </div>
          </ScrollArea>

          <div className="p-8 bg-gray-50 border-t">
            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-blue-900 font-bold">
                <span>Total do Pedido</span>
                <span className="text-2xl font-black">{formatCurrency(total)}</span>
              </div>
            </div>
            <Button 
              type="submit" 
              variant="burger" 
              size="xl" 
              className="w-full h-16 shadow-xl shadow-yellow-200"
              disabled={loading || items.length === 0}
            >
              {loading ? "ENVIANDO..." : "CONFIRMAR E ENVIAR WHATSAPP"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
