import React, { useState, useEffect } from 'react';
import Chatbot from './Chatbot';
import MobileChatbot from './MobileChatbot';

const ResponsiveChatbot = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile ? <MobileChatbot /> : <Chatbot />;
};

export default ResponsiveChatbot;