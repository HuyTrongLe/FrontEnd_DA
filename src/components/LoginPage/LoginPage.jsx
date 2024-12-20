import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/styles/Components/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import { useAuth } from "../RouterPage/AuthContext";
import Swal from "sweetalert2";
import { decryptData } from "../Encrypt/encryptionUtils";
const secretKey = "fe-rmrbd-key"; 

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

const Login = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();
  useEffect(() => {
    const encryptedRole = Cookies.get("UserRole");
    if (encryptedRole) {
      const userRole = decryptData(encryptedRole);
      setIsLoggedIn(true);
      navigate(getDashboardPath(userRole));
    }

    const handleStorageChange = (event) => {
      if (event.key === "UserRole") {
        const newEncryptedRole = event.newValue;
        if (newEncryptedRole) {
          const newUserRole = decryptData(newEncryptedRole);
          navigate(getDashboardPath(newUserRole));
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  const getDashboardPath = (role) => {
    switch (role) {
      default:
        return "/";
    }
  };

  const handleLogin = async ({ credential }) => {
    const { sub: googleId, email, name: userName } = jwtDecode(credential);
    const data = { googleId, userName, email };

    const url = `https://rmrbdapi.somee.com/odata/Login`;
    try {
      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
          Token: "123-abc",
        },
      });

      const { userRole, userId } = response.data;

      console.log("role", response.data);

      const existingRole = Cookies.get("UserRole");
      if (existingRole && decryptData(existingRole) !== userRole) {
        Swal.fire({
          icon: "warning",
          title: "Bạn đã đăng nhập với vai trò khác!",
          text: "Vui lòng đăng xuất trước khi đăng nhập lại.",
          confirmButtonText: "OK",
        });
        return;
      }

      // Mã hóa và lưu dữ liệu vào cookie
      Cookies.set("UserRole", encryptData(userRole), { expires: 1 });
      Cookies.set("UserId", encryptData(userId), { expires: 1 });

      setIsLoggedIn(true);
      navigate(getDashboardPath(userRole));
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      Swal.fire({
        icon: "error",
        title: "Đăng nhập thất bại",
        text:
          error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="wrapper bg-transparent min-h-screen flex justify-center items-center">
      <div className="container flex justify-center items-center">
        <div className="login-box p-6 bg-white/70 shadow-lg rounded-lg backdrop-blur-lg ">
          <div className="logo mb-6">
            <img
              src="/images/LogoA.png"
              className="w-20 h-20 mx-auto"
              alt="RecipeCook LogoA"
            />
          </div>
          <div>
            <h2 className="text-center text-2xl font-bold mb-3">Đăng nhập</h2>
            <p className="text-center text-gray-600 mb-4">
              Đăng nhập để lưu và xem lại các công thức yêu thích của bạn.
            </p>
          </div>
          <div className="google-login text-center mb-4">
            <div className="flex items-center justify-center w-full">
              <GoogleLogin
                onSuccess={handleLogin}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
