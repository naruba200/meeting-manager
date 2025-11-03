import React, { useState, useRef, useEffect } from 'react';
import '../../assets/styles/UserCSS/ChatBot.css';
import { sendChatMessage } from '../../services/chatService';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { text: 'Xin chào! Tôi là GrokBot, hỗ trợ quản lý lịch họp & dự án 📅. Bạn cần tạo lịch họp dự án nào ạ? (VD: "Tạo lịch họp title Test, start 2025-11-04T15:00:00, end 2025-11-04T16:00:00, mô tả Review, mời nam@company.com")', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Thêm tin nhắn user ngay
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);

    try {
      // Gọi service API
      const response = await sendChatMessage(userMessage);
      
      // Lấy reply đúng
      const replyText = response?.reply || response || 'Không có phản hồi từ bot 😅 (Kiểm tra backend)';
      
      // FIX: Nếu tự động tạo lịch thành công, enhance reply + toast + refresh web
      let enhancedReply = replyText;
      if (response?.meetingCreated) {
        enhancedReply = `${replyText}\n\n🎉 Lịch họp đã tự động tạo và lưu vào dự án! ID: ${response.meetingCreated.meetingId}\nChi tiết: ${response.meetingCreated.title} lúc ${response.meetingCreated.startTime}.\n(Refresh mục Cuộc họp để xem!).`;
        
        // Toast confirm (dùng alert đơn giản, thay bằng react-toastify nếu có)
        alert(`Tạo lịch thành công! ID: ${response.meetingCreated.meetingId} - Đã lưu DB & gửi email nếu có.`);
        
        // Nối thẳng refresh web: Emit event để MeetingList component reload data
        window.dispatchEvent(new CustomEvent('meetingCreated', { detail: response.meetingCreated }));
      }

      // Thêm tin nhắn bot
      setMessages(prev => [...prev, { text: enhancedReply, sender: 'bot' }]);
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
      const errorMsg = `Xin lỗi, có lỗi xảy ra: ${error.message || 'Unknown'}. Thử lại nhé! (Có thể thiếu info tạo lịch).`;
      setMessages(prev => [...prev, { text: errorMsg, sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        ChatBot - Hỗ trợ Dự án & Lịch họp 📅
      </div>

      {/* Khu vực tin nhắn */}
      <div className="messages-container" style={{ minHeight: '300px' }}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className={`message-bubble ${msg.sender}`}>
              {/* FIX: Multi-line */}
              {msg.text ? msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>) : <p>(Tin nhắn rỗng)</p>}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="loading message bot">
            <div className="message-bubble">
              Đang suy nghĩ... (Đang parse để tự động tạo lịch nếu đủ info!)
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="VD: Tạo lịch họp title Test, start 2025-11-04T15:00:00, end 2025-11-04T16:00:00, mô tả Review, mời nam@company.com"
          className="input-field"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="send-button"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatBot;