import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product, Addition } from '../types/burger';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number, additions: Addition[], observation?: string) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity, additions, observation) => {
        const additionsPrice = additions.reduce((acc, curr) => acc + curr.price, 0);
        
        const existingItemIndex = get().items.findIndex(item => 
          item.product.id === product.id && 
          item.observation === observation &&
          JSON.stringify(item.additions.sort((a, b) => a.name.localeCompare(b.name))) === 
          JSON.stringify(additions.sort((a, b) => a.name.localeCompare(b.name)))
        );

        if (existingItemIndex !== -1) {
          const updatedItems = [...get().items];
          const item = updatedItems[existingItemIndex];
          if (item) {
            const newQuantity = item.quantity + quantity;
            updatedItems[existingItemIndex] = {
              ...item,
              quantity: newQuantity,
              totalPrice: (item.product.price + additionsPrice) * newQuantity
            };
            set({ items: updatedItems });
          }
        } else {
          const cartId = Math.random().toString(36).substring(7);
          const totalPrice = (product.price + additionsPrice) * quantity;
          set((state) => {
            const newItem: CartItem = { 
              cartId, 
              product, 
              quantity, 
              additions, 
              totalPrice, 
              observation 
            };
            return {
              items: [...state.items, newItem],
            };
          });
        }
      },
      removeItem: (cartId) => {
        set((state) => ({
          items: state.items.filter((item) => item.cartId !== cartId),
        }));
      },
      updateQuantity: (cartId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartId);
          return;
        }
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
    }),
    {
      name: 'burger-cart-storage',
      storage: createJSONStorage(() => {
        // Safe check for window/localStorage during SSR
        if (typeof window !== 'undefined') {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Skip hydration during SSR
      skipHydration: true,
    }
  )
);



