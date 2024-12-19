import React, { useState, useEffect, useRef } from "react";
import LogoA from '/images/LogoA.png';
import { NavLink, Link, useNavigate } from "react-router-dom";
import NavLinks from './NavLinks';
import { leftLinks } from '../../data/data';
import { rightLinks } from '../../data/data';
import { Button, IconButton } from "@material-tailwind/react";
import SearchWrapper from "../Search/SearchWrapper";
import { Widgets, ArrowDropDown } from "@mui/icons-material";
import Cookies from "js-cookie";
import { useAuth } from "../RouterPage/AuthContext";
import Notification from "/images/notification.svg";
import "./navbar.css"
import { useSocket } from "../../App"
import { getNotificationbyAccountId } from "../services/NotificationService"
import CartDropdown from './CartDropDown'
import Swal from "sweetalert2";
import { getAccountData, logout } from "../services/CustomerService/CustomerService";
import { decryptData, encryptData } from "../Encrypt/encryptionUtils";
const categoriesContent = {
  "Công Thức Nấu Ăn": (
    <div className="grid grid-cols-3 gap-6 text-gray-700">
      <div>
        <h3 className="font-semibold text-base">MÓN ĂN CHÍNH</h3>
        <ul className="space-y-1 text-sm">
          <li>Thịt ba chỉ kho</li>
          <li>Cá kho tộ</li>
          <li>Gà nướng mật ong</li>
          <li>Phở bò</li>
          <li className="text-blue-500">Xem tất cả</li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-base">MÓN CANH</h3>
        <ul className="space-y-1 text-sm">
          <li>Canh cá quả chua</li>
          <li>Canh khổ qua nhồi</li>
          <li>Canh cuốn bắp cải</li>
          <li>Canh rong biển</li>
          <li className="text-blue-500">Xem tất cả</li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-base">MÓN ĂN VẶT</h3>
        <ul className="space-y-1 text-sm">
          <li>Bánh cuốn hấp</li>
          <li>Gỏi cuốn</li>
          <li>Bánh xèo</li>
          <li>Bánh căn mini</li>
          <li className="text-blue-500">Xem tất cả</li>
        </ul>
      </div>
    </div>
  ),
  "Sách Dạy Nấu Ăn": (
    <div className="grid grid-cols-3 gap-6 text-gray-700">
      <div>
        <h3 className="font-semibold text-base">ẨM THỰC VIỆT NAM</h3>
        <ul className="space-y-1 text-sm">
          <li>Phở và các món bún</li>
          <li>Đặc sản miền Trung</li>
          <li>Món ăn truyền thống</li>
          <li>Tráng miệng Việt Nam</li>
          <li className="text-blue-500">Xem tất cả</li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-base">ẨM THỰC QUỐC TẾ</h3>
        <ul className="space-y-1 text-sm">
          <li>Món ăn Nhật Bản</li>
          <li>Ẩm thực Hàn Quốc</li>
          <li>Món ăn Ý</li>
          <li>Món ăn Pháp</li>
          <li className="text-blue-500">Xem tất cả</li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-base">ĂN CHAY & SỨC KHỎE</h3>
        <ul className="space-y-1 text-sm">
          <li>Món ăn chay cơ bản</li>
          <li>Salad & Nước ép</li>
          <li>Kế hoạch ăn uống lành mạnh</li>
          <li>Công thức món ăn ít calo</li>
          <li className="text-blue-500">Xem tất cả</li>
        </ul>
      </div>
    </div>
  ),
  "Sách Điện Tử": (
    <div className="grid grid-cols-3 gap-6 text-gray-700">
      <div>
        <h3 className="font-semibold text-base">SÁCH CÔNG THỨC NẤU ĂN</h3>
        <ul className="space-y-1 text-sm">
          <li>Công thức nấu ăn Việt Nam</li>
          <li>Công thức nấu ăn Châu Á</li>
          <li>Công thức nấu ăn Châu Âu</li>
          <li>Công thức món tráng miệng</li>
          <li className="text-blue-500">Xem tất cả</li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-base">KỸ THUẬT NẤU ĂN</h3>
        <ul className="space-y-1 text-sm">
          <li>Công thức nướng</li>
          <li>Kỹ thuật xào</li>
          <li>Thực hành làm bánh</li>
          <li>Chuẩn bị nguyên liệu</li>
          <li className="text-blue-500">Xem tất cả</li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-base">SỨC KHỎE & DINH DƯỠNG</h3>
        <ul className="space-y-1 text-sm">
          <li>Dinh dưỡng hàng ngày</li>
          <li>Kế hoạch ăn uống giảm cân</li>
          <li>Kế hoạch dinh dưỡng cho trẻ em</li>
          <li>Dinh dưỡng cho thể thao</li>
          <li className="text-blue-500">Xem tất cả</li>
        </ul>
      </div>
    </div>
  ),
};

