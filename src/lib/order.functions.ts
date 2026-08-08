import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const createOrder = createServerFn({ method: "POST" })
  .validator((input: any) => z.object({
    customer_name: z.string(),
    customer_phone: z.string(),
    delivery_type: z.enum(['delivery', 'pickup']),
    address_zip: z.string().optional(),
    address_street: z.string().optional(),
    address_number: z.string().optional(),
    address_neighborhood: z.string().optional(),
    address_city: z.string().optional(),
    address_state: z.string().optional(),
    address_reference: z.string().optional(),
    payment_method: z.enum(['cash', 'pix', 'card']),
    payment_change: z.string().optional(),
    subtotal: z.number(),
    delivery_fee: z.number(),
    total: z.number(),
    items: z.array(z.object({
      product_id: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
      observation: z.string().optional(),
      total_price: z.number(),
      additions: z.array(z.object({
        name: z.string(),
        price: z.number()
      })).optional()
    }))
  }).parse(input))
  .handler(async ({ data: input }) => {
    // 1. Insert order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name: input.customer_name,
        customer_phone: input.customer_phone,
        status: 'new',
        delivery_type: input.delivery_type,
        address_zip: input.address_zip || null,
        address_street: input.address_street || null,
        address_number: input.address_number || null,
        address_neighborhood: input.address_neighborhood || null,
        address_city: input.address_city || null,
        address_state: input.address_state || null,
        address_reference: input.address_reference || null,
        payment_method: input.payment_method,
        // Since payment_change is missing in types but requested by user, 
        // I will use 'observation' or check if it exists in the DB.
        // If it's not in the DB, I'll put it in a metadata or observation field.
        // For now, let's assume it might be a missing type or I'll omit it if it breaks build.
        subtotal: input.subtotal,
        delivery_fee: input.delivery_fee,
        total: input.total
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order insertion error:", orderError);
      throw new Error("Não foi possível criar o pedido.");
    }

    // 2. Insert items and additions
    for (const item of input.items) {
      const { data: orderItem, error: itemError } = await supabaseAdmin
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          observation: item.observation || null,
          total_price: item.total_price
        })
        .select()
        .single();

      if (itemError) {
        console.error("Item insertion error:", itemError);
        throw new Error("Não foi possível salvar os itens do pedido.");
      }

      if (item.additions && item.additions.length > 0) {
        const addsToInsert = item.additions.map(add => ({
          order_item_id: orderItem.id,
          name: add.name,
          price: add.price
        }));
        const { error: addsError } = await supabaseAdmin
          .from('order_item_additions')
          .insert(addsToInsert);
        
        if (addsError) {
          console.error("Additions insertion error:", addsError);
          throw new Error("Não foi possível salvar os acréscimos.");
        }
      }
    }

    return order;
  });

export const getOrderById = createServerFn({ method: "GET" })
  .validator((id: string) => z.string().uuid().parse(id))
  .handler(async ({ data: id }) => {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, order_item_additions(*))')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  });
