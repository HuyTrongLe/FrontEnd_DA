import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Swal from "sweetalert2"; // Import SweetAlert2
import { FaSave, FaArrowLeft } from "react-icons/fa";
import Cookies from "js-cookie";
import { useSocket } from "../../../App";
import { createNotification } from "../../services/NotificationService";
import {
  getAccountData,
  getAccountProfile,
} from "../../services/CustomerService/CustomerService";

import {
  updateAccountProfile,
  updateAccount,
} from "../../services/ModeratorService/Api";
import { decryptData } from "../../Encrypt/encryptionUtils";

const AccountDetails = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [accountDetails, setAccountDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusEditing, setStatusEditing] = useState(false);
  const [newStatus, setNewStatus] = useState(null);
  const [censorID, setCensorID] = useState();
  const [censorNote, setCensorNote] = useState();
  const { socket, accountOnline } = useSocket();
  const [dataAccount, setAccountData] = useState(null);
  useEffect(() => {
    setCensorID(decryptData(Cookies.get("UserId")));
  }, []);
  useEffect(() => {
    fetchAccountDetails();
    fetchAccount();
  }, [accountId]);

  const fetchAccountDetails = async () => {
    setLoading(true);

    try {
      const result = await getAccountProfile(accountId);
      setAccountDetails(result);
      setNewStatus(result.status);
      setCensorNote(result.censorNote);
    } catch (error) {
      console.error("Error fetching account details:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchAccount = async () => {
    setLoading(true);

    try {
      const result = await getAccountData(accountId);
      setAccountData(result);
    } catch (error) {
      console.error("Error fetching account details:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (accountId) => {
    try {
      // Hiển thị hộp thoại xác nhận với SweetAlert2
      const result = await Swal.fire({
        title: "Bạn có chắc chắn muốn thay đổi trạng thái?",
        text: "Điều này sẽ cập nhật trạng thái tài khoản!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
      });

      // Nếu người dùng xác nhận
      if (result.isConfirmed) {
        setLoading(true);

        const updatePromises = [];
        // Tạo dữ liệu cập nhật cho AccountProfile
        const updatedAccountProfile = {
          ...accountDetails,
          status: newStatus,
          censorId: censorID,
          censorNote: censorNote,
        };
        // Tạo promise cho việc cập nhật AccountProfile
        const accountProfileUpdatePromise = updateAccountProfile(
          accountId,
          updatedAccountProfile
        );

        updatePromises.push(accountProfileUpdatePromise);

        // Nếu trạng thái mới là 1, cập nhật thêm roleId trong bảng Account
        if (newStatus === 1) {
          const updatedAccount = {
            ...dataAccount,
            roleId: 2,
          };

          const accountUpdatePromise = updateAccount(accountId, updatedAccount);

          updatePromises.push(accountUpdatePromise);
        }

        // Thực thi các promise
        await Promise.all(updatePromises);

        // Refresh dữ liệu sau khi cập nhật
        fetchAccount();
        fetchAccountDetails();

        // Đặt lại trạng thái chỉnh sửa
        setStatusEditing(false);

        // Hiển thị thông báo thành công
        Swal.fire(
          "Thành công!",
          "Trạng thái tài khoản đã được cập nhật.",
          "success"
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);

      // Hiển thị thông báo lỗi
      Swal.fire("Lỗi", "Có lỗi xảy ra khi cập nhật trạng thái.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Đang tải...
      </div>
    );
  }

  if (!accountDetails) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Không tìm thấy thông tin tài khoản.
      </div>
    );
  }

  const handleNotification = (text) => {
    socket.emit("sendNotification", {
      senderName: accountOnline,
      receiverName: accountDetails.account?.userName,
      content: text,
    });
    const addNotification = () => {
      const newNotificationData = {
        accountId: accountDetails.account?.accountId,
        content: text,
        date: new Date().toISOString(),
        status: 1,
      };
      createNotification(newNotificationData); // Không cần await
    };
    addNotification();
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Chi tiết tài khoản
        </h1>

        {/* Account Info */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
          <h2 className="font-semibold text-2xl text-gray-700 mb-4">
            Thông tin tài khoản
          </h2>
          <p className="mb-4 text-lg">
            <span className="font-medium">Tên đăng nhập:</span>{" "}
            {accountDetails.account?.userName || "Không có tên"}
          </p>
          <p className="mb-4 text-lg">
            <span className="font-medium">Ngày sinh:</span>{" "}
            {accountDetails.dateOfBirth
              ? format(new Date(accountDetails.dateOfBirth), "dd/MM/yyyy", {
                  locale: vi,
                })
              : "Không có"}
          </p>
          <p className="mb-4 text-lg">
            <span className="font-medium">Số CMND:</span>{" "}
            {accountDetails.idcardNumber || "Không có"}
          </p>
        </div>

        {/* Images */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
          <h2 className="font-semibold text-2xl text-gray-700 mb-4">
            Hình ảnh
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {accountDetails.frontIdcard && (
              <div>
                <p className="font-medium text-lg mb-2">Mặt trước CMND:</p>
                <img
                  src={accountDetails.frontIdcard}
                  alt="Mặt trước CMND"
                  className="w-full h-auto object-contain rounded-lg border"
                />
              </div>
            )}
            {accountDetails.backIdcard && (
              <div>
                <p className="font-medium text-lg mb-2">Mặt sau CMND:</p>
                <img
                  src={accountDetails.backIdcard}
                  alt="Mặt sau CMND"
                  className="w-full h-auto object-contain rounded-lg border"
                />
              </div>
            )}
            {accountDetails.portrait && (
              <div>
                <p className="font-medium text-lg mb-2">Ảnh chân dung:</p>
                <img
                  src={accountDetails.portrait}
                  alt="Ảnh chân dung"
                  className="w-full h-auto object-contain rounded-lg border"
                />
              </div>
            )}
            {accountDetails.bankAccountQR && (
              <div>
                <p className="font-medium text-lg mb-2">Mã QR tài khoản:</p>
                <img
                  src={accountDetails.bankAccountQR}
                  alt="Mã QR tài khoản ngân hàng"
                  className="w-full h-auto object-contain rounded-lg border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Status Update */}
        <div className="mb-6">
          <label className="block text-lg font-semibold">
            Trạng thái tài khoản:
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(parseInt(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value={-1}>Chờ xác nhận</option>
            <option value={1}>Xác nhận</option>
            <option value={0}>Từ chối</option>
            <option value={2}>Cập nhật thông tin</option>
          </select>
        </div>
        <div>
          <label className="block text-lg font-semibold">Lưu ý:</label>
          <textarea
            value={censorNote}
            onChange={(e) => setCensorNote(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            rows="4"
          />
        </div>
        <div className="flex justify-center items-center space-x-4 center">
          <button
            onClick={() => {
              let statusText = "";
              let content = "";
              if (newStatus === 1) {
                statusText = "duyệt";
              } else if (newStatus === -2) {
                statusText = "từ chối";
                content = censorNote;
              } else if (newStatus === 0) {
                statusText = "khóa";
                content = censorNote;
              }
              if (content) {
                handleNotification(
                  `${content} Mod ${accountOnline} đã ${statusText} thông tin làm người bán hàng của bạn`
                );
              } else {
                handleNotification(
                  `Mod ${accountOnline} đã ${statusText} thông tin làm người bán hàng của bạn`
                );
              }
              updateStatus(accountId);
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
  );
};

export default AccountDetails;