const Navbar = () => {

  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [openNav, setOpenNav] = useState(false);
  const [stickyNavbar, setStickyNavbar] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Sách Dạy Nấu Ăn");
  const navigate = useNavigate();
  const userRole = decryptData(Cookies.get("UserRole"));
  const accountonlineId = decryptData(Cookies.get("UserId"));
  const [accountData, setAccountData] = useState({});
  const isFetchCalled = useRef(false);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [stickyNavbar]);

  const handleScroll = () => {
    setStickyNavbar(window.pageYOffset > 500);
  };
  //Notification
  const { socket } = useSocket(); // Access `socket` and `user` from context
  const [notifications, setNotifications] = useState([]);
  const [dbnotifications, setDbNotifications] = useState([]);
  //const [lengthnotifications, setLengthnotifications] = useState(0);
  const [open, setOpen] = useState(null);
  useEffect(() => {
    const fetchNotification = async () => {
      try {
        // Lấy dữ liệu từ API
        const notificationdata = await getNotificationbyAccountId(accountonlineId);
        setDbNotifications(notificationdata);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
      if (!isFetchCalled.current) {
        fetchAccountData(accountonlineId);
        isFetchCalled.current = true;
      }
    };

    fetchNotification();
  }, [accountonlineId]);

  useEffect(() => {
    if (socket) {
      const handleNotification = (data) => {
        setNotifications((prev) => [data, ...prev]);
      };
      socket.on("getNotification", handleNotification);
      // Clean up event listener when the component unmounts or socket changes
      return () => {
        socket.off("getNotification", handleNotification);
      };
    }
  }, [socket])


  const displayNotification = ({ content }) => {
    return (
      <div className="notification-item">
        <span className="notification-content">{`${content}`}</span>
        <hr style={{ margin: "10px 0", borderColor: "black", borderStyle: "solid" }} />
      </div>
    )
  }
  const handleRead = () => {
    setNotifications([]);
    setOpen(false);
  }
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    if (category === "Sách Dạy Nấu Ăn") {
      navigate("/book")
    }
    if (category == "Công Thức Nấu Ăn") {
      navigate("/recipe")
    }
    if (category == "Sách Điện Tử") {
      navigate("/ebook")
    }
  };
  const fetchAccountData = async (userId) => {
    try {
      const data = await getAccountData(userId);
      if (data.roleId === 2) {
        Cookies.set("UserRole", encryptData("Seller"));
      }
      if (data.accountStatus === 0) {
        Swal.fire({
          icon: "warning",
          title: "Tài khoản của bạn đã bị khóa",
          text: "Vui lòng liên hệ với bên CSKH để biết thêm chi tiết",
          confirmButtonText: "OK",
        }).then(() => {
          handleLogout();
        });
        return;
      }
      setAccountData(data);
    } catch (error) {
      console.error(error);
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      Cookies.remove("UserRole");
      Cookies.remove("UserName");
      Cookies.remove("UserId");
      Cookies.remove("Coin");
      localStorage.removeItem("isLoggedIn");
      navigate("/");
    } catch (error) {
      console.error("Đăng xuất không thành công:", error);
    }
  };
  const dropdownRef = React.useRef(null); // Khởi tạo ref
  //Sửa dropdowwn trên avatar
  const toggleDropdown = () => {
    setIsDropdownOpen(prevState => !prevState);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };
  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <nav
      className={` z-50 w-full absolute ${stickyNavbar
        ? 'font-expletus animate-fade-in-down sticky top-0 bg-gray-900 shadow-sm'
        : ''
        }`}
    >
      <div
        className={`section-center flex items-center justify-between lg:justify-center lg:space-x-32 sticky z-50 w-full ${stickyNavbar ? 'py-4' : ''
          }`}
      >
        <ul className="nav-links-container">
          <NavLinks links={leftLinks} setIsMenuOpen={setIsMenuOpen} />
          <Button
            variant="text"
            title={"Categories"}
            size="sm"
            className="flex items-center gap-1 text-gray-50 hover:text-green-500 text-xl"
            onMouseEnter={() => setShowDropdown(true)}
          >
            <Widgets />
            <ArrowDropDown />
          </Button>
          {showDropdown && (
            <div
              className="absolute left-0 top-full mt-2 w-[1000px] bg-white text-black shadow-lg rounded-md p-6 z-50"
              onMouseLeave={() => setShowDropdown(false)}
            >
              <div className="flex">
                <div className="w-1/4 pr-6 border-r">
                  <h2 className="font-semibold text-gray-800 mb-4 text-lg">Danh Mục Sản Phẩm</h2>
                  <ul className="space-y-3 text-gray-700 font-medium text-base">
                    {Object.keys(categoriesContent).map((category) => (
                      <li
                        key={category}
                        className={`hover:bg-gray-200 p-2 rounded cursor-pointer ${activeCategory === category ? "bg-gray-300" : ""
                          }`}
                        onMouseEnter={() => setActiveCategory(category)}
                        onClick={() => handleCategoryClick(category)}
                      >
                        {category}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="w-3/4 pl-6">
                  <h2 className="text-red-600 font-semibold mb-4 text-lg">{activeCategory}</h2>
                  {categoriesContent[activeCategory]}
                </div>
              </div>
            </div>
          )}
          {accountonlineId && (
            <div className="icon">
              <div className="icon-notification" onClick={() => setOpen((prev) => !prev)}>
                <img className="w-8 h-8" src={Notification} alt="Notification Icon" />
                {notifications.length > 0 && (
                  <div className="counter">{notifications.length}</div>
                )}
              </div>
              {open && (
                <div className="notifications">
                  <div className="topnav-dropdown-header">
                    <span className="notification-title">Thông báo</span>
                    <button className="clear-noti" onClick={handleRead}>
                      Đọc tất cả
                    </button>
                  </div>
                  {notifications.map((n) => displayNotification(n))}

                  {dbnotifications
                    .map((notification) => {
                      const notificationDate = new Date(notification.date); // Convert date string to Date object
                      const now = Date.now(); // Current timestamp
                      const differenceInMs = now - notificationDate.getTime(); // Time difference in ms
                      const minutesPassed = Math.floor(differenceInMs / (1000 * 60)); // Convert ms to minutes
                      const hoursPassed = Math.floor(minutesPassed / 60); // Convert minutes to hours
                      const daysPassed = Math.floor(hoursPassed / 24); // Convert hours to days

                      return { ...notification, minutesPassed, hoursPassed, daysPassed }; // Add `daysPassed`
                    })
                    .sort((a, b) => a.minutesPassed - b.minutesPassed) // Sort by `minutesPassed`
                    .map((notification, index) => (
                      <div key={notification.id || index} className="notification-item" style={{ fontWeight: 300 }}>
                        <div className="notification-content">{notification.content}</div>
                        <div className="notification-time">
                          {notification.daysPassed >= 1
                            ? `${notification.daysPassed} ngày trước` // If more than 1 day
                            : notification.hoursPassed >= 1
                              ? `${notification.hoursPassed} giờ trước` // If more than 1 hour
                              : `${notification.minutesPassed} phút trước`} {/* If less than 1 hour */}
                        </div>
                        <hr style={{ margin: "10px 0", borderColor: "black", borderStyle: "solid" }} />
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </ul>
        <Link
          to="/"
          aria-label="Recipe RMRBD"
          title="Recipe RMRBD"
          className="inline-flex items-center"
        >
          <img href="/" src={LogoA} className="object-contain h-16 w-18" alt="company logo" />
        </Link>
        <ul className="nav-links-container">
          <SearchWrapper />
          <CartDropdown />
          <NavLinks links={rightLinks} setIsMenuOpen={setIsMenuOpen} />
          {isLoggedIn ? (
            <div
              ref={dropdownRef}
              className="relative"
            >
              <div onClick={toggleDropdown} className="flex items-center cursor-pointer">
                <img
                  src={accountData.avatar || "/images/avatar-guest.png"}
                  alt="User Avatar"
                  className="w-12 h-12 object-cover rounded-full"
                />
                <div className="flex flex-col items-start ml-1">
                  {/* Username */}
                  <span className="text-base font-bold text-white">
                    {accountData.userName}
                  </span>
                  {/* Coin */}
                  <span className="text-base font-bold text-white">
                    {Intl.NumberFormat('de-DE').format(accountData.coin)} <img src="/images/icon/dollar.png" alt="coins" className="h-5 w-5 inline-block" />
                  </span>
                </div>
              </div>
              {isDropdownOpen && (
                <div className="absolute mt-2 w-52 bg-white shadow-lg rounded-md text-black z-10 text-left p-2 text-base">
                  {userRole === "Admin" && (
                    <>
                      <NavLink
                        to="/admin/dashboard" // Change to your admin page
                        className="block px-2 py-2 hover:bg-gray-200 rounded-md flex items-center"
                      >
                        {/* Icon for Admin */}
                        <img
                          src="/images/icon/SELLERRECIPE.svg"
                          alt="Account Administrator"
                          className="h-5 w-5 mr-2"
                        />
                        Quản trị viên
                      </NavLink>

                      <NavLink
                        to="/update-information"
                        className="block px-2 py-2 hover:bg-gray-200 rounded-md flex items-center"
                      >
                        <img src="/images/icon/edit-profile.svg" alt="Update Information" className="h-5 w-5 mr-2" />
                        Cập nhật tài khoản
                      </NavLink>
                    </>
                  )}
                  {userRole === "Customer" && (
                    <>
                      <NavLink
                        to="/update-to-seller"
                        className="block px-2 py-2 hover:bg-gray-200 rounded-md flex items-center"
                      >
                        {/* Icon for Customer */}
                        <img
                          src="/images/icon/ECOMMERCE.svg"
                          alt="Đăng kí bán hàng"
                          className="h-5 w-5 mr-2"
                        />
                        Đăng kí bán hàng
                      </NavLink>

                      <NavLink
                        to="/list-saved-recipe"
                        className="block px-2 py-2 hover:bg-gray-200 flex items-center"
                      >
                        {/* Icon for Customer Recipe */}
                        <img
                          src="/images/icon/recipe.svg"
                          alt="Công thức đã lưu"
                          className="h-5 w-5 mr-2"
                        />
                        Công thức đã lưu
                      </NavLink>
                      <NavLink
                        to="/update-information"
                        className="block px-2 py-2 hover:bg-gray-200 rounded-md flex items-center"
                      >
                        <img src="/images/icon/edit-profile.svg" alt="Update Information" className="h-5 w-5 mr-2" />
                        Cập nhật tài khoản
                      </NavLink>

                      <NavLink
                        to="/report"
                        className="block px-2 py-2 hover:bg-gray-200 flex items-center"
                      >
                        {/* Icon for Complaint */}
                        <img
                          src="/images/icon/SUPPORT.svg"
                          alt="Khiếu nại"
                          className="h-5 w-5 mr-2"
                        />
                        Khiếu nại
                      </NavLink>
                    </>
                  )}
                  {userRole === "Moderator" && (
                    <>
                      <NavLink
                        to="/update-role"
                        className="block px-2 py-2 hover:bg-gray-200 flex items-center"
                      >
                        {/* Icon for Moderator */}
                        <img
                          src="/images/icon/SELLERRECIPE.svg"
                          alt="Account moderate"
                          className="h-5 w-5 mr-2"
                        />
                        Tổng quan quản lý
                      </NavLink>
                      <NavLink
                        to="/reportmod"
                        className="block px-2 py-2 hover:bg-gray-200 flex items-center"
                      >
                        {/* Icon for Report Moderation */}
                        <img
                          src="/images/icon/review.svg"
                          alt="Duyệt đơn khiếu nại"
                          className="h-5 w-5 mr-2"
                        />
                        Duyệt đơn khiếu nại
                      </NavLink>
                      <NavLink
                        to="/withdrawmod"
                        className="block px-2 py-2 hover:bg-gray-200 flex items-center"
                      >
                        {/* Icon for Withdraw */}
                        <img
                          src="/images/icon/withdraw.svg"
                          alt="Duyệt rút xu"
                          className="h-5 w-5 mr-2"
                        />
                        Duyệt rút xu
                      </NavLink>
                    </>
                  )}
                  {userRole === "Seller" && (
                    <>
                      <NavLink
                        to="/recipe-list-seller"
                        className="block px-2 py-2 hover:bg-gray-200 flex items-center"
                      >
                        {/* Icon for Seller Recipe */}
                        <img
                          src="/images/icon/SELLERRECIPE.svg"
                          alt="Seller Recipe"
                          className="h-5 w-5 mr-2"
                        />
                        Tổng quan người bán
                      </NavLink>
                      <NavLink
                        to="/list-saved-recipe"
                        className="block px-2 py-2 hover:bg-gray-200 flex items-center"
                      >
                        {/* Icon for Seller Saved Recipe */}
                        <img
                          src="/images/icon/recipe.svg"
                          alt="Công thức đã lưu"
                          className="h-5 w-5 mr-2"
                        />
                        Công thức đã lưu
                      </NavLink>
                      <NavLink
                        to="/withdrawrequest"
                        className="block px-2 py-2 hover:bg-gray-200 flex items-center"
                      >
                        {/* Icon for Withdraw Request */}
                        <img
                          src="/images/icon/withdraw.svg"
                          alt="Yêu cầu rút tiền"
                          className="h-5 w-5 mr-2"
                        />
                        Yêu cầu rút tiền
                      </NavLink>
                      <NavLink
                        to="/update-information"
                        className="block px-2 py-2 hover:bg-gray-200 rounded-md flex items-center"
                      >
                        <img src="/images/icon/edit-profile.svg" alt="Update Information" className="h-5 w-5 mr-2" />
                        Cập nhật tài khoản
                      </NavLink>
                      <NavLink
                        to="/report"
                        className="block px-2 py-2 hover:bg-gray-200 flex items-center"
                      >
                        {/* Icon for Complaint */}
                        <img
                          src="/images/icon/SUPPORT.svg"
                          alt="Khiếu nại"
                          className="h-5 w-5 mr-2"
                        />
                        Khiếu nại
                      </NavLink>
                    </>
                  )}
                  <div
                    className="block px-2 py-2 hover:bg-gray-200 cursor-pointer flex"
                    onClick={handleLogout}
                  >
                    <img
                      src="/images/icon/logout.svg"
                      alt="Đăng xuất"
                      className="h-5 w-5 mr-2"
                    />
                    Đăng xuất
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-x-1">
              <Button
                variant="gradient"
                size="sm"
                className={`hidden lg:inline-block bg-gray-300 text-white text-sm`}
              >
                <NavLink to="/login">Đăng Nhập</NavLink>
              </Button>
            </div>
          )}

          <IconButton
            variant="text"
            className={`ml-auto h-6 w-6 text-black hover:bg-gray-100 lg:hidden`}
            ripple={false}
            onClick={() => setOpenNav(!openNav)}
            aria-label="Toggle navigation"
          >
            {openNav ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                className="h-6 w-6"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </IconButton>
        </ul>
        <div className="lg:hidden">
          <button
            aria-label="Open Menu"
            title="Open Menu"
            className="p-2 -mr-1 transition duration-200 rounded hover:scale-125"
            onClick={() => setIsMenuOpen(true)}
          >
            <svg className="w-5 text-black sm:w-8w" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M23,13H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,13,23,13z"
              />
              <path
                fill="currentColor"
                d="M23,6H1C0.4,6,0,5.6,0,5s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,6,23,6z"
              />
              <path
                fill="currentColor"
                d="M23,20H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,20,23,20z"
              />
            </svg>
          </button>
          {isMenuOpen && (
            <div className="animate-fade-in-down absolute top-0 left-0 w-full text-black bg-green-50 text-left p-5  border rounded shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Link
                    to="/"
                    aria-label="Recipe RMRBD"
                    title="Recipe RMRBD"
                    className="inline-flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <img
                      src={LogoA}
                      className="w-5 h-5"
                      alt="company logo"
                    />
                    <span className="company-name">Recipe RMRBD</span>
                  </Link>
                </div>
                <div>
                  <button
                    aria-label="Close Menu"
                    title="Close Menu"
                    className="p-2 -mt-2 -mr-2 transition duration-200 rounded hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-5 text-gray-600" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M19.7,4.3c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l6.3,6.3l-6.3,6.3 c-0.4,0.4-0.4,1,0,1.4C4.5,19.9,4.7,20,5,20s0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3 c0.4-0.4,0.4-1,0-1.4L13.4,12l6.3-6.3C20.1,5.3,20.1,4.7,19.7,4.3z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <nav>
                <ul className="space-y-4">
                  <NavLinks links={leftLinks} setIsMenuOpen={setIsMenuOpen} />
                  <NavLinks
                    links={rightLinks}
                    setIsMenuOpen={setIsMenuOpen}
                  />
                  <div className="flex items-center gap-x-1">
                    {isLoggedIn ? (
                      <>
                        <div className="w-full">
                          <NavLink to="/list-saved-recipe" className="block px-4 py-2">
                            Công thức đã lưu
                          </NavLink>
                          <NavLink to="/update-account" className="block px-4 py-2">
                            Đăng kí bán hàng
                          </NavLink>
                          <Button
                            fullWidth
                            variant="text"
                            size="sm"
                            onClick={handleLogout}
                          >
                            <img
                              src="/images/icon/logout.svg"
                              alt="Đăng xuất"
                              className="h-5 w-5 mr-2"
                            />
                            Đăng xuất
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Button fullWidth variant="text" size="sm">
                          <NavLink to="/login">Đăng nhập</NavLink>
                        </Button>
                      </>
                    )}
                  </div>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
