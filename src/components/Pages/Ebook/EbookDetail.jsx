import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getEbookById, checkEbookOwnership } from "../../services/EbookService";
import CommentEBooks from "../../CommentItem/CommentEBooks";
import Cookies from 'js-cookie';
import { createEbookTransaction } from '../../services/Transaction';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

function EbookDetail() {
  const { ebookId } = useParams();
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleaccountonline, setRoleaccountonline] = useState("");
  const navigate = useNavigate();
  const [isPurchased, setIsPurchased] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEbookDetail = async () => {
      try {
        const data = await getEbookById(ebookId);
        setEbook(data);
        
        // Check if user owns the ebook
        const customerId = Cookies.get('UserId');
        if (customerId) {
          const isOwned = await checkEbookOwnership(customerId, ebookId);
          console.log('Ownership check result:', isOwned); // Debug log
          setIsPurchased(isOwned);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ebook details:", error);
        setLoading(false);
        setError(error.message || 'Failed to load ebook details');
      }
    };

    fetchEbookDetail();
  }, [ebookId]);

  const handlePurchase = async () => {
    try {
      const result = await Swal.fire({
        title: 'Xác nhận mua sách',
        text: `Bạn có muốn mua sách "${ebook.ebookName}" với giá ${ebook.price.toLocaleString()} xu không?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        setIsProcessing(true);
        setError(null);
        
        const customerId = Cookies.get('UserId');
        
        if (!customerId) {
          throw new Error('Vui lòng đăng nhập để mua sách');
        }

        try {
          console.log('Initiating purchase for ebook:', { 
            ebookId, 
            price: ebook.price, 
            bookName: ebook.ebookName 
          });
          const transactionResult = await createEbookTransaction(customerId, ebookId, ebook.price);
          
          if (!transactionResult.updatedBalance && transactionResult.updatedBalance !== 0) {
            throw new Error('Không thể cập nhật số dư');
          }

          setIsPurchased(true);
          
          // Create a more focused success message
          await Swal.fire({
            title: 'Thanh toán thành công!',
            html: `
              <p>Bạn đã mua sách thành công!</p>
              <p>Sách: <strong>${ebook.ebookName}</strong></p>
              <p>Số xu ban đầu: <strong>${transactionResult.previousBalance.toLocaleString()}</strong> xu</p>
              <p>Số xu đã trừ: <strong>${ebook.price.toLocaleString()}</strong> xu</p>
              <p>Số xu còn lại: <strong>${transactionResult.updatedBalance.toLocaleString()}</strong> xu</p>
            `,
            icon: 'success',
            confirmButtonText: 'OK'
          });
          
        } catch (error) {
          console.error('Transaction error:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      setError(error.message || 'Failed to purchase ebook. Please try again.');
      
      await Swal.fire({
        title: 'Lỗi!',
        text: error.message || 'Không thể mua sách. Vui lòng thử lại.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl mb-4">Error loading ebook</div>
        <button 
          onClick={() => navigate('/ebook')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Ebooks
        </button>
      </div>
    );
  }

  // Safe category display with multiple fallbacks
  const getCategoryName = () => {
    if (!ebook.category) return "Đang cập nhật";
    if (typeof ebook.category === 'string') return ebook.category;
    if (typeof ebook.category === 'object' && ebook.category.name) return ebook.category.name;
    return "Đang cập nhật";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white text-gray-800 min-h-screen">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Book Cover with sticky effect */}
            <div className="md:w-1/3">
              <div className="sticky top-8">
                <img
                  src={ebook.imageUrl}
                  alt={ebook.ebookName}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            </div>

            {/* Right Column - Book Details */}
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold mb-2">{ebook.ebookName}</h1>
              
              {/* Rating Section */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">★</span>
                  ))}
                </div>
                <span className="text-gray-600">• {ebook.ratings || 3} đánh giá</span>
              </div>

              {/* Book Metadata */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-gray-500 mb-1">Tác giả</h3>
                  <p className="font-medium">{ebook.author || "Unknown"}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 mb-1">Thể loại</h3>
                  <p className="font-medium">{getCategoryName()}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 mb-1">Nhà xuất bản</h3>
                  <p className="font-medium">{ebook.createBy?.userName || "Đang cập nhật"}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {!isPurchased ? (
                  <button 
                    onClick={handlePurchase}
                    disabled={isProcessing}
                    className={`w-full py-3 ${
                      isProcessing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                    } text-white rounded-full transition-colors flex items-center justify-center gap-2`}
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-spin">↻</span>
                        Đang xử lý...
                      </>
                    ) : (
                      `Mua sách (${ebook.price} xu)`
                    )}
                  </button>
                ) : (
                  <Link 
                    to={`/ebook/${ebookId}/read`}
                    className="flex-1"
                  >
                    <button className="w-full py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <span className="material-icons">menu_book</span>
                      Đọc sách
                    </button>
                  </Link>
                )}
                <button className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300">
                  <span className="material-icons">favorite_border</span>
                </button>
                <button className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300">
                  <span className="material-icons">share</span>
                </button>
              </div>

              {/* Description */}
              <div className="mt-8">
                <p className="text-gray-700 leading-relaxed">
                  {ebook.description || "Bạn đã bao giờ tự hỏi cuộc sống của mình sẽ thay đổi như thế nào trong năm tới? Hay từng khao khát hiểu sâu sc hơn về sức mạnh tiềm ẩn của chính mình dựa trên dấu hiệu Hoàng đạo?"}
                </p>
              </div>

              {/* Add Comments Section */}
              <div className="mt-12">
                <CommentEBooks 
                  ebookId={ebookId}
                  createById={ebook.createById}
                  roleaccountonline={roleaccountonline}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EbookDetail; 