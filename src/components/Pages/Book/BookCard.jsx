import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarOutline } from "@fortawesome/free-regular-svg-icons";
import { useNavigate } from "react-router-dom";
import "../../../assets/styles/Components/BookCard.css";
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import { useCart } from '../../Cart/components/CartContext';
import { decryptData } from "../../Encrypt/encryptionUtils";
function BookCard({ book }) {
  const navigate = useNavigate();
  const maxStars = 5;
  const filledStars = Math.round(book.bookRate || 0);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const { updateCartItems } = useCart();

  useEffect(() => {
    checkIfBookInCart();
  }, []);

  const checkIfBookInCart = async () => {
    try {
      const customerId = decryptData(Cookies.get("UserId"));
      if (!customerId) return;

      const existingOrderResponse = await fetch(`https://rmrbdapi.somee.com/odata/BookOrder`, {
        headers: {
          'Token': '123-abc',
          'Content-Type': 'application/json',
        },
      });

      if (!existingOrderResponse.ok) return;

      const allOrdersData = await existingOrderResponse.json();

      // Filter orders for current customer and cart status
      const cartOrders = allOrdersData.filter(order =>
        order.customerId === parseInt(customerId) &&
        order.orderCode === null
      );

      if (cartOrders.length > 0) {
        const orderIdToUse = cartOrders[0].orderId;

        // Check if book is in order
        const orderDetailResponse = await fetch(
          `https://rmrbdapi.somee.com/odata/BookOrderDetail?$filter=orderId eq ${orderIdToUse} and bookId eq ${book.bookId}`,
          {
            headers: {
              'Token': '123-abc',
              'Content-Type': 'application/json',
            },
          }
        );

        if (!orderDetailResponse.ok) return;

        const orderDetailData = await orderDetailResponse.json();

        // If book exists in cart, set isAddedToCart to true
        setIsAddedToCart(orderDetailData.length > 0);
      }
    } catch (error) {
      console.error('Error checking cart status:', error);
    }
  };

  const handleAddToCart = async () => {
    try {
      const customerId = decryptData(Cookies.get("UserId"));
      if (!customerId) {
        Swal.fire({
          icon: 'error',
          title: 'Vui lòng đăng nhập để thêm vào giỏ hàng!',
          showConfirmButton: false,
          timer: 1500
        });
        return;
      }

      // Fetch all orders for the customer that are in cart status (orderCode is null)
      const existingOrderResponse = await fetch(`https://rmrbdapi.somee.com/odata/BookOrder`, {
        method: 'GET',
        headers: {
          'Token': '123-abc',
          'Content-Type': 'application/json',
        },
      });

      if (!existingOrderResponse.ok) {
        throw new Error('Failed to fetch existing orders');
      }

      const allOrdersData = await existingOrderResponse.json();

      // Filter orders for current customer and cart status (orderCode is null)
      const cartOrders = allOrdersData.filter(order =>
        order.customerId === parseInt(customerId) &&
        order.orderCode === null
      );

      let orderIdToUse = cartOrders.length > 0 ? cartOrders[0].orderId : null;

      if (orderIdToUse) {
        // Check if book is already in order
        const orderDetailResponse = await fetch(`https://rmrbdapi.somee.com/odata/BookOrderDetail?$filter=orderId eq ${orderIdToUse} and bookId eq ${book.bookId}`, {
          method: 'GET',
          headers: {
            'Token': '123-abc',
            'Content-Type': 'application/json',
          },
        });

        if (!orderDetailResponse.ok) {
          throw new Error('Failed to check order details');
        }

        const orderDetailData = await orderDetailResponse.json();

        if (orderDetailData.length === 0) {
          // Add book to existing order
          const addBookResponse = await fetch('https://rmrbdapi.somee.com/odata/BookOrderDetail', {
            method: 'POST',
            headers: {
              'Token': '123-abc',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: orderIdToUse,
              bookId: book.bookId,
              quantity: 1,
              price: book.price,
              totalPrice: book.price // Add totalPrice field
            }),
          });

          if (!addBookResponse.ok) {
            throw new Error('Failed to add book to order details');
          }

          // Fetch updated cart items
          const updatedOrderDetailsResponse = await fetch(`https://rmrbdapi.somee.com/odata/BookOrderDetail?$filter=orderId eq ${orderIdToUse}`, {
            headers: {
              'Token': '123-abc',
              'Content-Type': 'application/json',
            },
          });

          if (updatedOrderDetailsResponse.ok) {
            const updatedCartItems = await updatedOrderDetailsResponse.json();
            updateCartItems(updatedCartItems); // Update the global cart state
          }
        }
      } else {
        // Create new order
        const newOrderResponse = await fetch('https://rmrbdapi.somee.com/odata/BookOrder', {
          method: 'POST',
          headers: {
            'Token': '123-abc',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: parseInt(customerId),
            totalPrice: book.price,
            shipFee: 0,
            price: book.price,
            status: 1,
            orderCode: null, // Ensure orderCode is null for cart items
            purchaseDate: new Date().toISOString(),
          }),
        });

        if (!newOrderResponse.ok) {
          throw new Error('Failed to create new order');
        }

        const newOrderData = await newOrderResponse.json();

        // Add book to new order
        const addBookResponse = await fetch('https://rmrbdapi.somee.com/odata/BookOrderDetail', {
          method: 'POST',
          headers: {
            'Token': '123-abc',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: newOrderData.orderId,
            bookId: book.bookId,
            quantity: 1,
            price: book.price,
            totalPrice: book.price // Add totalPrice field
          }),
        });

        if (!addBookResponse.ok) {
          throw new Error('Failed to add book to new order details');
        }

        // Fetch updated cart items
        const updatedOrderDetailsResponse = await fetch(`https://rmrbdapi.somee.com/odata/BookOrderDetail?$filter=orderId eq ${newOrderData.orderId}`, {
          headers: {
            'Token': '123-abc',
            'Content-Type': 'application/json',
          },
        });

        if (updatedOrderDetailsResponse.ok) {
          const updatedCartItems = await updatedOrderDetailsResponse.json();
          updateCartItems(updatedCartItems); // Update the global cart state
        }
      }

      setIsAddedToCart(true);
      Swal.fire({
        icon: 'success',
        title: 'Thêm giỏ thành công!',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      Swal.fire({
        icon: 'error',
        title: 'Có lỗi xảy ra khi thêm vào giỏ hàng!',
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  const handleCardClick = () => {
    navigate(`/book-detail/${book.bookId}`);
  };

  const handleDeleteFromCart = async () => {
    try {
      const customerId = decryptData(Cookies.get("UserId"));
      if (!customerId) {
        Swal.fire({
          icon: 'error',
          title: 'Vui lòng đăng nhập để xóa khỏi giỏ hàng!',
          showConfirmButton: false,
          timer: 1500
        });
        return;
      }

      // Fetch all orders for the customer that are in cart status (orderCode is null)
      const existingOrderResponse = await fetch(`https://rmrbdapi.somee.com/odata/BookOrder`, {
        method: 'GET',
        headers: {
          'Token': '123-abc',
          'Content-Type': 'application/json',
        },
      });

      if (!existingOrderResponse.ok) {
        throw new Error('Failed to fetch existing orders');
      }

      const allOrdersData = await existingOrderResponse.json();

      // Filter orders for current customer and cart status (orderCode is null)
      const cartOrders = allOrdersData.filter(order =>
        order.customerId === parseInt(customerId) &&
        order.orderCode === null
      );

      if (cartOrders.length > 0) {
        const orderIdToUse = cartOrders[0].orderId;

        // Check if book is in order
        const orderDetailResponse = await fetch(`https://rmrbdapi.somee.com/odata/BookOrderDetail?$filter=orderId eq ${orderIdToUse} and bookId eq ${book.bookId}`, {
          method: 'GET',
          headers: {
            'Token': '123-abc',
            'Content-Type': 'application/json',
          },
        });

        if (!orderDetailResponse.ok) {
          throw new Error('Failed to check order details');
        }

        const orderDetailData = await orderDetailResponse.json();

        if (orderDetailData.length > 0) {
          const orderDetailId = orderDetailData[0].orderDetailId;

          // Delete book from order
          await fetch(`https://rmrbdapi.somee.com/odata/BookOrderDetail/${orderDetailId}`, {
            method: 'DELETE',
            headers: {
              'Token': '123-abc',
              'Content-Type': 'application/json',
            },
          });

          // Fetch updated cart items
          const updatedOrderDetailsResponse = await fetch(`https://rmrbdapi.somee.com/odata/BookOrderDetail?$filter=orderId eq ${orderIdToUse}`, {
            headers: {
              'Token': '123-abc',
              'Content-Type': 'application/json',
            },
          });

          if (updatedOrderDetailsResponse.ok) {
            const updatedCartItems = await updatedOrderDetailsResponse.json();
            updateCartItems(updatedCartItems); // Update the global cart state
          }

          setIsAddedToCart(false);
          Swal.fire({
            icon: 'success',
            title: 'Đã xóa khỏi giỏ hàng!',
            showConfirmButton: false,
            timer: 1500
          });
        }
      }
    } catch (error) {
      console.error('Error deleting from cart:', error);
      Swal.fire({
        icon: 'error',
        title: 'Có lỗi xảy ra khi xóa khỏi giỏ hàng!',
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  return (
    <div className="book">
      <div className="book-container">
        <div
          className="top relative"
          style={{
            backgroundImage: `url(${book.images && book.images.length > 0
              ? book.images[0].imageUrl
              : "https://via.placeholder.com/150?text=No+Image"
              })`,
          }}
          onClick={handleCardClick}
        >
          <div className="absolute top-0 left-0 right-0 bottom-0 book-border z-5 rounded-none"></div>
        </div>

        {/* Book Info */}
        <div className={`bottom ${isAddedToCart ? "clicked" : ""}`}>
          <div className="left">
            <div className="details">
              <h1>{book.bookName}</h1>
              <p>{book.price.toLocaleString()} đ</p>
            </div>
            <div className="buy cursor-pointer" onClick={handleAddToCart}>
              <i className="material-icons">add_shopping_cart</i>
            </div>
          </div>
          <div className="right">
            <div className="done">
              <i className="material-icons">done</i>
            </div>
            <div className="details">
              <h1>{book.bookName}</h1>
              <p>Đã thêm vào giỏ hàng</p>
            </div>
            <div className="remove cursor-pointer" onClick={handleDeleteFromCart}>
              <i className="material-icons">clear</i>
            </div>
          </div>
        </div>
      </div>

      {/* Inside Details */}
      <div className="inside">
        <div className="icon">
          <i className="material-icons">info_outline</i>
        </div>
        <div className="contents">
          <h1 className="pb-2">
            {book.description
              ? (book.description.length > 200
                ? `${book.description.substring(0, 200)}...`
                : book.description)
              : "Không rõ"}
          </h1>
          <h1 className="font-bold">Tác giả  <span className="ml-8 font-medium">{book.author || "Không rõ"}</span></h1>
          <table>
            <tbody>
              <tr>
                <th>Xếp hạng</th>
                <td>
                  {[...Array(maxStars)].map((_, index) => (
                    <FontAwesomeIcon
                      key={index}
                      icon={index < filledStars ? faStar : faStarOutline}
                      className={`${index < filledStars ? "text-yellow-500" : "text-gray-500"
                        }`}
                    />
                  ))}
                </td>
              </tr>
              <tr>
                <th>Giá</th>
                <td>{book.price.toLocaleString()} đ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

BookCard.propTypes = {
  book: PropTypes.shape({
    bookId: PropTypes.number.isRequired,
    bookName: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    bookRate: PropTypes.number,
    author: PropTypes.string,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        imageUrl: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
};

export default BookCard;
