import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { pdfjs } from 'react-pdf';
import { getEbookById, checkEbookOwnership } from '../../services/EbookService';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import LoadingPage from '../../Loader/LoadingPage';
import storage from '../../../firebase/config';
import { ref, getDownloadURL } from 'firebase/storage';
import { decryptData } from "../../Encrypt/encryptionUtils";
import Cookies from 'js-cookie';

// Make sure to use the same version as your react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


const EbookReader = () => {
  const { ebookId } = useParams();
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfBlob, setPdfBlob] = useState(null);
  const navigate = useNavigate();
  const [slideDirection, setSlideDirection] = useState('right');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Memoize options to prevent unnecessary reloads
  const options = useMemo(() => ({
    cMapUrl: 'cmaps/',
    cMapPacked: true,
  }), []);

  // Add new state for reading mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        const customerId = decryptData(Cookies.get('UserId'));
        
        if (!customerId) {
          navigate(`/ebook/${ebookId}`);
          return;
        }

        const data = await getEbookById(ebookId);
        setEbook(data);

        // Check if user owns the ebook or is the creator
        const isOwned = await checkEbookOwnership(customerId, ebookId);
        const isCreator = data.createById === customerId;

        if (!isOwned && !isCreator) {
          navigate(`/ebook/${ebookId}`);
          return;
        }

        setIsAuthorized(true);

        const storageRef = ref(storage, data.pdfurl);
        const url = await getDownloadURL(storageRef);
        setPdfBlob(url);
      } catch (error) {
        console.error('Error checking access:', error);
        navigate(`/ebook/${ebookId}`);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [ebookId, navigate]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        changePage(-1);
      } else if (event.key === 'ArrowRight') {
        changePage(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [numPages, pageNumber]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    console.log("PDF loaded successfully with", numPages, "pages");
  };

  const onDocumentLoadError = (error) => {
    console.error("Error loading PDF:", error);
  };

  const changePage = (offset) => {
    setSlideDirection(offset > 0 ? 'left' : 'right');
    setPageNumber(prevPageNumber => Math.min(Math.max(1, prevPageNumber + offset), numPages));
  };

  const changeScale = (delta) => {
    setScale(prevScale => {
      const newScale = prevScale + delta;
      console.log('New scale:', newScale);
      // Limit scale between 0.5 (50%) and 2.0 (200%)
      return Math.min(Math.max(0.5, newScale), 2.0);
    });
  };

  const handleBackToDetail = async () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate(`/ebook/${ebookId}`);
    }, 500);
  };

  if (!isAuthorized) {
    return null; // Or a loading state if you prefer
  }

  if (loading || isNavigating) {
    return <LoadingPage />;
  }

  if (!ebook) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl mb-4">Error loading ebook</div>
        <button 
          onClick={() => navigate('/ebook')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Ebooks
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ease-in-out ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 transition-colors duration-300 ease-in-out ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm z-10`}>
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <button 
            onClick={handleBackToDetail}
            className={`flex items-center space-x-2 transition-colors duration-300 ease-in-out 
              ${isDarkMode ? 'text-white hover:text-gray-300' : 'text-gray-800 hover:text-gray-600'}`}
          >
            <span className="material-icons">arrow_back</span>
            <span className="font-medium">Quay lại trang chi tiết</span>
          </button>
          {ebook && (
            <h1 className={`font-medium transition-colors duration-300 ease-in-out 
              ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {ebook.title}
            </h1>
          )}
          <div className="w-12"></div> {/* Placeholder for alignment */}
        </div>
      </div>

      {/* Add margin-top to prevent content from being hidden under the header */}
      <div className="pt-16">
        {/* PDF Viewer with side navigation arrows */}
        <div className="relative flex justify-center items-center">
          {/* Left Arrow */}
          <div className="absolute left-4 flex items-center h-full z-10">
            <button 
              onClick={() => changePage(-1)} 
              disabled={pageNumber <= 1}
              className={`transition-colors duration-300 ease-in-out 
                ${isDarkMode ? 'bg-gray-800/80 hover:bg-gray-800/90' : 'bg-white/80 hover:bg-white/90'} 
                w-12 h-12 p-0 rounded-full shadow-lg backdrop-blur-sm 
                disabled:opacity-50 disabled:cursor-not-allowed
                transform hover:scale-105 transition-transform duration-200 flex items-center justify-center`}
            >
              <span className={`material-icons text-3xl transition-colors duration-300 ease-in-out 
                ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                chevron_left
              </span>
            </button>
          </div>

          {/* PDF Content */}
          <div className="w-full flex justify-center relative z-0">
            {pdfBlob ? (
              <Document
                file={pdfBlob}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                options={options}
              >
                <SwitchTransition mode="out-in">
                  <CSSTransition
                    key={pageNumber}
                    timeout={300}
                    classNames={`page-${slideDirection}`}
                    mountOnEnter
                    unmountOnExit
                  >
                    <div className="relative">
                      <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="shadow-lg"
                        width={Math.min(window.innerWidth * 0.28, 800)}
                      />
                    </div>
                  </CSSTransition>
                </SwitchTransition>
              </Document>
            ) : (
              <div className={`text-center py-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Loading PDF...
              </div>
            )}
          </div>

          {/* Right Arrow */}
          <div className="absolute right-4 flex items-center h-full z-10">
            <button 
              onClick={() => changePage(1)}
              disabled={!numPages || pageNumber >= numPages}
              className={`transition-colors duration-300 ease-in-out 
                ${isDarkMode ? 'bg-gray-800/80 hover:bg-gray-800/90' : 'bg-white/80 hover:bg-white/90'} 
                w-12 h-12 p-0 rounded-full shadow-lg backdrop-blur-sm 
                disabled:opacity-50 disabled:cursor-not-allowed
                transform hover:scale-105 transition-transform duration-200 flex items-center justify-center`}
            >
              <span className={`material-icons text-3xl transition-colors duration-300 ease-in-out 
                ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className={`fixed bottom-0 left-0 right-0 transition-colors duration-300 ease-in-out ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'} border-t border-gray-200 z-50`}>
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm transition-colors duration-300 ease-in-out">
              {numPages ? Math.round((pageNumber / numPages) * 100) : 0}%
            </span>
            <div className="flex-1 mx-4">
              <div className={`w-full transition-colors duration-300 ease-in-out ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-1`}>
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${numPages ? (pageNumber / numPages) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Zoom controls */}
              <div className="flex items-center space-x-2 relative z-50">
                <button
                  onClick={() => {
                    console.log('Zoom out clicked');
                    changeScale(-0.1);
                  }}
                  className={`p-2 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 ease-in-out 
                    ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}
                    ${scale <= 0.5 ? 'opacity-50 cursor-not-allowed' : ''}
                    relative z-50`}
                  title="Zoom Out"
                  disabled={scale <= 0.5}
                >
                  <span className="material-icons text-xl">zoom_out</span>
                </button>
                
                <span className="text-sm min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                
                <button
                  onClick={() => changeScale(0.1)}
                  className={`p-2 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 ease-in-out ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title="Zoom In"
                  disabled={scale >= 2.0}
                >
                  <span className="material-icons text-xl">zoom_in</span>
                </button>
              </div>

              {/* Dark mode toggle button */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 ease-in-out ${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <span className="material-icons text-xl">
                  {isDarkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              {/* Page number input */}
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={pageNumber}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value && value > 0 && value <= numPages) {
                      setPageNumber(value);
                    }
                  }}
                  className={`w-16 h-8 text-center border rounded-md focus:outline-none 
                    transition-colors duration-300 ease-in-out
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
                    [&::-webkit-inner-spin-button]:appearance-none
                    ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                />
                <span className="transition-colors duration-300 ease-in-out">/ {numPages || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EbookReader; 