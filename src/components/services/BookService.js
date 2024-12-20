import axios from "axios";

const API_URL = "https://rmrbdapi.somee.com/odata"; // Cấu hình URL API tổng quát
const TOKEN = "123-abc";

// Tạo instance của axios để dễ dàng thêm header cho tất cả các request
const apiInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Token: TOKEN, // Thêm header Token
  },
});

// API lấy danh sách sách
export const getBooks = async () => {
  try {
    const response = await axios.get(
      `https://rmrbdapi.somee.com/odata/Book?$filter=status eq 1`,
      {
        headers: {
          token: "123-abc",
          mode: "no-cors",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

// API lấy chi tiết sách theo bookId
export const getBookById = async (bookId) => {
  try {
    // Gọi API với URL mới `/Book/{bookId}`
    const response = await apiInstance.get(`/Book/${bookId}`);
    return response.data; // Trả về dữ liệu sách
  } catch (error) {
    console.error(`Error fetching book with ID ${bookId}:`, error);
    throw error;
  }
};

// Lấy ảnh đầu tiên theo BookId với `$top=1`
export const getImagesByBookId = async (bookId) => {
  try {
    const response = await axios.get(
      "https://rmrbdapi.somee.com/odata/Image?$filter=BookId eq " +
        bookId +
        "&$top=1",
      {
        headers: {
          token: "123-abc",
        },
      }
    );

    // Kiểm tra nếu `response.data` tồn tại và có phần tử
    if (response.data && response.data.length > 0) {
      return response.data[0].imageUrl.Value; // Trả về URL của ảnh đầu tiên
    } else {
      console.warn(`No images found for book ID ${bookId}`);
      return "https://via.placeholder.com/150"; // Trả về URL mặc định nếu không có ảnh
    }
  } catch (error) {
    console.error(`Error fetching images for book ID ${bookId}:`, error);
    return "https://via.placeholder.com/150"; // Trả về URL mặc định nếu có lỗi xảy ra
  }
};

export const getFirstImageByBookId = async (bookId) => {
  try {
    const response = await axios.get(
      `https://rmrbdapi.somee.com/odata/Image?$filter=BookId eq ${bookId}&$top=1&$Select=ImageUrl`,
      {
        headers: {
          token: "123-abc",
          mode: "no-cors",
        },
      }
    );

    return response.data[0].ImageUrl;
  } catch (error) {
    console.error(`Error fetching image for book ID ${bookId}:`, error);
    throw error;
  }
};

// API tạo sách mới
export const createBook = async (bookData) => {
  try {
    const response = await apiInstance.post("/Book", bookData);
    return response.data;
  } catch (error) {
    console.error("Error creating book:", error);
    throw error;
  }
};

// API cập nhật sách theo bookId
export const updateBook = async (bookId, bookData) => {
  try {
    const response = await apiInstance.put(`/Book/${bookId}`, bookData);
    return response.data;
  } catch (error) {
    console.error(`Error updating book with ID ${bookId}:`, error);
    throw error;
  }
};

// API xóa sách theo bookId
export const deleteBook = async (bookId) => {
  try {
    await apiInstance.delete(`/Book/${bookId}`);
  } catch (error) {
    console.error(`Error deleting book with ID ${bookId}:`, error);
    throw error;
  }
};
// Lấy sách theo categoryId
export const getBooksByCategory = async (categoryId) => {
  try {
    const response = await axios.get(
      `${API_URL}/Book?$filter=categoryId eq ${categoryId} and status eq 1`,
      {
        headers: { token: TOKEN },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching books for category ${categoryId}:`, error);
    throw error;
  }
};
// Add this new function to update book stock
export const updateBookStock = async (bookId, quantity) => {
  try {
    // First get the current book data
    const book = await getBookById(bookId);

    // Calculate new stock quantity
    const newStock = Math.max(0, book.unitInStock - quantity);

    // Update the book with new stock quantity
    const response = await apiInstance.put(`/Book/${bookId}`, {
      ...book,
      unitInStock: newStock,
    });

    return response.data;
  } catch (error) {
    console.error(`Error updating stock for book ID ${bookId}:`, error);
    throw error;
  }
};

// API lấy tất cả ảnh theo BookId
export const getAllImagesByBookId = async (bookId) => {
  try {
    const response = await axios.get(
      `${API_URL}/Image?$filter=BookId eq ${bookId} and status eq 1`,
      {
        headers: {
          token: TOKEN,
        },
      }
    );

    if (response.data && response.data.length > 0) {
      return response.data.map(image => image.imageUrl.Value || image.imageUrl);
    }
    return ['https://via.placeholder.com/150'];
  } catch (error) {
    console.error(`Error fetching images for book ID ${bookId}:`, error);
    return ['https://via.placeholder.com/150'];
  }
};
