import { useState, useEffect } from "react";
import {
  FaBan,
  FaCheckCircle,
  FaRegClock,
  FaInfoCircle,
  FaFilter,
} from "react-icons/fa";
import Cookies from "js-cookie";
import DataTable from "react-data-table-component";
import { listEbook } from "../services/ModeratorService/Api";
import { decryptData } from "../Encrypt/encryptionUtils";
import { useNavigate } from "react-router-dom";

const EbookList = () => {
  const [ebooks, setebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [censorID, setcensorID] = useState();
  const [showFilter, setShowFilter] = useState(false);
  const [filterText, setFilterText] = useState(""); // For ebook name filter
  const [filterStatus, setFilterStatus] = useState(""); // For ebook status filter
  const navigate = useNavigate();
  useEffect(() => {
    setcensorID(decryptData(Cookies.get("UserId")));
  }, []);

  const fetchebooks = async () => {
    try {
      const response = await listEbook();
      setebooks(response);
    } catch (error) {
      console.error("Error fetching ebooks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetails = (ebookId) => {
    navigate(`/update-ebook-details/${ebookId}`);
  };

  useEffect(() => {
    fetchebooks();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: true,
    },
    {
      name: "Tên sách điện tử",
      selector: (row) => row.ebookName || "Unknown",
      sortable: true,
    },
    {
      name: "Giá",
      selector: (row) => row.price || "Unknown",
      sortable: true,
    },
    {
      name: "Ảnh",
      selector: (row) => (
        <img
          src={row.imageUrl}
          alt="ebook preview"
          className="w-16 h-16 object-cover rounded-md"
        />
      ),
      sortable: false,
    },
    {
      name: "Trạng thái",
      selector: (row) => {
        if (row.status === 0) {
          return (
            <FaBan
              style={{
                color: "red",
                cursor: "pointer",
                fontSize: "24px",
              }}
              title="Bị khóa"
            />
          );
        }
        if (row.status === 1) {
          return (
            <FaCheckCircle
              style={{
                color: "green",
                cursor: "pointer",
                fontSize: "24px",
              }}
              title="Đã xác nhận"
            />
          );
        }
        if (row.status === -1) {
          return (
            <FaRegClock
              style={{
                color: "orange",
                cursor: "pointer",
                fontSize: "24px",
              }}
              title="Chờ được xác nhận"
            />
          );
        }
      },
      sortable: false,
    },
    {
      name: "Thao tác",
      selector: (row) => (
        <button
          className="btn btn-link"
          onClick={() => handleDetails(row.accountId)}
        >
          <FaInfoCircle
            style={{
              color: "#007bff",
              cursor: "pointer",
              fontSize: "24px",
            }}
            title="Chi tiết"
          />
        </button>
      ),
      sortable: false,
    },
  ];

  // Filter ebooks based on filter criteria
  const filteredEbooks = ebooks.filter((ebook) => {
    const matchesName = ebook.ebookName
      .toLowerCase()
      .includes(filterText.toLowerCase());
    const matchesStatus = filterStatus
      ? ebook.status.toString() === filterStatus
      : true;

    return matchesName && matchesStatus;
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        {/* Filter Section */}
        <div className="mb-4 flex items-center">
          <button
            className="flex items-center text-blue-500 hover:text-blue-700"
            onClick={() => setShowFilter(!showFilter)}
          >
            <FaFilter className="mr-2" />
            Bộ lọc
          </button>
        </div>

        {showFilter && (
          <div className="mb-4 flex flex-wrap items-center gap-4 w-full bg-gray-100 p-4 rounded-md">
            <input
              type="text"
              placeholder="Tìm theo tên sách điện tử"
              className="border border-gray-300 rounded p-2 flex-1 min-w-[200px]"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <select
              className="border border-gray-300 rounded p-2 flex-1 min-w-[200px]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="0">Bị khóa</option>
              <option value="1">Đã xác nhận</option>
              <option value="-1">Chờ xác nhận</option>
            </select>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={() => {
                setFilterText("");
                setFilterStatus("");
              }}
            >
              Xóa lọc
            </button>
          </div>
        )}

        <DataTable
          title="Danh sách sách điện tử"
          columns={columns}
          data={filteredEbooks}
          progressPending={loading}
          pagination
          responsive
          highlightOnHover
          pointerOnHover
        />
      </div>
    </div>
  );
};

export default EbookList;
