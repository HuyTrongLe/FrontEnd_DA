import Swal from "sweetalert2";
import axios from "axios";
import { getAccountData } from "../../services/CustomerService/CustomerService";

const HandleBuy = async (
  recipe,
  accountId,
  purchasedRecipes,
  getAccountInfo,
  getPurchasedRecipes,
  dataAccount,
  navigate
) => {
  if (!accountId) {
    Swal.fire({
      title: "Bạn chưa đăng nhập",
      text: "Hãy đăng nhập để thực hiện thao tác này!!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đăng nhập",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/login");
      }
    });
    return;
  }

  if (purchasedRecipes.has(recipe.recipeId)) {
    Swal.fire("Thông báo", "Bạn đã mua công thức này rồi.", "info");
    return;
  }
  if (Number(accountId) === Number(recipe.createById)) {
    Swal.fire({
      title: "Thông báo",
      text: "Đây là công thức mà bạn đã tạo, bạn muốn xem chứ?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Xem công thức",
      cancelButtonText: "Ở lại trang",
    }).then((result) => {
      if (result.isConfirmed) {
        // Điều hướng tới trang chi tiết công thức
        navigate(`/recipe-seller-detail/${recipe.recipeId}`);
      }
      // Nếu nhấn "Hủy", không làm gì cả, ở lại trang
    });
    return;
  }

  const confirmResult = await Swal.fire({
    title: "Xác nhận mua công thức",
    text: `Bạn có muốn mua công thức: ${recipe.recipeName} với giá ${recipe.price} đ không?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Xác nhận",
    cancelButtonText: "Hủy",
  });

  if (!confirmResult.isConfirmed) {
    return;
  }

  // Show "Transaction in Progress" message
  const loadingToast = Swal.fire({
    title: "Đang giao dịch...",
    html: "Vui lòng đợi trong khi chúng tôi xử lý giao dịch của bạn.",
    didOpen: () => {
      Swal.showLoading();
    },
    allowOutsideClick: false, // Prevent closing while loading
  });

  try {
    // Gọi tới API để lấy thông tin của seller
    const sellerResponse = await getAccountData(recipe.createById);
    const sellerData = sellerResponse;

    const newCoin = dataAccount.coin - recipe.price;
    if (newCoin < 0) {
      Swal.fire({
        title: "Thông báo",
        text: "Bạn không đủ tiền để thực hiện giao dịch này.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Nạp tiền",
        cancelButtonText: "Quay lại",
      }).then((result) => {
        if (result.isConfirmed) {
          // Điều hướng tới trang chi tiết công thức
          navigate(`/recharge`);
        }
        // Nếu nhấn "Hủy", không làm gì cả, ở lại trang
      });
      loadingToast.close();
      return;
    }

    // Dữ liệu của người mua (Dùng để trừ coin sau khi người mua thanh toán)

    const data = {
      coin: newCoin,
      email: dataAccount.email,
      userName: dataAccount.userName,
      googleId: dataAccount.googleId,
      roleId: dataAccount.roleId,
      accountStatus: dataAccount.accountStatus,
    };

    // Dữ liệu của người bán (Dùng để cộng coin sau khi người mua thanh toán)
    const dataSL = {
      coin: sellerData.coin + recipe.price,
      email: sellerData.email,
      userName: sellerData.userName,
      googleId: sellerData.googleId,
      roleId: sellerData.roleId,
      accountStatus: sellerData.accountStatus,
    };

    // Dữ liệu của recipe sau khi người dùng mua
    const dataPR = {
      recipeId: recipe.recipeId,
      customerId: accountId,
      numberOfService: recipe.numberOfService,
      nutrition: recipe.nutrition,
      tutorial: recipe.tutorial,
      ingredient: recipe.ingredient,
      purchasePrice: recipe.price,
      status: -1,
    };

    // Dữ liệu RT của người mua
    const dataRT = {
      recipeId: recipe.recipeId,
      customerId: accountId,
      coinFluctuations: parseFloat(-recipe.price),
      date: new Date().toISOString().slice(0, 10),
      status: 1,
      detail: "Buy recipe",
    };

    // Dữ liệu RT của người bán
    const dataRTSeller = {
      recipeId: recipe.recipeId,
      customerId: sellerData.accountId,
      coinFluctuations: parseFloat(recipe.price),
      date: new Date().toISOString().slice(0, 10),
      status: 1,
      detail: "Sell recipe",
    };
    // Đẩy dữ liệu của người mua (trừ coin)
    await axios.put(
      `https://rmrbdapi.somee.com/odata/Account/Info/${accountId}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Token: "123-abc",
        },
      }
    );
    // Đẩy dữ liệu của người bán (cộng coin)

    await axios.put(
      `https://rmrbdapi.somee.com/odata/Account/Info/${recipe.createById}`,
      dataSL,
      {
        headers: {
          "Content-Type": "application/json",
          Token: "123-abc",
        },
      }
    );

    // Lưu công thức cho người mua

    await axios.post(
      "https://rmrbdapi.somee.com/odata/PersonalRecipe",
      dataPR,
      {
        headers: {
          "Content-Type": "application/json",
          Token: "123-abc",
        },
      }
    );

    // Lưu recipe transaction của người mua
    await axios.post(
      "https://rmrbdapi.somee.com/odata/RecipeTransaction",
      dataRT,
      {
        headers: {
          "Content-Type": "application/json",
          Token: "123-abc",
        },
      }
    );

    // Lưu recipe transaction của người bán
    await axios.post(
      "https://rmrbdapi.somee.com/odata/RecipeTransaction",
      dataRTSeller,
      {
        headers: {
          "Content-Type": "application/json",
          Token: "123-abc",
        },
      }
    );

    Swal.fire(
      "Thành công",
      "Giao dịch mua công thức đã được thực hiện thành công!",
      "success"
    ).then(() => {
      window.location.reload(); // Reload lại trang
    });
    getPurchasedRecipes();
  } catch (error) {
    Swal.fire(
      "Lỗi",
      "Đã xảy ra lỗi trong quá trình giao dịch. Vui lòng thử lại sau.",
      "error"
    );
    console.error("Error during purchase process:", error);
  } finally {
    loadingToast.close(); // Close the loading toast when the process is done
  }
};

export default HandleBuy;
