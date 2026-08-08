import { createFileRoute, redirect } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session && session.user.email?.toLowerCase() === 'deliciahotburguers@gmail.com') {
      throw redirect({ to: '/admin/dashboard' });
    }
    
    throw redirect({ to: '/admin/login' });
  },
  component: () => null,
});
