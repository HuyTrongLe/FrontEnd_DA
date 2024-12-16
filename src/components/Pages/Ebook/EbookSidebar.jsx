import React, { useEffect, useState } from "react";
import axios from "axios";

function EbookSidebar({ onFilterChange }) {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    categories: null,
    priceRanges: [],
    ratings: [],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://rmrbdapi.somee.com/odata/BookCategory",
          {
            headers: { token: "123-abc" },
          }
        );
        const activeCategories = response.data.filter(
          (category) => category.status === 1
        );
        setCategories(activeCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };

      if (filterType === "categories") {
        updatedFilters.categories = updatedFilters.categories === value ? null : value;
      } else {
        if (updatedFilters[filterType].includes(value)) {
          updatedFilters[filterType] = updatedFilters[filterType].filter(
            (item) => item !== value
          );
        } else {
          updatedFilters[filterType].push(value);
        }
      }

      onFilterChange(updatedFilters);
      return updatedFilters;
    });
  };

  const clearFilters = () => {
    const newFilters = {
      categories: null,
      priceRanges: [],
      ratings: [],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="p-4 rounded-lg shadow-md bg-white">
      <h2 className="font-bold text-lg mb-6">Bộ lọc</h2>

      {/* Categories */}
      <div className="mb-6">
        <label className="font-bold mb-4 block">Thể loại</label>
        <ul className="space-y-3">
          {categories.map((category) => (
            <li key={category.categoryId} className="flex items-center">
              <input
                type="radio"
                name="category"
                className="w-4 h-4 mr-3 text-blue-500 focus:ring-blue-400"
                checked={filters.categories === category.categoryId}
                onChange={() => handleFilterChange("categories", category.categoryId)}
              />
              <span className="text-gray-600">{category.name}</span>
            </li>
          ))}
        </ul>
        <button
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-400 rounded"
          onClick={clearFilters}
        >
          Bỏ chọn
        </button>
      </div>

      {/* Price Ranges */}
      <div className="mb-6">
        <label className="font-bold mb-4 block">Giá</label>
        <ul className="space-y-3">
          {[
            { label: "Miễn phí", value: "0-0" },
            { label: "1 - 150,000 xu", value: "1-150000" },
            { label: "150,001 - 300,000 xu", value: "150001-300000" },
            { label: ">300,000 xu", value: "300001-999999999" },
          ].map((range) => (
            <li key={range.value} className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 mr-3 text-blue-500 focus:ring-blue-400 rounded"
                checked={filters.priceRanges.includes(range.value)}
                onChange={() => handleFilterChange("priceRanges", range.value)}
              />
              <span className="text-gray-600">{range.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ratings */}
      <div className="mb-6">
        <label className="font-bold mb-4 block">Đánh Giá</label>
        <ul className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <li key={rating} className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 mr-3 text-blue-500 focus:ring-blue-400 rounded"
                checked={filters.ratings.includes(rating)}
                onChange={() => handleFilterChange("ratings", rating)}
              />
              <span className="text-gray-600">{rating} sao</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default EbookSidebar; 