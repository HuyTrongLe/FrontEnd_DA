import React, { useState, useEffect } from 'react';
import AdminLayout from '../shared/AdminLayout';
import { FaPlus, FaEdit, FaBook, FaUtensils } from 'react-icons/fa';
import Switch from 'react-switch';
import axios from 'axios';
import Swal from 'sweetalert2';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ Name: '', Status: 1 });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [activeTab, setActiveTab] = useState('books'); // 'books' or 'recipes'
  const [recipeTags, setRecipeTags] = useState([]);
  const [newRecipeTag, setNewRecipeTag] = useState({ tagName: '', status: 1 });
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState('');

  useEffect(() => {
    if (activeTab === 'books') {
      fetchCategories();
    } else {
      fetchRecipeTags();
    }
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('https://rmrbdapi.somee.com/odata/BookCategory', {
        headers: {
          'Content-Type': 'application/json',
          'Token': '123-abc',
        }
      });
      setCategories(response.data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setIsLoading(false);
    }
  };

  const addCategory = async () => {
    try {
      await axios.post('https://rmrbdapi.somee.com/odata/BookCategory', newCategory, {
        headers: {
          'Content-Type': 'application/json',
          'Token': '123-abc',
        },
      });
      
      // Reset form
      setNewCategory({ Name: '', Status: 1 });
      
      // Fetch fresh data
      await fetchCategories();

      // Show success message
      Swal.fire({
        title: 'Thành công!',
        text: 'Danh mục mới đã được thêm thành công',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error adding category:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Không thể thêm danh mục mới',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const updateCategory = async (id, updatedCategoryData) => {
    try {
      // For status changes (activate/deactivate)
      if (updatedCategoryData.Status === 0 || updatedCategoryData.Status === 1) {
        const result = await Swal.fire({
          title: `Bạn có chắc chắn?`,
          text: `Bạn có muốn ${updatedCategoryData.Status === 1 ? 'kích hoạt' : 'vô hiệu hóa'} danh mục này?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Có',
          cancelButtonText: 'Không'
        });

        if (!result.isConfirmed) {
          return;
        }
      } 
      // For name edits
      else {
        const result = await Swal.fire({
          title: 'Lưu thay đổi?',
          text: `Cập nhật tên danh mục thành "${editingCategoryName}"?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Lưu',
          cancelButtonText: 'Hủy'
        });

        if (!result.isConfirmed) {
          setEditingCategoryId(null);
          setEditingCategoryName('');
          return;
        }
      }

      const response = await axios.put(`https://rmrbdapi.somee.com/odata/BookCategory/${id}`, 
        {
          ...updatedCategoryData,
          Name: updatedCategoryData.name || updatedCategoryData.Name,
          Status: updatedCategoryData.Status
        }, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': '123-abc',
          },
        }
      );

      setCategories(prev => prev.map(cat => 
        cat.categoryId === id 
          ? {
              ...cat,
              status: updatedCategoryData.Status,
              name: updatedCategoryData.Name || cat.name
            }
          : cat
      ));
      
      setEditingCategoryId(null);
      setEditingCategoryName('');

      // Success messages
      if (updatedCategoryData.Status === 0 || updatedCategoryData.Status === 1) {
        // For activate/deactivate
        Swal.fire({
          title: 'Thành công!',
          text: `Danh mục ${updatedCategoryData.Status === 1 ? 'kích hoạt' : 'vô hiệu hóa'} thành công`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        // For name edits
        Swal.fire({
          title: 'Thành công!',
          text: 'Tên danh mục đã được cập nhật thành công',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error updating category:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Không thể cập nhật danh mục',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const startEditing = (categoryId, categoryName) => {
    setEditingCategoryId(categoryId);
    setEditingCategoryName(categoryName);
  };

  // Add confirmation for canceling edit
  const cancelEdit = () => {
    Swal.fire({
      title: 'Hủy chỉnh sửa?',
      text: 'Thay đổi của bạn sẽ không được lưu',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có, hủy',
      cancelButtonText: 'Tiếp tục chỉnh sửa'
    }).then((result) => {
      if (result.isConfirmed) {
        setEditingCategoryId(null);
        setEditingCategoryName('');
      }
    });
  };

  const handleStatusChange = async (checked, categoryId, category) => {
    const newStatus = checked ? 1 : 0;
    await updateCategory(categoryId, { ...category, Status: newStatus });
  };

  const fetchRecipeTags = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('https://rmrbdapi.somee.com/odata/tag', {
        headers: {
          'Content-Type': 'application/json',
          'Token': '123-abc',
        }
      });
      setRecipeTags(response.data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching recipe tags:', error);
      setIsLoading(false);
    }
  };

  const addRecipeTag = async () => {
    try {
      await axios.post('https://rmrbdapi.somee.com/odata/tag', newRecipeTag, {
        headers: {
          'Content-Type': 'application/json',
          'Token': '123-abc',
        },
      });
      
      // Reset form
      setNewRecipeTag({ tagName: '', status: 1 });
      
      // Fetch fresh data
      await fetchRecipeTags();

      // Show success message
      Swal.fire({
        title: 'Thành công!',
        text: 'Thẻ mới đã được thêm thành công',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error adding recipe tag:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Không thể thêm thẻ mới',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const updateRecipeTag = async (id, updatedTagData) => {
    try {
      if (updatedTagData.status === 0 || updatedTagData.status === 1) {
        const result = await Swal.fire({
          title: `Bạn có chắc chắn?`,
          text: `Bạn có muốn ${updatedTagData.status === 1 ? 'kích hoạt' : 'vô hiệu hóa'} thẻ này?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Có',
          cancelButtonText: 'Không'
        });

        if (!result.isConfirmed) {
          return;
        }
      } else {
        const result = await Swal.fire({
          title: 'Lưu thay đổi?',
          text: `Cập nhật tên thẻ thành "${editingTagName}"?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Lưu',
          cancelButtonText: 'Hủy'
        });

        if (!result.isConfirmed) {
          setEditingTagId(null);
          setEditingTagName('');
          return;
        }
      }

      const response = await axios.put(`https://rmrbdapi.somee.com/odata/tag/${id}`, 
        {
          ...updatedTagData,
          tagName: updatedTagData.tagName || updatedTagData.TagName,
          status: updatedTagData.status
        }, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': '123-abc',
          },
        }
      );

      setRecipeTags(prev => prev.map(tag => 
        tag.tagId === id 
          ? {
              ...tag,
              status: updatedTagData.status,
              tagName: updatedTagData.tagName || tag.tagName
            }
          : tag
      ));
      
      setEditingTagId(null);
      setEditingTagName('');
    } catch (error) {
      console.error('Error updating recipe tag:', error);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Quản Lý Danh Mục">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quản Lý Danh Mục">
      <div className="space-y-6 p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            className={`py-2 px-4 ${activeTab === 'books' 
              ? 'border-b-2 border-orange-500 text-orange-500' 
              : 'text-gray-500 hover:text-orange-500'}`}
            onClick={() => setActiveTab('books')}
          >
            <FaBook className="inline mr-2" /> Danh Mục Sách & Ebook
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'recipes' 
              ? 'border-b-2 border-orange-500 text-orange-500' 
              : 'text-gray-500 hover:text-orange-500'}`}
            onClick={() => setActiveTab('recipes')}
          >
            <FaUtensils className="inline mr-2" /> Thẻ Món Ăn
          </button>
        </div>

        {activeTab === 'books' ? (
          // Existing book categories content
          <>
            {/* Add Category Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Thêm Danh Mục Mới</h2>
              <form onSubmit={(e) => { e.preventDefault(); addCategory(); }} className="space-y-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Tên Danh Mục"
                    value={newCategory.Name}
                    onChange={(e) => setNewCategory({ ...newCategory, Name: e.target.value })}
                    className="flex-1 rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                  <select
                    value={newCategory.Status}
                    onChange={(e) => setNewCategory({ ...newCategory, Status: parseInt(e.target.value) })}
                    className="rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:ring-orange-500"
                  >
                    <option value={1}>Kích Hoạt</option>
                    <option value={0}>Vô Hiệu Hóa</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"
                >
                  <FaPlus /> Thêm Danh Mục
                </button>
              </form>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Quản Lý Danh Mục</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Danh Mục</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.length > 0 ? categories.map((category) => (
                        <tr key={category.categoryId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.categoryId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {editingCategoryId === category.categoryId ? (
                              <input
                                type="text"
                                value={editingCategoryName}
                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                className="rounded-md border border-gray-300 p-1 w-full focus:border-orange-500 focus:ring-orange-500"
                              />
                            ) : (
                              category.name
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`px-2 py-1 rounded-full text-xs ${category.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {category.status === 1 ? 'Kích Hoạt' : 'Vô Hiệu Hóa'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {editingCategoryId === category.categoryId ? (
                              <div className="space-x-2">
                                <button 
                                  onClick={() => updateCategory(category.categoryId, { ...category, Name: editingCategoryName })}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Lưu
                                </button>
                                <button 
                                  onClick={cancelEdit}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-4">
                                <button 
                                  onClick={() => startEditing(category.categoryId, category.name)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <FaEdit className="inline mr-1" /> Chỉnh Sửa
                                </button>
                                <Switch
                                  checked={category.status === 1}
                                  onChange={(checked) => handleStatusChange(checked, category.categoryId, category)}
                                  onColor="#86d3ff"
                                  onHandleColor="#2693e6"
                                  handleDiameter={24}
                                  uncheckedIcon={false}
                                  checkedIcon={false}
                                  boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                  activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                  height={20}
                                  width={48}
                                  className="react-switch"
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr key="no-categories">
                          <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Không có danh mục nào</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Recipe tags content
          <>
            {/* Add Recipe Tag Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Thêm Thẻ Mới</h2>
              <form onSubmit={(e) => { e.preventDefault(); addRecipeTag(); }} className="space-y-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Tên Thẻ"
                    value={newRecipeTag.tagName}
                    onChange={(e) => setNewRecipeTag({ ...newRecipeTag, tagName: e.target.value })}
                    className="flex-1 rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                  <select
                    value={newRecipeTag.status}
                    onChange={(e) => setNewRecipeTag({ ...newRecipeTag, status: parseInt(e.target.value) })}
                    className="rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:ring-orange-500"
                  >
                    <option value={1}>Kích Hoạt</option>
                    <option value={0}>Vô Hiệu Hóa</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"
                >
                  <FaPlus /> Thêm Thẻ
                </button>
              </form>
            </div>

            {/* Recipe Tags Table */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Quản Lý Thẻ Món Ăn</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Thẻ</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recipeTags.length > 0 ? recipeTags.map((tag) => (
                        <tr key={tag.tagId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tag.tagId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {editingTagId === tag.tagId ? (
                              <input
                                type="text"
                                value={editingTagName}
                                onChange={(e) => setEditingTagName(e.target.value)}
                                className="rounded-md border border-gray-300 p-1 w-full focus:border-orange-500 focus:ring-orange-500"
                              />
                            ) : (
                              tag.tagName
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`px-2 py-1 rounded-full text-xs ${tag.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {tag.status === 1 ? 'Kích Hoạt' : 'Vô Hiệu Hóa'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {editingTagId === tag.tagId ? (
                              <div className="space-x-2">
                                <button 
                                  onClick={() => updateRecipeTag(tag.tagId, { ...tag, tagName: editingTagName })}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Lưu
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingTagId(null);
                                    setEditingTagName('');
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-4">
                                <button 
                                  onClick={() => {
                                    setEditingTagId(tag.tagId);
                                    setEditingTagName(tag.tagName);
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <FaEdit className="inline mr-1" /> Chỉnh Sửa
                                </button>
                                <Switch
                                  checked={tag.status === 1}
                                  onChange={(checked) => updateRecipeTag(tag.tagId, { ...tag, status: checked ? 1 : 0 })}
                                  onColor="#86d3ff"
                                  onHandleColor="#2693e6"
                                  handleDiameter={24}
                                  uncheckedIcon={false}
                                  checkedIcon={false}
                                  boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                  activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                  height={20}
                                  width={48}
                                  className="react-switch"
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr key="no-tags">
                          <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Không có thẻ nào</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default CategoryManagement;