import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  // Read cart items
  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsCart = await AsyncStorage.getItem('@GoMarketplace:cart');
      if (productsCart) {
        setProducts([...JSON.parse(productsCart)]);
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // Verificar se existe o item no carrinho
      const productExists = products.find(
        productInCart => productInCart.id === product.id,
      );

      // Se o produto existir, só incrementa a quantidade, se não adiciona no carrinho
      if (productExists) {
        setProducts(
          products.map(productInCart =>
            productInCart.id === product.id
              ? { ...product, quantity: productInCart.quantity + 1 }
              : productInCart,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIncrement = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );

      setProducts(productIncrement);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(productIncrement),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productDecrement = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity - 1 }
          : product,
      );

      setProducts(productDecrement);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(productDecrement),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
