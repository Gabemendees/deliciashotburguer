import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  PlusSquare, 
  Tags, 
  Truck, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';


const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: ShoppingBag, label: 'Pedidos', href: '/admin/pedidos' },
  { icon: UtensilsCrossed, label: 'Produtos', href: '/admin/produtos' },
  { icon: PlusSquare, label: 'Acréscimos', href: '/admin/acrescimos' },
  { icon: Tags, label: 'Categorias', href: '/admin/categorias' },
  { icon: Truck, label: 'Entregas', href: '/admin/entregas' },
  { icon: BarChart3, label: 'Financeiro', href: '/admin/financeiro' },
  { icon: Settings, label: 'Configurações', href: '/admin/configuracoes' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      // Small delay to ensure browser processed localStorage
      await new Promise(r => setTimeout(r, 200));
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!isMounted) return;

      if (!session) {
        navigate({ to: '/admin' });
        return;
      }

      if (session.user.email?.toLowerCase() !== 'deliciahotburguers@gmail.com') {
        await supabase.auth.signOut();
        navigate({ to: '/admin' });
        return;
      }

      setUserEmail(session.user.email ?? null);
    };

    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      if (event === 'SIGNED_OUT') {
        navigate({ to: '/admin' });
      } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session && session.user.email?.toLowerCase() === 'deliciahotburguers@gmail.com') {
          setUserEmail(session.user.email ?? null);
        } else if (session) {
          supabase.auth.signOut().then(() => {
            navigate({ to: '/admin' });
          });
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/admin' });
  };


  return (
    <div className="min-h-screen bg-[#FFF4E6] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#2B1710] text-white">
        <div className="flex flex-col">
          <span className="font-black text-lg">DELÍCIA'S</span>
          <span className="text-[10px] text-[#E87524] font-bold tracking-[0.2em] -mt-1">PAINEL ADMIN</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#2B1710] text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-2xl shrink-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <div className="hidden md:flex flex-col mb-10">
            <span className="font-black text-2xl">DELÍCIA'S</span>
            <span className="text-xs text-[#E87524] font-bold tracking-[0.3em] -mt-1 uppercase">Painel Administrativo</span>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    isActive 
                      ? "bg-[#E87524] text-white shadow-lg" 
                      : "text-[#F3E2CC] hover:bg-[#4A2618]"
                  )}
                >
                  <item.icon size={20} className={cn(isActive ? "text-white" : "text-[#E87524] group-hover:scale-110 transition-transform")} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-[#4A2618]">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#4A2618] flex items-center justify-center text-[#E87524]">
              <User size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">Administrador</p>
              <p className="text-[10px] text-[#F3E2CC]/60 truncate">{userEmail || 'Carregando...'}</p>
            </div>

          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
