import  { useState, useEffect } from "react";
import {
  FaBan,
  FaCheckCircle,
  FaRegClock,
  FaInfoCircle,
  FaFilter,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import "bootstrap/dist/css/bootstrap.min.css";
import { listAccountProfile } from "../services/ModeratorService/Api";

const AccountProfile = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [showFilter, setShowFilter] = useState(false); // State to control the filter visibility
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const result = await listAccountProfile();
      setData(result);
    } catch (error) {
      console.error("Error fetching account data:", error);
    }
  };

  const handleDetails = (accountId) => {
    navigate(`/update-role/${accountId}`);
  };

  // Filter the data based on the search term
  const filteredData = data.filter((row) => {
    const matchesName = row.account?.userName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      !statusFilter || row.status?.toString() === statusFilter;

    return matchesName && matchesStatus;
  });

  const columns = [
    {
      name: "STT",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "80px", // Reduced width for smaller display
    },
    {
      name: "Tên người dùng",
      selector: (row) => row.account?.userName || "Không có tên",
      sortable: true,
      width: "250px", // Adjusted width
      style: { fontSize: "14px" }, // Reduced font size for smaller text
    },
    {
      name: "Ngày sinh",
      selector: (row) => row.dateOfBirth.split("T")[0], // Display only the date
      sortable: true,
      width: "120px", // Adjusted width for smaller display
      style: { fontSize: "14px" }, // Reduced font size for smaller text
    },
    {
      name: "Chân dung",
      cell: (row) =>
        row.portrait ? (
          <img
            alt="Chân dung"
            className="w-24 h-24 object-cover rounded-md" // Reduced size for image
            src={row.portrait}
          />
        ) : (
          "Không có"
        ),
      width: "250px", // Adjusted width
      height: "150px", // Adjusted height
    },
    {
      name: "Số CMND",
      selector: (row) => row.idcardNumber,
      sortable: true,
      width: "120px", // Adjusted width
      style: { fontSize: "14px" }, // Reduced font size for smaller text
    },
    {
      name: "Trạng thái",
      cell: (row) =>
        row.status === 0 ? (
          <FaBan style={{ color: "red", fontSize: "18px" }} title="Từ chối" /> 
        ) : row.status === 1 ? (
          <FaCheckCircle
            style={{ color: "green", fontSize: "18px" }}
            title="Đã xác nhận"
          />
        ) : (
          <FaRegClock
            style={{ color: "orange", fontSize: "18px" }}
            title="Chờ xác nhận"
          />
        ),
      sortable: true,
      width: "120px", // Adjusted width
    },
    {
      name: "Thao tác",
      cell: (row) => (
        <button
          className="btn btn-link p-0"
          onClick={() => handleDetails(row.accountId)}
        >
          <FaInfoCircle
            style={{ color: "#007bff", fontSize: "18px" }} 
            title="Chi tiết"
          />
        </button>
      ),
      width: "120px", // Adjusted width
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-7xl bg-white shadow-lg rounded-lg p-5">
        {/* Filter Button */}
        <div className="mb-4 flex items-center justify-between">
          <button
            className="flex items-center text-blue-500 hover:text-blue-700"
            onClick={() => setShowFilter(!showFilter)}
          >
            <FaFilter className="mr-2" />
            Bộ lọc
          </button>
        </div>

        {/* Filter Section */}
        {showFilter && (
          <div className="flex flex-wrap items-center mb-4 gap-4 bg-gray-100 p-4 rounded-md">
            <input
              type="text"
              className="border p-2 rounded flex-1 min-w-[200px]"
              placeholder="Tìm kiếm tên người dùng"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="border p-2 rounded flex-1 min-w-[200px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="0">Từ chối</option>
              <option value="-1">Chờ xác nhận</option>
              <option value="1">Đã xác nhận</option>
            </select>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
              }}
            >
              Xóa lọc
            </button>
          </div>
        )}

        {/* DataTable */}
        <DataTable
          title="Danh sách tài khoản"
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          striped
          customStyles={{
            rows: {
              style: {
                fontSize: "14px",
                padding: "12px",
              },
            },
            headCells: {
              style: {
                fontSize: "16px",
                padding: "10px",
              },
            },
            cells: {
              style: {
                padding: "10px",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AccountProfile;
