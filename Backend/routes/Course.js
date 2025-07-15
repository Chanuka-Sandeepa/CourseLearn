const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { authenticateToken, requireInstructor, optionalAuth } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Middleware to handle route not found
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Get all courses (public endpoint with optional auth)
// Get all courses
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      level,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      instructor
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (instructor) query.instructor = instructor;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName username')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCourses = await Course.countDocuments(query);

    // Format response
    const formattedCourses = courses.map(course => ({
      id: course._id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      instructorName: course.instructorName,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price,
      thumbnail: course.thumbnail,
      tags: course.tags,
      enrollmentCount: course.enrollmentCount,
      availableSpots: course.availableSpots,
      isFull: course.isFull,
      rating: course.rating,
      createdAt: course.createdAt,
      isEnrolled: req.user ? course.enrolledStudents.some(
        enrollment => enrollment.student.toString() === req.user._id.toString()
      ) : false
    }));

    res.json({
      courses: formattedCourses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCourses / parseInt(limit)),
        totalCourses,
        hasNextPage: skip + parseInt(limit) < totalCourses,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      message: 'Failed to fetch courses',
      error: 'COURSES_FETCH_ERROR'
    });
  }
});

// Get course by ID
// Get single course by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName username email bio')
      .populate('enrolledStudents.student', 'firstName lastName username');

    if (!course) {
      return res.status(404).json({
        message: 'Course not found',
        error: 'COURSE_NOT_FOUND'
      });
    }

    if (!course.isActive) {
      return res.status(404).json({
        message: 'Course is not available',
        error: 'COURSE_INACTIVE'
      });
    }

    // Check if user is enrolled
    const isEnrolled = req.user ? course.enrolledStudents.some(
      enrollment => enrollment.student._id.toString() === req.user._id.toString()
    ) : false;

    // Check if user is the instructor
    const isInstructor = req.user && course.instructor._id.toString() === req.user._id.toString();

    res.json({
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        instructorName: course.instructorName,
        content: isEnrolled || isInstructor ? course.content : 'Content available after enrollment',
        category: course.category,
        level: course.level,
        duration: course.duration,
        price: course.price,
        thumbnail: course.thumbnail,
        tags: course.tags,
        prerequisites: course.prerequisites,
        learningObjectives: course.learningObjectives,
        enrollmentCount: course.enrollmentCount,
        availableSpots: course.availableSpots,
        isFull: course.isFull,
        rating: course.rating,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        isEnrolled,
        isInstructor,
        enrolledStudents: isInstructor ? course.enrolledStudents : []
      }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      message: 'Failed to fetch course',
      error: 'COURSE_FETCH_ERROR'
    });
  }
});

// Create new course (instructors only)
// Create new course
router.post('/', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      category,
      level,
      duration,
      price,
      thumbnail,
      tags,
      prerequisites,
      learningObjectives,
      maxStudents
    } = req.body;

    // Validation
    if (!title || !description || !content || !category || !level || !duration || price === undefined) {
      return res.status(400).json({
        message: 'All required fields must be provided',
        error: 'MISSING_FIELDS'
      });
    }

    const course = new Course({
      title,
      description,
      instructor: req.user._id,
      instructorName: req.user.fullName,
      content,
      category,
      level,
      duration,
      price,
      thumbnail: thumbnail || '',
      tags: tags || [],
      prerequisites: prerequisites || [],
      learningObjectives: learningObjectives || [],
      maxStudents: maxStudents || 0
    });

    await course.save();

    // Add course to instructor's created courses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdCourses: course._id }
    });

    res.status(201).json({
      message: 'Course created successfully',
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        instructor: req.user._id,
        instructorName: course.instructorName,
        category: course.category,
        level: course.level,
        duration: course.duration,
        price: course.price,
        createdAt: course.createdAt
      }
    });
  } catch (error) {
    console.error('Create course error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        details: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      message: 'Failed to create course',
      error: 'COURSE_CREATION_ERROR'
    });
  }
});

// Update course (instructor only)
// Update course
router.put('/:id', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: 'Course not found',
        error: 'COURSE_NOT_FOUND'
      });
    }

    // 🔍 Debug logs
    console.log('Instructor ID:', course.instructor.toString());
    console.log('Logged-in User ID:', req.user._id.toString());

    // ✅ Optional: Allow admins to update any course (if using role-based system)
    const isOwner = course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin'; // only if your system supports it

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: 'Access denied. You can only update your own courses.',
        error: 'UNAUTHORIZED_COURSE_UPDATE'
      });
    }

    // Update fields safely
    const {
      title,
      description,
      content,
      category,
      level,
      duration,
      price,
      thumbnail,
      tags,
      prerequisites,
      learningObjectives,
      maxStudents
    } = req.body;

    if (title) course.title = title;
    if (description) course.description = description;
    if (content) course.content = content;
    if (category) course.category = category;
    if (level) course.level = level;
    if (duration) course.duration = duration;
    if (price !== undefined) course.price = price;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (tags) course.tags = tags;
    if (prerequisites) course.prerequisites = prerequisites;
    if (learningObjectives) course.learningObjectives = learningObjectives;
    if (maxStudents !== undefined) course.maxStudents = maxStudents;

    await course.save();

    res.json({
      message: 'Course updated successfully',
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.duration,
        price: course.price,
        updatedAt: course.updatedAt
      }
    });
  } catch (error) {
    console.error('Update course error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        details: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      message: 'Failed to update course',
      error: 'COURSE_UPDATE_ERROR'
    });
  }
});

// Delete course (instructor only)
// Delete course
router.delete('/:id', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: 'Course not found',
        error: 'COURSE_NOT_FOUND'
      });
    }

    // Check if user is the instructor of this course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only delete your own courses.',
        error: 'UNAUTHORIZED_COURSE_DELETE'
      });
    }

    // Soft delete - mark as inactive
    course.isActive = false;
    await course.save();

    res.json({
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      message: 'Failed to delete course',
      error: 'COURSE_DELETE_ERROR'
    });
  }
});

// Get instructor's courses
router.get('/instructor/my-courses', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const courses = await Course.find({
      instructor: req.user._id,
      isActive: true
    })
    .populate('enrolledStudents.student', 'firstName lastName username email')
    .sort({ createdAt: -1 });

    const formattedCourses = courses.map(course => ({
      id: course._id,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price,
      enrollmentCount: course.enrollmentCount,
      availableSpots: course.availableSpots,
      rating: course.rating,
      createdAt: course.createdAt,
      enrolledStudents: course.enrolledStudents
    }));

    res.json({
      courses: formattedCourses
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      message: 'Failed to fetch instructor courses',
      error: 'INSTRUCTOR_COURSES_FETCH_ERROR'
    });
  }
});

// Get course categories
router.get('/meta/categories', (req, res) => {
  const categories = [
    'Programming', 
    'Data Science', 
    'Web Development', 
    'Mobile Development', 
    'Machine Learning', 
    'Cybersecurity', 
    'Database', 
    'Cloud Computing',
    'DevOps',
    'UI/UX Design',
    'Digital Marketing',
    'Project Management',
    'Business',
    'Other'
  ];

  res.json({ categories });
});

module.exports = router;

