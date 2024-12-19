import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { calculateShippingFee, createShippingOrder } from '../services/ShippingService';
import {   getProvinceName,   fetchDistrictName,   fetchWardName } from '../services/AddressService';
import axios from 'axios';
import { Form, Row, Col, Button } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingOverlay from '../shared/LoadingOverlay';
import { updateBookStock } from '../services/BookService';
import { createBookTransaction } from '../services/Transaction';
import { createOrderStatus } from '../services/OrderStatusService';
import { decryptData } from "../Encrypt/encryptionUtils";
const getAccountById = async (accountId) => {
  try {
    const response = await axios.get(`https://rmrbdapi.somee.com/odata/Account/${accountId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Token': '123-abc',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching account ${accountId}:`, error);
    return null;
  }
};

const formatDeliveryDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000); // Convert Unix timestamp to JS Date
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const deleteOrderDetail = async (orderDetailId) => {
  try {
    await axios.delete(`https://rmrbdapi.somee.com/odata/BookOrderDetail/${orderDetailId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Token': '123-abc'
      }
    });
  } catch (error) {
    console.error(`Error deleting order detail ${orderDetailId}:`, error);
    throw error;
  }
};

// Add this helper function to delete parent order
const deleteParentOrder = async (orderId) => {
  try {
    await axios.delete(`https://rmrbdapi.somee.com/odata/BookOrder/${orderId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Token': '123-abc'
      }
    });
    console.log(`Order ${orderId} deleted successfully.`);
  } catch (error) {
    // Just log the error since the order might have been already deleted
    console.log(`Parent order ${orderId} might have been already deleted:`, error);
  }
};

