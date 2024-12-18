import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ClockIcon from "/images/icon/iconclock.png";
import SpoonIcon from "/images/icon/iconsspoon.png";
import Cookies from "js-cookie";
import Swal from "sweetalert2"; // Import SweetAlert2
import { FaSave, FaArrowLeft } from "react-icons/fa";
import { useSocket } from "../../../App";
import { createNotification } from "../../services/NotificationService";
import { getBook, updateBook } from "../../services/ModeratorService/Api";
import { getAccountData } from "../../services/CustomerService/CustomerService";
import { decryptData } from "../../Encrypt/encryptionUtils";

const BookDetail = () => {
  const { bookId } = useParams(); // Lấy ID từ URL
  const [book, setBook] = useState(null);
  const [accountID, setAccountID] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [status, setStatus] = useState();
  const [censorNote, setCensorNote] = useState();
  const { socket, accountOnline } = useSocket();
  // Hàm lấy chi tiết công thức
  const fetchBookDetail = async (id) => {
    const bookData = await getBook(id);
    console.log("Book Data", bookData);
    setBook(bookData);
    setStatus(bookData.status);
    setMainImage(bookData.images[0]?.imageUrl);
    setCensorNote(bookData.censorNote || "");
    return bookData;
  };

  // Hàm lấy thông tin tài khoản
  const fetchAccount = async (createById) => {
    const response = await getAccountData(createById);
    setAccountID(response);
  };

  // Hàm gọi tất cả các API
  const fetchData = async () => {
    try {
      const BookData = await fetchBookDetail(bookId);
      if (BookData.createById) {
        await fetchAccount(BookData.createById);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Hàm lưu cập nhật
  const handleSave = async () => {
    await Swal.fire({
      title: "Bạn có chắc chắn muốn thay đổi trạng thái?",
      text: "Điều này sẽ cập nhật trạng thái tài khoản!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });
    const censorId = decryptData(Cookies.get("UserId"));
    try {
      const updatedBook = {
        ...book,
        status,
        censorNote,
        censorId,
      };
      console.log(updatedBook);

      // Gọi tới api để cập nhật

      await updateBook(bookId, updatedBook);
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Công thức đã được cập nhật thành công.",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error updating Book:", error);
      Swal.fire({
        icon: "error",
        title: "Thất bại!",
        text: "Công thức đã cập nhật thất bại.",
        confirmButtonText: "OK",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [bookId]);

  if (!book || !accountID || !book.images?.length === 0) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  const handleNotification = (text) => {
    socket.emit("sendNotification", {
      senderName: accountOnline,
      receiverName: accountID?.userName,
      content: text,
    });
    const addNotification = () => {
      const newNotificationData = {
        accountId: accountID?.accountId,
        content: text,
        date: new Date().toISOString(),
        status: 1,
      };
      createNotification(newNotificationData); // Không cần await
    };
    addNotification();
  };

  return (
    <>
      <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {book?.bookName || "N/A"}
        </h1>

        <div className="space-y-4">
          <p className="text-lg">{book?.description || "N/A"}</p>
          <p className="text-lg">
            <strong>Tạo bởi:</strong> {accountID?.userName || "N/A"}
          </p>
          <div className="flex flex-col md:flex-row items-start space-x-4">
            {/* Book Image Section */}
            <div className="md:w-2/3 relative">
              <img
                src={mainImage}
                alt="Main Book"
                className="w-full object-cover rounded-lg shadow-md"
              />
              {/* Thumbnail Images */}
              <div className="flex space-x-4 overflow-x-auto mt-4">
                {book.images?.length > 0 ? (
                  book.images?.map((image, index) => (
                    <img
                      key={index}
                      src={image.imageUrl || ""}
                      alt={`Book image ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-75"
                      onClick={() => setMainImage(image.imageUrl)} // Set main image on click
                    />
                  ))
                ) : (
                  <p className="text-lg">N/A</p>
                )}
              </div>
            </div>

            {/* Book Details Section */}
            <div className="md:w-1/3 bg-gray-50 p-4 rounded-lg shadow-md relative">
              {/* Clock Icon */}
              {/* <ClockIcon className="w-6 h-6 text-gray-600 absolute top-2 right-2" /> */}
              <img
                src={ClockIcon}
                alt=""
                className="w-6 h-6 text-gray-600 absolute top-2 right-2"
              />

              {/* Book Details */}
              <p className="text-lg">
                <strong className="text-gray-800">Giá:</strong>{" "}
                {book?.price || "N/A"}đ
              </p>
              <p className="text-lg mb-2">
                <strong className="text-gray-800">Ngày tạo:</strong>{" "}
                {book?.createDate
                  ? new Date(book.createDate).toLocaleDateString("vi-VN") // Định dạng ngày theo chuẩn Việt Nam
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="relative flex items-center mb-8">
            <hr className="flex-grow border-t border-black-300" />
            <img src={SpoonIcon} alt="Icon" className="mx-2 w-6 h-6" />
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
            <label className="block text-lg font-semibold">Censor Note:</label>
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
                if(censorNote){
                  handleNotification(
                    `Mod ${accountOnline} đã ${statusText} sách ${book.bookName} của bạn`
                  );
                }else{
                  handleNotification(
                    `Mod ${accountOnline} đã ${statusText} sách ${book.bookName} của bạn với lý do : ${censorNote}!!!`
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
    </>
  );
};

export default BookDetail;
