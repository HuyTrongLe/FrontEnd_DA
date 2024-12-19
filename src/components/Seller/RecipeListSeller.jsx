import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import EditIcon from "/images/icon/edit.svg";
import EyeIcon from "/images/icon/eye.svg";
import Sidebar from "../Customer/Sidebar";
import {fetchRecipes} from "../services/SellerService/Api";
import Swal from "sweetalert2";
import { decryptData } from "../Encrypt/encryptionUtils";
import {
  FaFilter,
  FaSearch,
  FaPlus,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
const ShowRecipes = () => {
  const [data, setData] = useState([]);
  const [accountId, setAccountID] = useState("");

  useEffect(() => {
    const storedUserId = decryptData(Cookies.get("UserId"));
    console.log("Stored UserId:", storedUserId);

    if (storedUserId) {
      setAccountID(storedUserId);
    } else {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không tìm thấy người dùng. Vui lòng đăng nhập.",
      });
    }
  }, []);

  useEffect(() => {
    if (accountId) {
      getData(); // Fetch data only when accountId is available
    }
  }, [accountId]);

  const getData = async () => {
    try {
      const result = await fetchRecipes(accountId);
      setData(result);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải danh sách công thức. Vui lòng thử lại.",
      });
    }
  };

  // Function to return the status icon based on the recipe's status
  const getStatusIcon = (status) => {
    switch (status) {
      case 1:
        return (
          <FaCheck style={{ color: "green", width: "32px", height: "32px" }} />
        );
      case -1:
        return (
          <FaExclamationTriangle
            style={{
              color: "orange",
              width: "32px",
              height: "32px",
              textAlign: "center",
            }}
          />
        );
      case 0:
        return (
          <FaTimes style={{ color: "red", width: "32px", height: "32px" }} />
        );
      default:
        return (
          <FaExclamationTriangle
            style={{ color: "gray", width: "32px", height: "32px" }}
          />
        );
    }
  };

  //Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });

  // Hàm sắp xếp
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);
  // Tính toán dữ liệu phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  // Thay đổi trạng thái sắp xếp
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPortion, setSelectedPortion] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  // Lấy danh sách duy nhất
  const portionOptions = [
    ...new Set(data.map((recipe) => recipe.numberOfService)),
  ];
  const statusOptions = [...new Set(data.map((recipe) => recipe.status))];
  const priceOptions = [...new Set(data.map((recipe) => recipe.price))];

  // Hàm xử lý khi nhấn FaSearch
  const handleSearch = () => {
    let filteredData = data;

    if (searchQuery) {
      filteredData = filteredData.filter((recipe) =>
        recipe.recipeName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedPortion)
      filteredData = filteredData.filter(
        (recipe) => recipe.numberOfService.toString() === selectedPortion
      );
    if (selectedStatus)
      filteredData = filteredData.filter(
        (recipe) => recipe.status === parseInt(selectedStatus)
      );
    if (selectedPrice)
      filteredData = filteredData.filter(
        (recipe) => recipe.price === parseFloat(selectedPrice)
      );
    setFilteredRecipes(filteredData);
    setIsFiltered(true); // Đánh dấu là có bộ lọc
    setCurrentPage(1); // Reset pagination
  };
  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedPortion("");
    setSelectedStatus("");
    setSelectedPrice("");
    setIsFiltered(false);
    setCurrentPage(1);
  };
  const currentData = (isFiltered ? filteredRecipes : sortedData).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <div className="flex flex-col md:flex-row justify-center items-start p-4 space-y-8 md:space-y-0 md:space-x-8">
      {/* Sidebar */}
      <Sidebar />
      <section className="flex flex-col">
        <div className="section-center w-[1140px] bg-white p-4 rounded-lg shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Danh sách công thức
            </h2>
            <Link to="/create-recipe-seller">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                <FaPlus className="mr-2" /> Thêm công thức
              </button>
            </Link>
          </div>
          {/* Nút Filter */}
          <div className="flex items-center mb-4">
            <button
              className="bg-orange-500 text-white p-2 rounded-md mr-2"
              onClick={() => setShowFilters(!showFilters)} // Toggle bộ lọc
            >
              <FaFilter className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Search..."
              className="border rounded-md px-4 py-2 w-49"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value); // Set the search query
                handleSearch(); // Trigger the filter immediately when the user types
              }}
            />
            <button
              className="bg-gray-500 text-white p-2 rounded-md ml-2"
              onClick={handleClearFilters}
            >
              Xóa lọc
            </button>
          </div>

          {/* Bộ lọc chi tiết */}
          {showFilters && (
            <div className="flex space-x-4 mb-4">
              <select
                className="border rounded-md px-4 py-2 w-48"
                value={selectedPortion}
                onChange={(e) => setSelectedPortion(e.target.value)}
              >
                <option value="">Chọn khẩu phần</option>
                {portionOptions.map((portion, index) => (
                  <option key={index} value={portion}>
                    {portion}
                  </option>
                ))}
              </select>
              <select
                className="border rounded-md px-4 py-2 w-48"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Chọn trạng thái</option>
                {statusOptions.map((status, index) => (
                  <option key={index} value={status}>
                    {status === -1
                      ? "Chưa kiểm duyệt"
                      : status === 0
                      ? "Bị khóa"
                      : status === 1
                      ? "Được duyệt"
                      : "Không xác định"}
                  </option>
                ))}
              </select>
              <select
                className="border rounded-md px-4 py-2 w-48"
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
              >
                <option value="">Chọn giá</option>
                {priceOptions.map((price, index) => (
                  <option key={index} value={price}>
                    {price}
                  </option>
                ))}
              </select>
              <button
                className="bg-orange-500 text-white p-2 rounded-md"
                onClick={handleSearch}
              >
                <FaSearch className="w-4 h-4" />
              </button>
            </div>
          )}

          <table className="table-auto w-full">
            <thead className="bg-gray-200">
              <tr className="text-gray-700">
                <th className="px-4 py-2 text-left">#</th>
                <th
                  className="px-4 py-2 text-left cursor-pointer"
                  onClick={() => handleSort("recipeName")}
                >
                  Tên công thức{" "}
                  {sortConfig.key === "recipeName"
                    ? sortConfig.direction === "ascending"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th
                  className="px-4 py-2 text-left cursor-pointer"
                  onClick={() => handleSort("price")}
                >
                  Giá{" "}
                  {sortConfig.key === "price"
                    ? sortConfig.direction === "ascending"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th
                  className="px-4 py-2 text-left cursor-pointer"
                  onClick={() => handleSort("numberOfService")}
                >
                  Khẩu phần{" "}
                  {sortConfig.key === "numberOfService"
                    ? sortConfig.direction === "ascending"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th className="px-4 py-2 text-left">Hình ảnh</th>
                <th className="px-4 py-2 text-left">Trạng thái</th>
                <th className="px-4 py-2 text-left">Tùy chọn</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((recipe, index) => (
                <tr key={recipe.recipeId} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-center">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="px-4 py-2">{recipe.recipeName}</td>
                  <td className="px-4 py-2">{recipe.price}</td>
                  <td className="px-4 py-2">{recipe.numberOfService}</td>
                  <td className="px-4 py-2">
                    {recipe.images?.length > 0 && (
                      <img
                        src={recipe.images[0].imageUrl}
                        alt="Recipe preview"
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    )}
                  </td>
                  <td className="px-8 py-2">{getStatusIcon(recipe.status)}</td>
                  <td className="px-4 py-8 flex space-x-2">
                  <Link
                      to={
                        recipe.status === 1
                          ? "#"
                          : `/edit-recipe/${recipe.recipeId}`
                      }
                    >
                      <img
                        src={EditIcon}
                        alt="Edit Icon"
                        className="w-6 h-6 mr-2"
                        onClick={(e) => {
                          if (recipe.status === 1) {
                            e.preventDefault();
                            Swal.fire({
                              icon: "error",
                              title: "Không thể chỉnh sửa",
                              text: "Công thức này đã được duyệt, bạn không thể chỉnh sửa.",
                              confirmButtonText: "OK",
                            });
                          }
                        }}
                      />
                    </Link>
                    <Link to={`/recipe-seller-detail/${recipe.recipeId}`}>
                      <img
                        src={EyeIcon}
                        alt="Edit Icon"
                        className="w-6 h-6 mr-2"
                      />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4">
            <div>
              Hiển thị trên mỗi trang:{" "}
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border rounded-md px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShowRecipes;
