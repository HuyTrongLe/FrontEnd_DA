import React, { useEffect, useState, useMemo } from "react";
import { getEbooks, checkEbookOwnership } from "../../services/EbookService";
import EbookSidebar from "./EbookSidebar";
import EbookCard from './EbookCard';
import Cookies from 'js-cookie';
import { decryptData } from "../../Encrypt/encryptionUtils";

function Ebook() {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: null,
    priceRange: null,
  });

  // Cache user ID
  const customerId = useMemo(() => decryptData(Cookies.get('UserId'), []));

  // Optimize data fetching
  const fetchEbooks = async () => {
    try {
      setLoading(true);
      
      // Parallel requests for better performance
      const [ebooksData] = await Promise.all([
        getEbooks(),
        // Add other parallel requests here if needed
      ]);

      if (!ebooksData || ebooksData.length === 0) {
        setEbooks([]);
        return;
      }

      // Batch ownership checks for better performance
      let ebooksWithOwnership = ebooksData;
      if (customerId) {
        const ownershipChecks = await Promise.all(
          ebooksData.map(ebook => 
            checkEbookOwnership(customerId, ebook.ebookId)
              .catch(() => false) // Handle individual failures gracefully
          )
        );
        
        ebooksWithOwnership = ebooksData.map((ebook, index) => ({
          ...ebook,
          isOwned: ownershipChecks[index]
        }));
      }

      setEbooks(ebooksWithOwnership);
    } catch (error) {
      console.error("Error fetching ebooks:", error);
      setError("Failed to load ebooks");
    } finally {
      setLoading(false);
    }
  };

  // Memoize filtered ebooks to prevent unnecessary recalculations
  const filteredEbooks = useMemo(() => {
    let filtered = [...ebooks];

    // Apply category filter
    if (filters.categories) {
      filtered = filtered.filter(
        ebook => ebook.categoryId === filters.categories
      );
    }

    // Apply price filter
    if (filters.priceRanges && filters.priceRanges.length > 0) {
      filtered = filtered.filter(ebook => {
        return filters.priceRanges.some(range => {
          const [min, max] = range.split("-").map(Number);
          return ebook.price >= min && ebook.price <= max;
        });
      });
    }

    // Apply rating filter
    if (filters.ratings && filters.ratings.length > 0) {
      filtered = filtered.filter(ebook => {
        return filters.ratings.includes(Math.round(ebook.bookRate || 0));
      });
    }

    return filtered;
  }, [ebooks, filters]);

  // Use effect with proper dependencies
  useEffect(() => {
    fetchEbooks();
  }, []); // Empty dependency array since filters are now handled by useMemo

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <section className="section-center min-h-screen">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row items-start justify-between -mx-4">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4 px-4 mb-8 lg:mb-0">
            <EbookSidebar onFilterChange={handleFilterChange} />
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-3/4 px-4">
            <div className="rounded-lg shadow-md bg-gray-300 p-4">
              {loading ? (
                <p className="text-2xl text-center text-blue-500">Đang tải dữ liệu...</p>
              ) : error ? (
                <p className="text-center text-red-500">{error}</p>
              ) : filteredEbooks.length === 0 ? (
                <p className="text-2xl text-center text-gray-500 font-bold">Không tìm thấy sách nào.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEbooks.map((ebook) => (
                    <EbookCard key={ebook.ebookId} ebook={ebook} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Ebook; 