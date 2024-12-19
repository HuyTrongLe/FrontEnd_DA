import React from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { decryptData } from "../../Encrypt/encryptionUtils";

const EbookCard = ({ ebook }) => {
  const customerId = decryptData(Cookies.get('UserId'));
  
  // Ensure we have valid values for comparison and handle type coercion
  const createById = ebook.createById || ebook.createBy || null; // Try both possible field names
  const isCreator = Boolean(createById) && Boolean(customerId) && 
                   Number(createById) === Number(customerId); // Use Number for comparison
  const isOwned = Boolean(ebook.isOwned) || Boolean(ebook.isPurchased) || isCreator;

  // Debug logs with more detailed information
  console.log('Card Debug:', {
    bookName: ebook.ebookName,
    customerId,
    createById,
    createBy: ebook.createBy,
    isCreator,
    isOwned,
    isPurchased: ebook.isPurchased,
    comparison: {
      createById: typeof createById,
      customerId: typeof customerId,
      createByIdValue: createById,
      customerIdValue: customerId,
      isEqual: Number(createById) === Number(customerId)
    }
  });

  return (
    <div className="flex flex-col">
      <Link 
        to={`/ebook/${ebook.ebookId}`}
        className="group relative block transition-transform duration-300 hover:-translate-y-2"
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-gray-200 
          shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] 
          transition-shadow duration-300 bg-white">
            <div className="absolute top-0 left-0 right-0 bottom-0 book-border z-20"></div>
          {/* Book Cover */}
          <img
            src={ebook.imageUrl}
            alt={ebook.ebookName}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
            }}
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="text-lg font-semibold mb-2">{ebook.ebookName}</h3>
              <p className="text-sm text-gray-200 line-clamp-2">{ebook.description}</p>
            </div>
          </div>
        </div>
      </Link>
      <h3 className="mt-3 text-center text-gray-800 font-medium line-clamp-2 px-2">
        {ebook.ebookName}
      </h3>
      <p className="text-center text-gray-600">
        {isCreator ? (
          <span className="text-green-600 font-medium">Đã sở hữu (Tác giả)</span>
        ) : isOwned ? (
          <span className="text-green-600 font-medium">Đã sở hữu</span>
        ) : ebook.price === 0 ? (
          <span className="text-green-600 font-medium">Miễn phí</span>
        ) : (
          <span>
            {ebook.price}
            <img src="/images/icon/dollar.png" alt="coins" className="h-5 w-5 mb-1 ml-1 inline-block" />
          </span>
        )}
      </p>
    </div>
  );
};

export default EbookCard; 