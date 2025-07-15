const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Course title must not exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [1000, 'Course description must not exceed 1000 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  instructorName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: [true, 'Course content is required']
  },
  category: {
    type: String,
    enum: [
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
    ]
  },
  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  duration: {
    type: String,
    required: [true, 'Course duration is required']
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Price cannot be negative']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  maxStudents: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  isActive: {
    type: Boolean,
    default: true
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  learningObjectives: [{
    type: String,
    trim: true
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for search functionality
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for enrollment count
courseSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents.length;
});

// Virtual for available spots
courseSchema.virtual('availableSpots').get(function() {
  if (this.maxStudents === 0) return 'Unlimited';
  return Math.max(0, this.maxStudents - this.enrolledStudents.length);
});

// Check if course is full
courseSchema.virtual('isFull').get(function() {
  if (this.maxStudents === 0) return false;
  return this.enrolledStudents.length >= this.maxStudents;
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Course', courseSchema);
