const express = require('express');
const axios = require('axios');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

const router = express.Router();

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

// Request counter to track API usage
let requestCount = 0;
const MAX_REQUESTS = 250;

// Middleware to check if OpenAI API key is configured
const checkOpenAIKey = (req, res, next) => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
    return res.status(503).json({
      message: 'OpenAI API service is not configured. Please contact the administrator.',
      error: 'OPENAI_SERVICE_UNAVAILABLE'
    });
  }
  next();
};

// Fallback response generator for when OpenAI is not available
const generateFallbackResponse = (chatMode, userInput) => {
  const responses = {
    recommendations: {
      recommendations: [],
      explanation: "I'm sorry, but I'm currently unable to provide personalized course recommendations. Please browse our course catalog to find courses that match your interests, or contact our support team for assistance."
    },
    'study-plan': {
      studyPlan: {
        overview: "I'm currently unable to generate a personalized study plan. However, I recommend starting with beginner-level courses in your area of interest, dedicating 1-2 hours daily for learning, and gradually progressing to more advanced topics. Please contact our support team for personalized guidance.",
        weeks: [
          {
            week: 1,
            focus: "Foundation building",
            timeAllocation: "1-2 hours daily",
            goals: ["Complete course selection", "Set up learning schedule"],
            activities: ["Browse course catalog", "Create study plan"]
          }
        ],
        tips: [
          "Set realistic learning goals",
          "Maintain consistent study schedule",
          "Practice regularly",
          "Seek help when needed"
        ]
      }
    },
    'course-help': {
      answer: "I'm currently unable to provide AI-powered course assistance. Please refer to your course materials, reach out to your instructor, or contact our support team for help with your questions.",
      additionalResources: ["Course forums", "Instructor office hours", "Student support center"],
      relatedTopics: ["General study tips", "Course navigation"]
    }
  };

  return responses[chatMode] || responses['course-help'];
};

// Error handler for OpenAI API requests
const handleOpenAIError = (error, chatMode, userInput) => {
  console.error('OpenAI API Error:', error);
  
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        console.log('Invalid API key, returning fallback response');
        return {
          fallback: true,
          data: generateFallbackResponse(chatMode, userInput)
        };
      case 429:
        console.log('Rate limit exceeded');
        return {
          error: {
            status: 429,
            message: 'OpenAI API rate limit exceeded. Please try again later.',
            error: 'RATE_LIMIT_EXCEEDED'
          }
        };
      case 500:
        console.log('OpenAI server error');
        return {
          error: {
            status: 500,
            message: 'OpenAI service is temporarily unavailable. Please try again later.',
            error: 'OPENAI_SERVER_ERROR'
          }
        };
      default:
        return {
          error: {
            status: status,
            message: 'OpenAI API error occurred',
            error: 'OPENAI_API_ERROR',
            details: data
          }
        };
    }
  }
  
  if (error.code === 'ECONNABORTED') {
    return {
      error: {
        status: 408,
        message: 'Request timeout. Please try again.',
        error: 'REQUEST_TIMEOUT'
      }
    };
  }
  
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return {
      error: {
        status: 503,
        message: 'Unable to connect to OpenAI service. Please try again later.',
        error: 'CONNECTION_ERROR'
      }
    };
  }
  
  // Return fallback for any other errors
  return {
    fallback: true,
    data: generateFallbackResponse(chatMode, userInput)
  };
};

