import apiClient from './apiClient'; // Import apiClient (đã config baseURL: http://localhost:8080/api/chat)

// Gửi message qua POST /message
export const sendMessage = async (userId, message) => {
  try {
    const response = await apiClient.post('/chat/message', {
      message: message,
      userId: userId,
    });
    return response.data; // Trả về ChatMessageDTO từ backend
  } catch (error) {
    console.error('Lỗi gửi message:', error.response?.data || error.message);
    throw error; // Ném lỗi để component xử lý
  }
};

// Lấy lịch sử chat qua GET /history/{sessionId}
export const getHistory = async (sessionId) => {
  try {
    const response = await apiClient.get(`/chat/history/${sessionId}`);
    return response.data; // Trả về List<ChatMessageDTO>
  } catch (error) {
    console.error('Lỗi tải lịch sử:', error.response?.data || error.message);
    throw error;
  }
};