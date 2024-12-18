import { useState, useEffect,useRef } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  CircularProgress,
  Link,
} from "@mui/material";
import Sidebar from "../../Customer/Sidebar";
import {fetchPersonalRecipes} from "../../services/CustomerService/CustomerService"
import { decryptData } from "../../Encrypt/encryptionUtils";
const GetListSaveRecipe = () => {
  const [data, setData] = useState([]); 
  const [accountId, setAccountID] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();
  const isFetchCalled = useRef(false);
  useEffect(() => {
    if (!isFetchCalled.current) {
      isFetchCalled.current = true; 
      const storedUserId = decryptData(Cookies.get("UserId"));
      if (storedUserId) {
        setAccountID(storedUserId);
      }
      getData();
    }
  }, []);

  const getData = async () => {
    try {
      setLoading(true); 
      const accountId = decryptData(Cookies.get("UserId"));
      const fetchedData = await fetchPersonalRecipes(accountId);
      setData(fetchedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (recipeId) => {
    navigate(`/editrecipecustomer-recipe/${recipeId}`);
  };
  const handleDetails = (recipeId) => {
    navigate(`/recipecustomer-detail/${recipeId}`);
  };
  return (
    <section className="flex flex-col md:flex-row justify-center items-start p-4 space-y-8 md:space-y-0 md:space-x-8">
      <Sidebar />
      <div className="flex flex-col">
        <div
          className="section-center w-[1140px] bg-white p-4 rounded-lg shadow-md flex flex-col text-xl"
        >
          <h2 className="text-2xl font-bold text-gray-800 pb-10">
            Công thức nấu ăn đã lưu
          </h2>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
                width: "120vh"
              }}
            >
              <CircularProgress />
            </Box>
          ) : data.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: "center",
              }}
            >
              {data.map((recipe) => (
                <Card
                  key={recipe.recipeId}
                  sx={{
                    display: "flex",
                    flexDirection: "column", 
                    maxWidth: 350,
                    width: "100%",
                    flex: "1 1 calc(33.333% - 16px)", 
                    "@media (max-width: 900px)": {
                      flex: "1 1 calc(50% - 16px)", 
                    },
                    "@media (max-width: 600px)": {
                      flex: "1 1 100%", 
                    },
                  }}
                >
                  {recipe.images && recipe.images.length > 0 ? (
                    <CardMedia
                      className="block w-full h-60 mb-4 object-cover object-center rounded-lg"
                      component="img"
                      height="140"
                      image={recipe.images[0].imageUrl}
                      alt={`${recipe.recipeName} Image`}
                    />
                  ) : (
                    <CardMedia
                      className="block w-full h-60 mb-4 object-cover object-center rounded-lg"
                      component="div"
                      sx={{
                        height: 140,
                        backgroundColor: "#f0f0f0",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "#888",
                        fontSize: "1rem",
                      }}
                    >
                      No Image Available
                    </CardMedia>
                  )}
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column", 
                      justifyContent: "space-between",
                      minHeight: 200, 
                      flexGrow: 1, 
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {recipe.recipeName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {recipe.description || "No description"}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        marginTop: "auto",
                        flexDirection: "row",
                        width: "100%",
                      }}
                    >
                      <Button
                        variant="contained"
                        onClick={() => handleEdit(recipe.recipeId)}
                        sx={{
                          background: "linear-gradient(45deg, #FF6F00, #FF8F00)",
                          color: "white", 
                          "&:hover": {
                            background: "linear-gradient(45deg, #FF8F00, #FF6F00)", 
                          },
                          boxShadow: 2, 
                          flex: 1, 
                        }}
                      >
                        Chỉnh sửa
                      </Button>

                      <Button
                        variant="contained"
                        onClick={() => handleDetails(recipe.recipeId)}
                        sx={{
                          background: "linear-gradient(45deg, #FF6F00, #FF8F00)",
                          color: "white",
                          "&:hover": {
                            background: "linear-gradient(45deg, #FF8F00, #FF6F00)", 
                          },
                          boxShadow: 2, 
                          flex: 1, 
                        }}
                      >
                        Chi tiết
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: 20,
              }}
            > 
              <Typography
                variant="h6"
                color="text.primary"
                sx={{ fontWeight: "bold", textAlign: "center" }}
              >
                Bạn chưa có công thức nào đã lưu.
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ marginTop: 2, textAlign: "center", lineHeight: 1.5 }}
              >
                Hãy tới trang này để làm đầy bộ sưu tập của bạn nhé!{" "}
                <Link
                  href="/recipe"
                  color="primary"
                  sx={{ fontWeight: "bold", textDecoration: "underline" }}
                >
                  Mua công thức ngay!
                </Link>
              </Typography>
            </Box>
          )}
        </div>
      </div>
    </section>
  );
};

export default GetListSaveRecipe;