// Get course recommendations using ChatGPT
router.post('/recommendations', async (req, res) => {
  try {
    const { prompt } = req.body;

    console.log('Recommendations request received');
    console.log('Prompt:', prompt);

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        message: 'Prompt is required',
        error: 'MISSING_PROMPT'
      });
    }

    // Check if OpenAI API key is configured
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.log('OpenAI API key not configured, returning fallback response');
      const fallbackResponse = generateFallbackResponse('recommendations', prompt);
      return res.json({
        ...fallbackResponse,
        requestCount: requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount,
        fallback: true
      });
    }

    // Check API request limit
    if (requestCount >= MAX_REQUESTS) {
      return res.status(429).json({
        message: 'API request limit exceeded',
        error: 'REQUEST_LIMIT_EXCEEDED',
        requestCount
      });
    }

    try {
      // Get available courses from database
      const availableCourses = await Course.find({ 
        isActive: true
      })
        .select('title description category level duration price tags prerequisites learningObjectives')
        .limit(50);

      // If no courses available, return fallback
      if (availableCourses.length === 0) {
        console.log('No courses available, returning fallback response');
        const fallbackResponse = generateFallbackResponse('recommendations', prompt);
        return res.json({
          ...fallbackResponse,
          requestCount: requestCount,
          requestsRemaining: MAX_REQUESTS - requestCount,
          fallback: true
        });
      }

      // Format courses for the AI prompt
      const coursesList = availableCourses.map(course => ({
        id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.duration,
        price: course.price,
        tags: course.tags,
        prerequisites: course.prerequisites,
        learningObjectives: course.learningObjectives
      }));

      // Create enhanced prompt for ChatGPT
      const systemPrompt = `You are a helpful course recommendation assistant for an online learning platform. 
      Based on the user's request, recommend the most suitable courses from the available course catalog.
      
      Available courses:
      ${JSON.stringify(coursesList, null, 2)}
      
      Instructions:
      1. Analyze the user's request and recommend the most relevant courses
      2. Consider the user's goals, skill level, and interests
      3. Provide 3-5 course recommendations maximum
      4. For each recommendation, explain why it's suitable
      5. Consider course difficulty progression (beginner -> intermediate -> advanced)
      6. Consider prerequisites and learning objectives
      7. Format your response as a JSON object with this structure:
      {
        "recommendations": [
          {
            "id": "course_id",
            "title": "Course Title",
            "category": "Course Category",
            "level": "Course Level",
            "duration": "Course Duration",
            "price": "Course Price",
            "reason": "Why this course is recommended for the user"
          }
        ],
        "explanation": "General explanation of the recommendations"
      }
      
      If no suitable courses are found, return empty recommendations array and explain why.`;

      const userPrompt = `User request: ${prompt}`;

      // Make request to OpenAI API
      requestCount++;
      
      console.log('Making OpenAI API request...');
      const response = await axios.post(
        `${OPENAI_BASE_URL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      console.log('OpenAI Response:', aiResponse);
      
      // Try to parse JSON response
      let recommendations = [];
      let explanationText = '';
      
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          recommendations = parsed.recommendations || [];
          explanationText = parsed.explanation || '';
        } else {
          explanationText = aiResponse;
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        explanationText = aiResponse;
      }

      // If recommendations were found, enrich them with full course data
      if (recommendations.length > 0) {
        recommendations = recommendations.map(rec => {
          const matchingCourse = availableCourses.find(course => 
            course._id.toString() === rec.id || course.title === rec.title
          );
          
          if (matchingCourse) {
            return {
              id: matchingCourse._id,
              title: matchingCourse.title,
              description: matchingCourse.description,
              category: matchingCourse.category,
              level: matchingCourse.level,
              duration: matchingCourse.duration,
              price: matchingCourse.price,
              tags: matchingCourse.tags,
              reason: rec.reason
            };
          }
          return rec;
        }).filter(rec => rec.id); // Remove any recommendations without matching courses
      }

      res.json({
        recommendations,
        explanation: explanationText,
        requestCount: requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      const fallbackResponse = generateFallbackResponse('recommendations', prompt);
      return res.json({
        ...fallbackResponse,
        requestCount: requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount,
        fallback: true
      });
    }

  } catch (error) {
    console.error('ChatGPT recommendations error:', error);
    
    const errorResult = handleOpenAIError(error, 'recommendations', req.body.prompt);
    
    if (errorResult.fallback) {
      return res.json({
        ...errorResult.data,
        requestCount: requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount,
        fallback: true
      });
    }
    
    if (errorResult.error) {
      return res.status(errorResult.error.status).json(errorResult.error);
    }
    
    // Final fallback
    const fallbackResponse = generateFallbackResponse('recommendations', req.body.prompt);
    res.json({
      ...fallbackResponse,
      requestCount: requestCount,
      requestsRemaining: MAX_REQUESTS - requestCount,
      fallback: true
    });
  }
});

// Get personalized study plan using ChatGPT
router.post('/study-plan', async (req, res) => {
  try {
    const { goal, timeframe, skillLevel, preferences } = req.body;

    console.log('Study plan request received');

    if (!goal || !timeframe) {
      return res.status(400).json({
        message: 'Goal and timeframe are required',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Check if OpenAI API key is configured
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.log('OpenAI API key not configured, returning fallback response');
      const fallbackResponse = generateFallbackResponse('study-plan', goal);
      return res.json({
        ...fallbackResponse,
        requestCount: requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount,
        fallback: true
      });
    }

    // Check API request limit
    if (requestCount >= MAX_REQUESTS) {
      return res.status(429).json({
        message: 'API request limit exceeded',
        error: 'REQUEST_LIMIT_EXCEEDED'
      });
    }

    try {
      // Get available courses
      const availableCourses = await Course.find({ isActive: true })
        .select('title description category level duration prerequisites')
        .limit(30);

      const systemPrompt = `You are a personalized learning advisor. Create a detailed study plan based on the user's goals and available courses.
      
      Available courses:
      ${JSON.stringify(availableCourses, null, 2)}
      
      Create a structured study plan with:
      1. Weekly breakdown
      2. Recommended courses in order
      3. Time allocation
      4. Milestones and checkpoints
      5. Tips for success
      
      Format as JSON:
      {
        "studyPlan": {
          "overview": "Brief overview of the plan",
          "weeks": [
            {
              "week": 1,
              "focus": "Main focus for this week",
              "courses": ["Course titles"],
              "timeAllocation": "Hours per day/week",
              "goals": ["Specific goals"],
              "activities": ["Specific activities"]
            }
          ],
          "milestones": [
            {
              "week": 4,
              "milestone": "Description of milestone",
              "assessment": "How to assess progress"
            }
          ],
          "tips": ["Success tips"]
        }
      }`;

      const userPrompt = `Goal: ${goal}
      Timeframe: ${timeframe}
      Skill Level: ${skillLevel || 'Not specified'}
      Preferences: ${preferences || 'Not specified'}`;

      requestCount++;
      
      console.log('Making OpenAI API request for study plan...');
      const response = await axios.post(
        `${OPENAI_BASE_URL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 1500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      console.log('OpenAI Study Plan Response:', aiResponse);
      
      let studyPlan = {};
      
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          studyPlan = parsed.studyPlan || {};
        } else {
          studyPlan = { overview: aiResponse };
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        studyPlan = { overview: aiResponse };
      }

      res.json({
        studyPlan,
        requestCount: requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      const fallbackResponse = generateFallbackResponse('study-plan', goal);
      return res.json({
        ...fallbackResponse,
        requestCount: requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount,
        fallback: true
      });
    }

  } catch (error) {
    console.error('Study plan error:', error);
    
    const errorResult = handleOpenAIError(error, 'study-plan', req.body.goal);
    
    if (errorResult.fallback) {
      return res.json({
        ...errorResult.data,
        requestCount: requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount,
        fallback: true
      });
    }
    
    if (errorResult.error) {
      return res.status(errorResult.error.status).json(errorResult.error);
    }
    
    // Final fallback
    const fallbackResponse = generateFallbackResponse('study-plan', req.body.goal);
    res.json({
      ...fallbackResponse,
      requestCount: requestCount,
      requestsRemaining: MAX_REQUESTS - requestCount,
      fallback: true
    });
  }
});

