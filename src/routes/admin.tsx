import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const Route = createFileRoute('/admin')({
  component: AdminGateway,
});

import { Outlet } from '@tanstack/react-router';

function AdminGateway() {
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if exactly at /admin
    if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user.email?.toLowerCase() === 'deliciahotburguers@gmail.com') {
          window.location.replace('/admin/dashboard');
        } else {
          window.location.replace('/admin/login');
        }
      };
      
      checkAuth();
    }
  }, [navigate]);

  return <Outlet />;
}
