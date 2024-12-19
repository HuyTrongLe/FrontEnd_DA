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
  const [tags, setTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [selectedTagNames, setSelectedTagNames] = useState([]);
  const [tagMap, setTagMap] = useState({});
  const [energy, setEnergy] = useState("");
  const [updatedDate, setUpdatedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [errors, setErrors] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchRecipeData = async () => {
    try {
      const recipeData = await getRecipeById(id);
      setRecipe(recipeData);
      setRecipeName(recipeData.recipeName);
      setPrice(recipeData.price);
      setNumberOfService(recipeData.numberOfService);
      setStatus(recipeData.status);
      setNutrition(recipeData.nutrition);
      if (recipeData.tutorial) {
        setTutorial(
          recipeData.tutorial
            .split("Bước")
            .map((ing) => ing.trim())
            .filter((ing) => ing !== "")
        );
      }
      setVideo(recipeData.video);
      setDescription(recipeData.description);
      //setIngredient(recipeData.ingredient);
      // Kiểm tra và tách ingredient nếu có dấu phẩy
      if (recipeData.ingredient) {
        setIngredient(
          recipeData.ingredient.split(",").map((ing) => ing.trim())
        );
      }
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
    tutorial.forEach((ing, index) => {
      if (!ing.trim()) {
        newErrors[`tutorial_${index}`] = `Bước ${
          index + 1
        } không được để trống.`;
      }
    });
    if (!video) newErrors.video = "Video là bắt buộc.";
    ingredient.forEach((ing, index) => {
      if (!ing.trim()) {
        newErrors[`ingredient_${index}`] = `Nguyên liệu ${
          index + 1
        } không được để trống.`;
      }
    });
    if (!description) newErrors.description = "Mô tả là bắt buộc.";
    if (!energy || isNaN(energy) || energy <= 0)
      newErrors.energy = "Vui lòng nhập giá trị hợp lệ.";

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
    const value = e.target.value;
    setter(value);

    // Nếu có dấu phẩy, tách thành các nguyên liệu riêng biệt và lưu vào ingredient
    if (field === "ingredient") {
      setIngredient(value.split(",").map((ing) => ing.trim()));
    }

    if (field === "tutorial") {
      setTutorial(value.split("Bước").map((ing) => ing.trim()));
    }
    setErrors((prevErrors) => ({ ...prevErrors, [field]: null }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    const updatedRecipe = {
      ...recipe,
      recipeName,
      price,
      numberOfService,
      status: -1,
      nutrition,
      tutorial: tutorial.join("Bước "),
      video,
      description,
      ingredient: ingredient.join(", "),
      createDate,
      updatedDate,
      totalTime,
      createById,
      energy,
    };
    Swal.fire({
      title: "Đang cập nhật...",
      text: "Vui lòng đợi trong giây lát.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      await updateRecipe(id, updatedRecipe);

      const oldTags = await getRecipeTags(id);

      const oldTagIds = oldTags.map((tag) => tag.tagId);

      for (const tagId of oldTagIds) {
        if (!selectedTagIds.includes(tagId)) {
          await deleteRecipeTag(id, tagId);
        }
      }

      for (const tagId of selectedTagIds) {
        if (!oldTagIds.includes(tagId)) {
          await addRecipeTag(tagId, id);
        }
      }

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
  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...ingredient];
    updatedIngredients[index] = value;
    setIngredient(updatedIngredients);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [`ingredient_${index}`]: null,
    }));
  };

  const handleTutorialChange = (index, value) => {
    const updatedTutorials = [...tutorial];
    updatedTutorials[index] = value;
    setTutorial(updatedTutorials);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [`tutorial_${index}`]: null,
    }));
  };
  const addIngredient = () => {
    setIngredient([...ingredient, ""]);
  };

  // Thêm một nguyên liệu mới
  const addTutorial = () => {
    setTutorial([...tutorial, ""]);
  };

  // Xóa một nguyên liệu
  const removeIngredient = (index) => {
    const updatedIngredients = ingredient.filter((_, i) => i !== index);
    setIngredient(updatedIngredients);
  };
  const removeTutorial = (index) => {
    const updatedTutorials = tutorial.filter((_, i) => i !== index);
    setTutorial(updatedTutorials);
  };
  if (!recipe) return <div>Đang tải...</div>;

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
            <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
              Hướng dẫn
            </Typography>
            {tutorial.map((ing, index) => (
              <Box key={index} display="flex" alignItems="center" mb={2}>
                <TextField
                  error={!!errors[`tutorial_${index}`]}
                  helperText={errors[`tutorial_${index}`]}
                  label={`Bước ${index + 1}`}
                  variant="outlined"
                  fullWidth
                  value={ing}
                  onChange={(e) => handleTutorialChange(index, e.target.value)}
                  sx={{ color: "black" }}
                  multiline
                  rows={4}
                />
                {tutorial.length > 1 && (
                  <Button
                    onClick={() => removeTutorial(index)}
                    variant="contained"
                    color="secondary"
                    sx={{ marginLeft: 1 }}
                  >
                    Xóa
                  </Button>
                )}
              </Box>
            ))}

            <Button
              onClick={addTutorial}
              variant="outlined"
              sx={{ marginTop: 1 }}
            >
              Thêm bước
            </Button>
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
            <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
              Nguyên liệu
            </Typography>
            {ingredient.map((ing, index) => (
              <Box key={index} display="flex" alignItems="center" mb={2}>
                <TextField
                  error={!!errors[`ingredient_${index}`]}
                  helperText={errors[`ingredient_${index}`]}
                  label={`Nguyên liệu ${index + 1}`}
                  variant="outlined"
                  fullWidth
                  value={ing}
                  onChange={(e) =>
                    handleIngredientChange(index, e.target.value)
                  }
                  sx={{ color: "black" }}
                  multiline
                  rows={1}
                />
                {ingredient.length > 1 && (
                  <Button
                    onClick={() => removeIngredient(index)}
                    variant="contained"
                    color="secondary"
                    sx={{ marginLeft: 1 }}
                  >
                    Xóa
                  </Button>
                )}
              </Box>
            ))}

            <Button
              onClick={addIngredient}
              variant="outlined"
              sx={{ marginTop: 1 }}
            >
              Thêm nguyên liệu
            </Button>
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
                      checked={selectedTagIds.includes(tag.tagId)}
                      onChange={handleTagSelection}
                      value={tag.tagId}
                    />
                  }
                  label={tag.tagName}
                />
              ))}
            </FormGroup>
            {errors.selectedTagIds && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.selectedTagIds}
              </Typography>
            )}
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

          <Box mb={2} className="flex justify-between gap-4">
            <Button
              type="button"
              variant="outlined"
              className="w-1/2 bg-gradient-to-r from-gray-100 to-gray-300 text-gray-700 border-none rounded-md shadow-md hover:from-gray-200 hover:to-gray-400 hover:shadow-lg transition-all"
              onClick={() => navigate(-1)}
            >
              Quay lại
            </Button>

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
