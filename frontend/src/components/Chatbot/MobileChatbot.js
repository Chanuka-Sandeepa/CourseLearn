import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader, MessageCircle, X, BarChart3, Book, Calendar, HelpCircle, Menu } from 'lucide-react';
import axios from 'axios';

const MobileChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState('recommendations');
  const [apiUsage, setApiUsage] = useState(null);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const messagesEndRef = useRef(null);

  const chatModes = {
    recommendations: {
      title: 'Course Recommendations',
      icon: Book,
      placeholder: 'Tell me about your learning goals...',
      endpoint: '/chatgpt/recommendations'
    },
    'study-plan': {
      title: 'Study Plan',
      icon: Calendar,
      placeholder: 'What do you want to learn and when?',
      endpoint: '/chatgpt/study-plan'
    },
    'course-help': {
      title: 'Course Q&A',
      icon: HelpCircle,
      placeholder: 'Ask about your course...',
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
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: Date.now(),
        text: "Hello! I'm your AI learning assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      }]);
      fetchApiUsage();
    }
  }, [isOpen]);

  const fetchApiUsage = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/chatgpt/usage`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApiUsage(response.data);
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

    try {
      const token = localStorage.getItem('token');
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

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}${currentMode.endpoint}`,
        requestData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let botResponseText = '';
      
      if (chatMode === 'recommendations') {
        if (response.data.recommendations && response.data.recommendations.length > 0) {
          botResponseText = `${response.data.explanation}\n\n📚 Recommended Courses:\n`;
          response.data.recommendations.forEach((course, index) => {
            botResponseText += `\n${index + 1}. ${course.title}\n`;
            botResponseText += `   📊 Level: ${course.level}\n`;
            botResponseText += `   ⏱️ Duration: ${course.duration}\n`;
            botResponseText += `   💰 Price: $${course.price}\n`;
            botResponseText += `   ✨ ${course.reason}\n`;
          });
        } else {
          botResponseText = response.data.explanation || 'No suitable courses found.';
        }
      } else if (chatMode === 'study-plan') {
        const studyPlan = response.data.studyPlan;
        if (studyPlan.overview) {
          botResponseText = `📋 Study Plan:\n${studyPlan.overview}\n`;
          
          if (studyPlan.weeks && studyPlan.weeks.length > 0) {
            botResponseText += '\n📅 Weekly Plan:\n';
            studyPlan.weeks.slice(0, 3).forEach(week => {
              botResponseText += `\nWeek ${week.week}: ${week.focus}\n`;
              botResponseText += `⏰ ${week.timeAllocation}\n`;
            });
          }
          
          if (studyPlan.tips && studyPlan.tips.length > 0) {
            botResponseText += '\n💡 Tips:\n';
            studyPlan.tips.slice(0, 3).forEach(tip => {
              botResponseText += `• ${tip}\n`;
            });
          }
        }
      } else if (chatMode === 'course-help') {
        botResponseText = response.data.answer || 'I couldn\'t generate a response.';
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
        errorMessage = 'API limit reached. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in to use the chatbot.';
      }

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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed z-50 p-3 text-white rounded-full shadow-lg bottom-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 md:hidden"
      >
        <MessageCircle size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900 md:hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModeSelector(!showModeSelector)}
            className="p-2 rounded hover:bg-white/20"
          >
            <Menu size={18} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      {showModeSelector && (
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(chatModes).map(([key, mode]) => {
              const IconComponent = mode.icon;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setChatMode(key);
                    setShowModeSelector(false);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    chatMode === key
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  <IconComponent size={20} />
                  <span>{mode.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* API Usage */}
      {apiUsage && (
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">API Usage</span>
            <span className="text-gray-300">{apiUsage.requestCount}/{apiUsage.maxRequests}</span>
          </div>
          <div className="h-2 mt-2 bg-gray-700 rounded-full">
            <div 
              className={`h-2 rounded-full transition-all ${
                apiUsage.usagePercentage > 80 ? 'bg-red-500' : 
                apiUsage.usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${apiUsage.usagePercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-purple-600 text-white'
                  : message.isError
                  ? 'bg-red-900 text-red-200'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.text}</div>
              <div className="mt-1 text-xs opacity-70">
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
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={chatModes[chatMode].placeholder}
            className="flex-1 p-3 text-white bg-gray-700 border border-gray-600 rounded-lg resize-none focus:border-purple-500 focus:outline-none"
            rows="1"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="p-3 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-600"
          >
            {isTyping ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileChatbot;
        