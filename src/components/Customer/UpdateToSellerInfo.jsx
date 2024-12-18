import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { FaCheckCircle, FaTimesCircle, FaClock, FaBan,FaSyncAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Swal from "sweetalert2";
import { getAccountProfile } from "../services/CustomerService/CustomerService";
import { decryptData } from "../Encrypt/encryptionUtils";

const UpdateToSellerInfo = () => {
  const navigate = useNavigate();

  const [accountID, setAccountID] = useState(null);
  const [accountProfile, setAccountProfileData] = useState({});
  // // Biến kiểm tra
  const isFetchCalled = useRef(false);
  useEffect(() => {
    const userId = decryptData(Cookies.get("UserId"));
    setAccountID(userId);
    if (userId && !isFetchCalled.current) {
      fetchAccountProfileData(userId);
      // Đánh dấu là đã gọi API
      isFetchCalled.current = true;
    }
  }, []);
  //Lấy thông tin đã gửi từ API dựa trên userId
  const fetchAccountProfileData = async (userId) => {
    try {
      const data = await getAccountProfile(userId);
      setAccountProfileData(data);
    } catch (error) {
      console.error(error);
      // Kiểm tra phản hồi từ server
      if (error.response) {
        const status = error.response.status;

        // Xử lý lỗi 400 hoặc 404
        if (status === 400 || status === 404) {
          Swal.fire({
            icon: "info",
            title: "Thông báo",
            text: "Bạn chưa gửi thông tin nào. Hãy gửi thông tin của bạn ngay bây giờ!",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Đến chỗ gửi thông tin",
            cancelButtonText: "Hủy",
          }).then((result) => {
            if (result.isConfirmed) {
              navigate("/update-to-seller");
            }
          });
        }
        // Xử lý lỗi 500 hoặc các lỗi khác
        else if (status === 500) {
          Swal.fire({
            icon: "error",
            title: "Lỗi máy chủ",
            text: "Đã xảy ra lỗi trên máy chủ. Vui lòng thử lại sau.",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: `Đã xảy ra lỗi: ${status}. Vui lòng thử lại sau.`,
          });
        }
      }
      // Lỗi không phải từ server (như lỗi mạng)
      else {
        Swal.fire({
          icon: "error",
          title: "Lỗi kết nối",
          text: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.",
        });
      }
    }
  };
  // Định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };
  // Điều hướng đến trang chỉnh sửa
  const handleEdit = () => {
    navigate(`/edit-profile/${accountID}`);
  };
  const handleUpdate = () => {
    navigate(`/update-profile/${accountID}`);
  };
  const handleBackButton = () => {
    Swal.fire({
      title: "Quay lại trang chủ?",
      text: "Bạn có chắc muốn quay lại trang chủ không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Có, quay lại!",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/");
      }
    });
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-start p-4 space-y-8 md:space-y-0 md:space-x-8">
      {/* Sidebar */}
      <Sidebar />
      <section className="flex flex-col">
        <div className="section-center w-[1140px] bg-white p-4 rounded-lg shadow-md flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800">Thông tin đã gửi</h2>
          <div className="mt-4 text-xs text-gray-500 border-b border-gray-300 opacity-50">
            <p>
              Lưu ý: Các thông tin trên sẽ được kiểm duyệt trong thời gian sớm
              nhất. Nếu có bất kỳ thay đổi nào, chúng tôi sẽ thông báo qua email
              hoặc tin nhắn cho bạn.
            </p>
          </div>
          <div className="space-y-4 mt-4">
            {/* ID Card Number */}
            <div className="flex justify-start items-center space-x-4 border-b border-gray-300 pb-4">
              <label className="block text-base font-medium text-gray-700 mb-1">
                Mã CCCD
              </label>
              <p className="px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 text-gray-700 w-1/6">
                {accountProfile.idcardNumber || "Chưa có"}
              </p>
            </div>

            {/* Date of Birth */}
            <div className="flex justify-start items-center space-x-4 border-b border-gray-300 pb-4">
              <label className="block text-base font-medium text-gray-700 mb-1">
                Ngày sinh
              </label>
              <p className="px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 text-gray-700 w-1/6">
                {formatDate(accountProfile.dateOfBirth)}
              </p>
            </div>

            {/* Status */}
            {/* Edit được khi Status = 0 */}
            <div className="flex justify-start items-center space-x-4 border-b border-gray-300 pb-4">
              <label className="block text-base font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <div className="flex items-center w-3/4">
                {accountProfile.status === 1 ? (
                  <span className="text-green-500 flex items-center space-x-2">
                    <FaCheckCircle size={20} />
                    <span>Đã được kiểm duyệt</span>
                  </span>
                ) : accountProfile.status === -1 ? (
                  <span className="text-yellow-500 flex items-center space-x-2">
                    <FaClock size={20} />
                    <span>Trong quá trình kiểm duyệt</span>
                  </span>
                ) : accountProfile.status === 0 ? (
                  <>
                    <span className="text-red-500 flex items-center space-x-2">
                      <FaBan size={20} />
                      <span>Từ chối</span>
                    </span>
                    <button
                      onClick={handleEdit}
                      className="ml-4 px-4 py-2 bg-indigo-500 text-white text-sm rounded-md hover:bg-indigo-600 transition"
                    >
                      Chỉnh sửa
                    </button>
                  </>
                ) : 
                accountProfile.status === 2 ? (
                  <>
                    <span className="text-red-500 flex items-center space-x-2">
                      <FaSyncAlt size={20} />
                      <span>Cập nhật thông tin</span>
                    </span>
                    <button
                      onClick={handleUpdate}
                      className="ml-4 px-4 py-2 bg-indigo-500 text-white text-sm rounded-md hover:bg-indigo-600 transition"
                    >
                      Chỉnh sửa
                    </button>
                  </>
                ) :(
                  <span className="text-orange-500 flex items-center space-x-2">
                    <FaTimesCircle size={20} />
                    <span>Bạn chưa gửi thông tin nào</span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-start items-center space-x-4 border-b border-gray-300 pb-4">
              <label className="block text-base font-medium text-gray-700 mb-1 mr-8">
                Lưu ý
              </label>
              <div className="flex items-center py-2 rounded-lg bg-gray-100 border border-gray-300 text-gray-700">
                {accountProfile.censorNote}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 border-b border-gray-300 pb-4">
              {/* Front ID Card */}
              <div className="flex flex-col items-center">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Ảnh CCCD mặt trước
                </label>
                {accountProfile.frontIdcard ? (
                  <img
                    src={accountProfile.frontIdcard}
                    alt="Front ID Card"
                    className="w-60 h-60 object-contain rounded-lg border border-gray-300"
                  />
                ) : (
                  <p className="text-gray-500">Không có ảnh</p>
                )}
              </div>

              {/* Back ID Card */}
              <div className="flex flex-col items-center">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Ảnh CCCD mặt sau
                </label>
                {accountProfile.backIdcard ? (
                  <img
                    src={accountProfile.backIdcard}
                    alt="Back ID Card"
                    className="w-60 h-60 object-contain rounded-lg border border-gray-300"
                  />
                ) : (
                  <p className="text-gray-500">Không có ảnh</p>
                )}
              </div>

              {/* Portrait */}
              <div className="flex flex-col items-center">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Ảnh chân dung
                </label>
                {accountProfile.portrait ? (
                  <img
                    src={accountProfile.portrait}
                    alt="Portrait"
                    className="w-60 h-60 object-contain rounded-lg border border-gray-300"
                  />
                ) : (
                  <p className="text-gray-500">Không có ảnh</p>
                )}
              </div>

              {/* Bank Account QR */}
              <div className="flex flex-col items-center">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Mã QR ngân hàng
                </label>
                {accountProfile.bankAccountQR ? (
                  <img
                    src={accountProfile.bankAccountQR}
                    alt="Bank Account QR"
                    className="w-60 h-60 object-contain rounded-lg border border-gray-300"
                  />
                ) : (
                  <p className="text-gray-500">Không có ảnh</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleBackButton}
              className="w-full font-medium py-2 rounded-lg text-white shadow-md transition duration-300 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UpdateToSellerInfo;
