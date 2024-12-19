import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button, Table, Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';
import axiosRetry from 'axios-retry';
import { getProvinceName, fetchDistrictName, fetchWardName } from '../services/AddressService';
import { Link } from 'react-router-dom';
import { FaTrash, FaStore } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingOverlay from '../shared/LoadingOverlay';
import Swal from 'sweetalert2';
import { useCart } from './components/CartContext';
import { decryptData } from "../Encrypt/encryptionUtils";
const ShoppingCart = () => {
  const [orders, setOrders] = useState([]);
  const [books, setBooks] = useState({});
  const [addresses, setAddresses] = useState([]); // Holds all user addresses
  const [userId, setUserId] = useState(decryptData(Cookies.get("UserId")));
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [addressDetails, setAddressDetails] = useState({}); // Store address details for each order
  const [totalPrice, setTotalPrice] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();
  const { updateCartItems } = useCart();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch book orders
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
          return {
            orderDetailId: detail.orderDetailId, 
            bookId: detail.bookId,
            quantity: detail.quantity,
            price: detail.price,
            totalPrice: detail.quantity * detail.price,
            purchaseDate: order?.purchaseDate,
            clientAddressId: order?.clientAddressId,
            orderId: order?.orderId // Add orderId to track parent order
          };
        }).filter(order => order.orderId != null); // Only include orders that match with parent orders
    
        // Log flattened orders for debugging
        console.log("Flattened Orders:", flatOrders);
    
        // Fetch book data
        const bookIds = [...new Set(flatOrders.map(order => order.bookId))];
        fetchBooks(bookIds);
    
        // Update the state with flattened orders
        setOrders(flatOrders);
      } catch (error) {
        console.error('Error fetching orders or details:', error);
        toast.error('Failed to load cart items.');
      }
    };
    
    
    const fetchBooks = async (bookIds) => {
      try {
        const bookPromises = bookIds.map(bookId =>
          axios.get(`https://rmrbdapi.somee.com/odata/book/${bookId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Token': '123-abc',
            },
          })
        );
        const bookResponses = await Promise.all(bookPromises);
        
        // Log the responses for debug
        console.log("Fetched Book Data:", bookResponses);
        
        const booksData = bookResponses.reduce((acc, response) => {
          const book = response.data;
          const bookImage = book.images && book.images.length > 0 ? book.images[0].imageUrl : null;
          
          // Add unitInStock data from Book API
          acc[book.bookId] = { 
            ...book, 
            imageUrl: bookImage, 
            unitInStock: book.unitInStock  
          };
          
          // Log the book with stock for debug
          console.log(`Book ID: ${book.bookId}, Unit in Stock: ${book.unitInStock}`);
          
          return acc;
        }, {});
    
        setBooks(booksData); // Save the books with stock data in state
      } catch (error) {
      }
    };
    
    const fetchAddresses = async () => {
      try {
        const response = await axios.get('https://rmrbdapi.somee.com/odata/CustomerAddress', {
          headers: {
            'Content-Type': 'application/json',
            'Token': '123-abc',
          },
        });
    
        // Filter addresses based on the userId from the cookie
        const userAddresses = response.data.filter(addr => addr.accountId === parseInt(userId));
        setAddresses(userAddresses);
    
        console.log("Filtered Addresses for User:", userAddresses);
      } catch (error) {
      }
    };

    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  const handleDeleteClick = (orderDetailId) => {
    Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        handleConfirmDelete(orderDetailId);
      }
    });
  };

  const handleConfirmDelete = async (orderDetailId) => {
    try {
      const orderToRemove = orders.find(order => order.orderDetailId === orderDetailId);
      if (!orderToRemove) {
        throw new Error('Order detail not found');
      }

      // Step 1: Delete the specific BookOrderDetail
      await axios.delete(
        `https://rmrbdapi.somee.com/odata/BookOrderdetail/${orderDetailId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Token: "123-abc",
          },
        }
      );

      // Step 2: Remove the deleted BookOrderDetail from the state (UI)
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.filter(order => order.orderDetailId !== orderDetailId);
        
        // Step 3: Find the orderId associated with the deleted orderDetailId
        const orderToCheck = prevOrders.find(order => order.orderDetailId === orderDetailId);
        
        if (orderToCheck && orderToCheck.orderId) {
          const remainingDetails = updatedOrders.filter(order => order.orderId === orderToCheck.orderId);
          
          // Step 4: If no remaining orderDetailId, delete the orderId (parent order)
          if (remainingDetails.length === 0) {
            console.log(`Order ${orderToCheck.orderId} has no remaining orderDetails. Deleting the entire order...`);

            // Try to delete the parent order, but don't throw an error if it fails
            axios.delete(`https://rmrbdapi.somee.com/odata/BookOrder/${orderToCheck.orderId}`, {
              headers: {
                "Content-Type": "application/json",
                Token: "123-abc",
              },
            })
            .then(() => {
              console.log(`Order ${orderToCheck.orderId} deleted successfully.`);
            })
            .catch((err) => {
              // Just log the error, don't show it to the user since the item was already removed
              console.log(`Parent order ${orderToCheck.orderId} might have been already deleted:`, err);
            });
            
            return updatedOrders.filter(order => order.orderId !== orderToCheck.orderId);
          }
        }

        return updatedOrders;
      });

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Đã xóa thành công!',
        text: 'Sản phẩm đã được xóa khỏi giỏ hàng.',
        showConfirmButton: false,
        timer: 1500,
        position: 'top-end',
        toast: true
      });

    } catch (error) {
      console.error("Error deleting order detail:", error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể xóa sản phẩm khỏi giỏ hàng.',
        showConfirmButton: false,
        timer: 1500,
        position: 'top-end',
        toast: true
      });
    }
  };
  
  
  const formatAddressLine = (address) => {
    if (!address) return 'Address details not available';
    // Combine ward, district, and province
    const addressLine = [
      address.provinceCode || 'Province N/A',
      address.districtCode || 'District N/A', 
      address.wardCode || 'Ward N/A'
    ]
      .filter(Boolean)
      .join(', ');
  
    return addressLine;
  };

  const handleCheckboxChange = (orderDetailId) => {
    setSelectedOrders((prevSelectedOrders) => {
      const newSelectedOrders = new Set(prevSelectedOrders);
      if (newSelectedOrders.has(orderDetailId)) {
        newSelectedOrders.delete(orderDetailId);  // If orderDetailId is already in selected, remove it
      } else {
        newSelectedOrders.add(orderDetailId);  // Add orderDetailId to selected orders
      }
      return newSelectedOrders;
    });
  };
  
  useEffect(() => {
    // Recalculate the total price whenever selectedOrders or orders change
    const total = orders.reduce((sum, order) => {
      if (selectedOrders.has(order.orderDetailId)) {
        return sum + (order.totalPrice || 0); // Add totalPrice of selected order
      }
      return sum;
    }, 0);
    setTotalPrice(total);  // Update totalPrice state
  }, [selectedOrders, orders]);

  const updateTotalPrice = () => {
    const total = orders.reduce((sum, order) => {
      if (selectedOrders.has(order.orderId)) {
        return sum + (order.totalPrice || 0);
      }
      return sum;
    }, 0);
    setTotalPrice(total);
  };
  
  const formatCurrency = (value) => {
    if (typeof value !== 'number') return value;  
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const fetchAddressDetails = async (senderAddressId) => {
  try {
    // Check if details already exist
    if (addressDetails[senderAddressId]) return;

    const addressData = await axios.get(
      `https://rmrbdapi.somee.com/odata/CustomerAddress/${senderAddressId}`,
      {
        headers: { 'Content-Type': 'application/json', 'Token': '123-abc' },
      }
    );

    const addressJson = addressData.data;
    const province = await getProvinceName(addressJson.provinceCode);
    const district = await fetchDistrictName(addressJson.provinceCode, addressJson.districtCode);
    const ward = await fetchWardName(addressJson.districtCode, addressJson.wardCode);

    setAddressDetails((prevDetails) => ({
      ...prevDetails,
      [senderAddressId]: {
        ...addressJson,
        provinceName: province,
        districtName: district,
        wardName: ward,
      },
    }));
  } catch (error) {
    console.error("Error fetching address details:", error);
  }
};

useEffect(() => {
  // Fetch address details for all orders
  orders.forEach(order => {
    if (order.clientAddressId && !addressDetails[order.clientAddressId]) {
      fetchAddressDetails(order.clientAddressId); // Only fetch if not already fetched
    }
  });
}, [orders, addressDetails]); 

const updateOrderQuantity = (orderDetailId, newQuantity) => {
  const orderToUpdate = orders.find(order => order.orderDetailId === orderDetailId);
  if (!orderToUpdate) return;

  // If trying to decrease below 1, show delete confirmation
  if (newQuantity < 1) {
    handleDeleteClick(orderDetailId);
    return;
  }

  const maxQuantity = books[orderToUpdate.bookId]?.unitInStock || 0;

  if (newQuantity > maxQuantity) {
    toast.warn("Quantity exceeds available stock!");
    return;
  }

  const updatedQuantity = Math.max(newQuantity, 1); // Ensure minimum of 1
  const updatedTotalPrice = updatedQuantity * orderToUpdate.price;

  setOrders(prevOrders =>
    prevOrders.map(order =>
      order.orderDetailId === orderDetailId
        ? { ...order, quantity: updatedQuantity, totalPrice: updatedTotalPrice }
        : order
    )
  );

  // Update server and handle 0 quantity
  if (updatedQuantity === 0) handleDeleteClick(orderDetailId);
  else {
    axios.put(`https://rmrbdapi.somee.com/odata/BookOrderDetail/${orderDetailId}`, {
      ...orderToUpdate,
      quantity: updatedQuantity,
      totalPrice: updatedTotalPrice,
    }, { headers: { "Content-Type": "application/json", Token: "123-abc" } })
    .catch(error => console.error("Error updating quantity:", error));
  }
};
  
  const handleProceedToCheckout = () => {
    if (selectedOrders.size > 0) {
      setIsProcessing(true); // This will show LoadingOverlay
      const selectedOrdersList = orders
        .filter(order => selectedOrders.has(order.orderDetailId))
        .map(order => ({
          ...order,
          bookDetails: books[order.bookId],
          address: addressDetails[order.clientAddressId]
        }));

      navigate('/checkout', { 
        state: { 
          selectedOrders: selectedOrdersList,
          totalAmount: totalPrice 
        } 
      });
      
      setTimeout(() => setIsProcessing(false), 500);
    } else {
      toast.error('Please select at least one order to proceed!');
    }
  };

  // Group orders by seller (createById)
  const groupedOrders = orders.reduce((acc, order) => {
    const book = books[order.bookId];
    const sellerId = book?.createById;
    const sellerName = book?.createBy?.userName || 'Unknown Seller';
    
    if (!acc[sellerId]) {
      acc[sellerId] = {
        seller: {
          id: sellerId,
          name: sellerName,
        },
        orders: []
      };
    }
    acc[sellerId].orders.push(order);
    return acc;
  }, {});

  // After updating orders
  updateCartItems(orders);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="bg-gray-100 min-h-screen py-4"
    >
      <div className="container mx-auto px-4">
        <ToastContainer />
        
        {/* Header Bar */}
        <div className="bg-white rounded-t-lg shadow-sm mb-3 p-4">
          <div className="grid grid-cols-12 text-gray-600 text-sm">
            <div className="col-span-1 text-center">
              <input
                type="checkbox"
                className="w-4 h-4 accent-orange-500"
                checked={selectedOrders.size === orders.length}
                onChange={() => {
                  if (selectedOrders.size === orders.length) {
                    setSelectedOrders(new Set());
                  } else {
                    setSelectedOrders(new Set(orders.map(o => o.orderDetailId)));
                  }
                }}
              />
            </div>
            <div className="col-span-5">Sản Phẩm</div>
            <div className="col-span-2 text-center">Đơn Giá</div>
            <div className="col-span-2 text-center">Số Lượng</div>
            <div className="col-span-1 text-center">Số Tiền</div>
            <div className="col-span-1 text-center">Thao Tác</div>
          </div>
        </div>

        {/* Grouped Orders by Seller */}
        {Object.values(groupedOrders).map(({ seller, orders }) => (
          <div key={seller.id} className="bg-white rounded-lg shadow-sm mb-4 p-4">
            {/* Seller Header */}
            <div className="border-b pb-4 flex items-center gap-4">
              <input
                type="checkbox"
                className="w-4 h-4 accent-orange-500"
                checked={orders.every(order => selectedOrders.has(order.orderDetailId))}
                onChange={() => {
                  const sellerOrderIds = orders.map(o => o.orderDetailId);
                  if (orders.every(order => selectedOrders.has(order.orderDetailId))) {
                    setSelectedOrders(prev => {
                      const next = new Set(prev);
                      sellerOrderIds.forEach(id => next.delete(id));
                      return next;
                    });
                  } else {
                    setSelectedOrders(prev => {
                      const next = new Set(prev);
                      sellerOrderIds.forEach(id => next.add(id));
                      return next;
                    });
                  }
                }}
              />
              <FaStore className="text-black" />
              <span className="font-medium ml-2">{seller.name}</span>
            </div>

            {/* Products */}
            {orders.map((order) => {
              const book = books[order.bookId];
              return (
                <div key={order.orderDetailId} className="grid grid-cols-12 items-center py-4 border-b">
                  <div className="col-span-1 text-center">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order.orderDetailId)}
                      onChange={() => handleCheckboxChange(order.orderDetailId)}
                      className="w-4 h-4 accent-orange-500"
                    />
                  </div>
                  
                  <div className="col-span-5 flex items-center gap-4">
                    <Link to={`/book-detail/${order.bookId}`}>
                      <img
                        src={book?.images?.[0]?.imageUrl || 'placeholder.jpg'}
                        alt={book?.bookName}
                        className="w-16 h-20 object-cover rounded hover:opacity-80 transition-opacity"
                      />
                    </Link>
                    <Link 
                      to={`/book-detail/${order.bookId}`}
                      className="font-medium text-gray-800 hover:text-orange-600 transition-colors"
                    >
                      {book?.bookName}
                    </Link>
                  </div>

                  <div className="col-span-2 text-center">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(order.price)}
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <div className="flex border rounded">
                      <button
                        onClick={() => updateOrderQuantity(order.orderDetailId, order.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={order.quantity}
                        onChange={(e) => updateOrderQuantity(order.orderDetailId, parseInt(e.target.value, 10))}
                        className="w-14 text-center border-x [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min="1"
                      />
                      <button
                        onClick={() => updateOrderQuantity(order.orderDetailId, order.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="col-span-1 text-center">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(order.price * order.quantity)}
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      onClick={() => handleDeleteClick(order.orderDetailId)}
                      className="text-gray-500 transition hover:text-red-500"
                    >
                      <FaTrash className="text-xl" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Footer/Checkout Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 sticky bottom-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                className="w-4 h-4 accent-orange-500"
                checked={selectedOrders.size === orders.length}
                onChange={() => {
                  if (selectedOrders.size === orders.length) {
                    setSelectedOrders(new Set());
                  } else {
                    setSelectedOrders(new Set(orders.map(o => o.orderDetailId)));
                  }
                }}
              />
              <span>Chọn tất cả</span>
            </div>
            <div className="flex items-center gap-8">
              <div>
                <span>Tổng ({selectedOrders.size} sách): </span>
                <span className="text-xl text-red-500 font-medium">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(totalPrice)}
                </span>
              </div>
              <button
                onClick={handleProceedToCheckout}
                disabled={selectedOrders.size === 0}
                className={`px-12 py-2 rounded ${
                  selectedOrders.size === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600'
                } text-white`}
              >
                Thanh Toán
              </button>
            </div>
          </div>
        </div>
      </div>

      {isProcessing && <LoadingOverlay />}
    </motion.div>
  );
};

export default ShoppingCart;
