import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { getShippingOrderStatus } from '../../services/ShippingService';
import { cancelOrder } from '../../services/OrderService';
import LoadingOverlay from '../../shared/LoadingOverlay';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../Customer/Sidebar';
import { decryptData } from "../../Encrypt/encryptionUtils";
const formatAmount = (amount, paymentType) => {
  if (paymentType === 1) { // COINS payment
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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState({});
  const userId = decryptData(Cookies.get("UserId"));
  const [orderStatuses, setOrderStatuses] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch orders
        const response = await axios.get('https://rmrbdapi.somee.com/odata/BookOrder', {
          headers: {
            'Content-Type': 'application/json',
            'Token': '123-abc',
          },
        });

        // Filter orders for current user and sort by purchase date (newest first)
        const userOrders = response.data
          .filter(order => order.customerId === parseInt(userId) && order.orderCode !== null)
          .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

        // Fetch order details
        const detailsResponse = await axios.get(`https://rmrbdapi.somee.com/odata/BookOrderdetail`, {
          headers: {
            'Content-Type': 'application/json',
            'Token': '123-abc',
          },
        });

        // Create a map of order details, filtering by orderId
        const detailsMap = {};
        detailsResponse.data.forEach(detail => {
          if (!detailsMap[detail.orderId]) {
            detailsMap[detail.orderId] = [];
          }
          // Only add details that belong to our user's orders
          if (userOrders.some(order => order.orderId === detail.orderId)) {
            detailsMap[detail.orderId].push(detail);
          }
        });

        console.log('Order details map:', detailsMap);
        console.log('User orders:', userOrders);

        setOrderDetails(detailsMap);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  useEffect(() => {
    const fetchOrderStatuses = async () => {
      try {
        const statusResponse = await axios.get(
          'https://rmrbdapi.somee.com/odata/bookorderstatus',
          {
            headers: {
              'Content-Type': 'application/json',
              'Token': '123-abc',
            },
          }
        );

        // Create a map of latest status for each order
        const statusMap = {};
        statusResponse.data.forEach(status => {
          if (!statusMap[status.orderId] || new Date(status.statusDate) > new Date(statusMap[status.orderId].statusDate)) {
            statusMap[status.orderId] = status;
          }
        });

        setOrderStatuses(statusMap);
      } catch (error) {
        console.error('Error fetching order statuses:', error);
      }
    };

    if (orders.length > 0) {
      fetchOrderStatuses();
    }
  }, [orders]);

  const getStatusDisplay = (order) => {
    const status = orderStatuses[order.orderId];
    if (!status) return 'Đang Xử Lý';

    switch (status.details?.toLowerCase()) {
      case 'ready_to_pick':
        return 'Đang Xử Lý';
      case 'cancel':
        return 'Đã Hủy';
      case 'completed':
        return 'Đã Hoàn Thành';
      default:
        return 'Đang Xử Lý';
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Đã Hủy') return 'text-red-600';
    return 'text-orange-800';
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

        // Find the order that's being cancelled
        const orderToCancel = orders.find(order => order.orderCode === orderCode);

        // If the order was paid with coins (paymentType === 1), process the refund
        if (orderToCancel && orderToCancel.paymentType === 1) {
          try {
            // First get the current account data
            const accountResponse = await axios.get(
              `https://rmrbdapi.somee.com/odata/Account/${userId}`,
              {
                headers: {
                  'Token': '123-abc'
                }
              }
            );

            const currentAccount = accountResponse.data;

            // Update account with refunded coins
            await axios.put(
              `https://rmrbdapi.somee.com/odata/Account/info/${userId}`,
              {
                ...currentAccount,
                coin: currentAccount.coin + orderToCancel.totalPrice
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Token': '123-abc'
                }
              }
            );

            console.log('Coins refunded:', orderToCancel.totalPrice);
          } catch (refundError) {
            console.error('Error refunding coins:', refundError);
            throw new Error('Failed to refund coins');
          }
        }

        // Cancel the order
        const response = await cancelOrder(orderCode);

        // Create a transaction record for the refund if it was a coin payment
        if (orderToCancel && orderToCancel.paymentType === 1) {
          try {
            await axios.post(
              'https://rmrbdapi.somee.com/odata/BookTransaction',
              {
                customerId: parseInt(userId),
                orderId: orderToCancel.orderId,
                moneyFluctuation: null,
                coinFluctuations: orderToCancel.totalPrice, // Positive value for refund
                date: new Date().toISOString(),
                details: 'Hoàn xu từ đơn hàng đã hủy',
                status: 1
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Token': '123-abc'
                }
              }
            );
          } catch (transactionError) {
            console.error('Error creating refund transaction record:', transactionError);
            // Continue with the cancellation even if transaction record fails
          }
        }

        await Swal.fire({
          title: "Thành công!",
          text: orderToCancel?.paymentType === 1
            ? `Đơn hàng đã được hủy và ${formatAmount(orderToCancel.totalPrice, 1)} đã được hoàn lại vào tài khoản của bạn`
            : response.message,
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
      <div className="flex flex-col md:flex-row justify-center items-start p-4 space-y-8 md:space-y-0 md:space-x-8">
        <Sidebar />
        <section className='flex flex-col'><LoadingOverlay />

          <div className="section-center w-[1140px] bg-white p-4 rounded-lg shadow-md flex flex-col">
          <h1 className="text-2xl font-bold mb-6">Đơn Hàng Của Tôi</h1>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-start p-4 space-y-8 md:space-y-0 md:space-x-8">
      <Sidebar />
      <section className="flex flex-col">
        {isProcessing && <LoadingOverlay />}
        <div className="section-center w-[1140px] bg-white p-4 rounded-lg shadow-md flex flex-col">
          <h1 className="text-2xl font-bold mb-6">Đơn Hàng Của Tôi</h1>

          {orders.length === 0 ? (
            <div className="text-center text-gray-500">
              Không tìm thấy đơn hàng nào
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white rounded-lg shadow p-6 mb-4"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-semibold">Mã Đơn Hàng #{order.orderId}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.purchaseDate).toLocaleDateString()}
                      </p>
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
                      <span className={getStatusColor(getStatusDisplay(order))}>
                        {getStatusDisplay(order)}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Phí Vận Chuyển: </span>
                      {formatAmount(order.shipFee, order.paymentType)}
                    </div>

                    {orderStatuses[order.orderId]?.status === 1 && 
                      orderStatuses[order.orderId]?.details?.toLowerCase() !== 'completed' && (
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
        </div>
      </section>
    </div>
  );
};

export default Orders; 