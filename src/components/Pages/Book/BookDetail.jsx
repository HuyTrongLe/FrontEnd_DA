import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBookById, getFirstImageByBookId } from '../../services/BookService';
import { FaShippingFast, FaRedo, FaUsers, FaShoppingCart, FaCreditCard, FaTag, FaCheckCircle } from 'react-icons/fa';
import { Button } from '@material-tailwind/react';
import { Tooltip } from '@mui/material';
import { BsFillPatchCheckFill } from 'react-icons/bs';
import CommentBooks from "../../CommentItem/CommentBooks";
import Cookies from 'js-cookie';
import { FaStar } from 'react-icons/fa'
import "../../../assets/styles/Components/Rating.css"
import { saveBookRate, updateBookRate, getBookRatePoint, getCountBookRateBybookId, checkRated } from '../../services/BookRateService';
import { getAccountById } from "../../services/AccountService"
const BookDetail = () => {
    const { bookId } = useParams();
    const [book, setBook] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const maxStars = 5;

    //new update 17/11/2024
    const [createById, setCreateById] = useState(null);
    const accountId = Cookies.get("UserId");
    //rating
    const [showModal, setShowModal] = useState(false);
    const [ratepoint, setRatepoint] = useState("");
    const [averageRate, setAverageRate] = useState(0);
    const [countRate, setCountRate] = useState(0);
    const [hover, setHover] = useState(null);
    const [checkRatedStatus, setcheckRated] = useState("");
    const [accountName, setAccountName] = useState("")
    const handleOpenModal = () => {
        setShowModal(true);
    };
    const handleSaveRecipeRate = async () => {
        try {
            await saveBookRate(ratepoint, accountId,bookId );
            setShowModal(false); // Đóng modal khi lưu thành công
            window.location.reload();
        } catch (error) {
            console.error("Failed to save recipe rate:", error);
        }
    };

    const handleUpdateRecipeRate = async () => {
        try {
            await updateBookRate(ratepoint, accountId,bookId);
            setShowModal(false); // Đóng modal khi lưu thành công
            window.location.reload();
        } catch (error) {
            console.error("Failed to save recipe rate:", error);
        }
    };

    useEffect(() => {
        const fetchBookData = async () => {
            try {
                const data = await getBookById(bookId);
                const imageData = await getFirstImageByBookId(bookId);
                const rateData = await getBookRatePoint(bookId);
                const countrate = await getCountBookRateBybookId(bookId);
                const checkrateddata = await checkRated(accountId,bookId);
                const createbyName = await getAccountById(data.createById);
                setcheckRated(checkrateddata?.ratePoint);
                setCreateById(data.createById);
                //console.log('Đã rated: ', checkRatedStatus);
                setAverageRate(rateData[0]?.AvgRatePoint);
                setCountRate(countrate || 0);
                setBook(data);
                setAccountName(createbyName.userName);
                setImageUrl(imageData);
            } catch (err) {
                setError('Có lỗi xảy ra khi tải dữ liệu sách');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookData();
    }, [bookId,accountId]);

    // Calculate how many stars are filled based on averageRate
    let roundedAverageRate = 0;
    if (averageRate > 0) { roundedAverageRate = parseFloat(averageRate.toFixed(2)) }
    const fullStars = Math.floor(roundedAverageRate);
    const halfStar = averageRate % 1 >= 0.5 ? 1 : 0;

    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p>{error}</p>;
    if (!book) return <p>Không tìm thấy thông tin sách.</p>;

    const isLongDescription = book.description.length > 300;
    const displayDescription = showFullDescription ? book.description : book.description.slice(0, 300) + '...';

    return (
        <>
        <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg grid grid-cols-2 gap-8">
            {/* Phần bên trái với lớp nền */}
            <div className="relative">
                {/* Lớp nền */}
                <div className="absolute inset-0 bg-gray-100 rounded-lg shadow-inner p-6 -z-10"></div>

                {/* Phần hình ảnh */}
                <div className="mb-4 z-10">
                    <img src={imageUrl || 'https://via.placeholder.com/150'} alt={book.bookName} className="w-full rounded-lg shadow-lg" />
                </div>

                {/* Các nút */}
                <div className="flex gap-4 mb-4 z-10">
                    <Button className="flex items-center justify-center bg-red-500 text-white py-2 px-4 rounded-lg w-1/2">
                        <FaShoppingCart className="mr-2" /> Thêm vào giỏ hàng
                    </Button>
                    <Button className="flex items-center justify-center bg-green-500 text-white py-2 px-4 rounded-lg w-1/2">
                        <FaCreditCard className="mr-2" /> Mua ngay
                    </Button>
                </div>

                {/* Các chính sách */}
                <div className="space-y-2 z-10">
                    <Tooltip title="Thời gian giao hàng">
                        <p className="text-gray-700 font-semibold flex items-center">
                            <FaShippingFast className="text-blue-500 mr-2" />Thời gian giao hàng: <span className="text-gray-500">Giao nhanh và uy tín</span>
                        </p>
                    </Tooltip>
                    <Tooltip title="Chính sách đổi trả">
                        <p className="text-gray-700 font-semibold flex items-center">
                            <FaRedo className="text-green-500 mr-2" />Chính sách đổi trả: <span className="text-gray-500">Đổi trả miễn phí toàn quốc</span>
                        </p>
                    </Tooltip>
                    <Tooltip title="Chính sách khách sỉ">
                        <p className="text-gray-700 font-semibold flex items-center">
                            <FaUsers className="text-yellow-500 mr-2" />Chính sách khách sỉ: <span className="text-gray-500">Ưu đãi khi mua số lượng lớn</span>
                        </p>
                    </Tooltip>
                </div>
            </div>

            {/* Right Section */}
            <div>
                <h1 className="text-4xl font-bold text-gray-800">{book.bookName}</h1>
                <p className="text-xl text-gray-600 mt-1">Nhà cung cấp: {accountName}</p>
                <div className="flex items-baseline mt-4 mb-4">
                    <span className="text-3xl font-bold text-red-600">{book.price.toLocaleString()} đ</span>
                    <span className="text-xl text-gray-500 line-through ml-2">{book.price.toLocaleString()} đ</span>
                    <span className="text-lg text-white bg-red-600 px-2 py-1 ml-4 rounded">-{book.discount}0%</span>
                </div>
                <div className="flex items-center mt-2">
                {[...Array(maxStars)].map((_, index) => {
                            let starColor = "#e4e5e9"; // Màu sao chưa được đánh giá
                            if (index < fullStars) {
                                starColor = "#ffc107"; // Màu sao đầy
                            } else if (index === fullStars && halfStar) {
                                starColor = "#ffc107"; // Màu sao nửa
                            }
                            return (
                                <label key={index}>
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={index + 1}
                                        style={{ display: "none" }}
                                    />
                                    <FaStar className="star" size={20}
                                        color={starColor}
                                    />
                                </label>
                            );
                        })}
                </div>

                {/* Shipping Information */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="flex items-center gap-4 mb-4">
                        <FaShippingFast className="text-2xl text-blue-500" />
                        <div>
                            <p className="text-xl text-gray-700 font-semibold">Giao hàng tiêu chuẩn</p>
                            <p className="text-gray-500 text-base">Yêu cầu khi giao hàng: {book.requiredNote}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <div className="bg-yellow-100 text-yellow-600 py-2 px-4 rounded-lg flex items-center">
                            <FaTag className="mr-2" />
                            <span>Mã giảm giá 10K cho đơn hàng từ 130K</span>
                        </div>
                        <div className="bg-blue-100 text-blue-600 py-2 px-4 rounded-lg flex items-center">
                            <BsFillPatchCheckFill className="mr-2" />
                            <span>Mã giảm giá 20K cho đơn hàng từ 280K</span>
                        </div>
                        <div className="bg-green-100 text-green-600 py-2 px-4 rounded-lg flex items-center">
                            <FaCheckCircle className="mr-2" />
                            <span>Voucher giảm 5%</span>
                        </div>
                    </div>
                </div>

                {/* Detailed Information */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-4">Thông tin chi tiết</h2>
                    <ul className="text-gray-700 text-lg">
                        <li className="flex">
                            <span className="font-semibold" style={{ minWidth: '200px' }}>Mã hàng:</span>
                            <span style={{ marginLeft: '20px' }}>{book.isbn}</span>
                        </li>
                        <li className="flex">
                            <span className="font-semibold" style={{ minWidth: '200px' }}>Trạng thái:</span>
                            <span style={{ marginLeft: '20px' }}>{book.status === 1 ? 'Còn hàng' : 'Hết hàng'}</span>
                        </li>
                        <li className="flex">
                            <span className="font-semibold" style={{ minWidth: '200px' }}>Trọng lượng (gr):</span>
                            <span style={{ marginLeft: '20px' }}>{book.weight}</span>
                        </li>
                        <li className="flex">
                            <span className="font-semibold" style={{ minWidth: '200px' }}>Kích thước bao bì:</span>
                            <span style={{ marginLeft: '20px' }}>{book.length} x {book.width} x {book.height} cm</span>
                        </li>
                        <li className="flex">
                            <span className="font-semibold" style={{ minWidth: '200px' }}>Số lượng trong kho:</span>
                            <span style={{ marginLeft: '20px' }}>{book.unitInStock}</span>
                        </li>
                        <li className="flex">
                            <span className="font-semibold" style={{ minWidth: '200px' }}>Ngày tạo:</span>
                            <span style={{ marginLeft: '20px' }}>{new Date(book.createDate).toLocaleDateString()}</span>
                        </li>
                    </ul>
                </div>



                {/* Product Description with Show More/Less Toggle */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-4">Mô tả sản phẩm</h2>
                    <p className="text-2xl font-bold text-gray-800">{book.bookName}</p>
                    <p className="text-gray-600 mt-2 text-lg">{displayDescription}</p>
                    {isLongDescription && (
                        <button
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="text-blue-500 mt-2 underline"
                        >
                            {showFullDescription ? 'Rút gọn' : 'Xem thêm'}
                        </button>
                    )}
                </div>
            </div>
            {/* <Rating /> */}
            <div className="rating-container">
                    <div className="rating-header">
                        <h3>Đánh giá sản phẩm</h3>
                    </div>
                    <div className="rating-summary">
                        <div className="rating-score">
                            <span className="score">{roundedAverageRate}</span>
                            <span className="out-of">/5</span>
                        </div>
                        <div className="rating-stars">
                            <div className="stars">
                                {[...Array(maxStars)].map((_, index) => {
                                    let starColor = "#e4e5e9"; // Màu sao chưa được đánh giá
                                    if (index < fullStars) {
                                        starColor = "#ffc107"; // Màu sao đầy
                                    } else if (index === fullStars && halfStar) {
                                        starColor = "#ffc107"; // Màu sao nửa
                                    }
                                    return (
                                        <label key={index}>
                                            <input
                                                type="radio"
                                                name="rating"
                                                value={index + 1}
                                                style={{ display: "none" }}
                                            />
                                            <FaStar className="star" size={20}
                                                color={starColor}
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                            <div className="rating-count">({countRate} đánh giá)</div>
                        </div>
                    </div>
                    <div className="rating-bars">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="rating-bar">
                                <span>{star} sao</span>
                                <div className="bar">
                                    <div className="fill" style={{ width: "0%" }}></div>
                                </div>
                                <span>0%</span>
                            </div>
                        ))}
                    </div>
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                                <h2 className="text-2xl font-bold mb-4 text-center">Let us know how you liked this recipe</h2>
                                <div className="text-center">

                                    {[...Array(5)].map((star, index) => {
                                        const currentRating = index + 1;
                                        return (
                                            <label key={index}>
                                                <input
                                                    type="radio"
                                                    name="rating"
                                                    value={currentRating}
                                                    //onClick={() => setRatepoint(currentRating)}
                                                    onChange={(e) => setRatepoint(e.target.value)}
                                                    style={{ display: "none" }}
                                                />
                                                <FaStar className="star" size={50}
                                                    color={currentRating <= (hover || ratepoint) ? "#ffc107" : "#e4e5e9"}
                                                    onMouseEnter={() => setHover(currentRating)}
                                                    onMouseLeave={() => setHover(null)}
                                                />
                                            </label>
                                        );
                                    })}
                                    {!checkRatedStatus ? (
                                        <p>Your star rating is {ratepoint}</p>
                                    ) : (
                                        <>
                                            <p style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                                Your last star rating was {checkRatedStatus} <FaStar color="#ffc107" style={{ marginLeft: '2px', marginBottom: '1.5px' }} />
                                            </p>
                                            <p>Your star rating this time is {ratepoint}</p>
                                        </>
                                    )}

                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="bg-custom-orange hover:bg-orange-500 text-white font-bold py-2 px-4 rounded"
                                        onClick={checkRatedStatus ? handleUpdateRecipeRate : handleSaveRecipeRate}
                                    >
                                        {checkRatedStatus ? "Update Ratepoint" : "Save Ratepoint"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <button className="write-review-button" style={{ width: " 100%", height: "70px" }} onClick={handleOpenModal}>
                        <span role="img" aria-label="write">✏️</span> Give your stars for this recipe
                    </button>
                </div>
        </div>
        <CommentBooks bookId={bookId} createById={createById}/>
        </>
        
    );
};

export default BookDetail;
