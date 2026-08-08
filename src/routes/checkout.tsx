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
  const { items, getSubtotal, clearCart } = useCart();
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
  

  const subtotal = useMemo(() => getSubtotal(), [items, getSubtotal]);

  const deliveryFee = useMemo(() => {
    if (orderType === "pickup") return 0;
    const area = DELIVERY_AREAS.find((a) => a.neighborhood === neighborhood);
    return area ? area.fee : 0;
  }, [orderType, neighborhood]);

  const total = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);

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
    <div className="min-h-screen bg-[#FFF4E6] flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h1 className="text-3xl font-black text-[#2B1710] mb-8 uppercase tracking-tighter italic border-b-4 border-[#E87524] inline-block pb-2">Finalizar Pedido</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-[#2B1710]/5 border border-[#F3E2CC]">
              <h3 className="text-sm font-black text-[#2B1710] uppercase tracking-widest border-b border-[#F3E2CC] pb-4 mb-6">1. Seus Dados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#4A2618] font-bold">Seu Nome</Label>
                  <Input 
                    id="name" 
                    placeholder="Como podemos te chamar?" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl h-12 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#4A2618] font-bold">Seu WhatsApp</Label>
                  <Input 
                    id="phone" 
                    placeholder="(00) 00000-0000" 
                    required 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl h-12 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710]"
                  />
                </div>
              </div>
            </div>

            {/* Entrega */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-[#2B1710]/5 border border-[#F3E2CC]">
              <h3 className="text-sm font-black text-[#2B1710] uppercase tracking-widest border-b border-[#F3E2CC] pb-4 mb-6">2. Entrega ou Retirada</h3>
              
              <RadioGroup 
                defaultValue="delivery" 
                onValueChange={(v) => setOrderType(v as any)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
              >
                <div className={cn(
                  "flex items-center space-x-3 p-6 rounded-2xl border transition-all cursor-pointer",
                  orderType === "delivery" ? "bg-[#FFF4E6] border-[#E87524]" : "bg-white border-[#F3E2CC]"
                )}>
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="font-bold cursor-pointer text-[#2B1710]">Entrega em casa</Label>
                </div>
                <div className={cn(
                  "flex items-center space-x-3 p-6 rounded-2xl border transition-all cursor-pointer",
                  orderType === "pickup" ? "bg-[#FFF4E6] border-[#E87524]" : "bg-white border-[#F3E2CC]"
                )}>
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="font-bold cursor-pointer text-[#2B1710]">Retirada no local</Label>
                </div>
              </RadioGroup>

              {orderType === "delivery" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                  <div className="space-y-2">
                    <Label className="text-[#4A2618] font-bold">Bairro</Label>
                    <Select required onValueChange={setNeighborhood}>
                      <SelectTrigger className="rounded-xl h-12 border-[#F3E2CC] focus:ring-[#E87524] text-[#2B1710]">
                        <SelectValue placeholder="Selecione seu bairro" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#F3E2CC]">
                        {DELIVERY_AREAS.map((area) => (
                          <SelectItem key={area.neighborhood} value={area.neighborhood} className="focus:bg-[#FFF4E6] focus:text-[#E87524]">
                            {area.neighborhood} ({formatCurrency(area.fee)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label className="text-[#4A2618] font-bold">Rua</Label>
                      <Input 
                        required 
                        value={address.street}
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                        className="rounded-xl h-12 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#4A2618] font-bold">Número</Label>
                      <Input 
                        required 
                        value={address.number}
                        onChange={(e) => setAddress({...address, number: e.target.value})}
                        className="rounded-xl h-12 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#4A2618] font-bold">Complemento (opcional)</Label>
                      <Input 
                        value={address.complement}
                        onChange={(e) => setAddress({...address, complement: e.target.value})}
                        className="rounded-xl h-12 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#4A2618] font-bold">Ponto de referência</Label>
                      <Input 
                        value={address.reference}
                        onChange={(e) => setAddress({...address, reference: e.target.value})}
                        className="rounded-xl h-12 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pagamento */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-[#2B1710]/5 border border-[#F3E2CC]">
              <h3 className="text-sm font-black text-[#2B1710] uppercase tracking-widest border-b border-[#F3E2CC] pb-4 mb-6">3. Pagamento</h3>
              
              <RadioGroup 
                defaultValue="pix" 
                onValueChange={(v) => setPayment(v as any)}
                className="grid grid-cols-2 gap-4 mb-6"
              >
                {['pix', 'dinheiro', 'credito', 'debito'].map((p) => (
                  <div key={p} className={cn(
                    "flex items-center space-x-3 p-6 rounded-2xl border transition-all cursor-pointer",
                    payment === p ? "bg-[#FFF4E6] border-[#E87524]" : "bg-white border-[#F3E2CC]"
                  )}>
                    <RadioGroupItem value={p} id={p} />
                    <Label htmlFor={p} className="font-bold cursor-pointer uppercase text-xs tracking-widest text-[#2B1710]">{p}</Label>
                  </div>
                ))}
              </RadioGroup>

              {payment === "dinheiro" && (
                <div className="space-y-4 pt-2 animate-in fade-in">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="change" 
                      onCheckedChange={(checked) => setNeedsChange(checked as boolean)} 
                      className="border-[#F3E2CC] data-[state=checked]:bg-[#E87524]"
                    />
                    <Label htmlFor="change" className="font-bold text-[#2B1710]">Precisa de troco?</Label>
                  </div>
                  {needsChange && (
                    <div className="space-y-2 max-w-[200px]">
                      <Label className="text-[#4A2618] font-bold">Troco para quanto?</Label>
                      <Input 
                        type="text" 
                        placeholder="R$ 0,00" 
                        value={changeAmount}
                        onChange={(e) => setChangeAmount(e.target.value)}
                        className="rounded-xl h-12 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710]"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-[#2B1710]/5 border border-[#F3E2CC] sticky top-24">
              <h3 className="text-xl font-black text-[#2B1710] mb-6 uppercase tracking-wider">Seu Pedido</h3>
              
              <ScrollArea className="max-h-[30vh] mb-6 pr-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.cartId} className="flex justify-between text-sm gap-4">
                      <div className="font-bold text-[#4A2618]">
                        {item.quantity}x {item.product.name}
                      </div>
                      <div className="font-black text-[#2B1710]">{formatCurrency(item.totalPrice)}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="space-y-4 pt-6 border-t border-dashed border-[#F3E2CC]">
                <div className="flex justify-between text-[#4A2618] font-bold uppercase tracking-tighter text-xs">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {orderType === "delivery" && (
                  <div className="flex justify-between text-[#4A2618] font-bold uppercase tracking-tighter text-xs">
                    <span>Taxa de Entrega</span>
                    <span className="text-green-600">{formatCurrency(deliveryFee)}</span>
                  </div>
                )}
                <div className="pt-4 flex justify-between">
                  <span className="text-xl font-black text-[#2B1710] uppercase">Total</span>
                  <span className="text-2xl font-black text-[#E87524]">{formatCurrency(total)}</span>
                </div>
              </div>
              
              <Button 
                type="submit" 
                variant="burger" 
                size="xl" 
                className="w-full h-16 shadow-xl shadow-[#E87524]/20 mt-8"
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
