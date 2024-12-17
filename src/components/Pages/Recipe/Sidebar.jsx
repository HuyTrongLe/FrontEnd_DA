import React, { useEffect, useState } from "react";
import axios from "axios";

function Sidebar({ onFilterChange }) {
  const [tags, settags] = useState([]); // Danh mục loại sách
  const [filters, setFilters] = useState({
    tags: null, // Chỉ lưu trữ một tag
    priceRanges: [],
    publishers: [], // Giả sử bạn sẽ dùng publishers nếu cần
    ratings: [], // Đánh giá
  });

  // Fetch danh mục sách từ API
  useEffect(() => {
    const fetchtags = async () => {
      try {
        const response = await axios.get(
          "https://rmrbdapi.somee.com/odata/Tag?$filter=status eq 1",
          {
            headers: { token: "123-abc" },
          }
        );
        const activetags = response.data.filter(
          (tag) => tag.status === 1
        );
        settags(activetags);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      }
    };

    fetchtags();
  }, []);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (filterType, value) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };

      if (filterType === "tags") {
        // Chỉ cho phép chọn một tag
        updatedFilters.tags = updatedFilters.tags === value ? null : value;
      } else {
        // Xử lý các bộ lọc khác (đa chọn)
        if (updatedFilters[filterType].includes(value)) {
          updatedFilters[filterType] = updatedFilters[filterType].filter(
            (item) => item !== value
          );
        } else {
          updatedFilters[filterType].push(value);
        }
      }

      // Gửi bộ lọc được cập nhật về trang cha
      onFilterChange(updatedFilters);

      return updatedFilters;
    });
  };

  // Hàm xử lý "Bỏ chọn"
  const clearCategoryFilter = () => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, tags: null };
      onFilterChange(updatedFilters); // Gửi lại bộ lọc
      return updatedFilters;
    });
  };

  return (
    <div className="p-4 rounded-lg shadow-md bg-white">
      <h2 className="font-bold bg-clip-text text-lg mb-6">
        Nhóm Món Ăn
      </h2>

      {/* Loại Món Ăn */}
      <div className="mb-6">
        <label className="inline-block font-bold bg-clip-text mb-4">
          Loại Món Ăn
        </label>
        <ul className="space-y-3">
          {tags.map((tag) => (
            <li key={tag.tagId} className="flex items-center">
              <input
                type="radio"
                name="tag" // Đảm bảo chỉ chọn một
                className="w-4 h-4 mr-3 text-blue-500 focus:ring-blue-400 rounded"
                checked={filters.tags === tag.tagId}
                onChange={() =>
                  handleFilterChange("tags", tag.tagId)
                }
              />
              <span className="text-gray-800">{tag.tagName}</span>
            </li>
          ))}
        </ul>
        {/* Nút Bỏ chọn */}
        <button
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-400 rounded"
          onClick={clearCategoryFilter}
        >
          Bỏ chọn
        </button>
      </div>

      {/* Giá */}
      <div className="mb-6">
        <label className="inline-block font-bold mb-5">
          Giá
        </label>
        <ul className="space-y-3">
          {[
            { label: "Miễn phí", value: "0-0" },
            { label: ">0 Xu - 20,000 Xu", value: "1-20000.000" },
            { label: ">20,000 Xu - 50,000 Xu", value: "20000.000-50000.000" },
            { label: ">50,000 Xu", value: "50000.000 - 1000000000.000" },
          ].map((priceRange, index) => (
            <li key={index} className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 mr-3 text-blue-500 focus:ring-blue-400 rounded"
                onChange={() =>
                  handleFilterChange("priceRanges", priceRange.value)
                }
              />
              <span className="text-gray-800">{priceRange.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
