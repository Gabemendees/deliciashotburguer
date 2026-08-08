import { createFileRoute, Outlet, redirect, useNavigate, useLocation } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Redirect if already authenticated and trying to access /admin (login)
    if (session && location.pathname === '/admin') {
      // Basic check: if they are logged in, we let the component handle the role check 
      // or redirect to dashboard if they have the role.
      // But for better security, we check role here if possible.
    }
    
    // If accessing sub-routes without session, redirect to /admin
    if (!session && location.pathname !== '/admin') {
      throw redirect({ to: '/admin' });
    }
  },
  component: AdminRoot,
});

function AdminRoot() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/admin';

  if (isLoginPage) {
    return <AdminLogin />;
  }

  return <Outlet />;
}


function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Strict email check
      if (email.toLowerCase() !== 'deliciahotburguers@gmail.com') {
        throw new Error('E-mail ou senha incorretos.');
      }

      // 2. Auth check
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('E-mail ou senha incorretos.');
        }
        throw error;
      }

      // 3. Role check (RBAC)
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError || !roleData) {
        await supabase.auth.signOut();
        throw new Error('Acesso negado. Apenas o administrador autorizado pode entrar.');
      }

      toast.success('Login realizado com sucesso! Abrindo painel...');
      
      // Open in new tab
      // To avoid pop-up blockers after an async operation, some browsers require 
      // the window.open to be called directly in the event handler, but since 
      // we need to wait for auth, we use this approach which works in most modern browsers
      // if the async task is fast enough.
      window.open('/admin/dashboard', '_blank');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar login');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-[#FFF4E6] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[#2B1710]">DELÍCIA'S</h1>
          <p className="text-[#E87524] font-bold tracking-[0.2em] uppercase text-sm">Painel Administrativo</p>
        </div>

        <Card className="border-none shadow-xl bg-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-[#2B1710]">Login</CardTitle>
            <CardDescription>Insira suas credenciais para acessar o painel</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Digite seu e-mail" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#FFF4E6]/50 border-[#F3E2CC] focus:ring-[#E87524]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#FFF4E6]/50 border-[#F3E2CC] focus:ring-[#E87524]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-[#E87524] hover:bg-[#C95718] text-white font-bold h-12"
                disabled={isLoading}
              >
                {isLoading ? 'ENTRANDO...' : 'ENTRAR NO PAINEL'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

