import axios from 'axios';
// import Cookies from 'js-cookie';
// const userId = Cookies.get("UserId");
// API lấy danh sách sách
export const getBookRates = async () => {
    try {
        const response = await axios.get(`https://rmrbdapi.somee.com/odata/BookRate`, {
            headers: {
                token: '123-abc',
                mode: 'no-cors'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching Book Rate:", error);
        throw error;
    }
};
export const saveBookRate = async (ratepoint, customerId, bookId) => {
    const urlBookRate = "https://rmrbdapi.somee.com/odata/BookRate";
    let dulieu=null;
    // Validate input data
    if (!ratepoint || !customerId || !bookId) {
        throw new Error("Invalid input: ratepoint, customerId, and bookId are required.");
    }

    const BookRateData = {
        ratepoint, 
        customerId,
        bookId,
    };

    try {
        const response = await axios.post(urlBookRate, BookRateData, {
            headers: {
                Token: "123-abc", // Use environment variable or default
            },
        });
        dulieu =response.data;
        return response.data;
    } catch (error) {
        console.error("Error saving Book Rate:", dulieu);
        throw new Error("Failed to save Book Rate. Please try again later.");
    }
};


// API lấy trung bình cộng ratepoint Book Rate
export const getBookRatePoint = async (bookId) => {
    try {
        // Gọi API với URL mới `/BookRate/{bookId}`
        const response = await axios.get(`https://rmrbdapi.somee.com/odata/BookRate?$apply=filter(bookId eq ${bookId})/aggregate(RATEPOINT with average as AvgRatePoint)`, {
            headers: {
                token: '123-abc'
            }
        });
        return response.data; // Trả về dữ liệu BookRate
    } catch (error) {
        console.error(`Error fetching BookRate with ID ${bookId}:`, error);
        throw error;
    }
};
// API lấy số lượng Book Rate theo bookId
export const getCountBookRateBybookId = async (bookId) => {

    if (!bookId) {
        console.error('Invalid bookId:', bookId);
        return 0;
    }
    const apiUrl = `https://rmrbdapi.somee.com/odata/BookRate?$filter=bookId eq ${bookId}`;
    const headers = { token: '123-abc' };
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            const response = await axios.get(apiUrl, { headers });
            return response.data.length || 0;
        } catch (error) {
            attempts++;
            console.error(`Error fetching BookRate with ID ${bookId}, Attempt ${attempts}:`, error);

            // Nếu đã hết số lần thử thì ném ra lỗi
            if (attempts === maxAttempts) {
                throw new Error(`Failed to fetch BookRate after ${attempts} attempts.`);
            }

            // Tạm dừng trước khi thử lại (ví dụ 500ms)
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
};

// API cập nhật công thưc dựa theo bookId và AccountId
export const updateBookRate = async (ratepoint, customerId,bookId) => {
    const urlBookRate = `https://rmrbdapi.somee.com/odata/BookRate/${customerId}/${bookId}`;
    const BookRateData = {
        ratepoint, customerId,bookId
    };
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
        try {
            const response = await axios.put(urlBookRate,BookRateData,{
                headers: {
                    token: '123-abc'
                }
            });
            return response.data;
        } catch (error) {
            attempts++;
            if (attempts === maxAttempts) {
                console.error(`Error updating ratepoint with bookId ${bookId} and AccountId ${customerId}:`, error);
                throw error;
            }
        }
    }

    
};
// API kiểm tra đã rate hay chưa
export const checkRated = async (customerId,bookId ) => {
    if (!customerId) {
        console.error('Invalid customerId:', customerId);
        return false;
    }
    let statuscheck = false;
    try {
        // Gọi API với URL mới `/BookRate/{bookId}/{customerId}`
        const response = await axios.get(`https://rmrbdapi.somee.com/odata/BookRate/${customerId}/${bookId}`, {
            headers: {
                token: '123-abc'
            }
        });       
        if (response.status === 200) {
            const ratepoint = response.data;
            return ratepoint ;
        }else {
            return 0;
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn(`Data not found for bookId ${bookId} and AccountId ${customerId}. Returning 0.`);
            return 0;
        }
    }
};