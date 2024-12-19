import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRecipeById } from "../../services/RecipeService";
import {
  saveRecipeRate,
  updateRecipeRate,
  getRecipeRatePoint,
  getCountRecipeRateByRecipeId,
  checkRated,
} from "../../services/RecipeRateService";
import { getImagesByRecipeId, } from "../../services/SellerService/Api";
import {
  getAccountData,
  fetchPurchasedRecipes,
} from "../../services/CustomerService/CustomerService";
import Swal from 'sweetalert2';
import { getAccountById } from "../../services/AccountService";
import Cookies from "js-cookie";
import { FaStar } from "react-icons/fa";
import "../../../assets/styles/Components/Rating.css";
import CommentRecipes from "../../CommentItem/CommentRecipes";
import { useSocket } from "../../../App";
import { createNotification } from "../../services/NotificationService";
import HandleBuy from "./HandleBuy";
import "../../../assets/styles/Components/blurred.css";
import { useNavigate } from "react-router-dom";
import CheckMarkIcon from "/images/icon/iconscheckmark24.png";
import { decryptData } from "../../Encrypt/encryptionUtils";

const RecipeDetail = () => {
  const accountId = decryptData(Cookies.get("UserId"));
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [images, setImages] = useState([]); // Thay đổi thành mảng hình ảnh
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [dataAccount, setDataAccount] = useState([]);
  const [purchasedRecipes, setPurchasedRecipes] = useState(new Set());
  const navigate = useNavigate();
  const maxStars = 5;
  //rating
  const [createById, setCreateById] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [ratepoint, setRatepoint] = useState("");
  const [averageRate, setAverageRate] = useState(0);
  const [countRate, setCountRate] = useState(0);
  const [hover, setHover] = useState(null);
  const [checkRatedStatus, setcheckRated] = useState("");
  const [roleaccountonline, setRoleaccountonline] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const handleOpenModal = () => {
    setShowModal(true);
  };
  const handleSaveRecipeRate = async () => {
    if (!accountId) { // Kiểm tra nếu chưa có accountId
      Swal.fire({
        text: "Bạn cần đăng nhập để đánh giá sản phẩm. Bạn có muốn đăng nhập không?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Không"
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    } else {
      try {
        await saveRecipeRate(recipeId, accountId, ratepoint);
        setShowModal(false); // Đóng modal khi lưu thành công
        window.location.reload();
      } catch (error) {
        console.error("Lỗi khi lưu đánh giá:", error);
      }
    }
  };
  // Lấy thông tin tài khoản
  const getAccountInfo = async () => {
    const accountId = decryptData(Cookies.get("UserId"));
    try {
      const result = await getAccountData(accountId);
      await setDataAccount(result);
    } catch (error) {
      console.error("Error fetching account data:", error);
    }
  };
  // Hàm gọi API để lấy các công thức đã mua
  const getPurchasedRecipes = async () => {
    const storedUserId = decryptData(Cookies.get("UserId"));
    setLoading(true);
    try {
      const purchasedIds = await fetchPurchasedRecipes(storedUserId); // Gọi hàm từ file api/recipeApi.js
      setPurchasedRecipes(purchasedIds);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateRecipeRate = async () => {
    try {
      await updateRecipeRate(recipeId, accountId, ratepoint);
      setShowModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to save recipe rate:", error);
    }
  };

  const { socket, accountOnline } = useSocket();
  const handleNotification = (text) => {
    socket.emit("sendNotification", {
      senderName: accountOnline,
      receiverName: accountName,
      content: text,
    });
    if (accountId !== createById) {
      const addNotification = () => {
        const newNotificationData = {
          accountId: createById,
          content: text,
          date: new Date().toISOString(),
          status: 1,
        };
        createNotification(newNotificationData); // Không cần await
      };
      addNotification();
    }
  };

  useEffect(() => {
    setLoading(true);

    const fetchRecipeData = async () => {
      try {
        // Fetch the recipe data first
        const data = await getRecipeById(recipeId);

        // Fetch the related data sequentially
        const rateData = await getRecipeRatePoint(recipeId);
        const countrate = await getCountRecipeRateByRecipeId(recipeId);
        const checkrateddata = await checkRated(recipeId, accountId);
        const createbyName = await getAccountById(data.createById);
        const infoacconline = await getAccountById(accountId);
        const imagesData = await getImagesByRecipeId(recipeId);

        // Update state with fetched data
        setcheckRated(checkrateddata?.ratePoint);
        setAverageRate(rateData[0]?.AvgRatePoint);
        setCountRate(countrate || 0);
        setCreateById(data.createById);
        setRecipe(data);
        setRoleaccountonline(infoacconline.roleId);
        setAccountName(createbyName.userName);
        setImages(imagesData);
        setMainImage(imagesData[0]?.imageUrl);
        await getAccountInfo();
        await getPurchasedRecipes();
      } catch (err) {
        //không làm gì
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeData();
  }, [recipeId, accountId]);


  // Calculate how many stars are filled based on averageRate
  let roundedAverageRate = 0;
  if (averageRate > 0) {
    roundedAverageRate = parseFloat(averageRate.toFixed(2));
  }
  const fullStars = Math.floor(roundedAverageRate);
  const halfStar = averageRate % 1 >= 0.5 ? 1 : 0;

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }
  if (error) return <p>{error}</p>;
  if (!recipe) return <p>Không tải được công thức này.</p>;
  const isLongDescription = recipe.description.length > 300;
  const displayDescription = showFullDescription
    ? recipe.description
    : recipe.description.slice(0, 300) + "...";

  const handleEditRecipe = (recipeId) => {
    // Navigate to the edit page
    navigate(`/editrecipecustomer-recipe/${recipeId}`);
  };
  return (
    <section className="section-center">
      {loading === true ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div className="max-w-6xl mx-auto p-6 bg-gray-50 shadow-md rounded-lg grid grid-cols-2 gap-8 mb-5">
          {/* Phần bên trái với lớp nền */}
          <div className="relative">
            {/* Phần hình ảnh */}
            <div className="mb-24 z-10 flex flex-wrap gap-4">
              {/* Recipe Image Section */}
              <div className="relative w-full md:w-2/3 flex-1">
                {/* Main Recipe Image */}
                <div className="w-full h-96 rounded-lg overflow-hidden shadow-xl">
                  <img
                    src={mainImage}
                    alt="Main Recipe"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Thumbnail Images */}
                <div className="mt-4 flex gap-4 overflow-x-auto">
                  {images && images.length > 0 ? (
                    images.map((image, index) => (
                      <div
                        key={index}
                        className="w-20 h-20 rounded-lg overflow-hidden shadow-md cursor-pointer"
                        onClick={() => setMainImage(image.imageUrl)}
                      >
                        <img
                          src={image.imageUrl || ""}
                          alt={`Recipe image ${index + 1}`}
                          className="w-full h-full object-cover hover:opacity-75"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-lg text-gray-500">No images available</p>
                  )}
                </div>
              </div>

            </div>
            {/* Các chính sách */}
            <div className="space-y-2 z-10">
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
                              disabled // Disable không cho click
                              style={{ display: "none" }}
                            />
                            <FaStar className="star" size={20} color={starColor} />
                          </label>
                        );
                      })}
                    </div>
                    <div className="rating-count">({countRate} đánh giá)</div>
                  </div>
                </div>

                {showModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                      <h2 className="text-2xl font-bold mb-4 text-center">
                        Cho chúng tôi biết bạn thích công thức này như thế nào
                      </h2>
                      <div className="text-center">
                        {[...Array(5)].map((star, index) => {
                          const currentRating = index + 1;
                          return (
                            <label key={index}>
                              <input
                                type="radio"
                                name="rating"
                                value={currentRating}
                                onChange={(e) => setRatepoint(e.target.value)}
                                style={{ display: "none" }}
                              />
                              <FaStar
                                className="star"
                                size={50}
                                color={
                                  currentRating <= (hover || ratepoint)
                                    ? "#ffc107"
                                    : "#e4e5e9"
                                }
                                onMouseEnter={() => setHover(currentRating)}
                                onMouseLeave={() => setHover(null)}
                              />
                            </label>
                          );
                        })}
                        {!checkRatedStatus ? (
                          <p>Điểm đánh giá của bạn là {ratepoint}</p>
                        ) : (
                          <>
                            <p
                              style={{
                                display: "block",
                                alignItems: "center",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Đánh giá cuối cùng {checkRatedStatus}{" "}
                              <FaStar
                                color="#ffc107"
                                style={{ marginLeft: "2px", marginBottom: "1.5px", display: "inline" }}
                              />
                            </p>
                            <p>Đánh giá hiện tại {ratepoint}</p>
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
                          onClick={() => {
                            if (accountId) {
                              handleNotification(
                                `${accountOnline} đã đánh giá ${ratepoint} sao về công thức ${recipe.recipeName} của bạn`
                              );
                            }
                            checkRatedStatus
                              ? handleUpdateRecipeRate()
                              : handleSaveRecipeRate();
                          }}
                        >
                          {checkRatedStatus ? "Update Ratepoint" : "Save Ratepoint"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div
              >

                {/* Nút "Mua công thức này" chỉ hiển thị khi chưa mua */}
                {!purchasedRecipes.has(recipe.recipeId) && (
                  recipe.price === 0 ? (
                    <div style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                    }}>
                      <button
                        className="write-review-button"
                        style={{ width: "45%", height: "70px" }}
                        onClick={handleOpenModal}
                      >
                        <span role="img" aria-label="star">
                          ✨
                        </span>{" "}
                        Đánh giá công thức
                      </button>
                      <button
                        className="write-review-button"
                        style={{ width: "45%", height: "70px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          HandleBuy(
                            recipe,
                            accountId,
                            purchasedRecipes,
                            getAccountInfo,
                            getPurchasedRecipes,
                            dataAccount,
                            navigate
                          );
                        }}
                      >
                        <span role="img" aria-label="buy">
                          🛒
                        </span>{" "}

                        <span>Lưu công thức</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      className="write-review-button"
                      style={{ width: "45%", height: "70px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        HandleBuy(
                          recipe,
                          accountId,
                          purchasedRecipes,
                          getAccountInfo,
                          getPurchasedRecipes,
                          dataAccount,
                          navigate
                        );
                      }}
                    >
                      <span role="img" aria-label="buy">
                        🛒
                      </span>{" "}

                      <span>Mua công thức ({recipe.price})</span>
                    </button>
                  )
                )}

                {/* Nút "Sửa đổi công thức" chỉ hiển thị khi đã mua */}
                {(purchasedRecipes.has(recipe.recipeId) && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px", // Thêm khoảng cách giữa các nút
                    }}>
                    <button
                      className="write-review-button"
                      style={{ width: "45%", height: "70px" }}
                      onClick={handleOpenModal}
                    >
                      <span role="img" aria-label="star">
                        ✨
                      </span>{" "}
                      Đánh giá công thức
                    </button>

                    <button
                      className="write-review-button"
                      style={{ width: "45%", height: "70px" }}
                      onClick={() => {
                        {
                          handleEditRecipe(recipe.recipeId);
                        }
                      }}
                    >
                      <span role="img" aria-label="edit">
                        ✏️
                      </span>{" "}
                      Sửa đổi công thức
                    </button>
                  </div>
                )
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              {recipe.recipeName}{" "}
            </h1>
            <p className="text-xl text-gray-600 mt-1">
              Nhà cung cấp: {accountName || "Hệ thống"}
            </p>
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
                      disabled // Disable không cho click
                      style={{ display: "none" }}
                    />
                    <FaStar className="star" size={20} color={starColor} />
                  </label>
                );
              })}
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                Thông tin chi tiết
              </h2>
              <ul className="text-gray-700 text-lg">
                <li>
                  <span className="font-semibold">Phần ăn dành cho:</span>{" "}
                  {recipe.numberOfService} người
                </li>
                <li>
                  <span className="font-semibold">Sự dinh dưỡng:</span>{" "}
                  {recipe.nutrition}
                </li>
                <p className="text-lg">
                  <strong>Hướng dẫn</strong>
                  {recipe?.tutorial ? (
                    <div className="whitespace-pre-line">
                      {recipe.tutorial
                        .split("Bước ")
                        .filter((step, index) => step.trim() !== "")
                        .map((step, index) => {
                          const stepIndex = index === 0 ? 1 : index + 1;
                          return (
                            <div key={index} className="mb-4">
                              <div className="flex items-center mb-1">
                                <img
                                  src={CheckMarkIcon}
                                  alt=""
                                  className="w-5 h-5 mr-2"
                                />
                                <strong>Bước {stepIndex}</strong>
                              </div>
                              <div className="ml-7">
                                {purchasedRecipes.has(recipe.recipeId) ? (
                                  <span>{step.trim()}</span>
                                ) : (
                                  <span className="blurred">Nội dung bị ẩn</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    "N/A"
                  )}
                </p>
                <li>
                  <span className="font-semibold">Video:</span>{" "}
                  <span>
                    {(purchasedRecipes.has(recipe.recipeId) || recipe.price === 0) ? (
                      // Hiển thị đường dẫn video nếu đã mua
                      recipe.video ? (
                        <a
                          href={recipe.video}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Xem Video
                        </a>
                      ) : (
                        "Video không có sẵn"
                      )
                    ) : (
                      // Hiển thị "Video bị ẩn" nếu chưa mua
                      <span className="blurred">Video bị ẩn</span>
                    )}
                  </span>
                </li>

                <li>
                  <span className="font-semibold">Giá:
                    {recipe.price === 0 ? (
                      <span className="text-green-600">Miễn Phí</span>
                    ) : (
                      <span className="text-red-600">
                        {recipe.price}
                        <img src="/images/icon/dollar.png" alt="coins" className="h-5 w-5 mb-1 ml-1 inline-block" />
                      </span>
                    )}
                  </span>
                </li>
                <li>
                  <span className="font-semibold">Thành phần:</span>{" "}
                  <span>
                    {(purchasedRecipes.has(recipe.recipeId) || recipe.price === 0) ? (
                      // Hiển thị nội dung nếu đã mua
                      <span>{recipe.ingredient || "Nội dung không có sẵn"}</span>
                    ) : (
                      // Hiển thị "Nội dung bị ẩn" nếu chưa mua
                      <span className="blurred">Nội dung bị ẩn</span>
                    )}
                  </span>
                </li>
                <li>
                  <span className="font-semibold">Ngày tạo:</span>{" "}
                  {new Date(recipe.createDate).toLocaleDateString()}
                </li>
              </ul>
            </div>
            {!(purchasedRecipes.has(recipe.recipeId) || recipe.price === 0) && (
              <p className="text-red-500 font-bold text-xl mt-2">
                Vui lòng mua công thức để xem nội dung chi tiết.
              </p>
            )}
            {/* Product Description with Show More/Less Toggle */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                Mô tả sản phẩm
              </h2>
              <p className="text-2xl font-bold text-gray-800">
                {recipe.recipeName}
              </p>
              <p className="text-gray-600 mt-2 text-lg">{displayDescription}</p>
              {isLongDescription && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-blue-500 mt-2 underline"
                >
                  {showFullDescription ? "Rút gọn" : "Xem thêm"}
                </button>
              )}
            </div>
          </div>
          <div
            className="max-w-10xl mx-auto p-6 bg-white shadow-md rounded-lg flex justify-center"
            style={{ width: "205%" }}
          >
            <div className="w-full max-w-6xl">
              <CommentRecipes
                recipeId={recipeId}
                createById={createById}
                accountIdonline={accountId}
                roleaccountonline={roleaccountonline}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RecipeDetail;
