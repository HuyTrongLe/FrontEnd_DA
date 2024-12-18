import axios from "axios";
const API_URL = "https://rmrbdapi.somee.com/odata";
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Token: "123-abc",
};
const DEFAULT_HEADERS_FORM = {
  "Content-Type": "multipart/form-data",
  Token: "123-abc",
};
export const listAccountProfile = async () => {
  const result = await axios.get(`${API_URL}/AccountProfile`, {
    headers: DEFAULT_HEADERS,
  });
  return result.data;
};

export const listRecipe = async () => {
  const result = await axios.get(`${API_URL}/Recipe`, {
    headers: DEFAULT_HEADERS,
  });
  return result.data;
};

export const listEbook = async () => {
  const result = await axios.get(`${API_URL}/Ebook`, {
    headers: DEFAULT_HEADERS,
  });
  return result.data;
};

export const listBook = async () => {
  const result = await axios.get(`${API_URL}/Book`, {
    headers: DEFAULT_HEADERS,
  });
  return result.data;
};

export const listAccountSellerAndCustomer = async () => {
  const result = await axios.get(
    `${API_URL}/Account?$filter=roleId eq 1 or roleId eq 2`,
    {
      headers: DEFAULT_HEADERS,
    }
  );
  return result.data;
};

export const updateAccountProfile = async (
  accountId,
  updatedAccountProfile
) => {
  const result = await axios.put(
    `${API_URL}/AccountProfile/Censor/${accountId}`,
    updatedAccountProfile,
    { headers: DEFAULT_HEADERS }
  );
  return result.data;
};

export const updateAccount = async (accountId, updatedAccount) => {
  const result = await axios.put(
    `${API_URL}/Account/Info/${accountId}`,
    updatedAccount,
    {
      headers: DEFAULT_HEADERS,
    }
  );
  return result.data;
};

export const updateBook = async (bookId, updatedBook) => {
  const result = await axios.put(`${API_URL}/Book/${bookId}`, updatedBook, {
    headers: DEFAULT_HEADERS,
  });
  return result.data;
};
export const updateEbook = async (ebookId, updatedEbook) => {
  const result = await axios.put(`${API_URL}/Ebook/${ebookId}`, updatedEbook, {
    headers: DEFAULT_HEADERS,
  });
  return result.data;
};
export const getBook = async (bookId) => {
  const result = await axios.get(`${API_URL}/Book/${bookId}`, {
    headers: DEFAULT_HEADERS,
  });
  return result.data;
};
