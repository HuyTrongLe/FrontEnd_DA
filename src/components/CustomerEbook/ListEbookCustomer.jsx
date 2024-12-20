import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Sidebar from '../Customer/Sidebar';
import {FaCheckCircle,FaBan,FaRegClock} from 'react-icons/fa'
import { decryptData } from "../Encrypt/encryptionUtils";
const EditEbookCustomer = () => {
  const navigate = useNavigate();

  const [ebooks, setEbooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [newEbook, setNewEbook] = useState({
    ebookName: '',
    description: '',
    price: 0,
    pdf: null,
    image: [],
    categoryId: '',
    createById: '',
    censorId: '',
    pdfurl: '',
    author: ''
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEbookId, setSelectedEbookId] = useState(null);
  const currentUserId = parseInt(decryptData(Cookies.get("UserId"))) || null;
  console.log('Current User ID:', currentUserId);

  useEffect(() => {
    fetchEbooks();
    fetchCategories();
    fetchUsers();
  }, []);

  const fetchEbooks = async () => {
    try {
      const response = await axios.get('https://rmrbdapi.somee.com/odata/ebook', {
        headers: { 'Token': '123-abc' },
      });

      const filteredEbooks = Array.isArray(response.data)
        ? response.data.filter(ebook => parseInt(ebook.createById) === currentUserId)
        : [];

      setEbooks(filteredEbooks);
    } catch (error) {
      console.error('Error fetching ebooks:', error.response ? error.response.data : error.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://rmrbdapi.somee.com/odata/BookCategory', {
        headers: { 'Token': '123-abc' },
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://rmrbdapi.somee.com/odata/Account', {
        headers: { 'Token': '123-abc' },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const formatPrice = (price) => {
    return price === '' ? '' : new Intl.NumberFormat().format(price);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setNewEbook((prev) => ({
      ...prev,
      price: value ? parseInt(value, 10) : 0,
    }));
  };

  const addEbook = async (e) => {
    e.preventDefault();
    try {
      const ebookData = new FormData();
      ebookData.append('EbookName', newEbook.ebookName);
      ebookData.append('Description', newEbook.description);
      ebookData.append('Price', parseInt(newEbook.price, 10));
      ebookData.append('Status', newEbook.status);
      ebookData.append('categoryId', parseInt(newEbook.categoryId, 10));
      ebookData.append('CreateById', currentUserId);
      ebookData.append('CensorId', newEbook.censorId);
      ebookData.append('Author', newEbook.author);

      if (newEbook.image[0]) {
        ebookData.append('image', newEbook.image[0]);
      }

      if (newEbook.pdf) {
        ebookData.append('document', newEbook.pdf);
      }

      const response = await axios.post('https://rmrbdapi.somee.com/odata/UploadPDF', ebookData, {
        headers: { 'Token': '123-abc' },
      });

      setEbooks((prev) => [...prev, { ...response.data, pdfUrl: response.data.pdfUrl }]);
      resetForm();
    } catch (error) {
      console.error('Error adding ebook:', error);
    }
  };

  const editEbook = async (e) => {
    e.preventDefault();
    try {
      // Initialize with existing URLs from the current ebook state
      let updatedImageUrl = newEbook.image[0];
      let updatedPdfUrl = newEbook.pdf ? null : newEbook.pdfurl;

      // Check if image is a File object (new upload) or a URL string (existing image)
      if (newEbook.image[0] instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append('image', newEbook.image[0]);

        const imageResponse = await axios.post(
          'https://rmrbdapi.somee.com/odata/UploadImage',
          imageFormData,
          {
            headers: {
              'Token': '123-abc',
              'Content-Type': 'multipart/form-data'
            },
          }
        );
        updatedImageUrl = imageResponse.data.imageUrl;
      }

      // Only upload new PDF if it exists and is a File object
      if (newEbook.pdf instanceof File) {
        const pdfFormData = new FormData();
        pdfFormData.append('document', newEbook.pdf);

        const pdfResponse = await axios.post(
          'https://rmrbdapi.somee.com/odata/UploadPDF',
          pdfFormData,
          {
            headers: {
              'Token': '123-abc',
              'Content-Type': 'multipart/form-data'
            },
          }
        );
        updatedPdfUrl = pdfResponse.data.pdfUrl;
      }

      // Prepare the final update data
      const ebookData = {
        ebookId: selectedEbookId,
        ebookName: newEbook.ebookName,
        description: newEbook.description,
        price: parseInt(newEbook.price, 10),
        categoryId: parseInt(newEbook.categoryId, 10),
        createById: newEbook.createById,
        status: newEbook.status,
        imageUrl: updatedImageUrl,
        pdfUrl: updatedPdfUrl,
        author: newEbook.author
      };

      console.log('Sending update data:', ebookData);

      const response = await axios.put(
        `https://rmrbdapi.somee.com/odata/ebook/${selectedEbookId}`,
        ebookData,
        {
          headers: {
            'Token': '123-abc',
            'Content-Type': 'application/json',
          },
        }
      );

      // Update local state
      setEbooks((prev) =>
        prev.map((ebook) =>
          ebook.ebookId === selectedEbookId
            ? {
              ...ebook,
              ebookName: newEbook.ebookName,
              description: newEbook.description,
              price: parseInt(newEbook.price, 10),
              categoryId: parseInt(newEbook.categoryId, 10),
              status: newEbook.status,
              imageUrl: updatedImageUrl,
              pdfUrl: updatedPdfUrl,
              author: newEbook.author
            }
            : ebook
        )
      );

      Swal.fire({
        title: 'Thành công!',
        text: 'Cập nhật ebook thành công!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      resetForm();
    } catch (error) {
      console.error("Error updating ebook:", error);
      const errorMessage = error.response?.data || error.message;
      Swal.fire({
        title: 'Lỗi!',
        text: `Lỗi cập nhật ebook: ${errorMessage}`,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleEditButtonClick = (ebook) => {
    setEditMode(true);
    setSelectedEbookId(ebook.ebookId);
    setNewEbook({
      ebookName: ebook.ebookName,
      description: ebook.description,
      price: ebook.price,
      status: ebook.status,
      pdf: null,
      image: [ebook.imageUrl],
      categoryId: ebook.categoryId,
      createById: ebook.createById,
      censorId: ebook.censorId,
      pdfurl: ebook.pdfurl || ebook.pdfUrl,
      author: ebook.author || ''
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setNewEbook({
      ebookName: '',
      description: '',
      price: '',
      pdf: null,
      image: [],
      categoryId: '',
      createById: currentUserId,
      censorId: '',
      pdfurl: '',
      author: ''
    });
    setModalOpen(false);
    setEditMode(false);
    setSelectedEbookId(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewEbook((prev) => ({ ...prev, image: [file] }));
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewEbook((prev) => ({ ...prev, pdf: file }));
    }
  };

  const getCreatorName = (createById) => {
    const creatorId = Number(createById);
    const user = users.find(user => Number(user.accountId) === creatorId);
    return user ? user.userName : 'Unknown';
  };

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h1>
          <p className="text-gray-600">You need to be logged in to view your ebooks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-start p-4 space-y-8 md:space-y-0 md:space-x-8">
      <Sidebar />
      <section className="flex flex-col">
        <main className="section-center w-[1140px] bg-white p-4 rounded-lg shadow-md flex flex-col">
          {/* Header Section */}
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Ebook</h1>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/add-ebook-customer')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Thêm Ebook Mới
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình Ảnh</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Ebook</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Thể Loại</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PDF</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tác giả</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ebooks.length > 0 ? (
                    ebooks.map((ebook) => {
                      const category = categories.find((cat) => cat.categoryId === ebook.categoryId);
                      return (
                        <tr key={ebook.ebookId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {ebook.imageUrl ? (
                              <img
                                src={ebook.imageUrl}
                                alt={ebook.ebookName}
                                className="w-16 h-16 rounded-lg object-cover shadow-sm"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400">No image</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{ebook.ebookName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {ebook.price === 0 ? (
                                <span className="text-green-600">Free</span>
                              ) : (
                                formatPrice(ebook.price)
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 max-w-[200px] truncate">
                              {category ? category.name : 'No Category'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {ebook.status === 0 ? (
                              <FaBan style={{ color: "red", fontSize: "24px" }} title="Bị khóa" />
                            ) : ebook.status === -1 ? (
                              <FaRegClock
                                style={{ color: "orange", fontSize: "24px" }}
                                title="Chờ được xác nhận"
                              />
                            ) : ebook.status === 1 ? (
                              <FaCheckCircle
                                style={{ color: "green", fontSize: "24px" }}
                                title="Đã xác nhận"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">
                                {ebook.status}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {ebook.pdfurl ? (
                              <a
                                href={ebook.pdfurl.startsWith('http') ? ebook.pdfurl : `https://rmrbdapi.somee.com${ebook.pdfurl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                              >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0015.414 4L13 1.586A2 2 0 0011.586 1H9a2 2 0 00-2 2z" />
                                </svg>
                                Xem PDF
                              </a>
                            ) : (
                              <span className="text-red-500 text-sm">Not available</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {ebook.author || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>{
                                if (ebook.status === 1) {
                                  Swal.fire({
                                    text: "Trạng thái của sách đã được xác nhận. Bạn không thể sửa!!!",
                                    icon: "warning",
                                    showCancelButton: false,
                                    confirmButtonColor: "#3085d6",
                                    confirmButtonText: "Tôi biết rồi",
                                  });
                                }else{
                                  handleEditButtonClick(ebook);
                                }
                              }}
                              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Chỉnh sửa
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Không có sách điện tử nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal */}
          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
                {/* Close button */}
                <button
                  onClick={resetForm}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editMode ? 'Chỉnh Sửa Ebook' : 'Thêm Ebook Mới'}
                  </h3>
                </div>

                <form onSubmit={editMode ? editEbook : addEbook} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên Sách Điện Tử
                      </label>
                      <input
                        type="text"
                        value={newEbook.ebookName}
                        onChange={(e) => setNewEbook({ ...newEbook, ebookName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả
                      </label>
                      <textarea
                        value={newEbook.description}
                        onChange={(e) => setNewEbook({ ...newEbook, description: e.target.value })}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giá
                        </label>
                        <input
                          type="text"
                          value={formatPrice(newEbook.price)}
                          onChange={handlePriceChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thể loại
                        </label>
                        <select
                          value={newEbook.categoryId}
                          onChange={(e) => setNewEbook({ ...newEbook, categoryId: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category.categoryId} value={category.categoryId}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tác giả
                      </label>
                      <input
                        type="text"
                        value={newEbook.author}
                        onChange={(e) => setNewEbook({ ...newEbook, author: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        {editMode ? 'Cập Nhật Sách' : 'Add Ebook'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </section>
    </div>
  );
};

export default EditEbookCustomer;
