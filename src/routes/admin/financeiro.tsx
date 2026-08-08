import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Banknote, QrCode, TrendingUp, TrendingDown } from 'lucide-react';

export const Route = createFileRoute('/admin/financeiro')({
  component: Financeiro,
});

function Financeiro() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#2B1710]">Financeiro</h1>
            <p className="text-[#4A2618]">Relatório de faturamento e desempenho</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-xl shadow-sm">
            {['Hoje', '7 dias', '30 dias', 'Personalizado'].map(f => (
              <button key={f} className="px-4 py-2 text-sm font-bold rounded-lg hover:bg-[#FFF4E6] transition-colors">
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm bg-[#2B1710] text-white">
            <CardContent className="p-8">
              <p className="text-[#F3E2CC]/60 font-bold text-xs uppercase tracking-[0.2em] mb-2">Faturamento Total (30d)</p>
              <h2 className="text-4xl font-black mb-4">R$ 24.580,00</h2>
              <div className="flex items-center gap-2 text-green-400 font-bold">
                <TrendingUp size={18} />
                <span>+12% vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-8">
              <p className="text-[#4A2618]/60 font-bold text-xs uppercase tracking-[0.2em] mb-2">Ticket Médio</p>
              <h2 className="text-4xl font-black text-[#2B1710] mb-4">R$ 42,50</h2>
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <TrendingDown size={18} />
                <span>-3% vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-8">
              <p className="text-[#4A2618]/60 font-bold text-xs uppercase tracking-[0.2em] mb-2">Total de Pedidos</p>
              <h2 className="text-4xl font-black text-[#2B1710] mb-4">578</h2>
              <p className="text-[#E87524] font-bold">Média de 19 pedidos/dia</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-[#2B1710]">FORMAS DE PAGAMENTO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PaymentMethodRow icon={QrCode} name="PIX" amount="R$ 12.450,00" percentage={51} color="text-teal-500" />
              <PaymentMethodRow icon={CreditCard} name="Cartão" amount="R$ 8.920,00" percentage={36} color="text-purple-500" />
              <PaymentMethodRow icon={Banknote} name="Dinheiro" amount="R$ 3.210,00" percentage={13} color="text-green-500" />
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#2B1710]">VENDAS POR DIA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-end justify-between gap-2 px-4">
                {[450, 620, 380, 710, 920, 850, 520].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-[#E87524] rounded-t-lg transition-all hover:bg-[#C95718]" 
                      style={{ height: `${(val / 1000) * 100}%` }}
                    />
                    <span className="text-[10px] font-bold text-[#4A2618]/60 uppercase tracking-tighter">
                      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function PaymentMethodRow({ icon: Icon, name, amount, percentage, color }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#FFF4E6]/50 rounded-xl">
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl bg-white shadow-sm", color)}>
          <Icon size={20} />
        </div>
        <div>
          <p className="font-black text-[#2B1710]">{name}</p>
          <p className="text-xs text-[#4A2618]/60">{percentage}% do faturamento</p>
        </div>
      </div>
      <span className="text-lg font-black text-[#2B1710]">{amount}</span>
    </div>
  );
}
