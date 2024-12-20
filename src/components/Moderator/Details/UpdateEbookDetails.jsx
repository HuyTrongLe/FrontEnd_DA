import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEbookById, checkEbookOwnership } from "../../services/EbookService";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { updateEbook } from "../../services/ModeratorService/Api";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import { decryptData } from "../../Encrypt/encryptionUtils";
import { useSocket } from "../../../App";
import { createNotification } from "../../services/NotificationService";
function EbookDetail() {
  const { ebookId } = useParams();
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isPurchased, setIsPurchased] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState();
  const [censorNote, setCensorNote] = useState();
    const { socket, accountOnline } = useSocket();
  useEffect(() => {
    const fetchEbookDetail = async () => {
      try {
        const data = await getEbookById(ebookId);
        setEbook(data);
        setStatus(data.status);
        setCensorNote(data.censorNote || "");
        // Check if user owns the ebook
        const customerId = decryptData(Cookies.get("UserId"));
        if (customerId) {
          const isOwned = await checkEbookOwnership(customerId, ebookId);
          console.log("Ownership check result:", isOwned); // Debug log
          setIsPurchased(isOwned);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching ebook details:", error);
        setLoading(false);
        setError(error.message || "Failed to load ebook details");
      }
    };

    fetchEbookDetail();
  }, [ebookId]);
  const handleSave = async () => {
    await Swal.fire({
      title: "Bạn có chắc chắn muốn thay đổi trạng thái?",
      text: "Điều này sẽ cập nhật trạng thái của sách điện tử!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });
    const censorId = decryptData(Cookies.get("UserId"));
    try {
      const updatedEbook = {
        ...ebook,
        status,
        censorNote,
        censorId,
      };
      console.log(updatedEbook);

      // Gọi tới api để cập nhật

      await updateEbook(ebookId, updatedEbook);
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Sách điện tử đã được cập nhật thành công.",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error updating Book:", error);
      Swal.fire({
        icon: "error",
        title: "Thất bại!",
        text: "Cập nhật thất bại.",
        confirmButtonText: "OK",
      });
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
          onClick={() => navigate("/ebook")}
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
    if (typeof ebook.category === "string") return ebook.category;
    if (typeof ebook.category === "object" && ebook.category.name)
      return ebook.category.name;
    return "Đang cập nhật";
  };
  const handleNotification = (text) => {
      socket.emit("sendNotification", {
        senderName: accountOnline,
        receiverName: ebook.createBy?.userName,
        content: text,
      });
      const addNotification = () => {
        const newNotificationData = {
          accountId: ebook.createBy?.accountId,
          content: text,
          date: new Date().toISOString(),
          status: 1,
        };
        createNotification(newNotificationData); // Không cần await
      };
      addNotification();
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
                    <span key={star} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-gray-600">
                  • {ebook.ratings || 3} đánh giá
                </span>
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
                  <p className="font-medium">
                    {ebook.createBy?.userName || "Đang cập nhật"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8">
                <p className="text-gray-700 leading-relaxed">
                  {ebook.description ||
                    "Bạn đã bao giờ tự hỏi cuộc sống của mình sẽ thay đổi như thế nào trong năm tới? Hay từng khao khát hiểu sâu sc hơn về sức mạnh tiềm ẩn của chính mình dựa trên dấu hiệu Hoàng đạo?"}
                </p>
              </div>

              <div>
                <label className="block text-lg font-semibold">Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value={1}>Xác nhận</option>
                  <option value={-1}>Chờ xác nhận</option>
                  <option value={0}>Khóa</option>
                </select>
              </div>
              <div>
                <label className="block text-lg font-semibold">
                  Censor Note:
                </label>
                <textarea
                  value={censorNote}
                  onChange={(e) => setCensorNote(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="4"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    const statusText = status === 1 ? "Xác nhận" : "Khóa";
                    if(!censorNote){
                      handleNotification(
                        `Mod ${accountOnline} đã ${statusText} sách điện tử ${ebook.ebookName} của bạn`
                      );
                    }else{
                      handleNotification(
                        `Mod ${accountOnline} đã ${statusText} sách điện tử ${ebook.ebookName} của bạn với lý do ${censorNote}`
                      );
                      
                    }
                    handleSave();
                  }}
                  className="flex items-center justify-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition transform duration-300 hover:scale-105"
                >
                  <FaSave className="text-lg" />
                  <span className="text-lg">Lưu</span>
                </button>

                <button
                  className="flex items-center justify-center space-x-2 px-6 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-700 transition transform duration-300 hover:scale-105"
                  onClick={() => window.history.back()}
                >
                  <FaArrowLeft className="text-lg" />
                  <span className="text-lg">Quay lại</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EbookDetail;
