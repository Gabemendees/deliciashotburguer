import React, { useState, useMemo, useEffect } from "react";
import { useCart } from "@/lib/store";
import { formatCurrency, cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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
import { MapPin, Truck, Store, ExternalLink, Navigation, ChevronRight } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { calculateDeliveryDistance, getAddressFromZip } from "@/lib/checkout.functions";
import { getStoreConfig } from "@/lib/database.functions";
import { createOrder } from "@/lib/order.functions";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, getSubtotal, clearCart, isHydrated } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const calcDistance = useServerFn(calculateDeliveryDistance);
  const getAddress = useServerFn(getAddressFromZip);
  const saveOrder = useServerFn(createOrder);

  const { data: config } = useQuery({
    queryKey: ['store-config'],
    queryFn: () => getStoreConfig(),
  });

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
    if (!isHydrated) {
      useCart.persist.rehydrate();
    }
  }, [isHydrated]);

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
      const fullAddress = `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city || 'Contagem'} - ${address.state || 'MG'}, ${address.zip}`;
      calcDistance({ data: { destination: fullAddress } }).then((res) => {
        let fee = 0;
        let valid = true;
        const distMeters = res.distanceMeters;
        
        const deliveryRules = config?.['delivery_rules'] || [
          { min: 0, max: 2500, fee: 4 },
          { min: 2501, max: 4500, fee: 6 },
          { min: 4501, max: 6000, fee: 8 }
        ];

        const rule = deliveryRules.find((r: any) => distMeters >= r.min && distMeters <= r.max);
        if (rule) {
          fee = rule.fee;
        } else {
          valid = false;
        }

        setDistanceInfo({ km: distMeters / 1000, fee, valid });
        
        console.log("--- DEBUG FRONTEND ---");
        console.log("DISTÂNCIA RECEBIDA:", distMeters, "metros");
        console.log("TAXA CALCULADA:", fee);
      }).catch(err => {
        console.error("ERRO NO CÁLCULO:", err);
        toast.error(err.message || "Não conseguimos localizar esse endereço com precisão.");
        setDistanceInfo(null);
      });
    } else {
      setDistanceInfo(null);
    }
  }, [orderType, address.street, address.number, address.neighborhood, address.zip, address.city, address.state]);

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
      // Processar pedido usando a Server Function
      const order = await saveOrder({
        data: {
          customer_name: name,
          customer_phone: phone,
          delivery_type: orderType,
          address_zip: orderType === 'delivery' ? address.zip : undefined,
          address_street: orderType === 'delivery' ? address.street : undefined,
          address_number: orderType === 'delivery' ? address.number : undefined,
          address_neighborhood: orderType === 'delivery' ? address.neighborhood : undefined,
          address_city: orderType === 'delivery' ? address.city : undefined,
          address_state: orderType === 'delivery' ? address.state : undefined,
          address_reference: orderType === 'delivery' ? reference : undefined,
          payment_method: payment === 'dinheiro' ? 'cash' : (payment === 'pix' ? 'pix' : 'card'),
          payment_change: payment === 'dinheiro' && needsChange ? changeAmount : undefined,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          items: items.map(item => ({
            product_id: (item.product as any).id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            observation: item.observation,
            total_price: item.totalPrice,
            additions: item.additions.map(add => ({
              name: add.name,
              price: add.price
            }))
          }))
        }
      });

      toast.success("Pedido concluído com sucesso!");
      clearCart();
      navigate({ 
        to: '/pedido-concluido',
        search: { id: order.id }
      });
    } catch (error: any) {
      console.error("ERRO AO SALVAR PEDIDO:", error);
      toast.error(error.message || "Não foi possível finalizar seu pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }

  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#FFF4E6] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#E87524]" size={48} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF4E6] flex flex-col items-center justify-center p-4">
        <Header />
        <div className="bg-white p-12 rounded-[40px] shadow-xl text-center">
          <h2 className="text-2xl font-black text-[#2B1710] mb-4">Seu carrinho está vazio!</h2>
          <Button onClick={() => navigate({ to: '/' })} variant="burger">Voltar ao Cardápio</Button>
        </div>
      </div>
    );
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
            {/* Escolha do Tipo de Pedido */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-[#2B1710]/5 border border-[#F3E2CC]">
              <h3 className="text-xl font-black text-[#2B1710] uppercase tracking-tighter mb-6">
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
                    "flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all cursor-pointer gap-4 group",
                    orderType === "pickup" ? "bg-[#FFF4E6] border-[#E87524] shadow-lg shadow-[#E87524]/10" : "bg-white border-[#F3E2CC] hover:border-[#E87524]/50"
                  )}
                >
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-colors", orderType === "pickup" ? "bg-[#E87524] text-white" : "bg-[#FFF4E6] text-[#4A2618]")}>
                    <Store className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <span className="block font-black text-xl text-[#2B1710] uppercase tracking-tighter">Retirar no local</span>
                  </div>
                  <RadioGroupItem value="pickup" className="sr-only" />
                </div>
                
                <div 
                  onClick={() => setOrderType("delivery")}
                  className={cn(
                    "flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all cursor-pointer gap-4 group",
                    orderType === "delivery" ? "bg-[#FFF4E6] border-[#E87524] shadow-lg shadow-[#E87524]/10" : "bg-white border-[#F3E2CC] hover:border-[#E87524]/50"
                  )}
                >
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-colors", orderType === "delivery" ? "bg-[#E87524] text-white" : "bg-[#FFF4E6] text-[#4A2618]")}>
                    <Truck className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <span className="block font-black text-xl text-[#2B1710] uppercase tracking-tighter">Receber em casa</span>
                  </div>
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
            {/* Conteúdo dinâmico baseado na escolha */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-[#2B1710]/5 border border-[#F3E2CC]">
              {orderType === "pickup" ? (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-[#2B1710] uppercase tracking-widest border-b border-[#F3E2CC] pb-4 mb-4">
                    2. Retirada no Local
                  </h3>
                  
                  <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-[#FFF4E6] rounded-3xl border border-[#E87524]/20 text-center md:text-left">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                      <MapPin className="w-8 h-8 text-[#E87524]" />
                    </div>
                    <div>
                      <p className="font-black text-[#2B1710] uppercase text-xl mb-1 italic">Retire seu pedido aqui</p>
                      <p className="text-[#4A2618] font-bold text-lg leading-snug">
                        {STORE_ADDRESS.street}, {STORE_ADDRESS.number}<br />
                        {STORE_ADDRESS.neighborhood} — {STORE_ADDRESS.city}/{STORE_ADDRESS.state}
                      </p>
                      <p className="text-[#E87524] font-black uppercase text-sm mt-3 flex items-center gap-2 justify-center md:justify-start">
                        <span className="w-2 h-2 bg-[#E87524] rounded-full animate-pulse"></span>
                        {STORE_ADDRESS.reference}
                      </p>
                    </div>
                  </div>
                  
                  <a 
                    href={STORE_ADDRESS.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full rounded-2xl h-16 border-2 border-[#E87524] text-[#E87524] font-black uppercase hover:bg-[#E87524] hover:text-white transition-all gap-3 text-lg flex items-center justify-center no-underline"
                  >
                    <Navigation className="w-6 h-6" />
                    Como chegar agora
                  </a>

                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-[#2B1710] uppercase tracking-widest border-b border-[#F3E2CC] pb-4 mb-4">
                    2. Dados de Entrega
                  </h3>

                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#4A2618] font-bold">CEP</Label>
                      <Input 
                        placeholder="00000-000" 
                        required 
                        value={address.zip}
                        onChange={(e) => setAddress({...address, zip: e.target.value})}
                        className="rounded-xl h-14 border-2 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710] font-bold text-lg"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-[#4A2618] font-bold">Número</Label>
                      <Input 
                        placeholder="Ex: 714" 
                        required 
                        value={address.number}
                        onChange={(e) => setAddress({...address, number: e.target.value})}
                        className="rounded-xl h-14 border-2 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710] font-bold text-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#4A2618] font-bold">Rua</Label>
                    <Input 
                      placeholder="Rua Santa Maria"
                      required
                      value={address.street}
                      onChange={(e) => setAddress({...address, street: e.target.value})}
                      className="rounded-xl h-12 border-[#F3E2CC] text-[#2B1710]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#4A2618] font-bold">Bairro</Label>
                      <Input 
                        placeholder="Pedra Azul"
                        required
                        value={address.neighborhood}
                        onChange={(e) => setAddress({...address, neighborhood: e.target.value})}
                        className="rounded-xl h-12 border-[#F3E2CC] text-[#2B1710]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#4A2618] font-bold">Complemento (Opcional)</Label>
                      <Input 
                        placeholder="Bloco A, Apt 10"
                        value={address.complement}
                        onChange={(e) => setAddress({...address, complement: e.target.value})}
                        className="rounded-xl h-12 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#4A2618] font-bold">Ponto de Referência</Label>
                    <Input 
                      placeholder="Ex: Próximo à padaria"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="rounded-xl h-12 border-[#F3E2CC] focus-visible:ring-[#E87524] text-[#2B1710]"
                    />
                  </div>

                  {distanceInfo && (
                    <div className={cn(
                      "p-8 rounded-[32px] border-2 animate-in fade-in slide-in-from-top-4 duration-500",
                      distanceInfo.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    )}>
                      {distanceInfo.valid ? (
                        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Truck className="w-8 h-8 text-green-600" />
                          </div>
                          <div>
                            <p className="text-green-800 font-black uppercase text-sm mb-1 tracking-widest">Tudo Certo!</p>
                            <h4 className="text-2xl font-black text-green-900 tracking-tighter italic">Entregamos aí!</h4>
                            <p className="text-green-700 font-bold mt-1 text-lg">
                              📍 Distância: <span className="text-green-900">{distanceInfo.km.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km</span><br />
                              🛵 Taxa de entrega: <span className="text-green-900">{formatCurrency(distanceInfo.fee)}</span>
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
                            <MapPin className="w-10 h-10 text-red-600" />
                          </div>
                          <h4 className="text-2xl font-black text-red-900 tracking-tighter italic mb-2">😕 Poxa! Ainda não realizamos entregas nessa região.</h4>
                          <p className="text-red-700 font-bold max-w-md mx-auto mb-6 text-lg">
                            Seu endereço está a <span className="text-red-900">{distanceInfo.km.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km</span> da nossa loja.
                            Atualmente entregamos em um raio de até <span className="text-red-900">6,00 km</span>.
                          </p>
                          <Button 
                            type="button" 
                            className="bg-red-600 hover:bg-red-700 text-white font-black uppercase rounded-2xl h-14 px-8 shadow-lg shadow-red-200"
                            onClick={() => setOrderType("pickup")}
                          >
                            Retirar no Local (Taxa Grátis)
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
                  <span>Taxa de Entrega</span>
                  <span className={orderType === "delivery" && distanceInfo?.valid ? "text-[#E87524]" : ""}>
                    {orderType === "pickup" ? "Grátis" : formatCurrency(deliveryFee)}
                  </span>
                </div>
                
                <div className="flex justify-between items-end pt-4 border-t-2 border-[#2B1710]/10">
                  <span className="font-black text-[#2B1710] uppercase text-sm italic">Total do Pedido</span>
                  <span className="text-3xl font-black text-[#E87524] tracking-tighter leading-none">
                    {formatCurrency(total)}
                  </span>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading || (orderType === "delivery" && (!distanceInfo || !distanceInfo.valid))}
                  className="w-full bg-[#E87524] hover:bg-[#C95718] text-white rounded-2xl h-16 font-black uppercase text-xl shadow-lg shadow-[#E87524]/20 transition-all active:scale-95 disabled:grayscale disabled:opacity-50 mt-4 group"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3 italic">
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                      FINALIZANDO PEDIDO...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3 italic">
                      FINALIZAR PEDIDO
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
                
                <p className="text-[10px] text-center text-[#4A2618]/50 uppercase font-bold tracking-widest mt-4">
                  Pagamento realizado na entrega/retirada
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
