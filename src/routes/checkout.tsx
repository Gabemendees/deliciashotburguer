import { useState, useMemo, useEffect } from "react";
import { useCart } from "@/lib/store";
import { formatCurrency, cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";

import { DELIVERY_AREAS, WHATSAPP_NUMBER } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate store on mount
  useEffect(() => {
    setIsHydrated(true);
    useCart.persist.rehydrate();
  }, []);



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
        if (item.observation) {
          message += `   _Remover/Obs: ${item.observation}_\n`;
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
      navigate({ to: '/' });
    } catch (error) {
      toast.error("Erro ao enviar pedido.");
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated) return null;

  if (items.length === 0) {
    navigate({ to: '/carrinho' });
    return null;
  }


  return (
    <div className="min-h-screen bg-[#fcfbf8] flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h1 className="text-3xl font-black text-blue-900 mb-8 uppercase tracking-tighter italic">Finalizar Pedido</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-100 border border-gray-100">
              <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest border-b pb-4 mb-6">1. Seus Dados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Seu Nome</Label>
                  <Input 
                    id="name" 
                    placeholder="Como podemos te chamar?" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl h-12"
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
                    className="rounded-xl h-12"
                  />
                </div>
              </div>
            </div>

            {/* Entrega */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-100 border border-gray-100">
              <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest border-b pb-4 mb-6">2. Entrega ou Retirada</h3>
              
              <RadioGroup 
                defaultValue="delivery" 
                onValueChange={(v) => setOrderType(v as any)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
              >
                <div className={cn(
                  "flex items-center space-x-3 p-6 rounded-2xl border transition-all cursor-pointer",
                  orderType === "delivery" ? "bg-red-50 border-red-200" : "bg-white border-gray-100"
                )}>
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="font-bold cursor-pointer">Entrega em casa</Label>
                </div>
                <div className={cn(
                  "flex items-center space-x-3 p-6 rounded-2xl border transition-all cursor-pointer",
                  orderType === "pickup" ? "bg-red-50 border-red-200" : "bg-white border-gray-100"
                )}>
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="font-bold cursor-pointer">Retirada no local</Label>
                </div>
              </RadioGroup>

              {orderType === "delivery" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                  <div className="space-y-2">
                    <Label>Bairro</Label>
                    <Select required onValueChange={setNeighborhood}>
                      <SelectTrigger className="rounded-xl h-12">
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
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label>Rua</Label>
                      <Input 
                        required 
                        value={address.street}
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Número</Label>
                      <Input 
                        required 
                        value={address.number}
                        onChange={(e) => setAddress({...address, number: e.target.value})}
                        className="rounded-xl h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Complemento (opcional)</Label>
                      <Input 
                        value={address.complement}
                        onChange={(e) => setAddress({...address, complement: e.target.value})}
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ponto de referência</Label>
                      <Input 
                        value={address.reference}
                        onChange={(e) => setAddress({...address, reference: e.target.value})}
                        className="rounded-xl h-12"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pagamento */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-100 border border-gray-100">
              <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest border-b pb-4 mb-6">3. Pagamento</h3>
              
              <RadioGroup 
                defaultValue="pix" 
                onValueChange={(v) => setPayment(v as any)}
                className="grid grid-cols-2 gap-4 mb-6"
              >
                {['pix', 'dinheiro', 'credito', 'debito'].map((p) => (
                  <div key={p} className={cn(
                    "flex items-center space-x-3 p-6 rounded-2xl border transition-all cursor-pointer",
                    payment === p ? "bg-red-50 border-red-200" : "bg-white border-gray-100"
                  )}>
                    <RadioGroupItem value={p} id={p} />
                    <Label htmlFor={p} className="font-bold cursor-pointer uppercase text-xs tracking-widest">{p}</Label>
                  </div>
                ))}
              </RadioGroup>

              {payment === "dinheiro" && (
                <div className="space-y-4 pt-2 animate-in fade-in">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="change" 
                      onCheckedChange={(checked) => setNeedsChange(checked as boolean)} 
                    />
                    <Label htmlFor="change" className="font-bold">Precisa de troco?</Label>
                  </div>
                  {needsChange && (
                    <div className="space-y-2 max-w-[200px]">
                      <Label>Troco para quanto?</Label>
                      <Input 
                        type="text" 
                        placeholder="R$ 0,00" 
                        value={changeAmount}
                        onChange={(e) => setChangeAmount(e.target.value)}
                        className="rounded-xl h-12"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Observação */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-100 border border-gray-100">
              <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest border-b pb-4 mb-6">4. Observações</h3>
              <Textarea 
                placeholder="Ex: Tirar cebola, maionese à parte, caprichar no bacon..." 
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="rounded-2xl min-h-[120px] p-6"
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-100 border border-gray-100 sticky top-24">
              <h3 className="text-xl font-black text-blue-900 mb-6 uppercase tracking-wider">Seu Pedido</h3>
              
              <ScrollArea className="max-h-[30vh] mb-6 pr-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.cartId} className="flex justify-between text-sm gap-4">
                      <div className="font-bold text-gray-600">
                        {item.quantity}x {item.product.name}
                      </div>
                      <div className="font-black text-blue-900">{formatCurrency(item.totalPrice)}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="space-y-4 pt-6 border-t border-dashed border-gray-200">
                <div className="flex justify-between text-gray-500 font-bold uppercase tracking-tighter text-xs">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {orderType === "delivery" && (
                  <div className="flex justify-between text-gray-500 font-bold uppercase tracking-tighter text-xs">
                    <span>Taxa de Entrega</span>
                    <span className="text-green-600">{formatCurrency(deliveryFee)}</span>
                  </div>
                )}
                <div className="pt-4 flex justify-between">
                  <span className="text-xl font-black text-blue-900 uppercase">Total</span>
                  <span className="text-2xl font-black text-red-600">{formatCurrency(total)}</span>
                </div>
              </div>
              
              <Button 
                type="submit" 
                variant="burger" 
                size="xl" 
                className="w-full h-16 shadow-xl shadow-yellow-200 mt-8"
                disabled={loading}
              >
                {loading ? "ENVIANDO..." : "CONFIRMAR PEDIDO"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
