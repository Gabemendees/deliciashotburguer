import { create } from 'zustand';
import { CartItem, Product, Addition, Order } from '../types/burger';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number, additions: Addition[]) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  subtotal: number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  addItem: (product, quantity, additions) => {
    const additionsPrice = additions.reduce((acc, curr) => acc + curr.price, 0);
    const totalPrice = (product.price + additionsPrice) * quantity;
    const cartId = Math.random().toString(36).substring(7);

    set((state) => ({
      items: [...state.items, { cartId, product, quantity, additions, totalPrice }],
    }));
  },
  removeItem: (cartId) => {
    set((state) => ({
      items: state.items.filter((item) => item.cartId !== cartId),
    }));
  },
  updateQuantity: (cartId, quantity) => {
    set((state) => ({
      items: state.items.map((item) => {
        if (item.cartId === cartId) {
          const additionsPrice = item.additions.reduce((acc, curr) => acc + curr.price, 0);
          return {
            ...item,
            quantity,
            totalPrice: (item.product.price + additionsPrice) * quantity,
          };
        }
        return item;
      }),
    }));
  },
  clearCart: () => set({ items: [] }),
  get subtotal() {
    return get().items.reduce((acc, item) => acc + item.totalPrice, 0);
  },
  get total() {
    return get().subtotal;
  },
}));

