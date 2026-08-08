import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Edit2, Info, Loader2, Save, Store, Truck } from 'lucide-react';
import { STORE_ADDRESS } from '@/lib/data';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStoreConfig, updateStoreConfig } from '@/lib/database.functions';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";

export const Route = createFileRoute('/admin/entregas')({
  component: Entregas,
});

function Entregas() {
  const queryClient = useQueryClient();
  const [deliveryRules, setDeliveryRules] = useState<any[]>([]);

  const { data: config, isLoading } = useQuery({
    queryKey: ['store-config'],
    queryFn: () => getStoreConfig(),
  });

  const configMutation = useMutation({
    mutationFn: (data: { key: string, value: any }) => updateStoreConfig({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-config'] });
      toast.success("Regras de entrega atualizadas!");
    },
    onError: () => toast.error("Erro ao salvar configurações.")
  });

  useEffect(() => {
    if (config?.delivery_rules) {
      setDeliveryRules(config.delivery_rules);
    }
  }, [config]);

  const handleUpdateRule = (index: number, field: string, value: number) => {
    const newRules = [...deliveryRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setDeliveryRules(newRules);
  };

  const handleSaveRules = () => {
    configMutation.mutate({ key: 'delivery_rules', value: deliveryRules });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-[#E87524]" size={48} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-[#2B1710] uppercase tracking-tighter">Regras de Entrega</h1>
            <p className="text-[#4A2618]/60 font-bold uppercase text-xs tracking-[0.2em]">Configure as taxas por distância real</p>
          </div>
          <Button 
            onClick={handleSaveRules}
            disabled={configMutation.isPending}
            className="bg-[#2B1710] hover:bg-[#1a0e0a] text-white font-black h-14 px-8 rounded-2xl gap-3 shadow-lg"
          >
            {configMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            SALVAR ALTERAÇÕES
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-black text-[#2B1710] flex items-center gap-3 uppercase tracking-tight">
              <div className="p-2 bg-[#E87524] text-white rounded-lg">
                <Truck size={20} />
              </div>
              TAXAS POR DISTÂNCIA (GOOGLE MAPS)
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {deliveryRules.map((rule, index) => (
                <Card key={index} className="border-none shadow-sm bg-white overflow-hidden group border-2 border-transparent hover:border-[#E87524]/10 transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-[#2B1710] uppercase tracking-tighter">
                          Faixa {index + 1}: {rule.min / 1000}km a {rule.max / 1000}km
                        </h3>
                        <p className="text-xs font-bold text-[#4A2618]/40 uppercase tracking-widest">
                          Distância medida em rota real pelo GPS
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#E87524]">R$</span>
                          <Input 
                            type="number"
                            value={rule.fee}
                            onChange={(e) => handleUpdateRule(index, 'fee', Number(e.target.value))}
                            className="pl-12 w-32 h-14 bg-[#FFF4E6]/50 border-none font-black text-xl text-[#2B1710] focus-visible:ring-[#E87524] rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-start gap-4">
              <div className="p-2 bg-red-100 text-red-500 rounded-full">
                <Info size={20} />
              </div>
              <div>
                <p className="font-black text-red-700 uppercase text-xs tracking-widest mb-1">Bloqueio de Entrega</p>
                <p className="text-sm text-red-600 font-bold leading-relaxed">
                  Acima de {deliveryRules[deliveryRules.length - 1]?.max / 1000} km o sistema bloqueará automaticamente o pedido para entrega, permitindo apenas a opção de "Retirada no Local".
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-xl font-black text-[#2B1710] flex items-center gap-3 uppercase tracking-tight">
              <div className="p-2 bg-[#2B1710] text-white rounded-lg">
                <Store size={20} />
              </div>
              ORIGEM DA LOJA
            </h2>
            <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem]">
              <div className="aspect-video bg-[#FFF4E6] flex items-center justify-center border-b border-[#F3E2CC] relative overflow-hidden group">
                <MapPin className="text-[#E87524] relative z-10 group-hover:scale-125 transition-transform duration-500" size={64} />
                <div className="absolute inset-0 bg-[radial-gradient(#E87524_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
              </div>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-[#4A2618]/30 uppercase tracking-[0.2em] mb-1">Endereço Atual</p>
                    <p className="font-black text-[#2B1710] text-lg leading-tight uppercase">{STORE_ADDRESS.street}, {STORE_ADDRESS.number}</p>
                    <p className="text-sm font-bold text-[#4A2618]/60">{STORE_ADDRESS.neighborhood}, {STORE_ADDRESS.city} - {STORE_ADDRESS.state}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#4A2618]/30 uppercase tracking-[0.2em] mb-1">Ponto de Referência</p>
                    <p className="text-xs font-black text-[#E87524] uppercase tracking-wider italic">"{STORE_ADDRESS.reference}"</p>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-6 border-2 border-[#F3E2CC] text-[#2B1710] hover:bg-[#F3E2CC] font-black h-12 rounded-xl uppercase text-[10px] tracking-widest">
                    CONFIGURAR NO MAPA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