// Add this helper function to handle coin transactions
const handleCoinTransaction = async (totalAmount, orders, userId) => {
  try {
    // First get the current buyer's account data
    const buyerResponse = await axios.get(
      `https://rmrbdapi.somee.com/odata/Account/${userId}`,
      {
        headers: {
          'Token': '123-abc'
        }
      }
    );
    const buyerAccount = buyerResponse.data;
    
    if (buyerAccount.coin < totalAmount) {
      throw new Error('Số dư xu không đủ để thực hiện giao dịch');
    }

    // Update buyer's balance
    const updatedBuyerBalance = buyerAccount.coin - totalAmount;
    await axios.put(
      `https://rmrbdapi.somee.com/odata/Account/info/${userId}`,
      {
        ...buyerAccount,
        coin: updatedBuyerBalance
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Token': '123-abc'
        }
      }
    );

    // Group orders by seller
    const ordersBySeller = orders.reduce((acc, order) => {
      const sellerId = order.bookDetails.createById;
      if (!acc[sellerId]) {
        acc[sellerId] = [];
      }
      acc[sellerId].push(order);
      return acc;
    }, {});

    // For each seller, calculate and transfer their share
    for (const [sellerId, sellerOrders] of Object.entries(ordersBySeller)) {
      if (!sellerId) continue;

      // Get seller's account
      const sellerResponse = await axios.get(
        `https://rmrbdapi.somee.com/odata/Account/${sellerId}`,
        {
          headers: {
            'Token': '123-abc'
          }
        }
      );
      const sellerAccount = sellerResponse.data;

      // Calculate seller's share (tạm tính - only the book prices, no shipping fee)
      const sellerShare = sellerOrders.reduce((total, order) => {
        return total + order.totalPrice; // This is the "tạm tính" for each order
      }, 0);

      // Update seller's balance
      await axios.put(
        `https://rmrbdapi.somee.com/odata/Account/info/${sellerId}`,
        {
          ...sellerAccount,
          coin: sellerAccount.coin + sellerShare
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': '123-abc'
          }
        }
      );
    }

    return {
      previousBalance: buyerAccount.coin,
      updatedBalance: updatedBuyerBalance
    };
  } catch (error) {
    console.error('Error in coin transaction:', error);
    throw error;
  }
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = decryptData(Cookies.get("UserId"));
  
  // Add this check at the beginning of your component
  useEffect(() => {
    // If there are no selected orders or they've been cleared, redirect to cart
    if (!location.state?.selectedOrders?.length) {
      navigate('/cart', { replace: true });
      return;
    }
    
    // Existing authentication check
    if (!userId) {
      toast.error('Vui lòng đăng nhập để tiếp tục thanh toán');
      navigate('/login');
      return;
    }
  }, [location.state, userId, navigate]);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const { selectedOrders = [] } = location.state || {};
  const [addressDetails, setAddressDetails] = useState({});
  const [accountDetails, setAccountDetails] = useState({});
  const [senderAddress, setSenderAddress] = useState(null);
  const [recipientDetails, setRecipientDetails] = useState(null);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isRecipientLoading, setIsRecipientLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Add new state for grouped orders
  const [groupedOrders, setGroupedOrders] = useState({});

  // Group orders by sender address when component mounts or selected orders change
  useEffect(() => {
    const groupBySenderAddress = () => {
      const grouped = selectedOrders.reduce((acc, order) => {
        const senderAddressId = order.bookDetails?.senderAddressId;
        if (!acc[senderAddressId]) {
          acc[senderAddressId] = [];
        }
        acc[senderAddressId].push(order);
        return acc;
      }, {});
      setGroupedOrders(grouped);
    };

    groupBySenderAddress();
  }, [selectedOrders]);

  // Fetch user coins
  useEffect(() => {
    const fetchUserCoins = async () => {
      try {
        const response = await axios.get(`https://rmrbdapi.somee.com/odata/Account/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Token': '123-abc',
          },
        });
        setUserCoins(response.data.coin || 0);
      } catch (error) {
        console.error('Error fetching user coins:', error);
        setUserCoins(0);
      }
    };

    if (userId) {
      fetchUserCoins();
    }
  }, [userId]);

  // Function to fetch location names for an address
  const fetchLocationNames = async (address) => {
    try {
      console.log('Fetching location names for address:', address);
      
      const provinceName = await getProvinceName(address.provinceCode);
      const districtName = await fetchDistrictName(address.provinceCode, address.districtCode);
      const wardName = await fetchWardName(address.districtCode, address.wardCode);

      console.log('Location names:', { provinceName, districtName, wardName });

      setAddressDetails(prev => ({
        ...prev,
        [address.addressId]: {
          provinceName: provinceName || 'Unknown Province',
          districtName: districtName || 'Unknown District',
          wardName: wardName || 'Unknown Ward'
        }
      }));
    } catch (error) {
      console.error('Error fetching location names:', error);
      // Set default values in case of error
      setAddressDetails(prev => ({
        ...prev,
        [address.addressId]: {
          provinceName: 'Error loading province',
          districtName: 'Error loading district',
          wardName: 'Error loading ward'
        }
      }));
    }
  };

  // Fetch client addresses
  useEffect(() => {
    const fetchClientAddresses = async () => {
      try {
        const response = await axios.get('https://rmrbdapi.somee.com/odata/CustomerAddress', {
          headers: {
            'Content-Type': 'application/json',
            'Token': '123-abc',
          },
        });
        
        const userAddresses = response.data.filter(addr => addr.accountId === parseInt(userId));
        console.log('Addresses from API:', userAddresses); // Debug log
        setAddresses(userAddresses);

        // Fetch location names for each address
        for (const address of userAddresses) {
          await fetchLocationNames(address);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast.error('Failed to load delivery addresses');
      }
    };

    if (userId) {
      fetchClientAddresses();
    }
  }, [userId]);

  // Fetch account details
  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const newDetails = {};
        for (const address of addresses) {
          if (!accountDetails[address.accountId]) {
            const accountData = await getAccountById(address.accountId);
            if (accountData) {
              newDetails[address.accountId] = accountData;
            }
          }
        }
        
        if (Object.keys(newDetails).length > 0) {
          setAccountDetails(prev => ({
            ...prev,
            ...newDetails
          }));
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    };

    if (addresses.length > 0) {
      fetchAccountDetails();
    }
  }, [addresses]);

  // Add useEffect to fetch sender address
  useEffect(() => {
    const fetchSenderAddress = async () => {
      try {
        if (selectedOrders.length > 0 && selectedOrders[0]?.bookDetails?.senderAddressId) {
          const senderAddressId = selectedOrders[0].bookDetails.senderAddressId;
          const response = await axios.get(
            `https://rmrbdapi.somee.com/odata/CustomerAddress/${senderAddressId}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'Token': '123-abc',
              },
            }
          );
          
          // Fetch location names for sender address
          const provinceName = await getProvinceName(response.data.provinceCode);
          const districtName = await fetchDistrictName(response.data.provinceCode, response.data.districtCode);
          const wardName = await fetchWardName(response.data.districtCode, response.data.wardCode);

          setSenderAddress({
            ...response.data,
            provinceName,
            districtName,
            wardName
          });
        }
      } catch (error) {
        console.error('Error fetching sender address:', error);
        toast.error('Failed to load sender address information');
      }
    };

    fetchSenderAddress();
  }, [selectedOrders]);

  // Add useEffect to fetch recipient details when address is selected
  useEffect(() => {
    const fetchRecipientDetails = async () => {
      if (selectedAddress) {
        try {
          const response = await axios.get(
            `https://rmrbdapi.somee.com/odata/Account/${selectedAddress.accountId}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'Token': '123-abc',
              },
            }
          );
          
          console.log('Fetched recipient details:', response.data); // Debug log
          
          // Update selected address with recipient details
          setSelectedAddress(prev => ({
            ...prev,
            accountName: response.data.userName,
            userName: response.data.userName
          }));
          
          setRecipientDetails(response.data);
        } catch (error) {
          console.error('Error fetching recipient details:', error);
          toast.error('Failed to load recipient information');
        }
      }
    };

    fetchRecipientDetails();
  }, [selectedAddress?.accountId]); // Only run when selected address changes

  const [expectedDeliveryTime, setExpectedDeliveryTime] = useState(null);

  const calculateShippingFeeForAddress = async (address) => {
    try {
      const senderAddressId = selectedOrders[0]?.bookDetails?.senderAddressId;
      
      if (!senderAddressId) {
        throw new Error('No sender address found');
      }

      // Fetch sender's address details
      const senderAddressResponse = await axios.get(
        `https://rmrbdapi.somee.com/odata/CustomerAddress/${senderAddressId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': '123-abc',
          },
        }
      );

      const senderAddress = senderAddressResponse.data;
      
      // Calculate dimensions and weight with proper constraints
      const totalWeight = selectedOrders.reduce((sum, order) => {
        // Convert weight to grams and ensure minimum weight of 1 gram
        return sum + Math.max((order.bookDetails?.weight || 0), 1);
      }, 0);

      const maxDimensions = selectedOrders.reduce((dims, order) => {
        const book = order.bookDetails;
        return {
          // Ensure minimum dimensions of 1 cm
          length: Math.max(dims.length, book?.length || 1),
          width: Math.max(dims.width, book?.width || 1),
          height: Math.max(dims.height, book?.height || 1),
        };
      }, { length: 1, width: 1, height: 1 });

      // Base fee data with validated values
      const baseFeeData = {
        from_district_id: parseInt(senderAddress.districtCode),
        from_ward_code: String(senderAddress.wardCode),
        to_district_id: parseInt(address.districtCode),
        to_ward_code: String(address.wardCode),
        height: Math.max(Math.min(Math.ceil(maxDimensions.height), 200), 1),
        length: Math.max(Math.min(Math.ceil(maxDimensions.length), 200), 1),
        width: Math.max(Math.min(Math.ceil(maxDimensions.width), 200), 1),
        weight: Math.max(Math.min(Math.ceil(totalWeight), 50000), 1),
        insurance_value: calculateTotalPrice()
      };

      // Try first service ID
      try {
        const firstFeeData = { ...baseFeeData, service_type_id: 2 };
        console.log('Trying first service type:', firstFeeData);
        
        const response = await calculateShippingFee(firstFeeData);
        if (response.data?.total) {
          setShippingFee(response.data.total);
          setExpectedDeliveryTime(response.expected_delivery_time);
          return;
        }
      } catch (error) {
        console.log('First service ID failed, trying alternative');
      }

      // Try second service ID if first one fails
      try {
        const secondFeeData = { ...baseFeeData, service_type_id: 5 };
        console.log('Trying second service type:', secondFeeData);
        
        const response = await calculateShippingFee(secondFeeData);
        if (response.data?.total) {
          setShippingFee(response.data.total);
          setExpectedDeliveryTime(response.expected_delivery_time);
          return;
        }
      } catch (error) {
        console.error('Both service IDs failed');
        throw error;
      }

      // If we get here, neither service ID worked
      setShippingFee(0);
      setExpectedDeliveryTime(null);
      setSelectedAddress(null); // Reset selected address
      toast.error('Khu vực không hỗ trợ giao hàng');

    } catch (error) {
      console.error('Error calculating shipping fee:', error);
      console.error('Error response:', error.response?.data);
      setShippingFee(0);
      setExpectedDeliveryTime(null);
      setSelectedAddress(null); // Reset selected address
      toast.error('Khu vực không hỗ trợ giao hàng');
    }
  };

  // Add this validation function
  const isValidVietnamesePhoneNumber = (phoneNumber) => {
    // Regular expression for Vietnamese phone numbers
    const phoneRegex = /^(84|0[3|5|7|8|9])+([0-9]{8})$/;
    return phoneRegex.test(phoneNumber);
  };

  // Update the formatAmount function to have different slide directions
  const formatAmount = (amount, paymentType = paymentMethod) => {
    const formattedNumber = amount.toLocaleString('vi-VN');
    
    return (
      <div className="relative flex justify-end" style={{ minWidth: '100px' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={paymentType}
            initial={{ 
              position: 'absolute', 
              x: paymentType === 'COINS' ? -50 : 60, 
              opacity: 0 
            }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ 
              x: paymentType === 'COINS' ? 60 : -50, 
              opacity: 0 
            }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            {formattedNumber}
            {paymentType === 'COINS' ? (
              <img src="/images/icon/dollar.png" alt="coin" className="w-4 h-4 ml-1" />
            ) : (
              <span className="ml-1">đ</span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    return selectedOrders.reduce((total, order) => total + (order?.totalPrice || 0), 0);
  };

  // Calculate final price including fees (remove COD fee)
  const calculateCombinedTotalPrice = () => {
    const subtotal = calculateTotalPrice();
    return subtotal + shippingFee;
  };

  // Convert payment method to numeric type
  const paymentTypeMap = {
    'COD': 2,    // Cash on Delivery is type 2
    'COINS': 1   // Pay with Coins is type 1
  };

  // Update the handlePlaceOrder function
  const handlePlaceOrder = async () => {
    try {
      setIsProcessing(true);

      if (!selectedAddress) {
        toast.error('Vui lòng chọn địa chỉ giao hàng');
        return;
      }
      if (!paymentMethod) {
        toast.error('Vui lòng chọn phương thức thanh toán');
        return;
      }

      // Handle coin payment first if applicable
      if (paymentMethod === 'COINS') {
        const totalAmount = calculateCombinedTotalPrice();
        
        try {
          const transactionResult = await handleCoinTransaction(totalAmount, selectedOrders, userId);
        } catch (error) {
          console.error('Coin transaction failed:', error);
          throw new Error(error.message || 'Giao dịch xu thất bại');
        }
      }

      // Store order detail IDs and their parent order IDs
      const orderInfo = selectedOrders.reduce((acc, order) => {
        if (!acc[order.orderId]) {
          acc[order.orderId] = [];
        }
        acc[order.orderId].push(order.orderDetailId);
        return acc;
      }, {});

      // Create shipping orders for each group
      const shippingOrderPromises = Object.entries(groupedOrders).map(async ([senderAddressId, orders]) => {
        const senderAddressResponse = await axios.get(
          `https://rmrbdapi.somee.com/odata/CustomerAddress/${senderAddressId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Token': '123-abc',
            }
          }
        );

        const codAmount = paymentMethod === 'COD' ? 
          orders.reduce((total, order) => total + order.totalPrice, 0) + (shippingFee / Object.keys(groupedOrders).length) : 
          0;

        return createShippingOrder(
          orders.map(order => order.bookDetails),
          selectedAddress,
          senderAddressResponse.data,
          codAmount
        );
      });

      const shippingOrders = await Promise.all(shippingOrderPromises);

      // Create book orders for each group
      const orderPromises = Object.entries(groupedOrders).map(async ([senderAddressId, orders], index) => {
        const orderPayload = {
          orderId: 0,
          customerId: parseInt(userId),
          totalPrice: orders.reduce((total, order) => total + order.totalPrice, 0) + (shippingFee / Object.keys(groupedOrders).length),
          shipFee: shippingFee / Object.keys(groupedOrders).length,
          price: orders.reduce((total, order) => total + order.totalPrice, 0),
          purchaseDate: new Date().toISOString(),
          paymentType: paymentTypeMap[paymentMethod],
          orderCode: shippingOrders[index].data?.order_code || null,
          status: 1,
          clientAddressId: parseInt(selectedAddress.addressId),
          shippingAddress: null,
          bookOrderDetails: orders.map(order => ({
            bookId: order.bookDetails.bookId,
            quantity: order.quantity,
            price: order.price
          }))
        };

        return axios.post(
          'https://rmrbdapi.somee.com/odata/BookOrder',
          orderPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Token': '123-abc'
            }
          }
        );
      });

      const bookOrders = await Promise.all(orderPromises);

      // Create order statuses and transactions
      await Promise.all(bookOrders.map(async (order) => {
        await createOrderStatus(
          order.data.orderId,
          1,
          'ready_to_pick'
        );

        await createBookTransaction(
          userId,
          order.data.orderId,
          order.data.totalPrice,
          paymentTypeMap[paymentMethod]
        );
      }));

      // After successful order creation, delete order details and check parent orders
      for (const [orderId, detailIds] of Object.entries(orderInfo)) {
        // Delete all order details for this order
        await Promise.all(detailIds.map(id => deleteOrderDetail(id)));

        // Check if any order details remain for this order
        const response = await axios.get(`https://rmrbdapi.somee.com/odata/BookOrderDetail`, {
          headers: {
            'Content-Type': 'application/json',
            'Token': '123-abc'
          }
        });
        
        const remainingDetails = response.data.filter(detail => detail.orderId === parseInt(orderId));
        
        // If no details remain, delete the parent order
        if (remainingDetails.length === 0) {
          await deleteParentOrder(orderId);
        }
      }

      await Swal.fire({
        position: "center",
        icon: "success",
        title: "Đặt đơn hàng thành công!",
        text: "Cảm ơn bạn đã mua hàng",
        showConfirmButton: false,
        timer: 1500
      });

      // Navigate first
      navigate('/orders', { 
        replace: true,
        state: { selectedOrders: [] }
      });

      // Reload after a short delay to ensure navigation completes
      setTimeout(() => {
        window.location.reload();
      }, 100);

    } catch (error) {
      console.error('Error placing order:', error);
      
      // If there was an error and we were using coins, attempt to refund
      if (paymentMethod === 'COINS') {
        try {
          const accountResponse = await axios.get(
            `https://rmrbdapi.somee.com/odata/Account/${userId}`,
            {
              headers: {
                'Token': '123-abc'
              }
            }
          );

          const currentAccount = accountResponse.data;

          await axios.put(
            `https://rmrbdapi.somee.com/odata/Account/info/${userId}`,
            {
              ...currentAccount,
              coin: userCoins // Restore original coin amount
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Token': '123-abc'
              }
            }
          );
        } catch (refundError) {
          console.error('Error refunding coins:', refundError);
        }
      }

      Swal.fire({
        icon: 'error',
        title: 'Đặt hàng thất bại',
        text: error.message || 'Vui lòng thử lại sau',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Add this helper function to check if user can pay
  const canPlaceOrder = () => {
    if (!paymentMethod || !selectedAddress) return false;
    if (paymentMethod === 'COINS' && userCoins < calculateCombinedTotalPrice()) {
      console.log('Coins check:', { userCoins, required: calculateCombinedTotalPrice() });
      return false;
    }
    return true;
  };

  if (!selectedOrders?.length) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">No items selected for checkout</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="bg-gray-100 min-h-screen py-4"
    >
      {isProcessing && <LoadingOverlay />}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Checkout</h2>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sản Phẩm
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Đơn Giá
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Số Lượng
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Thành Tiền
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedOrders.map((order, index) => {
                // Safely access nested properties with null checks
                const bookDetails = order?.bookDetails || {};
                const images = bookDetails?.images || [];
                const firstImage = images[0] || {};
                const imageUrl = firstImage?.imageUrl || '';
                const bookName = bookDetails?.bookName || 'Unknown Book';
                const price = order?.price || 0;
                const quantity = order?.quantity || 0;
                const totalPrice = order?.totalPrice || 0;

                return (
                  <tr key={order?.orderDetailId || index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt={bookName}
                            className="w-12 h-16 object-cover rounded mr-4"
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {bookName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {formatAmount(price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {formatAmount(totalPrice)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Address Dropdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Địa Chỉ Giao Hàng</h3>
          
          {/* Address Selection */}
          {addresses.length > 0 ? (
            <div className="space-y-4">
              <div className="relative">
                <select
                  className={`w-full p-2 border rounded-lg ${
                    isAddressLoading || isRecipientLoading ? 'bg-gray-100' : 'bg-white'
                  }`}
                  value={selectedAddress?.addressId || ''}
                  onChange={async (e) => {
                    if (e.target.value === 'manage-addresses') {
                      navigate('/manage-addresses');
                      return;
                    }
                    const selected = addresses.find(addr => addr.addressId === parseInt(e.target.value));
                    if (selected) {
                      setIsAddressLoading(true);
                      setSelectedAddress(selected);
                      try {
                        // Fetch recipient details immediately after selection
                        const response = await axios.get(
                          `https://rmrbdapi.somee.com/odata/Account/${selected.accountId}`,
                          {
                            headers: {
                              'Content-Type': 'application/json',
                              'Token': '123-abc',
                            },
                          }
                        );
                        
                        setSelectedAddress(prev => ({
                          ...prev,
                          accountName: response.data.userName,
                          userName: response.data.userName
                        }));
                        
                        // Calculate shipping fee after recipient details are loaded
                        await calculateShippingFeeForAddress(selected);
                      } catch (error) {
                        console.error('Error loading address details:', error);
                        toast.error('Failed to load address details');
                      } finally {
                        setIsAddressLoading(false);
                      }
                    } else {
                      setSelectedAddress(null);
                    }
                  }}
                  disabled={isAddressLoading || isRecipientLoading}
                >
                  <option value="">Chọn Địa Chỉ</option>
                  {addresses.map((address) => {
                    const locationDetails = addressDetails[address.addressId] || {};
                    const account = accountDetails[address.accountId];
                    
                    return (
                      <option key={address.addressId} value={address.addressId}>
                        {`${address.addressDetail}, 
                        ${locationDetails.wardName || 'Loading...'}, 
                        ${locationDetails.districtName || 'Loading...'}, 
                        ${locationDetails.provinceName || 'Loading...'}`}
                      </option>
                    );
                  })}
                  <option value="manage-addresses" className="text-orange-500 font-medium border-t border-gray-200">
                    + Thêm Địa Chỉ Mới...
                  </option>
                </select>
                {(isAddressLoading || isRecipientLoading) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  </div>
                )}
              </div>
              
              {selectedAddress && !isAddressLoading && !isRecipientLoading && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Chi Tiết Địa Chỉ Đã Chọn:</h4>
                  <p><span className="font-medium">Người Nhận:</span> {selectedAddress.userName || selectedAddress.accountName || 'Đang tải...'}</p>
                  <p><span className="font-medium">Số Điện Thoại:</span> {selectedAddress.phoneNumber}</p>
                  <p><span className="font-medium">Địa Chỉ:</span> {selectedAddress.addressDetail}</p>
                  <p><span className="font-medium">Khu Vực:</span> {' '}
                    {addressDetails[selectedAddress.addressId]?.wardName || 'Đang tải...'}, {' '}
                    {addressDetails[selectedAddress.addressId]?.districtName || 'Đang tải...'}, {' '}
                    {addressDetails[selectedAddress.addressId]?.provinceName || 'Đang tải...'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400 mb-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-gray-600 mb-3">Bạn chưa có địa chỉ giao hàng nào</p>
              <button
                onClick={() => navigate('/manage-addresses')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <svg 
                  className="-ml-1 mr-2 h-5 w-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Thêm Địa Chỉ Mới
              </button>
            </div>
          )}
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Phương Thức Thanh Toán</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coins Payment Option */}
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                paymentMethod === 'COINS'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
              onClick={() => setPaymentMethod('COINS')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Thanh Toán Bằng Xu</h4>
                  <p className="text-sm">
                    <span className="text-gray-500 flex items-center">
                      Số Dư: {userCoins.toLocaleString('vi-VN')} 
                      <img src="/images/icon/dollar.png" alt="coin" className="w-4 h-4 ml-1" />
                    </span>
                    {paymentMethod === 'COINS' && userCoins < calculateCombinedTotalPrice() && (
                      <span className="text-red-500 ml-2 flex items-center">
                        (Cần: {calculateCombinedTotalPrice().toLocaleString('vi-VN')} 
                        <img src="/images/icon/dollar.png" alt="coin" className="w-4 h-4 ml-1" />)
                      </span>
                    )}
                  </p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                  {paymentMethod === 'COINS' && (
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                  )}
                </div>
              </div>
            </div>

            {/* COD Payment Option */}
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                paymentMethod === 'COD'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
              onClick={() => setPaymentMethod('COD')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Thanh Toán Khi Nhận Hàng</h4>
                </div>
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                  {paymentMethod === 'COD' && (
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Tổng Quan Đơn Hàng</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Tạm Tính:</span>
              {formatAmount(calculateTotalPrice(), paymentMethod)}
            </div>
            <div className="flex justify-between items-center">
              <span>Phí Vận Chuyển:</span>
              {formatAmount(shippingFee, paymentMethod)}
            </div>
            {expectedDeliveryTime && (
              <div className="flex justify-between text-black">
                <span>Thời Gian Giao Hàng Dự Kiến:</span>
                <span>{formatDeliveryDate(expectedDeliveryTime)}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Tổng Cộng:</span>
                {formatAmount(calculateCombinedTotalPrice(), paymentMethod)}
              </div>
            </div>
          </div>
        </div>

        {/* Place Order Button - Update this section */}
        <div className="flex justify-end">
          <button
            onClick={handlePlaceOrder}
            disabled={!canPlaceOrder()}
            className={`px-6 py-2 rounded-lg font-medium text-white transition-all
              ${!canPlaceOrder()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600'
              }`}
          >
            Đặt Hàng
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;