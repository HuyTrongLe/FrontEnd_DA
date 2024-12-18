import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
  FaBan,
  FaCheckCircle,
  FaRegClock,
  FaInfoCircle,
  FaFilter,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { listRecipe } from "../services/ModeratorService/Api";

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilter, setShowFilter] = useState(false); // Trạng thái hiển thị bộ lọc
  const navigate = useNavigate();

  const fetchRecipes = async () => {
    try {
      const response = await listRecipe();
      setRecipes(response);
      setFilteredRecipes(response);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách công thức:", error);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    const filtered = recipes.filter((recipe) => {
      const matchesKeyword =
        recipe.recipeName
          ?.toLowerCase()
          .includes(filterKeyword.toLowerCase()) ||
        recipe.ingredient?.toLowerCase().includes(filterKeyword.toLowerCase());

      const matchesStatus =
        statusFilter === "" || recipe.status === parseInt(statusFilter);

      return matchesKeyword && matchesStatus;
    });
    setFilteredRecipes(filtered);
  }, [filterKeyword, statusFilter, recipes]);

  const handleDetails = (recipeId) => {
    navigate(`/update-recipe/${recipeId}`);
  };

  const columns = [
    {
      name: "#",
      cell: (row, index) => <span>{index + 1}</span>,
      width: "50px",
    },
    {
      name: "Tên công thức",
      selector: (row) => row.recipeName || "Chưa xác định",
      sortable: true,
    },
    {
      name: "Số người phục vụ",
      selector: (row) => row.numberOfService || "Chưa xác định",
      sortable: true,
    },
    {
      name: "Giá",
      selector: (row) => row.price || "Miễn phí",
      sortable: true,
    },
    {
      name: "Ảnh",
      cell: (row) =>
        row.images?.length > 0 ? (
          <img
            src={row.images[0].imageUrl}
            alt="Ảnh công thức"
            className="w-16 h-16 object-cover rounded-md"
          />
        ) : (
          "Không có ảnh"
        ),
    },
    {
      name: "Trạng thái",
      cell: (row) => (
        <>
          {row.status === 0 && (
            <FaBan style={{ color: "red", fontSize: "24px" }} title="Bị khóa" />
          )}
          {row.status === 1 && (
            <FaCheckCircle
              style={{ color: "green", fontSize: "24px" }}
              title="Đã xác nhận"
            />
          )}
          {row.status === -1 && (
            <FaRegClock
              style={{ color: "orange", fontSize: "24px" }}
              title="Chờ xác nhận"
            />
          )}
        </>
      ),
      sortable: true,
    },
    {
      name: "Thao tác",
      cell: (row) => (
        <button
          className="btn btn-link"
          onClick={() => handleDetails(row.recipeId)}
        >
          <FaInfoCircle
            style={{ color: "#007bff", fontSize: "24px" }}
            title="Chi tiết"
          />
        </button>
      ),
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        {/* Nút hiển thị/ẩn bộ lọc */}
        <div className="mb-4 flex items-center">
          <button
            className="flex items-center text-blue-500 hover:text-blue-700"
            onClick={() => setShowFilter(!showFilter)}
          >
            <FaFilter className="mr-2" />
            Bộ lọc
          </button>
        </div>

        {/* Phần bộ lọc */}
        {showFilter && (
          <div className="flex flex-wrap items-center mb-4 gap-4 bg-gray-100 p-4 rounded-md">
            <input
              type="text"
              placeholder="Tìm kiếm tên công thức hoặc nguyên liệu..."
              className="border p-2 rounded flex-1 min-w-[200px]"
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
            />
            <select
              className="border p-2 rounded flex-1 min-w-[200px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="-1">Chờ xác nhận</option>
              <option value="0">Bị khóa</option>
              <option value="1">Đã xác nhận</option>
            </select>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={() => {
                setFilterKeyword("");
                setStatusFilter("");
              }}
            >
              Xóa lọc
            </button>
          </div>
        )}

        {/* DataTable */}
        <DataTable
          title="Danh sách công thức"
          columns={columns}
          data={filteredRecipes}
          pagination
          highlightOnHover
          pointerOnHover
          responsive
        />
      </div>
    </div>
  );
};

export default RecipeList;
