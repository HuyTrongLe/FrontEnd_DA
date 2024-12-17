import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (location.pathname === "/") {
    return null; // Không hiển thị breadcrumb khi ở trang Home
  }

  const breadcrumbNames = {
    // Sách và chi tiết sách
    book: { name: "Sách Nấu Ăn", link: "/book" },
    "book-detail": { name: "Chi Tiết Sách", link: "/book" },

    // Công thức và chi tiết công thức
    recipe: { name: "Công Thức Nấu Ăn", link: "/recipe" },
    "recipe-detail": { name: "Chi Tiết Công Thức", link: "/recipe" },

    // Sách điện tử và danh sách
    ebook: { name: "Sách Điện Tử", link: "/ebook" },
    "saved-ebooks": { name: "Sách Điện Tử Đã Lưu", link: "/ebook" },
    "list-ebook-customer": { name: "Sách Điện Tử Đã Đăng", link: "/ebook" },
    "add-ebook-customer": { name: "Thêm Sách Điện Tử Mới", link: "/ebook" },

    // Nạp xu và giao dịch
    recharge: { name: "Nạp Xu", link: "/recharge" },
    coinTransaction: { name: "Lịch Sử Giao Dịch", link: "/coinTransaction" },
    termsofpurchase: { name: "Điều Khoản và Điều Kiện Mua Tiền Xu", link: "/termsofpurchase" },

    // Đơn hàng và địa chỉ
    orders: { name: "Đơn Hàng Của Tôi", link: "/orders" },
    "manage-addresses": { name: "Địa Chỉ Của Bạn", link: "/manage-addresses" },

    // Giỏ hàng
    cart: { name: "Giỏ Hàng", link: "/cart" },

    // Công thức đăng của seller
    "recipe-list-seller": { name: "Công Thức Đã Đăng", link: "/recipe-list-seller" },
    "create-recipe-seller": { name: "Thêm Công Thức Mới", link: "/create-recipe-seller" },
    "list-saved-recipe": { name: "Công Thức Đã Lưu", link: "/list-saved-recipe" },

    // Sách nấu ăn của seller
    "book-list-customer": { name: "Sách Nấu Ăn Đã Đăng", link: "/book-list-customer" },
    "add-book-customer": { name: "Thêm Sách Mới", link: "/add-book-customer" },

    // Người dùng và cập nhật thông tin
    "update-information": { name: "Thông Tin Cá Nhân", link: "/update-information" },
    "update-to-seller": { name: "Đăng Kí Bán Hàng", link: "/update-to-seller" },
    "form-updated-role": { name: "Thông Tin Đăng Kí Bán Hàng", link: "/form-updated-role" },
    "form updated-role": { name: "Thông Tin Đã Yêu Cầu", link: "/form-updated-role" },

    // Khám phá và báo cáo
    places: { name: "Khám Phá Món Ăn", link: "/places" },
    report: { name: "Khiếu Nại", link: "/report" },

    // Các trang khác
    faq: { name: "Câu Hỏi Thường Gặp", link: "/faq" },
    withdrawrequest: { name: "Yêu Cầu Rút Tiền", link: "/withdrawrequest" },
    product: { name: "Tìm Kiếm Sản Phẩm", link: "/product" }
  };


  return (
    <>
      <div className="min-h-24 flex items-end w-full p-4 bg-gray-900"></div>
      <nav className="flex items-end w-full p-4">
        <ol className="inline-flex space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li className="inline-flex items-center">
            <Link
              to="/"
              className="inline-flex items-center text-lg font-medium text-gray-900 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
            >
              <svg
                className="w-4 h-4 me-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
              </svg>
              Trang Chủ
            </Link>
          </li>

          {pathnames.map((value, index) => {
            const isLast = index === pathnames.length - 1;
            const breadcrumb = breadcrumbNames[value] || {
              name: decodeURIComponent(value).replace("-", " "),
              link: `/${value}`,
            };

            // Nếu là trang chi tiết thì quay về link cha
            const to =
              value === "book-detail"
                ? breadcrumbNames["book-detail"].link
                : breadcrumb.link;

            return (
              <li key={to} aria-current={isLast ? "page" : undefined}>
                <div className="flex items-center">
                  <svg
                    className="rtl:rotate-180 w-4 h-4 text-gray-400 mx-1"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                  {isLast ? (
                    <span className="ms-1 text-lg font-medium text-gray-700 md:ms-2 dark:text-gray-400">
                      {breadcrumb.name}
                    </span>
                  ) : (
                    <Link
                      to={to}
                      className="ms-1 text-lg font-medium text-gray-800 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white"
                    >
                      {breadcrumb.name}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;