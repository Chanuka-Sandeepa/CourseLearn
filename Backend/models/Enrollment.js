const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
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
  },
  status: {
    type: String,
    enum: ['enrolled', 'completed', 'dropped', 'paused'],
    default: 'enrolled'
  },
  completedAt: {
    type: Date
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', ''],
    default: ''
  },
  feedback: {
    type: String,
    maxlength: [500, 'Feedback must not exceed 500 characters']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  reviewComment: {
    type: String,
    maxlength: [300, 'Review comment must not exceed 300 characters']
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Index for querying enrollments by student
enrollmentSchema.index({ student: 1, enrolledAt: -1 });

// Index for querying enrollments by course
enrollmentSchema.index({ course: 1, enrolledAt: -1 });

// Virtual for enrollment duration
enrollmentSchema.virtual('enrollmentDuration').get(function() {
  const now = this.completedAt || new Date();
  const diff = now - this.enrolledAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24)); // days
});

// Method to update progress
enrollmentSchema.methods.updateProgress = function(newProgress) {
  this.progress = Math.min(100, Math.max(0, newProgress));
  this.lastAccessedAt = new Date();
  
  if (this.progress === 100 && this.status === 'enrolled') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return this.save();
};

// Static method to get enrollment statistics
enrollmentSchema.statics.getEnrollmentStats = async function(courseId) {
  const stats = await this.aggregate([
    { $match: { course: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProgress: { $avg: '$progress' }
      }
    }
  ]);
  
  return stats;
};

// Ensure virtual fields are serialized
enrollmentSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
