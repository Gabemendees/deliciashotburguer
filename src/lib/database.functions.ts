import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// --- CATEGORIES ---

export const getAdminCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });
    if (error) throw error;
    return data;
  });

export const updateCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: any) => z.object({
    id: z.string().uuid().optional(),
    name: z.string(),
    slug: z.string(),
    order: z.number().optional().nullable(),
    is_active: z.boolean().optional().nullable(),
  }).parse(input))
  .handler(async ({ context, data: input }) => {
    const { id, ...data } = input;
    // Map undefined to null to satisfy exactOptionalPropertyTypes
    const payload: any = { ...data };
    if (payload.order === undefined) payload.order = null;
    if (payload.is_active === undefined) payload.is_active = null;

    if (id) {
      const { data: updated, error } = await context.supabase
        .from('categories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    } else {
      const { data: created, error } = await context.supabase
        .from('categories')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return created;
    }
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: any) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data: input }) => {
    const { error } = await context.supabase
      .from('categories')
      .delete()
      .eq('id', input.id);
    if (error) throw error;
    return { success: true };
  });

// --- PRODUCTS ---

export const getAdminProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from('products')
      .select('*, categories(*)');
    if (error) throw error;
    return data;
  });

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: any) => z.object({
    id: z.string().uuid().optional(),
    category_id: z.string().uuid(),
    name: z.string(),
    description: z.string().optional().nullable(),
    price: z.number(),
    image_url: z.string().optional().nullable(),
    is_available: z.boolean().optional().nullable(),
    is_featured: z.boolean().optional().nullable(),
    order: z.number().optional().nullable(),
  }).parse(input))
  .handler(async ({ context, data: input }) => {
    const { id, ...data } = input;
    // Map undefined to null
    const payload: any = { ...data };
    if (payload.is_available === undefined) payload.is_available = null;
    if (payload.is_featured === undefined) payload.is_featured = null;
    if (payload.order === undefined) payload.order = null;

    if (id) {
      const { data: updated, error } = await context.supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    } else {
      const { data: created, error } = await context.supabase
        .from('products')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return created;
    }
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: any) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data: input }) => {
    const { error } = await context.supabase
      .from('products')
      .delete()
      .eq('id', input.id);
    if (error) throw error;
    return { success: true };
  });

// --- ADDITIONS ---

export const getAdminAdditions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from('additions')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  });

export const updateAddition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: any) => z.object({
    id: z.string().uuid().optional(),
    name: z.string(),
    price: z.number(),
    is_available: z.boolean().optional().nullable(),
  }).parse(input))
  .handler(async ({ context, data: input }) => {
    const { id, ...data } = input;
    const payload: any = { ...data };
    if (payload.is_available === undefined) payload.is_available = null;

    if (id) {
      const { data: updated, error } = await context.supabase
        .from('additions')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    } else {
      const { data: created, error } = await context.supabase
        .from('additions')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return created;
    }
  });

export const deleteAddition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: any) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data: input }) => {
    const { error } = await context.supabase
      .from('additions')
      .delete()
      .eq('id', input.id);
    if (error) throw error;
    return { success: true };
  });

// --- ORDERS ---

export const getAdminOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from('orders')
      .select('*, order_items(*, order_item_additions(*))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: any) => z.object({
    id: z.string().uuid(),
    status: z.enum(['new', 'accepted', 'preparing', 'ready', 'delivered', 'completed', 'cancelled']),
  }).parse(input))
  .handler(async ({ context, data: input }) => {
    const { data, error } = await context.supabase
      .from('orders')
      .update({ status: input.status })
      .eq('id', input.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  });

// --- CONFIG ---

// Use a separate client for public config reads if needed, 
// but since this is a server function we can import it directly.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getStoreConfig = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from('store_config')
      .select('*');
    if (error) throw error;
    
    // Map array to object for easier consumption
    const config: Record<string, any> = {};
    data.forEach((item: any) => {
      config[item.key] = item.value;
    });
    return config;
  });

export const updateStoreConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: any) => z.object({
    key: z.string(),
    value: z.any(),
  }).parse(input))
  .handler(async ({ context, data: input }) => {
    const { data, error } = await context.supabase
      .from('store_config')
      .upsert({ key: input.key, value: input.value }, { onConflict: 'key' })
      .select()
      .single();
    if (error) throw error;
    return data;
  });

// --- PUBLIC (no auth) READS FOR THE STOREFRONT ---

export const getPublicCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug, order, is_active")
    .eq("is_active", true)
    .order("order", { ascending: true });
  if (error) throw error;
  return data ?? [];
});

export const getPublicProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id, category_id, name, description, price, image_url, is_available, categories(id, name, slug)")
    .eq("is_available", true);
  if (error) throw error;
  return data ?? [];
});

export const getPublicAdditions = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("additions")
    .select("id, name, price, is_available, order")
    .eq("is_available", true)
    .order("order", { ascending: true });
  if (error) throw error;
  return data ?? [];
});
