import { useState, useMemo, useEffect } from "react";
import { useCart } from "@/lib/store";
import { formatCurrency, cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { WHATSAPP_NUMBER, STORE_ADDRESS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Truck, Store, ExternalLink, Navigation } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { calculateDeliveryDistance, getAddressFromZip } from "@/lib/checkout.functions";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isHydrated, setIsHydrated] = useState(false);
  
  const calcDistance = useServerFn(calculateDeliveryDistance);
  const getAddress = useServerFn(getAddressFromZip);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState({ 
    zip: "", 
    street: "", 
    number: "", 
    complement: "", 
    neighborhood: "", 
    city: "",
    state: ""
  });
  const [reference, setReference] = useState("");
  const [payment, setPayment] = useState<"dinheiro" | "pix" | "credito" | "debito">("pix");
  const [needsChange, setNeedsChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState("");
  const [distanceInfo, setDistanceInfo] = useState<{ km: number; fee: number; valid: boolean } | null>(null);

  // Hydrate store on mount
  useEffect(() => {
    setIsHydrated(true);
    useCart.persist.rehydrate();
  }, []);

  const subtotal = useMemo(() => getSubtotal(), [items, getSubtotal]);

  // Address search by ZIP
  useEffect(() => {
    const zip = address.zip.replace(/\D/g, "");
    if (zip.length === 8) {
      getAddress({ data: zip }).then((res) => {
        setAddress(prev => ({
          ...prev,
          street: res.street,
          neighborhood: res.neighborhood,
          city: res.city,
          state: res.state
        }));
      }).catch(() => {
        toast.error("CEP não encontrado.");
      });
    }
  }, [address.zip]);

  // Distance calculation
  useEffect(() => {
    if (orderType === "delivery" && address.street && address.number && address.neighborhood) {
      const fullAddress = `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city || 'Contagem'} - ${address.state || 'MG'}`;
      calcDistance({ data: { destination: fullAddress } }).then((res) => {
        let fee = 0;
        let valid = true;
        
        if (res.distance <= 2.5) fee = 4;
        else if (res.distance <= 4.5) fee = 6;
        else if (res.distance <= 6.0) fee = 8;
        else valid = false;

        setDistanceInfo({ km: res.distance, fee, valid });
      }).catch(err => {
        console.error(err);
        setDistanceInfo(null);
      });
    } else {
      setDistanceInfo(null);
    }
  }, [orderType, address.street, address.number, address.neighborhood]);

  const deliveryFee = orderType === "pickup" ? 0 : (distanceInfo?.fee || 0);
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orderType === "delivery" && (!distanceInfo || !distanceInfo.valid)) {
      toast.error("Poxa! Ainda não realizamos entregas nessa região.");
      return;
    }

    setLoading(true);

    try {
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
        message += `*Entrega (${distanceInfo?.km.toFixed(1)} km):* ${formatCurrency(deliveryFee)}\n`;
      } else {
        message += `*Taxa de entrega:* R$ 0,00 (Retirada)\n`;
      }
      message += `*TOTAL: ${formatCurrency(total)}*\n\n`;

      if (orderType === "delivery") {
        message += `*ENDEREÇO DE ENTREGA:*\n`;
        message += `Rua: ${address.street}, ${address.number}\n`;
        message += `Bairro: ${address.neighborhood}\n`;
        if (address.complement) message += `Comp: ${address.complement}\n`;
        if (reference) message += `Ref: ${reference}\n\n`;
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
        <h1 className="text-3xl font-black text-[#2B1710] mb-8 uppercase tracking-tighter italic border-b-4 border-[#E87524] inline-block pb-2">
          Finalizar o Pedido
        </h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Escolha do Tipo */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-[#2B1710]/5 border border-[#F3E2CC]">
              <h3 className="text-sm font-black text-[#2B1710] uppercase tracking-widest border-b border-[#F3E2CC] pb-4 mb-6">
                Como você quer receber seu pedido?
              </h3>
              
              <RadioGroup 
                value={orderType}
                onValueChange={(v) => setOrderType(v as any)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div 
                  onClick={() => setOrderType("pickup")}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all cursor-pointer gap-3",
                    orderType === "pickup" ? "bg-[#FFF4E6] border-[#E87524] shadow-lg shadow-[#E87524]/10" : "bg-white border-[#F3E2CC] hover:border-[#E87524]/50"
                  )}
                >
                  <Store className={cn("w-10 h-10", orderType === "pickup" ? "text-[#E87524]" : "text-[#4A2618]")} />
                  <span className="font-black text-[#2B1710] uppercase tracking-tighter">Retirar no local</span>
                  <RadioGroupItem value="pickup" className="sr-only" />
                </div>
                
                <div 
                  onClick={() => setOrderType("delivery")}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all cursor-pointer gap-3",
                    orderType === "delivery" ? "bg-[#FFF4E6] border-[#E87524] shadow-lg shadow-[#E87524]/10" : "bg-white border-[#F3E2CC] hover:border-[#E87524]/50"
                  )}
                >
                  <Truck className={cn("w-10 h-10", orderType === "delivery" ? "text-[#E87524]" : "text-[#4A2618]")} />
                  <span className="font-black text-[#2B1710] uppercase tracking-tighter">Receber em casa</span>
                  <RadioGroupItem value="delivery" className="sr-only" />
                </div>
              </RadioGroup>
            </div>

            {/* Seus Dados */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-[#2B1710]/5 border border-[#F3E2CC]">
              <h3 className="text-sm font-black text-[#2B1710] uppercase tracking-widest border-b border-[#F3E2CC] pb-4 mb-6">1. Seus Dados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[#4A2618] font-bold">Seu Nome</Label>
                  <Input 
                    placeholder="Como podemos te chamar?" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl h-12 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#4A2618] font-bold">Seu WhatsApp</Label>
                  <Input 
                    placeholder="(00) 00000-0000" 
                    required 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl h-12 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710]"
                  />
                </div>
              </div>
            </div>

            {/* Endereço / Retirada */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-[#2B1710]/5 border border-[#F3E2CC]">
              {orderType === "pickup" ? (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-[#2B1710] uppercase tracking-widest border-b border-[#F3E2CC] pb-4 mb-4">Retire seu pedido no local</h3>
                  
                  <div className="flex items-start gap-4 p-6 bg-[#FFF4E6] rounded-3xl border border-[#E87524]/20">
                    <MapPin className="w-6 h-6 text-[#E87524] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-black text-[#2B1710] uppercase text-xs mb-1">Endereço</p>
                      <p className="text-[#4A2618] font-bold leading-relaxed">
                        {STORE_ADDRESS.street}, {STORE_ADDRESS.number}<br />
                        {STORE_ADDRESS.neighborhood}, {STORE_ADDRESS.city} - {STORE_ADDRESS.state}<br />
                        CEP: {STORE_ADDRESS.zip}
                      </p>
                      
                      <p className="font-black text-[#2B1710] uppercase text-xs mt-4 mb-1">Ponto de Referência</p>
                      <p className="text-[#4A2618] font-medium italic">"{STORE_ADDRESS.reference}"</p>
                    </div>
                  </div>
                  
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full rounded-2xl h-14 border-2 border-[#E87524] text-[#E87524] font-black uppercase hover:bg-[#E87524] hover:text-white transition-all gap-2"
                    onClick={() => window.open(STORE_ADDRESS.mapsLink, "_blank")}
                  >
                    <Navigation className="w-5 h-5" />
                    Ver no Mapa
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-[#2B1710] uppercase tracking-widest border-b border-[#F3E2CC] pb-4 mb-4">Dados de Entrega</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#4A2618] font-bold">CEP</Label>
                      <Input 
                        placeholder="00000-000" 
                        required 
                        value={address.zip}
                        onChange={(e) => setAddress({...address, zip: e.target.value})}
                        className="rounded-xl h-12 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#4A2618] font-bold">Número</Label>
                      <Input 
                        placeholder="Ex: 123" 
                        required 
                        value={address.number}
                        onChange={(e) => setAddress({...address, number: e.target.value})}
                        className="rounded-xl h-12 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#4A2618] font-bold">Rua (Preenchido pelo CEP)</Label>
                    <Input 
                      readOnly
                      value={address.street}
                      className="rounded-xl h-12 bg-gray-50 border-[#F3E2CC] text-[#2B1710]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#4A2618] font-bold">Bairro</Label>
                      <Input 
                        readOnly
                        value={address.neighborhood}
                        className="rounded-xl h-12 bg-gray-50 border-[#F3E2CC] text-[#2B1710]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#4A2618] font-bold">Complemento (opcional)</Label>
                      <Input 
                        value={address.complement}
                        onChange={(e) => setAddress({...address, complement: e.target.value})}
                        className="rounded-xl h-12 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#4A2618] font-bold">Ponto de Referência</Label>
                    <Input 
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="rounded-xl h-12 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710]"
                    />
                  </div>

                  {distanceInfo && (
                    <div className={cn(
                      "p-6 rounded-3xl border-2 animate-in fade-in slide-in-from-top-2",
                      distanceInfo.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    )}>
                      {distanceInfo.valid ? (
                        <div className="flex items-center gap-4">
                          <Truck className="w-8 h-8 text-green-600" />
                          <div>
                            <p className="text-green-800 font-black uppercase text-xs">Entrega Disponível</p>
                            <p className="text-green-700 font-bold">
                              📍 Distância da loja: {distanceInfo.km.toFixed(1)} km<br />
                              🛵 Taxa de entrega: {formatCurrency(distanceInfo.fee)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-red-800 font-black uppercase text-sm mb-2">😕 Poxa! Ainda não realizamos entregas nessa região.</p>
                          <p className="text-red-700 font-bold">
                            Seu endereço está a {distanceInfo.km.toFixed(1)} km da nossa loja e nossa área de entrega é de até 6 km.
                          </p>
                          <Button 
                            type="button" 
                            variant="link" 
                            className="p-0 text-red-800 font-black underline mt-2"
                            onClick={() => setOrderType("pickup")}
                          >
                            Deseja retirar no local?
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pagamento */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-[#2B1710]/5 border border-[#F3E2CC]">
              <h3 className="text-sm font-black text-[#2B1710] uppercase tracking-widest border-b border-[#F3E2CC] pb-4 mb-6">3. Pagamento</h3>
              
              <RadioGroup 
                value={payment}
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
              <h3 className="text-xl font-black text-[#2B1710] mb-6 uppercase tracking-wider border-b border-[#F3E2CC] pb-4">
                Resumo
              </h3>
              
              <ScrollArea className="max-h-[30vh] mb-6 pr-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.cartId} className="space-y-1">
                      <div className="flex justify-between text-sm gap-4">
                        <div className="font-bold text-[#4A2618]">
                          {item.quantity}x {item.product.name}
                        </div>
                        <div className="font-black text-[#2B1710]">{formatCurrency(item.totalPrice)}</div>
                      </div>
                      {item.observation && (
                        <p className="text-[10px] text-[#4A2618]/70 italic leading-tight">
                          Obs: {item.observation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="space-y-4 pt-6 border-t border-dashed border-[#F3E2CC]">
                <div className="flex justify-between text-[#4A2618] font-bold uppercase tracking-tighter text-xs">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-[#4A2618] font-bold uppercase tracking-tighter text-xs">
                  <span>{orderType === 'pickup' ? 'Retirada' : 'Entrega'}</span>
                  <span className={cn(deliveryFee > 0 ? "text-[#E87524]" : "text-green-600")}>
                    {formatCurrency(deliveryFee)}
                  </span>
                </div>

                <div className="pt-4 flex justify-between">
                  <span className="text-xl font-black text-[#2B1710] uppercase tracking-tighter">Total</span>
                  <span className="text-2xl font-black text-[#E87524]">{formatCurrency(total)}</span>
                </div>
              </div>
              
              <Button 
                type="submit" 
                variant="burger" 
                size="xl" 
                disabled={loading || (orderType === 'delivery' && !distanceInfo?.valid)}
                className="w-full h-16 shadow-xl shadow-[#E87524]/20 mt-8 font-black uppercase tracking-widest text-lg"
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