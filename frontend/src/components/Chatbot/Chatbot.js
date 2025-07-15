import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader, MessageCircle, X, BarChart3, Book, Calendar, HelpCircle } from 'lucide-react';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState('recommendations');
  const [apiUsage, setApiUsage] = useState(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const chatModes = {
    recommendations: {
      title: 'Course Recommendations',
      icon: Book,
      placeholder: 'Tell me about your learning goals...',
      endpoint: '/chatgpt/recommendations'
    },
    'study-plan': {
      title: 'Study Plan Generator',
      icon: Calendar,
      placeholder: 'What do you want to learn and in what timeframe?',
      endpoint: '/chatgpt/study-plan'
    },
    'course-help': {
      title: 'Course Q&A',
      icon: HelpCircle,
      placeholder: 'Ask a question about your course...',
      endpoint: '/chatgpt/course-help'
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      fetchApiUsage();
      if (messages.length === 0) {
        setMessages([{
          id: Date.now(),
          text: "Hello! I'm your AI learning assistant. I can help you with course recommendations, study plans, and course-related questions. How can I assist you today?",
          sender: 'bot',
          timestamp: new Date()
        }]);
      }
    }
  }, [isOpen]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchApiUsage = async () => {
    try {
      const headers = getAuthHeaders();
      console.log('Fetching API usage...');
      const response = await axios.get(`${API_BASE_URL}/chatgpt/usage`, { headers });
      setApiUsage(response.data);
      console.log('API usage fetched:', response.data);
    } catch (error) {
      console.error('Failed to fetch API usage:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setError('');

    try {
      const headers = getAuthHeaders();
      const currentMode = chatModes[chatMode];
      
      let requestData = {};
      
      if (chatMode === 'recommendations') {
        requestData = { prompt: inputMessage };
      } else if (chatMode === 'study-plan') {
        requestData = { 
          goal: inputMessage,
          timeframe: 'As specified by user',
          skillLevel: 'Not specified',
          preferences: 'Not specified'
        };
      } else if (chatMode === 'course-help') {
        requestData = { 
          courseId: 'default-course-id',
          question: inputMessage 
        };
      }

      console.log('Making request to:', `${API_BASE_URL}${currentMode.endpoint}`);
      console.log('Request data:', requestData);

      const response = await axios.post(
        `${API_BASE_URL}${currentMode.endpoint}`,
        requestData,
        { headers }
      );

      console.log('Response received:', response.data);

      let botResponseText = '';
      
      if (chatMode === 'recommendations') {
        if (response.data.recommendations && response.data.recommendations.length > 0) {
          botResponseText = `${response.data.explanation}\n\n**📚 Recommended Courses:**\n`;
          response.data.recommendations.forEach((course, index) => {
            botResponseText += `\n**${index + 1}. ${course.title}**\n`;
            botResponseText += `   📊 Category: ${course.category}\n`;
            botResponseText += `   📈 Level: ${course.level}\n`;
            botResponseText += `   ⏱️ Duration: ${course.duration}\n`;
            botResponseText += `   💰 Price: $${course.price}\n`;
            botResponseText += `   ✨ Why recommended: ${course.reason}\n`;
          });
        } else {
          botResponseText = response.data.explanation || 'No suitable courses found for your request.';
        }
      } else if (chatMode === 'study-plan') {
        const studyPlan = response.data.studyPlan;
        if (studyPlan && studyPlan.overview) {
          botResponseText = `**📋 Study Plan Overview:**\n${studyPlan.overview}\n`;
          
          if (studyPlan.weeks && studyPlan.weeks.length > 0) {
            botResponseText += '\n**📅 Weekly Breakdown:**\n';
            studyPlan.weeks.forEach(week => {
              botResponseText += `\n**Week ${week.week}:** ${week.focus}\n`;
              botResponseText += `⏰ Time: ${week.timeAllocation}\n`;
              if (week.goals && week.goals.length > 0) {
                botResponseText += `🎯 Goals: ${week.goals.join(', ')}\n`;
              }
            });
          }
          
          if (studyPlan.tips && studyPlan.tips.length > 0) {
            botResponseText += '\n**💡 Tips for Success:**\n';
            studyPlan.tips.forEach(tip => {
              botResponseText += `• ${tip}\n`;
            });
          }
        } else {
          botResponseText = 'I couldn\'t generate a study plan. Please try rephrasing your request.';
        }
      } else if (chatMode === 'course-help') {
        botResponseText = response.data.answer || 'I couldn\'t generate a response for your question.';
        
        if (response.data.additionalResources && response.data.additionalResources.length > 0) {
          botResponseText += '\n\n**📖 Additional Resources:**\n';
          response.data.additionalResources.forEach(resource => {
            botResponseText += `• ${resource}\n`;
          });
        }
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setApiUsage(prev => ({
        ...prev,
        requestCount: response.data.requestCount || (prev?.requestCount + 1) || 1,
        requestsRemaining: response.data.requestsRemaining || (prev?.requestsRemaining - 1) || 249
      }));

    } catch (error) {
      console.error('Chat error:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.response?.status === 429) {
        errorMessage = 'API request limit exceeded. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'No authentication token found') {
        errorMessage = 'Please log in to use the chatbot.';
      }

      setError(errorMessage);
      const errorBotMessage = {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      text: "Chat cleared! How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={index} className="mb-1 font-bold text-purple-200">{line.slice(2, -2)}</div>;
      }
      if (line.startsWith('•')) {
        return <div key={index} className="mb-1 ml-4">{line}</div>;
      }
      return <div key={index} className="mb-1">{line}</div>;
    });
  };

  const ChatModeSelector = () => (
    <div className="flex gap-2 p-2 mb-4 bg-gray-800 rounded-lg">
      {Object.entries(chatModes).map(([key, mode]) => {
        const IconComponent = mode.icon;
        return (
          <button
            key={key}
            onClick={() => setChatMode(key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              chatMode === key
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <IconComponent size={16} />
            <span className="hidden sm:inline">{mode.title}</span>
          </button>
        );
      })}
    </div>
  );

  const ApiUsageIndicator = () => (
    apiUsage && (
      <div className="p-3 mb-4 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={16} className="text-purple-400" />
          <span className="text-sm font-medium text-white">API Usage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-700 rounded-full">
            <div 
              className={`h-2 rounded-full transition-all ${
                apiUsage.usagePercentage > 80 ? 'bg-red-500' : 
                apiUsage.usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${apiUsage.usagePercentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">
            {apiUsage.requestCount}/{apiUsage.maxRequests}
          </span>
        </div>
      </div>
    )
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed z-50 p-4 text-white transition-all duration-300 transform rounded-full shadow-lg bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-xl hover:scale-110"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-gray-900 rounded-lg shadow-2xl z-50 flex flex-col border border-gray-700">
      {/* Header */}
      <div className="p-4 text-white rounded-t-lg bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot size={20} />
            <h3 className="font-semibold">AI Learning Assistant</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Chat Mode Selector */}
      <div className="p-4 border-b border-gray-700">
        <ChatModeSelector />
        <ApiUsageIndicator />
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-purple-600 text-white'
                  : message.isError
                  ? 'bg-red-900 text-red-200'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.sender === 'bot' && (
                  <Bot size={16} className="flex-shrink-0 mt-1" />
                )}
                {message.sender === 'user' && (
                  <User size={16} className="flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  {typeof message.text === 'string' ? formatMessage(message.text) : message.text}
                </div>
              </div>
              <div className="mt-2 text-xs opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="p-3 text-gray-200 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Bot size={16} />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={chatModes[chatMode].placeholder}
            className="flex-1 p-2 text-white bg-gray-800 border border-gray-600 rounded-lg resize-none focus:border-purple-500 focus:outline-none"
            rows="1"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="p-2 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-600"
          >
            {isTyping ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        
        {error && (
          <div className="mt-2 text-sm text-red-400">{error}</div>
        )}
        
        <div className="flex gap-2 mt-2">
          <button
            onClick={clearChat}
            className="text-xs text-gray-400 transition-colors hover:text-white"
          >
            Clear Chat
          </button>
          <button
            onClick={fetchApiUsage}
            className="text-xs text-gray-400 transition-colors hover:text-white"
          >
            Refresh Usage
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;

