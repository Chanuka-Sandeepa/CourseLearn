const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { authenticateToken, requireStudent } = require('../middleware/auth');

const router = express.Router();

// Get student's enrollments
router.get('/my-enrollments', authenticateToken, requireStudent, async (req, res) => {
  console.log('Fetching enrollments for user:', req.user._id);
  try {
    // First verify the user exists
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('User not found:', req.user._id);
      return res.status(404).json({
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    console.log('Querying enrollments for user:', req.user._id);
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate('course', 'title description instructorName category level thumbnail')
      .sort({ enrolledAt: -1 })
      .lean(); // Convert to plain JavaScript objects

    console.log('Found enrollments count:', enrollments.length);
    
    res.status(200).json({
      message: 'Enrollments retrieved successfully',
      enrollments: enrollments.map(enrollment => {
        console.log('Processing enrollment:', enrollment._id);
        return {
          id: enrollment._id,
          course: enrollment.course,
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status,
          progress: enrollment.progress || 0,
          lastAccessed: enrollment.lastAccessed
        };
      })
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    
    // More specific error handling
    let errorMessage = 'Failed to retrieve enrollments';
    let errorCode = 'ENROLLMENT_FETCH_ERROR';
    let statusCode = 500;

    if (error.name === 'CastError') {
      errorMessage = 'Invalid user ID format';
      errorCode = 'INVALID_USER_ID';
      statusCode = 400;
    } else if (error.name === 'MongoError') {
      errorMessage = 'Database error occurred while fetching enrollments';
      errorCode = 'DATABASE_ERROR';
    }

    res.status(statusCode).json({
      message: errorMessage,
      error: errorCode,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Enroll in a course (students only)
router.post('/:courseId', authenticateToken, requireStudent, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user._id;

    // Check if course exists and is active
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return res.status(404).json({
        message: 'Course not found or inactive',
        error: 'COURSE_NOT_FOUND'
      });
    }

    // Check if course is full
    if (course.isFull) {
      return res.status(400).json({
        message: 'Course is full',
        error: 'COURSE_FULL'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        message: 'Already enrolled in this course',
        error: 'ALREADY_ENROLLED'
      });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: studentId,
      course: courseId
    });

    await enrollment.save();

    // Add student to course's enrolled students
    course.enrolledStudents.push({
      student: studentId,
      enrolledAt: new Date()
    });
    await course.save();

    // Add course to student's enrolled courses
    await User.findByIdAndUpdate(studentId, {
      $push: { enrolledCourses: courseId }
    });

    res.status(201).json({
      message: 'Successfully enrolled in the course',
      enrollment: {
        id: enrollment._id,
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
          instructor: course.instructorName
        },
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status,
        progress: enrollment.progress
      }
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Already enrolled in this course',
        error: 'DUPLICATE_ENROLLMENT'
      });
    }

    res.status(500).json({
      message: 'Failed to enroll in course',
      error: 'ENROLLMENT_ERROR'
    });
  }
});

// Get student's enrollments
router.get('/my-enrollments', authenticateToken, requireStudent, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id
    })
    .populate('course', 'title description instructor instructorName category level duration price thumbnail rating')
    .sort({ enrolledAt: -1 });

    const formattedEnrollments = enrollments.map(enrollment => ({
      id: enrollment._id,
      course: {
        id: enrollment.course._id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        instructor: enrollment.course.instructor,
        instructorName: enrollment.course.instructorName,
        category: enrollment.course.category,
        level: enrollment.course.level,
        duration: enrollment.course.duration,
        price: enrollment.course.price,
        thumbnail: enrollment.course.thumbnail,
        rating: enrollment.course.rating
      },
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status,
      progress: enrollment.progress,
      lastAccessedAt: enrollment.lastAccessedAt,
      completedAt: enrollment.completedAt,
      grade: enrollment.grade
    }));

    res.json({
      enrollments: formattedEnrollments
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      message: 'Failed to fetch enrollments',
      error: 'ENROLLMENTS_FETCH_ERROR'
    });
  }
});

// Get specific enrollment details
router.get('/:enrollmentId', authenticateToken, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.enrollmentId)
      .populate('student', 'firstName lastName username email')
      .populate('course', 'title description instructor instructorName category level duration content');

    if (!enrollment) {
      return res.status(404).json({
        message: 'Enrollment not found',
        error: 'ENROLLMENT_NOT_FOUND'
      });
    }

    // Check if user is the student or the course instructor
    const isStudent = enrollment.student._id.toString() === req.user._id.toString();
    const isInstructor = enrollment.course.instructor.toString() === req.user._id.toString();

    if (!isStudent && !isInstructor) {
      return res.status(403).json({
        message: 'Access denied',
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    res.json({
      enrollment: {
        id: enrollment._id,
        student: enrollment.student,
        course: enrollment.course,
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status,
        progress: enrollment.progress,
        lastAccessedAt: enrollment.lastAccessedAt,
        completedAt: enrollment.completedAt,
        grade: enrollment.grade,
        feedback: enrollment.feedback,
        rating: enrollment.rating,
        reviewComment: enrollment.reviewComment
      }
    });
  } catch (error) {
    console.error('Get enrollment error:', error);
    res.status(500).json({
      message: 'Failed to fetch enrollment',
      error: 'ENROLLMENT_FETCH_ERROR'
    });
  }
});

