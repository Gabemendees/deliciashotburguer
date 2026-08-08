import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Edit2, Info } from 'lucide-react';
import { STORE_ADDRESS } from '@/lib/data';

export const Route = createFileRoute('/admin/entregas')({
  component: Entregas,
});

function Entregas() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-[#2B1710]">Regras de Entrega</h1>
          <p className="text-[#4A2618]">Configure as taxas por distância</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-[#2B1710] flex items-center gap-2">
              <MapPin className="text-[#E87524]" size={20} />
              TAXAS POR DISTÂNCIA
            </h2>
            
            <DeliveryRuleCard 
              range="Até 2,5 km" 
              fee={4.00} 
              description="Ideal para bairros vizinhos ao Trailer." 
            />
            <DeliveryRuleCard 
              range="2,5 km a 4,5 km" 
              fee={6.00} 
              description="Taxa intermediária para bairros próximos." 
            />
            <DeliveryRuleCard 
              range="4,5 km a 6,0 km" 
              fee={8.00} 
              description="Distância máxima de entrega permitida." 
            />
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <Info className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-700">Acima de 6,0 km o sistema bloqueia automaticamente o pedido para entrega.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#2B1710]">ENDEREÇO DA LOJA</h2>
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <div className="aspect-video bg-[#FFF4E6] flex items-center justify-center border-b border-[#F3E2CC]">
                <MapPin className="text-[#E87524]" size={48} />
              </div>
              <CardContent className="p-6">
                <p className="font-bold text-[#2B1710]">{STORE_ADDRESS.street}, {STORE_ADDRESS.number}</p>
                <p className="text-sm text-[#4A2618]/60">{STORE_ADDRESS.neighborhood}, {STORE_ADDRESS.city} - {STORE_ADDRESS.state}</p>
                <p className="text-xs text-[#E87524] font-bold mt-2 uppercase tracking-wider">{STORE_ADDRESS.reference}</p>
                
                <Button className="w-full mt-6 bg-white border-2 border-[#F3E2CC] text-[#2B1710] hover:bg-[#F3E2CC] font-bold">
                  ALTERAR ENDEREÇO
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function DeliveryRuleCard({ range, fee, description }: any) {
  return (
    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all group">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-[#2B1710]">{range}</h3>
            <p className="text-sm text-[#4A2618]/60">{description}</p>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-3xl font-black text-[#E87524]">R$ {fee.toFixed(2).replace('.', ',')}</span>
            <button className="p-3 bg-[#FFF4E6] text-[#E87524] rounded-xl hover:bg-[#E87524] hover:text-white transition-all shadow-sm">
              <Edit2 size={20} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
