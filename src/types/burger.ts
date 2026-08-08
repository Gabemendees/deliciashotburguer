export type Category = 'HOT DOGS' | 'HAMBÚRGUERES' | 'BEBIDAS';

export interface Product {
  id: string;
  number: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image?: string;
}

export interface Addition {
  name: string;
  price: number;
}

export interface CartItem {
  cartId: string;
  product: Product;
  quantity: number;
  additions: Addition[];
  totalPrice: number;
  observation?: string | undefined;
}

export interface DeliveryArea {
  neighborhood: string;
  fee: number;
}

export interface Order {
  name: string;
  phone: string;
  type: 'delivery' | 'pickup';
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    reference?: string;
  };
  payment: 'dinheiro' | 'pix' | 'credito' | 'debito';
  change?: string;
  observation?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}
