import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Bot, User, Loader } from 'lucide-react';
import { chatbotService, productivityService } from '../services/api';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your productivity AI assistant. I can help you analyze your productivity data and answer questions about your performance. What would you like to know?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRecords = async () => {
    try {
      const data = await productivityService.getRecords();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage({
        records: records,
        query: inputMessage
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.response || 'I apologize, but I couldn\'t process your request. Please try again.'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: error.code === 'ERR_NETWORK' 
          ? 'Unable to connect to the server. Please ensure the backend is running.'
          : 'Sorry, I encountered an error while processing your request. Please try again later.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'Which Batch was most productive ?',
    'Show me which Batch used most Electric units',
    'which batch produced the worst outputs?',
    'How can I improve my productivity?',
    'show me worst performing Batch',
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <MessageCircle className="mr-3" size={36} />
            AI Chatbot
          </h1>
          <p className="text-white/70">
            Chat with AI about your productivity data and get personalized insights.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Questions */}
          <div className="lg:col-span-1">
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Questions</h3>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white text-sm transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm">
                  <strong>Records Available:</strong> {records.length}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  I can analyze your productivity calculations and provide insights.
                </p>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="card p-0 h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-primary-500' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}>
                      {message.type === 'user' ? (
                        <User size={16} className="text-white" />
                      ) : (
                        <Bot size={16} className="text-white" />
                      )}
                    </div>
                    
                    <div className={`max-w-[80%] p-4 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/10 text-white'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Loader size={16} className="text-white animate-spin" />
                        <span className="text-white">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-white/20 p-4">
                <form onSubmit={handleSubmit} className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me about your productivity..."
                    className="input-field flex-1"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className="btn-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;