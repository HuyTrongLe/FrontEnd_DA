import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { decryptData } from "../../Encrypt/encryptionUtils";
const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(decryptData(Cookies.get("UserId")));

  // Watch for changes in the UserId cookie
  useEffect(() => {
    const checkUserIdCookie = () => {
      const currentUserId = decryptData(Cookies.get("UserId"));
      if (!currentUserId) {
        // Clear cart if userId is not present (user logged out)
        setCartItems([]);
      }
      setUserId(currentUserId);
    };

    // Check immediately
    checkUserIdCookie();

    // Set up an interval to check for cookie changes
    const interval = setInterval(checkUserIdCookie, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadCartItems = async () => {
      if (!userId) {
        console.log('No userId found, skipping cart load');
        setCartItems([]); // Clear cart when no userId
        return;
      }
      
      try {
        // Fetch book orders first
        const bookOrdersResponse = await axios.get('https://rmrbdapi.somee.com/odata/BookOrder', {
          headers: { 'Content-Type': 'application/json', 'Token': '123-abc' },
        });
    
        // Filter orders by customerId AND null orderCode (cart items)
        const userBookOrders = bookOrdersResponse.data.filter(order => 
          order.customerId === parseInt(userId) && order.orderCode === null
        );
    
        // Fetch order details
        const orderDetailsResponse = await axios.get('https://rmrbdapi.somee.com/odata/BookOrderDetail', {
          headers: { 'Content-Type': 'application/json', 'Token': '123-abc' },
        });
    
        // Flatten the order details into individual orders
        const flatOrders = orderDetailsResponse.data.map(detail => {
          const order = userBookOrders.find(order => order.orderId === detail.orderId);
          return order ? {
            orderDetailId: detail.orderDetailId, 
            bookId: detail.bookId,
            quantity: detail.quantity,
            price: detail.price,
            totalPrice: detail.quantity * detail.price,
            purchaseDate: order.purchaseDate,
            clientAddressId: order.clientAddressId,
            orderId: order.orderId
          } : null;
        }).filter(order => order !== null);
    
        console.log('Successfully loaded cart items:', flatOrders);
        setCartItems(flatOrders);
      } catch (error) {
        console.error('Failed to load cart items:', error.response?.status, error.response?.data);
        setCartItems([]); // Clear cart on error
      }
    };

    loadCartItems();
  }, [userId]); // Reload cart items when userId changes

  const updateCartItems = (items) => {
    if (!userId) return; // Don't update if no user is logged in
    console.log('Updating cart items:', items);
    setCartItems(items);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    updateCartItems,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
