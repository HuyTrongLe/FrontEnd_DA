import axios from 'axios';
const API_URL = 'https://rmrbdapi.somee.com/odata';
const TOKEN = '123-abc';


const apiInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Token': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor to log requests
apiInstance.interceptors.request.use(request => {
    console.log('API Request:', {
        url: request.url,
        method: request.method,
        headers: request.headers,
        data: request.data
    });
    return request;
});

// Add response interceptor to log responses
apiInstance.interceptors.response.use(
    response => {
        console.log('API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    error => {
        console.error('API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.config?.headers
        });
        return Promise.reject(error);
    }
);

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

export const getCoinTransactionByAccountId = async (accountId) => {
  if (!accountId) return 0;
  
  const cacheKey = `coinTransaction_${accountId}`;
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await apiInstance.get(`/CoinTransaction?$filter=CustomerId eq ${accountId} and status eq 1&$orderby=date desc`);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error(`API Error fetching transactions for Account ${accountId}:`, error.message);
    return []; // Return empty array instead of throwing
  }
};

export const getCoinTransactionByCoinTransactionId = async (coinTransactionId) => {
    if (!coinTransactionId) {
        return 0;
    }
    try {
        const response = await apiInstance.get(`/CoinTransaction?$filter=CoinTransactionId eq ${coinTransactionId}`);
        return response.data; 
    } catch (error) {
        console.error(`Error fetching Account with ID ${coinTransactionId}:`, error);
        throw error;
    }
}

export const addCoinTransaction = async (newCoinTransaction) => {
    try {
        console.log('Sending coin transaction:', newCoinTransaction); // Debug log
        const response = await apiInstance.post('/CoinTransaction', newCoinTransaction);
        // Check if the request was successful even with empty response
        if (response.status === 200) {
            return { data: newCoinTransaction, status: 200 }; // Return the sent data if no response data
        }
        return response;
    } catch (error) {
        console.error(`Error adding CoinTransaction:`, error);
        throw error;
    }
};

export const getWithdrawCoinTransactionByAccountId = async (accountId) => {
    if (!accountId) {
        return 0;
    }
    try {
        const response = await apiInstance.get(`/CoinTransaction?$filter=CustomerId eq ${accountId} and coinFluctuations lt 0&$orderby=date desc`);
        return response.data; 
    } catch (error) {
        console.error(`Error fetching Account with ID ${accountId}:`, error);
        throw error;
    }
};

export const getNotDonWithdrawCoinTransactionByAccountId = async (accountId) => {
    if (!accountId) {
        return 0;
    }
    try {
        const response = await apiInstance.get(`/CoinTransaction?$filter=CustomerId eq ${accountId} and coinFluctuations lt 0 and status eq -1`);
        return response.data; 
    } catch (error) {
        console.error(`Error fetching Account with ID ${accountId}:`, error);
        throw error;
    }
};

export const getWithdraw = async () => {
  try {
    const response = await apiInstance.get('/CoinTransaction?$filter=coinFluctuations lt 0 and status eq -1');
    return response.data;
  } catch (error) {
    console.error('API Error fetching withdrawals:', error.message);
    return []; // Return empty array instead of throwing
  }
};

