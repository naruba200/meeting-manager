import React, { useState, useEffect, useRef } from 'react';
import '../../assets/styles/UserCSS/ChatComponent.css';
import { sendMessage, getHistory } from '../../services/chatApi';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userId, setUserId] = useState(1); // Mặc định userId, có thể lấy từ props hoặc context
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll xuống cuối khi có message mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load history khi có sessionId
  useEffect(() => {
    if (sessionId) {
      loadHistory();
    }
  }, [sessionId]);

  const loadHistory = async () => {
    if (!sessionId) return;
    try {
      const history = await getHistory(sessionId);
      setMessages(history);
    } catch (error) {
      console.error('Lỗi tải lịch sử:', error);
      // Có thể thêm toast notification ở đây
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { content: inputMessage, senderType: 'USER' };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await sendMessage(userId, inputMessage);
      const botMessage = {
        content: response.content,
        senderType: 'BOT',
        chatSessionId: response.chatSessionId
      };
      setMessages(prev => [...prev, botMessage]);
      if (!sessionId) {
        setSessionId(response.chatSessionId);
      }
    } catch (error) {
      console.error('Lỗi gửi message:', error);
      const errorMessage = { content: 'Lỗi kết nối. Vui lòng thử lại!', senderType: 'SYSTEM' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat Bot Đặt Phòng Họp</h2>
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(parseInt(e.target.value))}
          placeholder="User ID"
          className="user-id-input"
        />
      </div>
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">Xin chào! Gõ "đặt phòng" để bắt đầu.</div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.senderType.toLowerCase()}`}>
              <div className="message-content">{msg.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-container">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập tin nhắn... (ví dụ: đặt phòng)"
          className="message-input"
          rows={1}
        />
        <button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
          {isLoading ? 'Đang gửi...' : 'Gửi'}
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;