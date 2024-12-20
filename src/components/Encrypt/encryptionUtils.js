import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import { logout } from "../services/CustomerService/CustomerService";

// Mã hóa dữ liệu
const secretKey = "fe-rmrbd-key";
export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

// Hàm giải mã
export const decryptData = (encryptedData) => {
  try {
    const userId = Cookies.get("UserId");
    const userRole = Cookies.get("UserRole");
    if (!userId || !userRole) {
      return;
    }
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error("Giải mã thất bại:", error);
    LogoutHandler();

    return;
  }
};

// Hàm xử lý đăng xuất người dùng
const LogoutHandler = () => {
  logout();

  Cookies.remove("UserId");
  Cookies.remove("UserRole");

  localStorage.removeItem("isLoggedIn");

  window.location.href = "/login";
};