export const updateCoinTransaction = async (coinTransaction) => {
    try {
        const response = await apiInstance.put(`/CoinTransaction/${coinTransaction.coinTransactionId}`, coinTransaction);
        return response; 
    } catch (error) {
        console.error(`Error updating CoinTransaction with ID ${coinTransaction.coinTransactionId}:`, error);
        throw error;
    }
}
// Create book transaction record
export const createBookTransaction = async (customerId, orderId, amount, paymentType) => {
    try {
        const transactionPayload = {
            customerId: parseInt(customerId),
            orderId: parseInt(orderId),
            moneyFluctuations: paymentType === 2 ? amount : null, // Fixed field name to match API
            coinFluctuations: paymentType === 1 ? amount : null, // If COINS (type 1), use amount
            date: new Date().toISOString(),
            details: paymentType === 1 ? 'Thanh toán bằng xu' : 'Thanh toán khi nhận hàng',
            status: 1
        };

        const response = await axios.post('/BookTransaction', transactionPayload, {
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
                'Token': TOKEN,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating book transaction:', error);
        throw error;
    }
};

export const createEbookTransaction = async (customerId, ebookId, price) => {
    try {
        console.log('Creating ebook transaction with:', { customerId, ebookId, price }); // Debug log
        
        // Get account data
        const accountResponse = await apiInstance.get(`/Account/${customerId}`);
        if (!accountResponse.data) {
            throw new Error('Account data not found');
        }

        const account = accountResponse.data;
        const currentBalance = account?.coin ?? account?.Coin ?? 0;
        
        console.log('Current balance:', currentBalance, 'Price:', price);
        
        if (currentBalance < price) {
            throw new Error(`Số dư xu không đủ để thực hiện giao dịch (Cần ${price} xu, hiện có ${currentBalance} xu)`);
        }

        // 1. Create ebook transaction
        const ebookTransactionPayload = {
            CustomerId: parseInt(customerId),
            EbookId: parseInt(ebookId), // Make sure ebookId is properly parsed
            CoinFluctuations: -parseFloat(price),
            Date: new Date().toISOString(),
            Detail: `Mua ebook #${ebookId}`,
            Status: 1
        };

        console.log('Sending ebook transaction payload:', ebookTransactionPayload);
        const ebookTransactionResponse = await apiInstance.post('/EbookTransaction', ebookTransactionPayload);

        // 2. Update account balance
        const updatedAccount = {
            ...account,
            accountId: parseInt(customerId),
            coin: currentBalance - parseFloat(price)
        };

        try {
            await apiInstance.put(`/Account/${customerId}`, updatedAccount);
        } catch (firstError) {
            console.error('First update attempt failed:', firstError);
            await apiInstance.put(`/Account/info/${customerId}`, updatedAccount);
        }

        // 3. Add to bookshelf
        const bookshelfPayload = {
            CustomerId: parseInt(customerId),
            EBookId: parseInt(ebookId), // Note: Changed from EbookId to EBookId to match API
            RatePoint: null,
            PurchasePrice: parseFloat(price),
            PurchaseDate: new Date().toISOString(),
            Status: 1
        };

        console.log('Adding to bookshelf with payload:', bookshelfPayload); // Debug log

        try {
            const bookshelfResponse = await apiInstance.post('/Bookshelf', bookshelfPayload);
            console.log('Bookshelf response:', bookshelfResponse.data); // Debug log
        } catch (bookshelfError) {
            console.error('Failed to add to bookshelf:', bookshelfError);
            try {
                await apiInstance.post('/Bookshelf/Add', bookshelfPayload);
            } catch (altError) {
                console.error('Alternative bookshelf addition failed:', altError);
            }
        }

        // 4. Fetch updated bookshelf
        const bookshelfResponse = await apiInstance.get(`/Bookshelf?$filter=CustomerId eq ${customerId} and Status eq 1`);
        console.log('Final bookshelf response:', bookshelfResponse.data); // Debug log

        return {
            ebookTransaction: ebookTransactionResponse.data,
            updatedBalance: currentBalance - parseFloat(price),
            previousBalance: currentBalance,
            purchasedEbookId: parseInt(ebookId) // Add this to track which book was purchased
        };
    } catch (error) {
        console.error('Error in createEbookTransaction:', error);
        throw error;
    }
};

export const getUserPurchasedEbooks = async (customerId) => {
    try {
        // Get all successful ebook transactions for the user
        const response = await apiInstance.get(`/EbookTransaction?$filter=CustomerId eq ${customerId} and Status eq 1`);
        
        if (!response.data || !response.data.value) {
            return [];
        }

        // Create a Set to store unique ebookIds (in case of multiple transactions for the same ebook)
        const uniqueEbookIds = new Set();
        response.data.value.forEach(transaction => {
            if (transaction.ebookId) {
                uniqueEbookIds.add(transaction.ebookId);
            }
        });

        // Convert Set to array and fetch ebook details for each ID
        const purchasedEbooks = await Promise.all(
            Array.from(uniqueEbookIds).map(async (ebookId) => {
                try {
                    const ebookResponse = await apiInstance.get(`/Ebook/${ebookId}`);
                    return ebookResponse.data;
                } catch (error) {
                    console.error(`Error fetching ebook details for ID ${ebookId}:`, error);
                    return null;
                }
            })
        );

        // Filter out any null values from failed requests
        return purchasedEbooks.filter(ebook => ebook !== null);
    } catch (error) {
        console.error('Error fetching user purchased ebooks:', error);
        throw new Error('Không thể lấy danh sách sách đã mua. Vui lòng thử lại sau.');
    }
};

export const checkEbookOwnership = async (customerId, ebookId) => {
    try {
        const response = await apiInstance.get(
            `/EbookTransaction?$filter=CustomerId eq ${customerId} and EbookId eq ${ebookId} and Status eq 1`
        );
        
        return response.data && response.data.value && response.data.value.length > 0;
    } catch (error) {
        console.error('Error checking ebook ownership:', error);
        throw new Error('Không thể kiểm tra quyền sở hữu sách. Vui lòng thử lại sau.');
    }
};

// Get user's bookshelf
export const getUserBookshelf = async (customerId) => {
    try {
        const response = await apiInstance.get(`/Bookshelf?$filter=CustomerId eq ${customerId} and Status eq 1`);
        
        if (!response.data || !response.data.value) {
            return [];
        }

        // Fetch full ebook details for each bookshelf entry
        const bookshelfWithDetails = await Promise.all(
            response.data.value.map(async (bookshelfItem) => {
                try {
                    const ebookResponse = await apiInstance.get(`/Ebook/${bookshelfItem.ebookId}`);
                    return {
                        ...bookshelfItem,
                        ebookDetails: ebookResponse.data
                    };
                } catch (error) {
                    console.error(`Error fetching ebook details for ID ${bookshelfItem.ebookId}:`, error);
                    return null;
                }
            })
        );

        return bookshelfWithDetails.filter(item => item !== null);
    } catch (error) {
        console.error('Error fetching user bookshelf:', error);
        throw new Error('Không thể lấy danh sách tủ sách. Vui lòng thử lại sau.');
    }
};

// Add ebook to user's bookshelf
export const addToBookshelf = async (customerId, ebookId, price) => {
    try {
        const bookshelfPayload = {
            CustomerId: parseInt(customerId),
            EbookId: parseInt(ebookId),
            RatePoint: null,
            PurchasePrice: parseFloat(price),
            PurchaseDate: new Date().toISOString(),
            Status: 1
        };

        const response = await apiInstance.post('/Bookshelf', bookshelfPayload);
        return response.data;
    } catch (error) {
        console.error('Error adding to bookshelf:', error);
        throw new Error('Không thể thêm sách vào tủ sách. Vui lòng thử lại sau.');
    }
};

// Check if an ebook is in user's bookshelf
export const checkBookshelfOwnership = async (customerId, ebookId) => {
    try {
        const response = await apiInstance.get(
            `/Bookshelf?$filter=CustomerId eq ${customerId} and EbookId eq ${ebookId} and Status eq 1`
        );
        
        return response.data && response.data.value && response.data.value.length > 0;
    } catch (error) {
        console.error('Error checking bookshelf ownership:', error);
        throw new Error('Không thể kiểm tra quyền sở hữu sách. Vui lòng thử lại sau.');
    }
};
