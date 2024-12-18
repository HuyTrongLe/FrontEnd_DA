import axios from "axios";
const API_URL = "https://rmrbdapi.somee.com/odata"; // Cấu hình URL API tổng quát
const TOKEN = "123-abc";

// Tạo instance của axios để dễ dàng thêm header cho tất cả các request
const apiInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Token: TOKEN,
  },
});

export const getAccountById = async (accountId) => {
  if (!accountId) {
    return ("no account online");   
  }
  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    try {
      const response = await apiInstance.get(`/Account/${accountId}`);
      return response.data;
    } catch (error) {
      attempts++;
      // Nếu đã hết số lần thử thì ném ra lỗi
      if (attempts === maxAttempts) {
        console.error(`Error fetching Account with ID ${accountId}:`, error);
        throw error;
      }
    }
  }
};

export const updateAccount = async (account) => {
  try {
    const response = await apiInstance.put(
      `/Account/info/${account.accountId}`,
      account
    );
    return response;
  } catch (error) {
    console.error(
      `Error updating Account with ID ${account.accountId}:`,
      error
    );
    throw error;
  }
};
export const getAccountByRoleId = async () => {
  try {
    const response = await axios.get(
      `https://rmrbdapi.somee.com/odata/Account?$filter=roleId eq 3`,
      {
        headers: {
          token: "123-abc",
          mode: "no-cors",
        },
      }
    );
    //console.log(response.data.userName);
    return response.data;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};
