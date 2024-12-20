import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2"; // Import SweetAlert2
import Cookies from "js-cookie";
import { FaCloudUploadAlt } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { decryptData } from "../Encrypt/encryptionUtils";
import { useNavigate } from 'react-router-dom';

const EbookCustomer = () => {
  const navigate = useNavigate();

  const [newEbook, setNewEbook] = useState({
    EbookName: "",
    Description: "",
    Price: "",
    Status: -1,
    Pdf: null,
    image: null,
    categoryId: "",
    Author: "",
  });

  const [categories, setCategories] = useState([]); // Store categories from API
  const fileInputRef = useRef(null);

  // Add new state for preview images
  const [previewImages, setPreviewImages] = useState([]);

  // Add this to your state management
  const [pdfPreview, setPdfPreview] = useState(null);

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://rmrbdapi.somee.com/odata/BookCategory",
          {
            headers: {
              "Content-Type": "application/json",
              Token: "123-abc",
            },
          }
        );
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load categories.",
        });
      }
    };

    fetchCategories();
  }, []);

  // Retrieve the logged-in user data from cookies
  const UserId = decryptData(Cookies.get("UserId")); // Get UserId from cookies (after login)

  // Update image handling to use dropzone
  const handleImageDrop = useCallback((acceptedFiles) => {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 1; // Only allow one file for ebook cover

    if (acceptedFiles.length > maxFiles) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Only one image allowed for ebook cover'
      });
      return;
    }

    const validFiles = acceptedFiles.filter(file => {
      if (!validImageTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: `${file.name} is not a valid image type (JPG, PNG, or GIF only)`
        });
        return false;
      }
      if (file.size > maxSize) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: `${file.name} is too large (max 5MB)`
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      // Update ebook state with new file
      setNewEbook(prev => ({
        ...prev,
        image: validFiles[0]
      }));

      // Create and store preview URL
      const newPreview = {
        url: URL.createObjectURL(validFiles[0]),
        name: validFiles[0].name
      };
      
      setPreviewImages([newPreview]); // Replace existing preview
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleImageDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024
  });

  // Add cleanup effect for preview URLs
  useEffect(() => {
    return () => {
      previewImages.forEach(image => {
        if (image?.url) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [previewImages]);

  // Add remove image function
  const removeImage = useCallback(() => {
    if (previewImages[0]?.url) {
      URL.revokeObjectURL(previewImages[0].url);
    }
    setPreviewImages([]);
    setNewEbook(prev => ({
      ...prev,
      image: null
    }));
  }, [previewImages]);

  // Update the PDF handler
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please select a PDF file'
        });
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'PDF file must be less than 50MB'
        });
        return;
      }

      setNewEbook(prev => ({
        ...prev,
        Pdf: file
      }));
      setPdfPreview({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) // Convert to MB
      });
    }
  };

  // Add this to your cleanup useEffect
  useEffect(() => {
    return () => {
      // ... existing cleanup for images ...
      setPdfPreview(null);
    };
  }, []);

  // Function to format number with commas
  const formatNumberWithCommas = (value) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Add this validation function at the top of your component
  const validateNumber = (value) => {
    // Remove any non-digit characters
    return value.replace(/[^\d]/g, '');
  };

  // Update the price handler
  const handlePriceChange = (e) => {
    const rawValue = validateNumber(e.target.value);
    if (rawValue) {
      // Format with commas for display
      const formattedValue = new Intl.NumberFormat('vi-VN').format(parseInt(rawValue));
      setNewEbook(prev => ({
        ...prev,
        Price: formattedValue
      }));
    } else {
      setNewEbook(prev => ({
        ...prev,
        Price: ''
      }));
    }
  };

  // Handle form submission to add ebook
  const addEbook = async (e) => {
    e.preventDefault();

    // Check for missing fields
    const missingFields = [];

    if (!newEbook.EbookName) missingFields.push("Tên Ebook");
    if (!newEbook.Description) missingFields.push("Mô tả");
    if (newEbook.Price === null || newEbook.Price === undefined)
      missingFields.push("Giá");
    if (!newEbook.image) missingFields.push("Hình ảnh");
    if (!newEbook.Pdf) missingFields.push("Tài liệu PDF");
    if (!newEbook.categoryId) missingFields.push("Danh mục"); // Check if category is selected
    if (!newEbook.Author) missingFields.push("Tác giả"); // Add this line

    // Ensure the user is logged in and UserId is available
    if (!UserId) {
      missingFields.push("Người dùng chưa đăng nhập hoặc thiếu UserId");
    }

    if (missingFields.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Thiếu trường thông tin",
        text: `Vui lòng điền đầy đủ các trường yêu cầu: ${missingFields.join(
          ", "
        )}`,
      });
      return;
    }

    // Log the price before appending
    console.log("Price before appending:", newEbook.Price);

    // Prepare FormData to send the file along with other fields
    const ebookData = new FormData();

    // Append form fields
    ebookData.append("ebookName", newEbook.EbookName);
    ebookData.append("description", newEbook.Description);

    // Ensure the price is correctly parsed
    const priceValue = newEbook.Price ? parseFloat(newEbook.Price.replace(/,/g, '')) : 0;
    console.log("Parsed price value:", priceValue);
    ebookData.append("price", priceValue);

    // Append the selected category
    ebookData.append("categoryId", newEbook.categoryId);

    // Append UserId as createById
    ebookData.append("createById", UserId); // Use UserId

    // Append the status, if required
    ebookData.append("status", newEbook.Status || 1);

    // Append author
    ebookData.append("author", newEbook.Author);

    // Append image if provided
    if (newEbook.image) {
      ebookData.append("image", newEbook.image);
    }

    // Append PDF file if provided
    if (newEbook.Pdf) {
      ebookData.append("document", newEbook.Pdf);
    }

    // Log the FormData being sent to the server
    console.log("FormData being sent to the API:", ebookData);

    try {
      // Show the loading progress alert without OK button
      let timerInterval;
      Swal.fire({
        title: 'Đang tải lên...',
        html: 'Đang xử lý tập tin PDF',
        timer: 0,
        timerProgressBar: true,
        showConfirmButton: false, // Remove OK button
        allowOutsideClick: false, // Prevent clicking outside
        didOpen: () => {
          Swal.showLoading();
        },
        willClose: () => {
          clearInterval(timerInterval);
        }
      });

      // Send request to the API
      const response = await axios.post(
        "https://rmrbdapi.somee.com/odata/UploadPDF",
        ebookData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Token: "123-abc",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            
            // Update the loading message with progress
            Swal.update({
              title: 'Đang tải lên...',
              html: `Đã tải lên ${percentCompleted}%`
            });
          }
        }
      );

      // Close the loading alert
      Swal.close();

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Ebook đã được thêm thành công.",
      });

      resetForm();
    } catch (error) {
      // Close the loading alert
      Swal.close();

      console.error(
        "Lỗi khi thêm Ebook:",
        error.response ? error.response.data : error.message
      );

      // Show error message
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.errors
          ? Object.values(error.response.data.errors).join(", ")
          : error.response.data.message || "Lỗi không xác định";

        Swal.fire({
          icon: "error",
          title: "Lỗi khi thêm Ebook",
          text: `Lỗi khi thêm Ebook: ${errorMessage}`,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi khi thêm Ebook",
          text: `Lỗi khi thêm Ebook: ${error.message}`,
        });
      }
    }
  };

  // Reset form after submission
  const resetForm = () => {
    // Revoke image URL if exists
    if (previewImages[0]?.url) {
      URL.revokeObjectURL(previewImages[0].url);
    }

    // Clear the state
    setNewEbook({
      EbookName: "",
      Description: "",
      Price: "",
      Status: 1,
      Pdf: null,
      image: null,
      categoryId: "",
      Author: "",
    });

    // Clear previews
    setPreviewImages([]);
    setPdfPreview(null);
  };

  return (
    <div className="min-h-screen py-8">
      <Container className="my-8 px-4 max-w-4xl mx-auto relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: "-100%" }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button
                onClick={() => navigate('/list-ebook-customer')}
                className="mr-4 text-orange-500 hover:text-orange-600 bg-transparent border border-orange-500 hover:border-orange-600 px-4 py-2 rounded-lg transition-colors"
              >
                ← Quay lại
              </Button>
              <h2 className="text-3xl font-semibold text-gray-800">Thêm sách điện tử</h2>
            </div>
          </div>

          <Form onSubmit={addEbook} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <Form.Control
                  type="text"
                  id="EbookName"
                  value={newEbook.EbookName}
                  onChange={(e) =>
                    setNewEbook({ ...newEbook, EbookName: e.target.value })
                  }
                  required
                  className="peer w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                            transition-all duration-200 outline-none
                            placeholder-transparent"
                  placeholder="Tên sách điện tử"
                />
                <Form.Label
                  htmlFor="EbookName"
                  className="absolute left-3 -top-2.5 text-gray-600 text-sm 
                            transition-all duration-200 
                            peer-placeholder-shown:text-base 
                            peer-placeholder-shown:text-gray-400
                            peer-placeholder-shown:top-3.5
                            peer-focus:-top-2.5 
                            peer-focus:text-sm
                            peer-focus:text-gray-600
                            bg-white px-2
                            pointer-events-none"
                >
                  Tên sách điện tử
                </Form.Label>
              </div>

              <div className="relative">
                <Form.Control
                  type="text"
                  id="Author"
                  value={newEbook.Author}
                  onChange={(e) =>
                    setNewEbook({ ...newEbook, Author: e.target.value })
                  }
                  required
                  className="peer w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                            transition-all duration-200 outline-none
                            placeholder-transparent"
                  placeholder="Tác giả"
                />
                <Form.Label
                  htmlFor="Author"
                  className="absolute left-3 -top-2.5 text-gray-600 text-sm 
                            transition-all duration-200 
                            peer-placeholder-shown:text-base 
                            peer-placeholder-shown:text-gray-400
                            peer-placeholder-shown:top-3.5
                            peer-focus:-top-2.5 
                            peer-focus:text-sm
                            peer-focus:text-gray-600
                            bg-white px-2
                            pointer-events-none"
                >
                  Tác giả
                </Form.Label>
              </div>
            </div>

            <div className="relative">
              <Form.Control
                as="textarea"
                id="Description"
                value={newEbook.Description}
                onChange={(e) =>
                  setNewEbook({ ...newEbook, Description: e.target.value })
                }
                required
                className="peer w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                          transition-all duration-200 outline-none
                          placeholder-transparent"
                placeholder="Mô tả"
              />
              <Form.Label
                htmlFor="Description"
                className="absolute left-3 -top-2.5 text-gray-600 text-sm 
                          transition-all duration-200 
                          peer-placeholder-shown:text-base 
                          peer-placeholder-shown:text-gray-400
                          peer-placeholder-shown:top-3.5
                          peer-focus:-top-2.5 
                          peer-focus:text-sm
                          peer-focus:text-gray-600
                          bg-white px-2
                          pointer-events-none"
              >
                Mô tả
              </Form.Label>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <Form.Control
                  type="text"
                  id="Price"
                  value={newEbook.Price}
                  onChange={handlePriceChange}
                  required
                  className="peer w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                            transition-all duration-200 outline-none
                            placeholder-transparent"
                  placeholder="Giá"
                />
                <Form.Label
                  htmlFor="Price"
                  className="absolute left-3 -top-2.5 text-gray-600 text-sm 
                            transition-all duration-200 
                            peer-placeholder-shown:text-base 
                            peer-placeholder-shown:text-gray-400
                            peer-placeholder-shown:top-3.5
                            peer-focus:-top-2.5 
                            peer-focus:text-sm
                            peer-focus:text-gray-600
                            bg-white px-2
                            pointer-events-none"
                >
                  Giá
                </Form.Label>
              </div>

              <div className="relative">
                <Form.Select
                  id="categoryId"
                  name="categoryId"
                  value={newEbook.categoryId || ''}
                  onChange={(e) => setNewEbook(prev => ({
                    ...prev,
                    categoryId: e.target.value
                  }))}
                  required
                  className="peer w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                            transition-all duration-200 outline-none
                            appearance-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option 
                      key={category.categoryId} 
                      value={category.categoryId}
                      className="py-2 px-4 hover:bg-blue-50"
                    >
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label
                  className="absolute left-3 -top-2.5 text-gray-600 text-sm 
                            bg-white px-2"
                >
                  Danh mục
                </Form.Label>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative">
              <Form.Group controlId="image" className="mb-4">
                <Form.Label className="block text-lg mb-2">Ảnh bìa</Form.Label>
                <div
                  {...getRootProps()}
                  className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg 
                    hover:border-blue-500 transition-colors duration-200
                    cursor-pointer"
                >
                  <input {...getInputProps()} />
                  <div className="text-center">
                    <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-2" />
                    <p className="text-gray-600">Kéo thả ảnh vào đây hoặc click để chọn ảnh</p>
                    <p className="text-gray-400 text-sm mt-1">
                      (Chỉ chấp nhận ảnh JPG, PNG, GIF, tối đa 5MB)
                    </p>
                  </div>
                </div>
              </Form.Group>

              {/* Preview Section */}
              {previewImages.length > 0 && (
                <motion.div 
                  className="mt-4"
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="relative w-full max-w-[200px] mx-auto">
                    <motion.div
                      layout
                      className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <img
                        src={previewImages[0].url}
                        alt="Book cover preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 
                            transition-opacity duration-200">
                        <div className="absolute bottom-2 left-2 right-2 text-white text-sm truncate px-2">
                          {previewImages[0].name}
                        </div>
                      </div>
                    </motion.div>
                    <motion.button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-6 h-6 
                       bg-red-500 hover:bg-red-600
                       text-white text-sm font-bold
                       rounded-full flex items-center justify-center
                       shadow-lg transform hover:scale-110
                       transition-all duration-200
                       cursor-pointer
                       z-50"
                      aria-label="Remove image"
                    >
                      ×
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="relative">
              <Form.Group controlId="Pdf" className="mb-4">
                <Form.Label className="block text-lg mb-2">Sách điện tử (PDF)</Form.Label>
                <div
                  onClick={() => document.getElementById("Pdf").click()}
                  className="cursor-pointer w-full p-8 border-2 border-dashed border-gray-300 rounded-lg 
                    hover:border-blue-500 transition-colors duration-200"
                >
                  <input
                    type="file"
                    name="Pdf"
                    id="Pdf"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="hidden"
                    required
                  />
                  <div className="text-center">
                    <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-2" />
                    <p className="text-gray-600">Kéo thả PDF vào đây hoặc click để chọn file</p>
                    <p className="text-gray-400 text-sm mt-1">
                      (Chỉ chấp nhận file PDF, tối đa 50MB)
                    </p>
                  </div>
                </div>

                {/* PDF Preview */}
                {pdfPreview && (
                  <motion.div 
                    className="mt-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative bg-gray-50 rounded-lg p-4 pr-12 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <svg 
                          className="w-8 h-8 text-red-500" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-6H9V7h2v3z"/>
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {pdfPreview.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {pdfPreview.size} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewEbook(prev => ({ ...prev, Pdf: null }));
                          setPdfPreview(null);
                        }}
                        className="absolute top-1/2 -translate-y-1/2 right-2 w-6 h-6 
                                 bg-red-500 hover:bg-red-600
                                 text-white text-sm font-bold
                                 rounded-full flex items-center justify-center
                                 shadow-lg transform hover:scale-110
                                 transition-all duration-200
                                 cursor-pointer"
                        aria-label="Remove PDF"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                )}
              </Form.Group>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold 
                          px-6 py-2 rounded-lg transition-all duration-200 
                          transform hover:-translate-y-0.5"
              >
                Thêm sách điện tử
              </Button>
            </div>
          </Form>
        </motion.div>
      </Container>
    </div>
  );
};

export default EbookCustomer;