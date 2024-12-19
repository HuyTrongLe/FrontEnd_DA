import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import LoadingOverlay from '../../shared/LoadingOverlay';
import { getShippingOrderStatus } from '../../services/ShippingService';

const OrderFullDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [shippingStatus, setShippingStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderStatusHistory, setOrderStatusHistory] = useState([]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        
        const [orderResponse, statusResponse] = await Promise.all([
          axios.get(
            `https://rmrbdapi.somee.com/odata/BookOrder/${orderId}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'Token': '123-abc',
              },
            }
          ),
          axios.get(
            'https://rmrbdapi.somee.com/odata/bookorderstatus',
            {
              headers: {
                'Content-Type': 'application/json',
                'Token': '123-abc',
              },
            }
          )
        ]);

        const orderStatuses = statusResponse.data
          .filter(status => status.orderId === parseInt(orderId))
          .sort((a, b) => new Date(b.statusDate) - new Date(a.statusDate));

        const cancelledStatus = orderStatuses.find(s => s.details?.toLowerCase() === 'cancel');
        const completedStatus = orderStatuses.find(s => s.details?.toLowerCase() === 'completed');
        const latestStatus = orderStatuses[0];
        
        setOrderDetails(orderResponse.data);
        setOrderStatusHistory(orderStatuses);
        
        if (cancelledStatus) {
          setShippingStatus(cancelledStatus);
        } else if (completedStatus) {
          setShippingStatus(completedStatus);
        } else if (latestStatus) {
          setShippingStatus(latestStatus);
        }

      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const getStatusText = (status) => {
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">
          Không tìm thấy thông tin đơn hàng
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Chi Tiết Đơn Hàng #{orderId}</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-orange-600 hover:text-orange-700"
          >
            ← Quay lại
          </button>
        </div>

        {/* Order Status Timeline */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Trạng Thái Đơn Hàng</h3>
          <div className="relative">
            {orderStatusHistory.map((status, index) => (
              <div key={status.bookOrderStatusId} className="flex items-start mb-4">
                <div className="flex flex-col items-center mr-4">
                  <div className={`w-4 h-4 rounded-full ${
                    index === 0 ? 'bg-orange-500' : 'bg-gray-300'
                  }`} />
                  {index !== orderStatusHistory.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${
                    status.details?.toLowerCase() === 'cancel' ? 'text-red-600' : ''
                  }`}>
                    {getStatusText(status)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(status.statusDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div>
            <span className="font-semibold">Tình Trạng: </span>
            <span className={`${shippingStatus?.details === 'cancel' ? 'text-red-600' : 'text-orange-800'}`}>
              {getStatusText(shippingStatus)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderFullDetails;
