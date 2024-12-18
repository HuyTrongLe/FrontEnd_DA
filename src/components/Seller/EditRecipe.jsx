import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Container,
  TextField,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import {
  fetchActiveTags2,
  getRecipeById,
  updateRecipe,
  getRecipeTags,
  deleteRecipeTag,
  addRecipeTag,
} from "../services/SellerService/Api";
const EditRecipe = () => {
  const [recipe, setRecipe] = useState(null);
  const [recipeName, setRecipeName] = useState("");
  const [price, setPrice] = useState("");
  const [numberOfService, setNumberOfService] = useState("");
  const [status, setStatus] = useState(1);
  const [nutrition, setNutrition] = useState("");
  const [tutorial, setTutorial] = useState("");
  const [video, setVideo] = useState("");
  const [description, setDescription] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [createById, setCreateById] = useState("");
  const [tags, setTags] = useState([]); // Tất cả các tag đang hoạt động
  const [selectedTagIds, setSelectedTagIds] = useState([]); // Các tag được chọn
  const [selectedTagNames, setSelectedTagNames] = useState([]);
  const [tagMap, setTagMap] = useState({});
  const [energy, setEnergy] = useState("");
  const [updatedDate, setUpdatedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [errors, setErrors] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  // Lấy dữ liệu Recipe từ API
  const fetchRecipeData = async () => {
    try {
      const recipeData = await getRecipeById(id);
      setRecipe(recipeData);
      setRecipeName(recipeData.recipeName);
      setPrice(recipeData.price);
      setNumberOfService(recipeData.numberOfService);
      setStatus(recipeData.status);
      setNutrition(recipeData.nutrition);
      setTutorial(recipeData.tutorial);
      setVideo(recipeData.video);
      setDescription(recipeData.description);
      setIngredient(recipeData.ingredient);
      setEnergy(recipeData.energy);
      setCreateById(recipeData.createById);
      setCreateDate(recipeData.createDate?.slice(0, 10) || "");
      setTotalTime(recipeData.totalTime);

      // Cập nhật tag từ API
      setSelectedTagIds(recipeData.tags?.map((tag) => tag.tagId) || []);
      setSelectedTagNames(recipeData.tags?.map((tag) => tag.tagName) || []);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải dữ liệu công thức!",
        footer: "Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.",
      });
    }
  };
  // Kiểm tra giá trị nhập vào
  const validateFields = () => {
    const newErrors = {};

    if (!recipeName) newErrors.recipeName = "Tên công thức là bắt buộc.";
    if (!numberOfService || isNaN(numberOfService) || numberOfService <= 0) {
      newErrors.numberOfService = "Vui lòng nhập số lượng phần ăn hợp lệ.";
    }
    if (!price || isNaN(price) || price < 0) {
      newErrors.price = "Vui lòng nhập giá hợp lệ.";
    }
    if (!nutrition) newErrors.nutrition = "Thông tin dinh dưỡng là cần thiết.";
    if (!tutorial) newErrors.tutorial = "Hướng dẫn là cần thiết.";
    if (!video) newErrors.video = "Video là bắt buộc.";
    if (!ingredient) newErrors.ingredient = "Thành phần là bắt buộc.";
    if (!description) newErrors.description = "Mô tả là bắt buộc.";
    if (!energy) newErrors.energy = "Năng lượng là bắt buộc.";

    if (!totalTime || isNaN(totalTime) || totalTime <= 0) {
      newErrors.totalTime = "Vui lòng nhập tổng thời gian hợp lệ.";
    }
    if (selectedTagIds.length === 0) {
      newErrors.selectedTagIds = "Vui lòng chọn ít nhất một thẻ.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Lấy tất cả các tag có `status = 1`
  const fetchTags = async () => {
    try {
      const response = await fetchActiveTags2();

      setTags(response);

      // Lưu map tagId -> tagName
      const newTagMap = response.reduce((acc, tag) => {
        acc[tag.tagId] = tag.tagName;
        return acc;
      }, {});
      setTagMap(newTagMap);
    } catch (error) {
      console.error("Error fetching tags:", error);
      Swal.fire("Lỗi", "Lỗi khi tải thẻ", "error");
    }
  };

  useEffect(() => {
    fetchTags();
    fetchRecipeData();
  }, [id]);

  // Xử lý khi chọn tag
  // Handle the selection change for tags
  const handleTagSelection = (e) => {
    const tagId = parseInt(e.target.value);
    const isChecked = e.target.checked;

    // Cập nhật selectedTagIds khi chọn/bỏ chọn tag
    if (isChecked) {
      setSelectedTagIds((prevSelected) => [...prevSelected, tagId]);
    } else {
      setSelectedTagIds((prevSelected) =>
        prevSelected.filter((id) => id !== tagId)
      );
    }
  };

  // Khi trường input thay đổi thì lỗi sẽ reset về null
  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
  };
  // Cập nhật công thức khi submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    const updatedRecipe = {
      ...recipe,
      recipeName,
      price,
      numberOfService,
      status:-1,
      nutrition,
      tutorial,
      video,
      description,
      ingredient,
      createDate,
      updatedDate,
      totalTime,
      createById,
      energy,
    };
    Swal.fire({
      title: "Đang cập nhật...",
      text: "Vui lòng đợi trong giây lát.",
      allowOutsideClick: false, // Người dùng không thể click bên ngoài cửa sổ
      didOpen: () => {
        Swal.showLoading(); // Hiển thị spinner khi đang loading
      },
    });
    try {
      // Cập nhật recipe
      await updateRecipe(id, updatedRecipe);

      // Lấy các tag hiện tại của recipe từ cơ sở dữ liệu
      const oldTags = await getRecipeTags(id);

      const oldTagIds = oldTags.map((tag) => tag.tagId);

      // Xóa các tag không còn trong danh sách đã chọn
      for (const tagId of oldTagIds) {
        if (!selectedTagIds.includes(tagId)) {
          await deleteRecipeTag(id, tagId);
        }
      }

      // Thêm các tag mới vào danh sách
      for (const tagId of selectedTagIds) {
        if (!oldTagIds.includes(tagId)) {
          await addRecipeTag(tagId, id);
        }
      }

      // Gọi lại fetchRecipeData để làm mới danh sách tag
      await fetchRecipeData();
      Swal.fire("Thành công", "Cập nhật công thức thành công!", "success").then(
        () => navigate("/recipe-list-seller")
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể cập nhật công thức!",
        footer: "Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.",
      });
      console.error("Error:", error);
    }
  };

  if (!recipe) return <div>Loading...</div>;

  return (
    <>
      <Container
        style={{
          color: "Black",
          backgroundColor: "#fff",
          padding: "20px",
          maxWidth: "900px",
          margin: "auto",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          <BuildIcon sx={{ color: "#FF6F00", marginRight: 1 }} /> Chỉnh sửa công
          thức
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            {errors.recipeName && (
              <p className="text-danger">{errors.recipeName}</p>
            )}
            <TextField
              label="Tên công thức"
              variant="outlined"
              fullWidth
              value={recipeName}
              onChange={handleInputChange(setRecipeName, "recipeName")}
              sx={{ color: "black" }}
            />
          </Box>

          <Box mb={2}>
            {errors.price && <p className="text-danger">{errors.price}</p>}
            <TextField
              label="Giá"
              variant="outlined"
              fullWidth
              type="number"
              value={price}
              onChange={handleInputChange(setPrice, "price")}
              sx={{ color: "black" }}
            />
          </Box>

          <Box mb={2}>
            {errors.numberOfService && (
              <p className="text-danger">{errors.numberOfService}</p>
            )}
            <TextField
              label="Số người phục vụ"
              variant="outlined"
              fullWidth
              type="number"
              value={numberOfService}
              onChange={handleInputChange(
                setNumberOfService,
                "numberOfService"
              )}
              required
              sx={{ color: "black" }}
            />
          </Box>

          <Box mb={2}>
            {errors.nutrition && (
              <p className="text-danger">{errors.nutrition}</p>
            )}
            <TextField
              label="Dinh dưỡng"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={nutrition}
              onChange={handleInputChange(setNutrition, "nutrition")}
              sx={{ color: "black" }}
            />
          </Box>

          <Box mb={2}>
            {errors.tutorial && (
              <p className="text-danger">{errors.tutorial}</p>
            )}
            <TextField
              label="Hướng dẫn"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={tutorial}
              onChange={handleInputChange(setTutorial, "tutorial")}
              sx={{ color: "black" }}
            />
          </Box>

          <Box mb={2}>
            {errors.video && <p className="text-danger">{errors.video}</p>}
            <TextField
              label="Video"
              variant="outlined"
              fullWidth
              value={video}
              onChange={handleInputChange(setVideo, "video")}
              sx={{ color: "black" }}
            />
          </Box>

          <Box mb={2}>
            {errors.description && (
              <p className="text-danger">{errors.description}</p>
            )}
            <TextField
              label="Chi tiết"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={handleInputChange(setDescription, "description")}
              sx={{ color: "black" }}
            />
          </Box>

          <Box mb={2}>
            {errors.ingredient && (
              <p className="text-danger">{errors.ingredient}</p>
            )}
            <TextField
              label="Nguyên liệu"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={ingredient}
              onChange={handleInputChange(setIngredient, "ingredient")}
              sx={{ color: "black" }}
            />
          </Box>
          <Box mb={2}>
            {errors.energy && <p className="text-danger">{errors.energy}</p>}
            <TextField
              label="Năng lượng"
              variant="outlined"
              fullWidth
              type="number"
              value={energy}
              onChange={handleInputChange(setEnergy, "energy")}
              sx={{ color: "black" }}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Ngày tạo"
              variant="outlined"
              fullWidth
              type="date"
              value={createDate}
              readOnly
              sx={{ color: "black" }}
            />
          </Box>

          <Box mb={2}>
            {errors.totalTime && (
              <p className="text-danger">{errors.totalTime}</p>
            )}
            <TextField
              label="Tổng thời gian(phút)"
              variant="outlined"
              fullWidth
              type="number"
              value={totalTime}
              onChange={handleInputChange(setTotalTime, "totalTime")}
              sx={{ color: "black" }}
            />
          </Box>

          <Box mb={2}>
            <TextField
              label="Ngày cập nhật"
              variant="outlined"
              fullWidth
              type="date"
              value={updatedDate}
              readOnly
              sx={{ color: "black" }}
            />
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle1">Tất cả các thẻ</Typography>
            <FormGroup>
              {tags.map((tag) => (
                <FormControlLabel
                  key={tag.tagId}
                  control={
                    <Checkbox
                      checked={selectedTagIds.includes(tag.tagId)} // Kiểm tra nếu tagId đã được chọn
                      onChange={handleTagSelection} // Gọi hàm khi người dùng thay đổi checkbox
                      value={tag.tagId} // Gửi tagId khi checkbox thay đổi
                    />
                  }
                  label={tag.tagName}
                />
              ))}
            </FormGroup>
          </Box>

          <Box mb={2}>
            <Typography variant="h6" color="black">
              Thẻ của công thức:
            </Typography>
            <ul>
              {recipe?.recipeTags?.length > 0 ? (
                recipe.recipeTags.map((tag, index) => (
                  <li key={index} style={{ color: "black" }}>
                    {tagMap[tag.tagId] || "Unknown"}
                  </li>
                ))
              ) : (
                <li style={{ color: "black" }}>Không có thẻ</li>
              )}
            </ul>
          </Box>

          <Box mb={2}>
            <Typography variant="h6" color="black">
              Các thẻ đã chọn:
            </Typography>
            <p style={{ color: "black" }}>{selectedTagNames.join(", ")}</p>
          </Box>

          <Box mb={2} className="flex justify-between gap-4">
            {/* Nút Back */}
            <Button
              type="button"
              variant="outlined"
              className="w-1/2 bg-gradient-to-r from-gray-100 to-gray-300 text-gray-700 border-none rounded-md shadow-md hover:from-gray-200 hover:to-gray-400 hover:shadow-lg transition-all"
              onClick={() => navigate(-1)} // Sử dụng navigate để quay lại trang trước
            >
              Quay lại
            </Button>

            {/* Nút Lưu */}
            <Button
              type="submit"
              variant="contained"
              className="w-1/2 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-md shadow-md hover:from-orange-400 hover:to-orange-600 hover:shadow-lg transition-all"
            >
              Lưu
            </Button>
          </Box>
        </form>
      </Container>
    </>
  );
};

export default EditRecipe;
