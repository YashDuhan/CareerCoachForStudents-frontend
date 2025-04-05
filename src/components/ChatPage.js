import React, { useState, useEffect } from 'react';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Dummy messages and suggestions for initial display
  useEffect(() => {
    setMessages([
      { id: 1, text: 'Hello! I am your AI Career Coach. How can I help you today based on your resume?', sender: 'ai' },
      // Add more initial messages if needed
    ]);
    setSuggestions([
      'Software Engineer at Google', 
      'Data Scientist at Meta', 
      'Product Manager at StartupX',
      'UX Designer at Adobe'
      // Add more dummy suggestions
    ]);
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    const newUserMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages([...messages, newUserMessage]);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse = { id: Date.now() + 1, text: `Thinking about "${input}"... Here's some advice...`, sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    }, 1000);

    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-page container">
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your career..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
      <div className="suggestions-container">
        <h3>AI Career Suggestions</h3>
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
            // In a real app, these might be clickable links or have more details
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatPage; 