// Update enrollment progress (students only)
router.put('/:enrollmentId/progress', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { progress } = req.body;

    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({
        message: 'Progress must be between 0 and 100',
        error: 'INVALID_PROGRESS'
      });
    }

    const enrollment = await Enrollment.findById(req.params.enrollmentId);

    if (!enrollment) {
      return res.status(404).json({
        message: 'Enrollment not found',
        error: 'ENROLLMENT_NOT_FOUND'
      });
    }

    // Check if user is the enrolled student
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied',
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    // Update progress
    await enrollment.updateProgress(progress);

    res.json({
      message: 'Progress updated successfully',
      enrollment: {
        id: enrollment._id,
        progress: enrollment.progress,
        status: enrollment.status,
        completedAt: enrollment.completedAt,
        lastAccessedAt: enrollment.lastAccessedAt
      }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      message: 'Failed to update progress',
      error: 'PROGRESS_UPDATE_ERROR'
    });
  }
});

// Drop from course (students only)
router.delete('/:enrollmentId', authenticateToken, requireStudent, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.enrollmentId);

    if (!enrollment) {
      return res.status(404).json({
        message: 'Enrollment not found',
        error: 'ENROLLMENT_NOT_FOUND'
      });
    }

    // Check if user is the enrolled student
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied',
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    // Update enrollment status to dropped
    enrollment.status = 'dropped';
    await enrollment.save();

    // Remove student from course's enrolled students
    await Course.findByIdAndUpdate(enrollment.course, {
      $pull: { enrolledStudents: { student: req.user._id } }
    });

    // Remove course from student's enrolled courses
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { enrolledCourses: enrollment.course }
    });

    res.json({
      message: 'Successfully dropped from the course'
    });
  } catch (error) {
    console.error('Drop course error:', error);
    res.status(500).json({
      message: 'Failed to drop from course',
      error: 'DROP_COURSE_ERROR'
    });
  }
});

// Add course review and rating (students only)
router.post('/:enrollmentId/review', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { rating, reviewComment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5',
        error: 'INVALID_RATING'
      });
    }

    const enrollment = await Enrollment.findById(req.params.enrollmentId)
      .populate('course');

    if (!enrollment) {
      return res.status(404).json({
        message: 'Enrollment not found',
        error: 'ENROLLMENT_NOT_FOUND'
      });
    }

    // Check if user is the enrolled student
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied',
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    // Update enrollment with review
    enrollment.rating = rating;
    enrollment.reviewComment = reviewComment || '';
    await enrollment.save();

    // Update course rating
    const course = enrollment.course;
    const allRatings = await Enrollment.find({
      course: course._id,
      rating: { $exists: true, $ne: null }
    }).select('rating');

    if (allRatings.length > 0) {
      const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      course.rating = {
        average: Math.round(avgRating * 10) / 10,
        count: allRatings.length
      };
      await course.save();
    }

    res.json({
      message: 'Review added successfully',
      review: {
        rating: enrollment.rating,
        reviewComment: enrollment.reviewComment,
        courseRating: course.rating
      }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      message: 'Failed to add review',
      error: 'REVIEW_ERROR'
    });
  }
});

// Get enrollment statistics for a course (instructors only)
router.get('/course/:courseId/stats', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        message: 'Course not found',
        error: 'COURSE_NOT_FOUND'
      });
    }

    // Check if user is the instructor of this course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied',
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    const stats = await Enrollment.aggregate([
      { $match: { course: course._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    const totalEnrollments = await Enrollment.countDocuments({ course: course._id });
    const completedCount = await Enrollment.countDocuments({ 
      course: course._id, 
      status: 'completed' 
    });
    const avgProgress = await Enrollment.aggregate([
      { $match: { course: course._id } },
      { $group: { _id: null, avgProgress: { $avg: '$progress' } } }
    ]);

    res.json({
      courseTitle: course.title,
      statistics: {
        totalEnrollments,
        completedCount,
        completionRate: totalEnrollments > 0 ? (completedCount / totalEnrollments * 100).toFixed(2) : 0,
        averageProgress: avgProgress.length > 0 ? avgProgress[0].avgProgress.toFixed(2) : 0,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    console.error('Get enrollment stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch enrollment statistics',
      error: 'STATS_FETCH_ERROR'
    });
  }
});

module.exports = router;
