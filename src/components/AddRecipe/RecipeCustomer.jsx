import { useState, useEffect } from "react";
import { Row, Col, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import "./addrecipecus.css"
import { FiPlus, FiX } from "react-icons/fi";
const RecipeCustomer = () => {
  const [recipeName, setRecipeName] = useState("");
  const [numberOfService, setNumberOfService] = useState("");
  const [price, setPrice] = useState("");
  const [tags, setTags] = useState([]);
  const [recipeImage, setRecipeImage] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  //const [tagsVisible, setTagsVisible] = useState(false);
  const [nutrition, setNutrition] = useState("");
  const [tutorial, setTutorial] = useState(["", ""]);
  const [video, setVideo] = useState("");
  const [description, setDescription] = useState("");
  const [ingredient, setIngredients] = useState(["", ""]);
  const [createDate, setCreateDate] = useState("");
  const [totalTime, setTotalTime] = useState();
  const [createById, setcreateById] = useState("");
  const [censorNote, setCensorNote] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  useEffect(() => {
    const storedUserId = Cookies.get("UserId");
    console.log("Stored UserId:", storedUserId);
    if (storedUserId) {
      setcreateById(storedUserId);
    }
    const today = new Date().toISOString().slice(0, 10);
    setCreateDate(today);
    fetchActiveTags();
  }, []);

  const fetchActiveTags = async () => {
    try {
      //"https://localhost:7220/odata/Tag",
      //https://rmrbdapi.somee.com/odata/Tag
      const response = await axios.get("https://rmrbdapi.somee.com/odata/Tag", {
        params: {
          $filter: "status eq 1",
        },
        headers: {
          "Content-Type": "application/json",
          Token: "123-abc",
        },
      });
      console.log("API Response:", response.data); // Thêm dòng log này
      setTags(response.data);
    } catch (error) {
      console.error("Error fetching active tags:", error);
    }
  };

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
    if (!totalTime || isNaN(totalTime) || totalTime <= 0) {
      newErrors.totalTime = "Vui lòng nhập tổng thời gian hợp lệ.";
    }
    if (recipeImage.length === 0) {
      newErrors.recipeImage = "Ít nhất một hình ảnh là bắt buộc.";
    }
    if (selectedTagIds.length === 0) {
      newErrors.selectedTagIds = "Vui lòng chọn ít nhất một thẻ.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (image, recipeId) => {
    // const url = `https://localhost:7220/odata/UploadImage/Recipe/${recipeId}`;
    const url = `https://rmrbdapi.somee.com/odata/UploadImage/Recipe/${recipeId}`;
    const formData = new FormData();
    formData.append("image", image);
    formData.append("recipeId", recipeId);
    try {
      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Token: "123-abc",
        },
      });

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Upload failed with status code: ${response.status}`);
      }
    } catch (error) {
      console.error("There was an error uploading the image!", error);
      throw error;
    }
  };
  const saveRecipeTag = async (tagId, recipeId) => {
    // const urlRecipeTag = "https://localhost:7220/odata/RecipeTag";
    const urlRecipeTag = "https://rmrbdapi.somee.com/odata/RecipeTag";

    const RecipeTagData = {
      tagId,
      recipeId,
    };

    try {
      const result = await axios.post(urlRecipeTag, RecipeTagData, {
        headers: {
          "Content-Type": "application/json",
          Token: "123-abc",
        },
      });
      console.log("Response from RecipeTag server:", result);
    } catch (error) {
      console.error("Error saving RecipeTag:", error);
      throw new Error("Failed to save RecipeTag.");
    }
  };

  const handleSave = async () => {
    if (!validateFields()) return;
    // const url = "https://localhost:7220/odata/Recipe";
    const url = "https://rmrbdapi.somee.com/odata/Recipe";
    const formattedTutorial = tutorial.map((step, index) => `Bước ${index + 1}: ${step}`);
    const recipeData = {
      recipeName,
      numberOfService,
      price,
      createById,
      nutrition,
      tutorial: formattedTutorial.join(", "),
      ingredient: ingredient.join(", "),
      totalTime,
      createDate,
      description,
      video,
      censorNote,
      Energy: 123
    };

    console.log("Recipe data:", recipeData);
    setIsLoading(true);
    try {
      // Step 1: Save the recipe data
      const result = await axios.post(url, recipeData, {
        headers: {
          "Content-Type": "application/json",
          Token: "123-abc",
        },
      });
      const recipeId = result.data.recipeId;
      console.log("Response from server:", result);
      if (!recipeId) {
        throw new Error("Failed to retrieve recipe ID from server response.");
      }

      for (const tagId of selectedTagIds) {
        await saveRecipeTag(tagId, recipeId);
      }
      // Step 2: Upload images if any are selected
      if (recipeImage.length > 0) {
        for (const image of recipeImage) {
          await uploadImage(image, recipeId);
        }
      }

      clear();
      toast.success("Công thức và hình ảnh đã được thêm thành công!");
    } catch (error) {
      console.error("Error saving recipe or uploading images:", error);
      toast.error(`Failed to add recipe or upload images: ${error.message}`);
      setIsLoading(false);
    }
  };

  const clear = () => {
    setRecipeName("");
    setNumberOfService("");
    setPrice("");
    setRecipeImage([]);
    setSelectedTagIds([]);
    setNutrition("");
    setTutorial([]);
    setDescription("");
    setVideo("");
    setIngredients([]);
    setTotalTime("");
    const today = new Date().toISOString().slice(0, 10);
    setCreateDate(today); // Reset createDate to today's date
    setErrors({});
    setIsLoading(false);
  };
  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
  };
  const handleImageChange = (e) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      recipeImage: "",
    }));
    const files = Array.from(e.target.files);

    // Bắt đầu quá trình tải lên
    setIsUploading(true);
    setUploadComplete(false); // Đảm bảo "Lưu hoàn tất" không hiển thị khi bắt đầu tải lên

    // Giả lập tải lên trong 2 giây (bạn có thể thay bằng API thật)
    setTimeout(() => {
      // Sau khi tải lên hoàn tất, cập nhật trạng thái
      setIsUploading(false);
      setUploadComplete(true);
      setRecipeImage((prevImages) => [...prevImages, ...files]);
    }, 1000);
  };

  const removeImage = (index) => {
    setRecipeImage((prevImages) => {
      const updatedImages = prevImages.filter((_, i) => i !== index);
      // Nếu không còn ảnh nào, ẩn trạng thái "Lưu hoàn tất"
      if (updatedImages.length === 0) {
        setUploadComplete(false); // Ẩn "Lưu hoàn tất"
      }
      return updatedImages;
    });
  };

  const renderImageInputs = () => {
    return recipeImage.map((file, index) => (
      <Col key={index} className="mb-4">
        <div className="relative flex flex-col items-center">
          <img
            src={URL.createObjectURL(file)}
            alt={`Preview ${index}`}
            className="w-32 h-32 object-cover rounded-lg mb-2"
          />
          {/* Nút xóa ảnh */}
          <button
            onClick={() => removeImage(index)}
            className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700"
            disabled={isUploading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </Col>
    ));
  };

  // const toggleTagsVisibility = () => {
  //   setTagsVisible(!tagsVisible); // Toggle the visibility
  // };


  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredient];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredient, ""]); // Add an empty input field
  };

  const removeIngredient = (index) => {
    const newIngredients = ingredient.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  //
  const handleTutorialChange = (index, value) => {
    const updatedTutorial = [...tutorial];
    updatedTutorial[index] = value;
    setTutorial(updatedTutorial);
  };

  const addTutorialStep = () => {
    setTutorial([...tutorial, ""]); // Thêm một bước trống
  };

  const removeTutorialStep = (index) => {
    const updatedTutorial = tutorial.filter((_, idx) => idx !== index);
    setTutorial(updatedTutorial);
  };

  const [showNoteForm, setShowNoteForm] = useState(false);

  const handleAddNoteClick = () => {
    setShowNoteForm(true);
  };

  const handleCancelNote = () => {
    setShowNoteForm(false);
  };

  const toggleTagSelection = (tagId) => {
    const isSelected = selectedTagIds.includes(tagId);
    const updatedSelection = isSelected
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];

    setSelectedTagIds(updatedSelection);
  };

  return (
    <section className="section-center">
      <ToastContainer />
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <span className="flex justify-center text-orange-500 mr-2 text-5xl items-center">+</span> Viết món mới
        </h1>
        <hr className="mb-4" />
        {/* Form */}
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recipe Title */}
            <Col>
              <Form.Group controlId="recipeName">
                {errors.recipeName && (
                  <p className="text-danger">{errors.recipeName}</p>
                )}
                <Form.Control
                  type="text"
                  placeholder="Tên món: Món canh rau mướp đắng nhồi thịt"
                  value={recipeName}
                  onChange={handleInputChange(setRecipeName, "recipeName")}
                  disabled={isLoading}
                  className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400 "
                />
              </Form.Group>
              <Form.Group controlId="description" className="mt-4">
                {errors.description && (
                  <p className="text-danger">{errors.description}</p>
                )}
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Hãy chia sẻ với mọi người về món này của bạn nhé - ai đã truyền cảm hứng cho bạn, tại sao nó đặc biệt, bạn thích thưởng thức nó thế nào?"
                  value={description}
                  onChange={handleInputChange(setDescription, "description")}
                  disabled={isLoading}
                  className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 "
                />
              </Form.Group>
            </Col>
            {/* Photo Upload */}
            <div className="relative">
              <Form.Group controlId="recipeImage">
                {errors.recipeImage && (
                  <p className="text-sm text-red-500">{errors.recipeImage}</p>
                )}

                {/* Hiển thị vùng chọn ảnh khi chưa có ảnh */}
                {recipeImage.length === 0 && !isUploading && (
                  <label
                    htmlFor="fileInput"
                    className="block cursor-pointer bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-600 hover:bg-gray-300 hover:border-gray-600"
                  >
                    <h1 className="material-icons text-6xl my-4">
                      cloud_upload
                    </h1>
                    <p className="text-lg">Bạn đã đăng hình món mình nấu ở đây chưa?</p>
                    <p className="text-sm">Chia sẻ thành phần nấu nướng của bạn với mọi người nào!</p>
                    <input
                      type="file"
                      id="fileInput"
                      multiple
                      onChange={handleImageChange}
                      disabled={isUploading}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                )}

                {/* Hiển thị trạng thái "Đang tải" trong label nếu đang tải */}
                {isUploading && (
                  <label
                    htmlFor="fileInput"
                    className="block cursor-pointer bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-600 hover:bg-gray-200 hover:border-gray-400"
                  >
                    <div className="flex justify-center items-center">
                      <img
                        src="/images/loading-image.png"
                        alt="Đang tải..."
                        className="w-12 h-12 animate-spin"
                      />
                      <p className="ml-2 text-lg">Đang tải...</p>
                    </div>
                    <input
                      type="file"
                      id="fileInput"
                      multiple
                      onChange={handleImageChange}
                      disabled={true} // Disable input khi đang tải
                      accept="images/*"
                      className="hidden"
                    />
                  </label>
                )}

                {/* Hiển thị trạng thái "Lưu hoàn tất" nếu tải lên hoàn tất */}
                {uploadComplete && (
                  <div className="flex justify-center mt-3">
                    <span className="material-icons text-green-500">
                      check_circle
                    </span>
                    <p>Lưu hoàn tất</p>
                  </div>
                )}

                {/* Hiển thị ảnh đã chọn */}
                {recipeImage.length > 0 && !isUploading && (
                  <div className="flex flex-wrap gap-4 mt-3">
                    {renderImageInputs()}
                  </div>
                )}
              </Form.Group>
            </div>

          </div>

          <hr className="mb-8" />
          {/* Ingredients */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1">
              <h2 className="text-xl font-bold mb-4">Nguyên liệu</h2>
              {ingredient.map((ingredient_chirld, index) => (
                <Row className="mb-2" key={index}>
                  <Col>
                    <Form.Group controlId={`ingredients-${index}`}>
                      <Form.Control
                        type="text"
                        placeholder={`${index === 0 ? "250g bột" : "100ml nước"}`}
                        value={ingredient_chirld}
                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                        rows={4}
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                      />

                    </Form.Group>
                  </Col>
                  <Col xs="auto" className="d-flex align-items-center justify-content-center">
                    <Button
                      variant="link"
                      onClick={() => removeIngredient(index)}
                      className="text-danger"
                    >
                      <FiX size={24} />
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button
                variant="outline-warning" // Use Bootstrap's orange variant for the border
                onClick={addIngredient}
                className="custom-button d-flex align-items-center mt-4"
              >
                <FiPlus className="mr-2" />Thêm nguyên liệu
              </Button>
            </div>
            <div className="col-span-1">
              {/* Directions Section */}
              <h2 className="text-xl font-bold mb-4">Các bước</h2>
              {tutorial.map((step, index) => (
                <Row className="mb-2" key={index}>
                  <Col>
                    <Form.Group controlId={`tutorial-${index}`}>
                      <Form.Label>Bước {index + 1}</Form.Label>
                      {errors.tutorial && errors.tutorial[index] && (
                        <p className="text-danger">{errors.tutorial[index]}</p>
                      )}
                      <Form.Control
                        as="textarea"
                        placeholder={`${index === 0
                          ? "Làm nóng lò ở 350 ° F..."
                          : "Kết hợp các nguyên liệu khô trong một cái bát..."
                          }`}
                        value={step}
                        onChange={(e) => handleTutorialChange(index, e.target.value)}
                        rows={3}
                        disabled={isLoading}
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs="auto" className="d-flex align-items-center justify-content-center">
                    <Button
                      variant="link"
                      onClick={() => removeTutorialStep(index)}
                      className="text-danger"
                    >
                      <FiX size={24} />
                    </Button>
                  </Col>
                </Row>
              ))}

              <Button
                onClick={addTutorialStep}
                className="custom-button d-flex align-items-center mt-4"
              >
                <FiPlus className="mr-2" /> Thêm bước
              </Button>
            </div>
          </div>

          <hr className="mb-8" />

          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* Servings */}
            <Row className="mb-4">
              <Col>
                <Form.Group controlId="numberOfService">
                  <Form.Label>Khẩu phần</Form.Label>
                  {errors.numberOfService && (
                    <p className="text-danger">{errors.numberOfService}</p>
                  )}
                  <Form.Control
                    type="number"
                    placeholder="e.g. 8 người"
                    value={numberOfService}
                    onChange={handleInputChange(setNumberOfService, "numberOfService")}
                    disabled={isLoading}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Total Time */}
            <Row className="mb-4">
              <Col>
                <Form.Group controlId="totalTime">
                  <Form.Label>Tổng thời gian</Form.Label>
                  {errors.totalTime && (
                    <p className="text-danger">{errors.totalTime}</p>
                  )}
                  <Form.Control
                    type="number"
                    placeholder="e.g. 12 phút"
                    value={totalTime}
                    onChange={handleInputChange(setTotalTime, "totalTime")}
                    disabled={isLoading}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col>
                <Form.Group controlId="price">
                  <Form.Label>Giá</Form.Label>
                  {errors.price && (
                    <p className="text-danger">{errors.price}</p>
                  )}
                  <Form.Control
                    type="number"
                    placeholder="e.g. 5,000 vnd"
                    value={price}
                    onChange={handleInputChange(setPrice, "price")}
                    disabled={isLoading}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col>
                <Form.Group controlId="video">
                  <Form.Label>Video</Form.Label>
                  {errors.video && (
                    <p className="text-danger">{errors.video}</p>
                  )}
                  <Form.Control
                    type="text"
                    placeholder="e.g. link video"
                    value={video}
                    onChange={handleInputChange(setVideo, "video")}
                    disabled={isLoading}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col>
                <Form.Group controlId="createDate">
                  <Form.Label>Ngày tạo</Form.Label>
                  {errors.createDate && (
                    <p className="text-danger">{errors.createDate}</p>
                  )}
                  <Form.Control
                    type="text"
                    placeholder="Create Date"
                    value={createDate}
                    onChange={(e) => setCreateDate(e.target.value)}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col>
                <Form.Group controlId="nutrition">
                  <Form.Label>Dinh dưỡng</Form.Label>
                  {errors.nutrition && (
                    <p className="text-danger">{errors.nutrition}</p>
                  )}
                  <Form.Control
                    type="text"
                    placeholder="e.g. 120 calories"
                    value={nutrition}
                    onChange={handleInputChange(setNutrition, "nutrition")}
                    disabled={isLoading}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
          <Col>
            <Form.Group controlId="tags">
              <Form.Label className="fw-bold">Thể loại công thức</Form.Label>
              {errors.tag && <p className="text-danger">{errors.tag}</p>}
              <div className="tags-container">
                {tags.map((tag) => (
                  <button
                    key={tag.tagId}
                    type="button"
                    className={`tag-button ${selectedTagIds.includes(tag.tagId) ? 'selected' : ''}`}
                    onClick={() => toggleTagSelection(tag.tagId)}
                    disabled={isLoading}
                  >
                    <span className="tag-icon">{tag.icon}</span>
                    <span className="tag-name">{tag.tagName}</span>
                  </button>
                ))}
              </div>
              <Form.Control
                as="select"
                multiple
                value={selectedTagIds}
                onChange={() => { }}
                disabled={isLoading}
                className="custom-multi-select"
              >
                {tags.map((tag) => (
                  <option key={tag.tagId} value={tag.tagId}>
                    {tag.tagName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <hr className="nm-8" />
          <div className="notes-section">
            <h2 className="text-2xl font-bold mb-4">Ghi chú (Tùy chọn)</h2>
            <p>Thêm bất kỳ lời khuyên hữu ích nào về thay thế thành phần, phục vụ hoặc lưu trữ tại đây.</p>

            {!showNoteForm ? (
              // UI for Button (Image 1)
              <Button className="custom-button d-flex align-items-center mt-4" onClick={handleAddNoteClick}>
                + Thêm ghi chú
              </Button>
            ) : (
              // UI for Form (Image 2)
              <Form>
                <Form.Group controlId="censorNote">
                  <Form.Control
                    as="textarea"
                    value={censorNote}
                    rows={3}
                    onChange={handleInputChange(setCensorNote, "censorNote")}
                    placeholder="e.g. Cố gắng không trộn quá nhiều bột. Gấp nhẹ nhàng." />
                </Form.Group>
                <div className="d-flex justify-content-start" style={{ marginTop: "10px" }}>
                  <Button className="custom-button d-flex align-items-center mt-4" onClick={handleCancelNote}>
                    Cancel
                  </Button>
                </div>
              </Form>
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <Button variant="danger" onClick={handleSave} className="px-4 py-2 fw-bold">
              Gửi công thức
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default RecipeCustomer;