// Get course Q&A assistance using ChatGPT
router.post('/course-help', async (req, res) => {
  try {
    const { courseId, question } = req.body;

    console.log('Course help request received');

    if (!question) {
      return res.status(400).json({
        message: 'Question is required',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Check if OpenAI API key is configured
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.log('OpenAI API key not configured, returning fallback response');
      const fallbackResponse = generateFallbackResponse('course-help', question);
      return res.json({
        ...fallbackResponse,
        courseTitle: 'General Help',
        question: question,
        requestCount: requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount,
        fallback: true
      });
    }

    // Check API request limit
    if (requestCount >= MAX_REQUESTS) {
      return res.status(429).json({
        message: 'API request limit exceeded',
        error: 'REQUEST_LIMIT_EXCEEDED'
      });
    }

    try {
      let course = null;
      
      // Try to get course information if courseId is provided
      if (courseId && courseId !== 'default-course-id') {
        try {
          course = await Course.findById(courseId)
            .select('title description content category level');
        } catch (courseError) {
          console.warn('Course not found:', courseError);
          // Continue without course info
        }
      }

      const systemPrompt = `You are a helpful teaching assistant${course ? ` for the course "${course.title}"` : ' for an online learning platform'}. 
      Help students understand course material and answer their questions.
      
      ${course ? `
      Course Information:
      - Title: ${course.title}
      - Category: ${course.category}
      - Level: ${course.level}
      - Description: ${course.description}
      ` : ''}
      
      Guidelines:
      1. Provide clear, educational explanations
      2. Use examples when helpful
      3. Encourage further learning
      4. If unsure, suggest consulting the instructor
      5. Keep responses focused on the course topic
      6. Be supportive and encouraging
      
      Format response as JSON:
      {
        "answer": "Your detailed answer",
        "additionalResources": ["Suggested resources or topics to explore"],
        "relatedTopics": ["Related topics in the course"]
      }`;

      const userPrompt = `Student question: ${question}`;

      requestCount++;
      
      console.log('Making OpenAI API request for course help...');
      const response = await axios.post(
        `${OPENAI_BASE_URL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 800,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      console.log('OpenAI Course Help Response:', aiResponse);
      
      let helpResponse = {};
      
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          helpResponse = JSON.parse(jsonMatch[0]);
        } else {
          helpResponse = { answer: aiResponse };
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        helpResponse = { answer: aiResponse };
      }

      res.json({
        courseTitle: course?.title || 'General Help',
        question: question,
        ...helpResponse,
        requestCount: requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      const fallbackResponse = generateFallbackResponse('course-help', question);
      return res.json({
        ...fallbackResponse,
        courseTitle: 'General Help',
        question: question,
        requestCount: requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount,
        fallback: true
      });
    }

  } catch (error) {
    console.error('Course help error:', error);
    
    const errorResult = handleOpenAIError(error, 'course-help', req.body.question);
    
    if (errorResult.fallback) {
      return res.json({
        ...errorResult.data,
        courseTitle: 'General Help',
        question: req.body.question,
        requestCount: requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount,
        fallback: true
      });
    }
    
    if (errorResult.error) {
      return res.status(errorResult.error.status).json(errorResult.error);
    }
    
    // Final fallback
    const fallbackResponse = generateFallbackResponse('course-help', req.body.question);
    res.json({
      ...fallbackResponse,
      courseTitle: 'General Help',
      question: req.body.question,
      requestCount: requestCount,
      requestsRemaining: MAX_REQUESTS - requestCount,
      fallback: true
    });
  }
});

// Get general chat assistance using ChatGPT
router.post('/general-chat', async (req, res) => {
  try {
    const { message } = req.body;

    console.log('General chat request received');

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        message: 'Message is required',
        error: 'MISSING_MESSAGE'
      });
    }

    // Check if OpenAI API key is configured
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.log('OpenAI API key not configured, returning fallback response');
      return res.json({
        response: "I'm sorry, but I'm currently unable to provide AI-powered chat assistance. Please contact our support team for help with your questions.",
        requestCount: requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount,
        fallback: true
      });
    }

    // Check API request limit
    if (requestCount >= MAX_REQUESTS) {
      return res.status(429).json({
        message: 'API request limit exceeded',
        error: 'REQUEST_LIMIT_EXCEEDED'
      });
    }

    try {
      const systemPrompt = `You are a helpful AI assistant for an online learning platform. 
      You can help with general questions about learning, study tips, career advice, and platform usage.
      
      Guidelines:
      1. Be helpful, friendly, and encouraging
      2. Provide practical advice when possible
      3. If asked about specific courses, suggest browsing the course catalog
      4. Keep responses concise but informative
      5. Encourage learning and personal growth
      6. If you don't know something, be honest about it`;

      const userPrompt = message;

      requestCount++;
      
      console.log('Making OpenAI API request for general chat...');
      const response = await axios.post(
        `${OPENAI_BASE_URL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      console.log('OpenAI General Chat Response:', aiResponse);

      res.json({
        response: aiResponse,
        requestCount: requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.json({
        response: "I'm sorry, but I'm currently unable to provide assistance. Please try again later or contact our support team.",
        requestCount: requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount,
        fallback: true
      });
    }

  } catch (error) {
    console.error('General chat error:', error);
    
    const errorResult = handleOpenAIError(error, 'general-chat', req.body.message);
    
    if (errorResult.fallback) {
      return res.json({
        response: "I'm sorry, but I'm currently unable to provide assistance. Please try again later or contact our support team.",
        requestCount: requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount,
        fallback: true
      });
    }
    
    if (errorResult.error) {
      return res.status(errorResult.error.status).json(errorResult.error);
    }
    
    // Final fallback
    res.json({
      response: "I'm sorry, but I'm currently unable to provide assistance. Please try again later or contact our support team.",
      requestCount: requestCount,
      requestsRemaining: MAX_REQUESTS - requestCount,
      fallback: true
    });
  }
});

// Get API usage statistics
router.get('/usage', (req, res) => {
  try {
    res.json({
      requestCount,
      requestsRemaining: MAX_REQUESTS - requestCount,
      maxRequests: MAX_REQUESTS,
      usagePercentage: ((requestCount / MAX_REQUESTS) * 100).toFixed(2),
      status: requestCount >= MAX_REQUESTS ? 'limit_reached' : 'available'
    });
  } catch (error) {
    console.error('Usage endpoint error:', error);
    res.status(500).json({
      message: 'Failed to get usage statistics',
      error: 'USAGE_ERROR'
    });
  }
});

// Reset request counter
router.post('/reset-usage', (req, res) => {
  try {
    const previousCount = requestCount;
    requestCount = 0;
    
    console.log(`Request counter reset from ${previousCount} to 0`);
    
    res.json({
      message: 'Request counter reset successfully',
      previousCount,
      requestCount: 0,
      requestsRemaining: MAX_REQUESTS
    });
  } catch (error) {
    console.error('Reset usage endpoint error:', error);
    res.status(500).json({
      message: 'Failed to reset usage counter',
      error: 'RESET_ERROR'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  try {
    const isOpenAIConfigured = OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key-here';
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      openai: {
        configured: isOpenAIConfigured,
        status: isOpenAIConfigured ? 'available' : 'not_configured'
      },
      usage: {
        requestCount,
        requestsRemaining: MAX_REQUESTS - requestCount,
        maxRequests: MAX_REQUESTS
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint for basic functionality
router.post('/test', (req, res) => {
  try {
    const { message } = req.body;
    
    res.json({
      message: 'ChatGPT service is working',
      echo: message || 'No message provided',
      timestamp: new Date().toISOString(),
      requestCount,
      requestsRemaining: MAX_REQUESTS - requestCount
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      message: 'Test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('ChatGPT router error:', error);
  
  res.status(500).json({
    message: 'An unexpected error occurred in the ChatGPT service',
    error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
