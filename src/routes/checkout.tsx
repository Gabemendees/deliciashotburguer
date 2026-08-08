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
import { MapPin, Truck, Store, ExternalLink } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { calculateDeliveryDistance } from "@/lib/checkout.functions";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isHydrated, setIsHydrated] = useState(false);
  const calcDistance = useServerFn(calculateDeliveryDistance);

  useEffect(() => {
    setIsHydrated(true);
    useCart.persist.rehydrate();
  }, []);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("pickup");
  const [address, setAddress] = useState({ zip: "", street: "", number: "", complement: "", neighborhood: "", reference: "" });
  const [payment, setPayment] = useState<"dinheiro" | "pix" | "credito" | "debito">("pix");
  
  const [distanceInfo, setDistanceInfo] = useState<{ km: number; fee: number; valid: boolean } | null>(null);
  
  const subtotal = useMemo(() => getSubtotal(), [items, getSubtotal]);

  useEffect(() => {
    if (orderType === "delivery" && address.zip.length >= 8 && address.number) {
        const fullAddress = `${address.street}, ${address.number}, ${address.neighborhood}, Contagem - MG`;
        calcDistance({ destination: fullAddress }).then((res) => {
            let fee = 0;
            let valid = true;
            if (res.distance <= 2.5) fee = 4;
            else if (res.distance <= 4.5) fee = 6;
            else if (res.distance <= 6.0) fee = 8;
            else valid = false;
            setDistanceInfo({ km: res.distance, fee, valid });
        });
    } else {
        setDistanceInfo(null);
    }
  }, [orderType, address.zip, address.number]);

  const deliveryFee = orderType === "pickup" ? 0 : (distanceInfo?.fee || 0);
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderType === "delivery" && (!distanceInfo || !distanceInfo.valid)) {
        toast.error("Endereço fora da área de entrega.");
        return;
    }
    setLoading(true);
    // WhatsApp logic...
    setLoading(false);
  };

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-[#FFF4E6] flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-black text-[#2B1710] mb-8 uppercase italic border-b-4 border-[#E87524] pb-2 inline-block">Finalizar Pedido</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* 1. Escolha */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3E2CC]">
                    <h3 className="font-black text-[#2B1710] uppercase mb-6">Como você quer receber?</h3>
                    <RadioGroup value={orderType} onValueChange={(v: any) => setOrderType(v)} className="grid grid-cols-2 gap-4">
                        <div onClick={() => setOrderType("pickup")} className={cn("p-6 rounded-2xl border cursor-pointer flex flex-col items-center text-center", orderType === "pickup" ? "border-[#E87524] bg-[#FFF4E6]" : "border-[#F3E2CC]")}>
                            <Store className="w-8 h-8 mb-2 text-[#E87524]" />
                            <span className="font-bold">Retirar no local</span>
                        </div>
                        <div onClick={() => setOrderType("delivery")} className={cn("p-6 rounded-2xl border cursor-pointer flex flex-col items-center text-center", orderType === "delivery" ? "border-[#E87524] bg-[#FFF4E6]" : "border-[#F3E2CC]")}>
                            <Truck className="w-8 h-8 mb-2 text-[#E87524]" />
                            <span className="font-bold">Receber em casa</span>
                        </div>
                    </RadioGroup>
                </div>

                {orderType === "pickup" ? (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3E2CC]">
                        <h3 className="font-black text-[#2B1710] uppercase mb-4">Retire seu pedido</h3>
                        <p className="text-sm">{STORE_ADDRESS.street}, {STORE_ADDRESS.number}</p>
                        <p className="text-sm font-bold mt-2">{STORE_ADDRESS.reference}</p>
                        <Button variant="outline" className="mt-4" onClick={() => window.open(STORE_ADDRESS.mapsLink)}>Ver no mapa</Button>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3E2CC] space-y-4">
                        <Input placeholder="CEP" value={address.zip} onChange={(e) => setAddress({...address, zip: e.target.value})} />
                        <Input placeholder="Número" value={address.number} onChange={(e) => setAddress({...address, number: e.target.value})} />
                        {distanceInfo && (
                            <div className="p-4 bg-[#FFF4E6] rounded-xl">
                                <p className="font-bold">Distância: {distanceInfo.km.toFixed(1)} km</p>
                                <p className="font-bold">Taxa: {formatCurrency(distanceInfo.fee)}</p>
                            </div>
                        )}
                        {!distanceInfo?.valid && distanceInfo && <p className="text-red-500 font-bold">Poxa! Não realizamos entregas aí.</p>}
                    </div>
                )}
            </div>
            
            <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3E2CC] sticky top-24">
                    <h3 className="font-black text-[#2B1710] mb-6 uppercase">Resumo</h3>
                    <div className="flex justify-between font-bold"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                    <div className="flex justify-between font-bold text-[#E87524]"><span>Taxa</span><span>{formatCurrency(deliveryFee)}</span></div>
                    <div className="flex justify-between text-2xl font-black mt-4"><span>Total</span><span>{formatCurrency(total)}</span></div>
                    <Button type="submit" className="w-full mt-6" disabled={loading || (orderType === 'delivery' && !distanceInfo?.valid)}>Confirmar</Button>
                </div>
            </div>
        </form>
      </main>
    </div>
  );
}