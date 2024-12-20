import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { getShippingOrderStatus } from '../../services/ShippingService';
import { motion } from 'framer-motion';
import LoadingOverlay from '../../shared/LoadingOverlay';
import { cancelOrder } from '../../services/OrderService';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../Customer/Sidebar';
import { decryptData } from "../../Encrypt/encryptionUtils";
const formatAmount = (amount, paymentType) => {
  if (paymentType === 1) {
    return `${amount.toLocaleString('vi-VN')} xu`;
  } else {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
};

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState({});
  const sellerId = decryptData(Cookies.get("UserId"));
  const [orderStatuses, setOrderStatuses] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch orders, details, and customer information
        const [ordersResponse, detailsResponse, customersResponse] = await Promise.all([
          axios.get('https://rmrbdapi.somee.com/odata/BookOrder', {
            headers: {
              'Content-Type': 'application/json',
              'Token': '123-abc',
            },
          }),
          axios.get('https://rmrbdapi.somee.com/odata/BookOrderdetail', {
            headers: {
              'Content-Type': 'application/json',
              'Token': '123-abc',
            },
          }),
          axios.get('https://rmrbdapi.somee.com/odata/Account', {
            headers: {
              'Content-Type': 'application/json',
              'Token': '123-abc',
            },
          })
        ]);

        // Create customer map for quick lookup
        const customerMap = {};
        customersResponse.data.forEach(customer => {
          customerMap[customer.accountId] = customer;
        });

        // Filter orders that contain books created by the seller
        const sellerOrders = ordersResponse.data.filter(order => {
          const orderDetails = detailsResponse.data.filter(detail =>
            detail.orderId === order.orderId &&
            detail.book?.createById === parseInt(sellerId)
          );
          return orderDetails.length > 0;
        }).sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

        // Create details map for seller's books only
        const detailsMap = {};
        detailsResponse.data.forEach(detail => {
          if (detail.book?.createById === parseInt(sellerId)) {
            if (!detailsMap[detail.orderId]) {
              detailsMap[detail.orderId] = [];
            }
            detailsMap[detail.orderId].push(detail);
          }
        });

        setOrderDetails(detailsMap);
        setOrders(sellerOrders);
        setCustomerDetails(customerMap);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    if (sellerId) {
      fetchOrders();
    }
  }, [sellerId]);

  useEffect(() => {
    const fetchOrderStatuses = async () => {
      const statusPromises = orders.map(async (order) => {
        if (order.orderCode) {
          try {
            const status = await getShippingOrderStatus(order.orderCode);
            return [order.orderId, status];
          } catch (error) {
            console.error(`Error fetching status for order ${order.orderId}:`, error);
            return [order.orderId, null];
          }
        }
        return [order.orderId, null];
      });

      const statuses = await Promise.all(statusPromises);
      const statusMap = Object.fromEntries(statuses);
      setOrderStatuses(statusMap);
    };

    if (orders.length > 0) {
      fetchOrderStatuses();
    }
  }, [orders]);

  const getStatusDisplay = (order) => {
    const shippingStatus = orderStatuses[order.orderId];
    if (!shippingStatus) return 'Đang Xử Lý';

    switch (shippingStatus.status) {
      case 1: return 'Đang Xử Lý';
      case 2: return 'Đã Hoàn Thành';
      case 3: return 'Đã Hủy';
      default: return 'Đang Xử Lý';
    }
  };

  const handleCancelOrder = async (orderCode) => {
    const result = await Swal.fire({
      title: "Xác nhận hủy đơn hàng",
      text: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        setIsProcessing(true);
        const response = await cancelOrder(orderCode);

        await Swal.fire({
          title: "Thành công!",
          text: response.message,
          icon: "success"
        });

        window.location.reload();
      } catch (error) {
        console.error('Error cancelling order:', error);
        Swal.fire({
          title: "Lỗi!",
          text: error.message,
          icon: "error"
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (isLoading) {
    return (
      <motion.div className="container mx-auto px-4 py-8">
        <LoadingOverlay />
      </motion.div>
    );
  }

  return (
    <motion.div>
      {isProcessing && <LoadingOverlay />}
      <div className="flex flex-col md:flex-row justify-center items-start p-4 space-y-8 md:space-y-0 md:space-x-8">
        <Sidebar />
      
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="section-center w-[1140px] bg-white p-4 rounded-lg shadow-md flex flex-col"
      >
        <h1 className="text-2xl font-bold mb-6">Đơn Hàng Sách Của Tôi</h1>

        {orders.length === 0 ? (
          <div className="text-center text-gray-500">
            Chưa có đơn hàng nào cho sách của bạn
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.orderId} className="bg-white rounded-lg shadow p-6 mb-4">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-semibold">Mã Đơn Hàng #{order.orderId}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.purchaseDate).toLocaleDateString()}
                    </p>
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="font-semibold">Người Đặt: </span>
                        {customerDetails[order.customerId]?.fullName || 'Không có thông tin'}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Email: </span>
                        {customerDetails[order.customerId]?.email || 'Không có thông tin'}
                      </p>
                      {order.clientAddress && (
                        <p className="text-sm">
                          <span className="font-semibold">Địa Chỉ: </span>
                          {order.clientAddress.address || 'Không có thông tin'}
                        </p>
                      )}
                      {order.clientAddress && (
                        <p className="text-sm">
                          <span className="font-semibold">Số Điện Thoại: </span>
                          {order.clientAddress.phone || 'Không có thông tin'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatAmount(order.totalPrice, order.paymentType)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="font-semibold">Mã Vận Đơn: </span>
                      {order.orderCode}
                    </div>
                  </div>
                </div>

                {orderDetails[order.orderId]?.map((detail) => (
                  <div
                    key={detail.orderDetailId}
                    className="flex items-start gap-4 py-4 border-t cursor-pointer hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/orders/${order.orderId}`);
                    }}
                  >
                    <img
                      src={detail.book?.images?.[0]?.imageUrl || 'placeholder.jpg'}
                      alt={detail.book?.bookName}
                      className="w-16 h-20 object-cover rounded"
                    />
                    <div className="flex flex-1 justify-between">
                      <div>
                        <h4 className="font-medium">{detail.book?.bookName}</h4>
                        <p className="text-sm text-gray-500">x{detail.quantity}</p>
                      </div>
                      <div className="text-right">
                        <div>
                          {formatAmount(detail.price, order.paymentType)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Thành tiền:</span>
                    <span className="text-orange-800">
                      {formatAmount(order.totalPrice, order.paymentType)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <span className="font-semibold">Tình Trạng: </span>
                    <span className="text-orange-800">
                      {getStatusDisplay(order)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Phí Vận Chuyển: </span>
                    {formatAmount(order.shipFee, order.paymentType)}
                  </div>

                  {orderStatuses[order.orderId]?.status === 1 && (
                    <button
                      onClick={() => handleCancelOrder(order.orderCode)}
                      className="px-4 py-2 bg-orange-400 text-white rounded 
                      hover:bg-orange-600 transition-colors duration-300 ease-in-out"
                    >
                      Hủy Đơn Hàng
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      </div>
    </motion.div>
  );
};

export default SellerOrders;
