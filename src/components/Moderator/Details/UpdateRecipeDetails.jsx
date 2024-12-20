import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ClockIcon from "/images/icon/iconclock.png";
import SpoonIcon from "/images/icon/iconsspoon.png";
import CheckMarkIcon from "/images/icon/iconscheckmark24.png";
import Cookies from "js-cookie";
import Swal from "sweetalert2"; // Import SweetAlert2
import { FaSave, FaArrowLeft } from "react-icons/fa";
import { useSocket } from "../../../App";
import { createNotification } from "../../services/NotificationService";
import {
  getRecipeById,
  getImagesByRecipeId,
  fetchActiveTags,
  updateRecipe,
} from "../../services/SellerService/Api";
import { getAccountData } from "../../services/CustomerService/CustomerService";
import { decryptData } from "../../Encrypt/encryptionUtils";

const RecipeDetail = () => {
  const { recipeId } = useParams(); // Lấy ID từ URL
  const [recipe, setRecipe] = useState(null);
  const [accountID, setAccountID] = useState(null);
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [tagMap, setTagMap] = useState({});
  const [status, setStatus] = useState();
  const [censorNote, setCensorNote] = useState();
  const { socket, accountOnline } = useSocket();
  // Hàm lấy chi tiết công thức
  const fetchRecipeDetail = async (id) => {
    const recipeData = await getRecipeById(id);
    setRecipe(recipeData);
    setStatus(recipeData.status);
    setCensorNote(recipeData.censorNote || "");
    return recipeData;
  };

  // Hàm lấy thông tin tài khoản
  const fetchAccount = async (createById) => {
    const response = await getAccountData(createById);
    setAccountID(response);
  };

  // Hàm lấy mảng hình ảnh
  const fetchImages = async (id) => {
    try {
      const data = await getImagesByRecipeId(id);
      setImages(data);
      setMainImage(data[0]?.imageUrl || null);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  // Hàm lấy tên tag
  const fetchTags = async () => {
    const data = await fetchActiveTags();
    const tagMapData = data.reduce((acc, tag) => {
      acc[tag.tagId] = tag.tagName;
      return acc;
    }, {});
    setTagMap(tagMapData);
  };

  // Hàm gọi tất cả các API
  const fetchData = async () => {
    try {
      const recipeData = await fetchRecipeDetail(recipeId);
      if (recipeData.createById) {
        await fetchAccount(recipeData.createById);
      }
      await fetchImages(recipeId);
      await fetchTags();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Hàm lưu cập nhật
  const handleSave = async () => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn thay đổi trạng thái?",
      text: "Điều này sẽ cập nhật trạng thái tài khoản!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });
    if (result.isConfirmed) {
      const censorId = decryptData(Cookies.get("UserId"));
      try {
        const updatedRecipe = {
          ...recipe,
          status,
          censorNote,
          censorId,
        };
        await updateRecipe(recipeId, updatedRecipe);
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Công thức đã được cập nhật thành công.",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("Error updating recipe:", error);
        Swal.fire({
          icon: "error",
          title: "Thất bại!",
          text: "Cập nhật thất bại.",
          confirmButtonText: "OK",
        });
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [recipeId]);

  if (!recipe || !accountID || images.length === 0) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  const handleNotification = (text) => {
    socket.emit("sendNotification", {
      senderName: accountOnline,
      receiverName: accountID?.userName,
      content: text,
    });
    const addNotification = () => {
      const newNotificationData = {
        accountId: accountID?.accountId,
        content: text,
        date: new Date().toISOString(),
        status: 1,
      };
      createNotification(newNotificationData); // Không cần await
    };
    addNotification();
  };

  return (
    <>
      <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {recipe?.recipeName || "N/A"}
        </h1>

        <div className="space-y-4">
          <p className="text-lg">{recipe?.description || "N/A"}</p>
          <p className="text-lg">
            <strong>Tạo bởi:</strong> {accountID?.userName || "N/A"}
          </p>
          <div className="flex flex-col md:flex-row items-start space-x-4">
            {/* Recipe Image Section */}
            <div className="md:w-2/3 relative">
              <img
                src={mainImage}
                alt="Main Recipe"
                className="w-full object-cover rounded-lg shadow-md"
              />
              {/* Thumbnail Images */}
              <div className="flex space-x-4 overflow-x-auto mt-4">
                {images && images.length > 0 ? (
                  images.map((image, index) => (
                    <img
                      key={index}
                      src={image.imageUrl || ""}
                      alt={`Recipe image ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-75"
                      onClick={() => setMainImage(image.imageUrl)} // Set main image on click
                    />
                  ))
                ) : (
                  <p className="text-lg">N/A</p>
                )}
              </div>
            </div>

            {/* Recipe Details Section */}
            <div className="md:w-1/3 bg-gray-50 p-4 rounded-lg shadow-md relative">
              {/* Clock Icon */}
              {/* <ClockIcon className="w-6 h-6 text-gray-600 absolute top-2 right-2" /> */}
              <img
                src={ClockIcon}
                alt=""
                className="w-6 h-6 text-gray-600 absolute top-2 right-2"
              />

              {/* Recipe Details */}
              <p className="text-lg mb-2">
                <strong className="text-gray-800">Khẩu phần:</strong>{" "}
                {recipe?.numberOfService || "N/A"} người
              </p>
              <p className="text-lg mb-2">
                <strong className="text-gray-800">Thời gian:</strong>{" "}
                {recipe?.totalTime || "N/A"} phút
              </p>
              <p className="text-lg">
                <strong className="text-gray-800">Giá:</strong>{" "}
                {recipe?.price || "N/A"}đ
              </p>
              <p className="text-lg">
                <strong>Sự dinh dưỡng:</strong> {recipe?.nutrition || "N/A"}
              </p>
              <p className="text-lg mb-2">
                <strong className="text-gray-800">Ngày tạo:</strong>{" "}
                {recipe?.createDate
                  ? new Date(recipe.createDate).toLocaleDateString("vi-VN")
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="relative flex items-center mb-8">
            <hr className="flex-grow border-t border-black-300" />
            <img src={SpoonIcon} alt="Icon" className="mx-2 w-6 h-6" />
          </div>
          <p className="text-lg">
            <strong>Hướng dẫn</strong>
            {recipe?.tutorial ? (
              <div className="whitespace-pre-line">
                {recipe.tutorial.split("Bước ").map(
                  (step, index) =>
                    step && (
                      <div key={index} className="mb-4">
                        <div className="flex items-center mb-1">
                          <img
                            src={CheckMarkIcon}
                            alt=""
                            className="w-5 h-5 mr-2"
                          />
                          <strong>Bước {index}</strong>
                        </div>
                        <div className="ml-7">{step.trim()}</div>
                      </div>
                    )
                )}
              </div>
            ) : (
              "N/A"
            )}
          </p>
          <div className="relative flex items-center mb-8">
            <hr className="flex-grow border-t border-black-300" />
            <img src={SpoonIcon} alt="Icon" className="mx-2 w-6 h-6" />
          </div>
          <p className="text-lg">
            <strong>Thành phần</strong> <br />
            {recipe?.ingredient || "N/A"}
          </p>
          <div>
            <p className="text-lg">
              <strong className="block text-lg mb-2">Thể loại</strong>
            </p>
            <ul className="list-disc pl-5">
              {recipe?.recipeTags?.length > 0 ? (
                recipe.recipeTags.map((tag, index) => (
                  <li key={index} className="text-lg">
                    {tagMap[tag.tagId] || "Unknown"}
                  </li>
                ))
              ) : (
                <li className="text-lg">N/A</li>
              )}
            </ul>
          </div>

          <div className="relative flex items-center mb-8">
            <hr className="flex-grow border-t border-black-300" />
            <img src={SpoonIcon} alt="Icon" className="mx-2 w-6 h-6" />
          </div>

          <p className="text-lg">
            <strong>Video:</strong>{" "}
            {recipe?.video ? (
              <a
                href={recipe.video}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Watch Video
              </a>
            ) : (
              "N/A"
            )}
          </p>
          <div>
            <label className="block text-lg font-semibold">Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(parseInt(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value={1}>Xác nhận</option>
              <option value={-1}>Chờ xác nhận</option>
              <option value={0}>Khóa</option>
            </select>
          </div>
          <div>
            <label className="block text-lg font-semibold">Censor Note:</label>
            <textarea
              value={censorNote}
              onChange={(e) => setCensorNote(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              rows="4"
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                const statusText = status === 1 ? "Xác nhận" : "Khóa";
                if(!censorNote){
                  handleNotification(
                    `Mod ${accountOnline} đã ${statusText} công thức ${recipe.recipeName} của bạn`
                  );
                }else{
                  handleNotification(
                    `Mod ${accountOnline} đã ${statusText} công thức ${recipe.recipeName} của bạn với lý do ${censorNote}`
                  );
                  
                }
               
                handleSave();
              }}
              className="flex items-center justify-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition transform duration-300 hover:scale-105"
            >
              <FaSave className="text-lg" />
              <span className="text-lg">Lưu</span>
            </button>

            <button
              className="flex items-center justify-center space-x-2 px-6 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-700 transition transform duration-300 hover:scale-105"
              onClick={() => window.history.back()}
            >
              <FaArrowLeft className="text-lg" />
              <span className="text-lg">Quay lại</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipeDetail;
