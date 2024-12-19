import axios from 'axios';
// import Cookies from 'js-cookie';
// const userId = Cookies.get("UserId");
// API lấy danh sách sách
export const getRecipeRates = async () => {
    try {
        const response = await axios.get(`https://rmrbdapi.somee.com/odata/RecipeRate`, {
            headers: {
                token: '123-abc',
                mode: 'no-cors'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching Recipe Rate:", error);
        throw error;
    }
};
export const saveRecipeRate = async (recipeId, accountId, ratepoint) => {
    const urlRecipeRate = "https://rmrbdapi.somee.com/odata/RecipeRate";
    const RecipeRateData = {
        recipeId,
        accountId,
        ratepoint,
    };

    try {
        const response = await axios.post(urlRecipeRate, RecipeRateData, {
            headers: {
                Token: "123-abc"
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error saving Recipe Rate:", error);
        throw new Error("Failed to save Recipe Rate.");
    }
};


// API lấy trung bình cộng ratepoint Recipe Rate
export const getRecipeRatePoint = async (recipeId) => {
    try {
        // Gọi API với URL mới `/RecipeRate/{recipeId}`
        const response = await axios.get(`https://rmrbdapi.somee.com/odata/RecipeRate?$apply=filter(recipeId eq ${recipeId})/aggregate(ratePoint with average as AvgRatePoint)`, {
            headers: {
                token: '123-abc'
            }
        });
        return response.data; // Trả về dữ liệu RecipeRate
    } catch (error) {
        console.error(`Error fetching RecipeRate with ID ${recipeId}:`, error);
        throw error;
    }
};
// API lấy số lượng Recipe Rate theo recipeId
export const getCountRecipeRateByRecipeId = async (recipeId) => {

    if (!recipeId) {
        console.error('Invalid recipeId:', recipeId);
        return 0;
    }
    const apiUrl = `https://rmrbdapi.somee.com/odata/RecipeRate?$filter=recipeId eq ${recipeId}`;
    const headers = { token: '123-abc' };
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            const response = await axios.get(apiUrl, { headers });
            return response.data.length || 0;
        } catch (error) {
            attempts++;
            console.error(`Error fetching RecipeRate with ID ${recipeId}, Attempt ${attempts}:`, error);

            // Nếu đã hết số lần thử thì ném ra lỗi
            if (attempts === maxAttempts) {
                throw new Error(`Failed to fetch RecipeRate after ${attempts} attempts.`);
            }

            // Tạm dừng trước khi thử lại (ví dụ 500ms)
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
};

// API cập nhật công thưc dựa theo Recipeid và AccountId
export const updateRecipeRate = async (recipeId, accountId, ratePoint) => {
    const urlRecipeRate = `https://rmrbdapi.somee.com/odata/RecipeRate/${recipeId}/${accountId}`;
    const RecipeRateData = {
        recipeId,
        accountId,
        ratePoint,
    };
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
        try {
            const response = await axios.put(urlRecipeRate, RecipeRateData, {
                headers: {
                    token: '123-abc'
                }
            });
            return response.data;
        } catch (error) {
            attempts++;
            if (attempts === maxAttempts) {
                console.error(`Error updating ratepoint with Recipeid ${recipeId} and AccountId ${accountId}:`, error);
                throw error;
            }
        }
    }


};
export const checkRated = async (recipeId, accountId) => {
    if (!accountId) {
        return 0; // Return 0 if no account online
    }
    try {
        // Making the API call
        const response = await axios.get(`https://rmrbdapi.somee.com/odata/RecipeRate/${recipeId}/${accountId}`, {
            headers: {
                token: "123-abc"
            }
        });
        if (response.status === 404) {
            return 0;
        } else if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return 0;
        }
    }
};



