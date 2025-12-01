// src/services/chatService.js

import apiClient from './apiClient'; // Import apiClient từ file bạn cung cấp

// Hàm gửi tin nhắn đến API và trả về reply từ bot
export const sendChatMessage = async (message) => {
  if (!message || !message.trim()) {
    throw new Error('Tin nhắn không được rỗng');
  }

  try {
    // Sử dụng apiClient để POST (tự động thêm token từ localStorage qua interceptor)
    const response = await apiClient.post('/chat', { message: message.trim() });

    // Kiểm tra response
    if (!response.data || !response.data.reply) {
      throw new Error('Không nhận được phản hồi từ AI');
    }

    return response.data.reply;
  } catch (error) {
    console.error('Lỗi khi gọi API chat:', error);
    
    // Nếu là lỗi Axios (ví dụ: 500), ném error để component xử lý
    if (error.response) {
      throw new Error(`Lỗi API: ${error.response.status} - ${error.response.data?.error || error.message}`);
    } else if (error.request) {
      throw new Error('Không kết nối được với server');
    } else {
      throw new Error(error.message);
    }
  }
};