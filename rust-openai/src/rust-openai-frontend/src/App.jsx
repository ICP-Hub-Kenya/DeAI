import { useState, useEffect } from 'react';
import { rust_openai_backend } from 'declarations/rust_openai_backend';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  const starterPrompts = [
    "Generate a Rust canister that implements a basic counter",
    "Write a function to call an HTTP outcall in a Rust canister",
    "Create a candid interface for a token canister",
    "Write a Motoko function for inter-canister calls",
    "Generate a React component that connects to an ICP canister"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % starterPrompts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { type: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputValue('');

    try {
      const response = await rust_openai_backend.generate_code(inputValue);
      // Parse the JSON response
      const parsedResponse = JSON.parse(response);
      // Extract just the content from the message
      const codeContent = parsedResponse.choices[0].message.content;
      const botMessage = { type: 'bot', content: codeContent };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { type: 'bot', content: 'Sorry, there was an error generating the response.' };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  };
  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>DeAI Code Assistant</h1>
        <p className="subtitle">Your AI-powered coding companion</p>
      </header>
      
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>👋 Hi! Try these example prompts:</p>
            <ul className="starter-prompts">
              {starterPrompts.map((prompt, index) => (
                <li key={index} onClick={() => setInputValue(prompt)} className="prompt-item">
                  {prompt}
                </li>
              ))}
            </ul>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'bot' ? '🤖' : '👤'}
            </div>
            <div className="message-content">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-avatar">🤖</div>
            <div className="loading-indicator">
              <span>●</span><span>●</span><span>●</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={starterPrompts[currentPlaceholder]}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default App;