import axios from 'axios';
const API_URL = 'https://rmrbdapi.somee.com/odata'; // Cấu hình URL API tổng quát
const TOKEN = '123-abc';


// Tạo instance của axios để dễ dàng thêm header cho tất cả các request
const apiInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Token': TOKEN, // Thêm header Token
    },
});
export const createNotification = async (NotificationData) => {
    try {
        const response = await apiInstance.post('/Notification', NotificationData);
        const commentdata = response.data;
        return commentdata
    } catch (error) {
        console.error("Error creating NotificationData:", error);
        throw error;
    }
};

export const getNotificationbyAccountId = async (accountId) => {
    try {
        if (!accountId) {
            return
        }
        const response = await apiInstance.get(`https://rmrbdapi.somee.com/odata/Notification?$filter=accountId eq ${accountId}`);
        return response.data;
    } catch (error) {
        console.error("Error creating NotificationData:", error);
        throw error;
    }
};