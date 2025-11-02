import React, { useState, useRef, useEffect } from 'react';
import '../../assets/styles/UserCSS/ChatBot.css'; // Import CSS (chỉnh đường dẫn nếu cần)
import { sendChatMessage } from '../../services/chatService'; // Import từ service

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { text: 'Xin chào! Tôi là chatbot sử dụng Gemini AI. Bạn cần hỗ trợ gì?', sender: 'bot' }
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

    // Thêm tin nhắn user vào danh sách
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);

    try {
      // Gọi service API
      const reply = await sendChatMessage(userMessage);
      // Thêm tin nhắn bot
      setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
      setMessages(prev => [...prev, { text: 'Xin lỗi, có lỗi xảy ra khi kết nối với AI. Hãy thử lại!', sender: 'bot' }]);
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
        ChatBot với Gemini AI
      </div>

      {/* Khu vực tin nhắn */}
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender}`}
          >
            <div className={`message-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="loading">
            <div className="message-bubble">
              Đang suy nghĩ...
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
          placeholder="Nhập tin nhắn của bạn..."
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