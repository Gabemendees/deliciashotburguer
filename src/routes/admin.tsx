import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && location.pathname === '/admin') {
      throw redirect({ to: '/admin/dashboard' });
    }
  },
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user has admin role
      const { data: roleData, error: roleError } = await (supabase as any)
        .from('user_roles')

        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', 'admin')
        .single();

      if (roleError || !roleData) {
        await supabase.auth.signOut();
        throw new Error('Acesso negado. Apenas administradores podem entrar.');
      }

      toast.success('Login realizado com sucesso!');
      navigate({ to: '/admin/dashboard' });
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
                  placeholder="admin@hamburgueria.com" 
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

