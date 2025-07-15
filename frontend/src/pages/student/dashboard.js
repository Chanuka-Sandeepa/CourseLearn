import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { 
  ChevronDownIcon, 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon, 
  Cog6ToothIcon, 
  UserIcon, 
  KeyIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  StarIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
// Toast component with better styling
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-500';
      case 'error':
        return 'bg-red-600 border-red-500';
      case 'warning':
        return 'bg-yellow-600 border-yellow-500';
      case 'info':
        return 'bg-blue-600 border-blue-500';
      default:
        return 'bg-gray-600 border-gray-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5" />;
      case 'warning':
        return <ExclamationCircleIcon className="w-5 h-5" />;
      case 'info':
        return <ExclamationCircleIcon className="w-5 h-5" />;
      default:
        return <CheckCircleIcon className="w-5 h-5" />;
    }
  };
  
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white transition-all transform animate-slide-in border-l-4 ${getToastStyles()}`}>
      <div className="flex items-center space-x-2">
        {getIcon()}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}

// Enhanced skeleton loader
function SkeletonCard() {
  return (
    <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl animate-pulse">
      <div className="flex items-center mb-4 space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
          <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="mb-4 space-y-2">
        <div className="w-full h-3 bg-gray-200 rounded"></div>
        <div className="w-4/5 h-3 bg-gray-200 rounded"></div>
        <div className="w-3/5 h-3 bg-gray-200 rounded"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="w-20 h-3 bg-gray-200 rounded"></div>
        <div className="w-24 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

// User dropdown component with better styling
const UserDropdown = ({ user, profileLoading, onLogout }) => (
  <Menu as="div" className="relative inline-block text-left">
    <div>
      <Menu.Button className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600">
          {profileLoading ? (
            <div className="w-4 h-4 rounded-full bg-white/30 animate-pulse"></div>
          ) : (
            <span className="text-sm font-semibold text-white">
              {user?.firstName?.charAt(0) || 'U'}
            </span>
          )}
        </div>
        {profileLoading ? (
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <span className="font-medium text-gray-700">{user?.firstName || 'User'}</span>
        )}
        <ChevronDownIcon className="w-4 h-4 ml-2 text-gray-500" aria-hidden="true" />
      </Menu.Button>
    </div>

    <Transition
      as={React.Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="absolute right-0 z-50 w-56 mt-2 origin-top-right bg-white border border-gray-100 shadow-lg rounded-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onLogout}
                className={`${
                  active ? 'bg-red-50 text-red-700' : 'text-red-600'
                } w-full text-left group flex items-center px-4 py-2 text-sm transition-colors`}
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                Sign out
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Transition>
  </Menu>
);

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, color = "indigo" }) => (
  <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg bg-${color}-100 mr-4`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Enrollments state
  const [enrollments, setEnrollments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollLoading, setEnrollLoading] = useState({});
  const [activeTab, setActiveTab] = useState('enrolled');
  
  // Course details modal
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Progress and reviews
  const [progress, setProgress] = useState(0);
  const [progressLoading, setProgressLoading] = useState(false);
  const [review, setReview] = useState({ rating: '', reviewComment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  
  // AI Recommendations state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiExplanation, setAiExplanation] = useState('');
  const [showAiSection, setShowAiSection] = useState(false);
  
  // Profile update state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    username: '',
    email: ''
  });
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);
  
  // UI state
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to get token
  const getToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      setProfileLoading(true);
      const response = await axios.get(`https://courselearn-2.onrender.com/api/auth/profile`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const userData = response.data.user;
      setUser(userData);
      setProfileForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        bio: userData.bio || '',
        username: userData.username || '',
        email: userData.email || ''
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setToast({ 
        message: error.response?.data?.message || 'Failed to fetch user profile', 
        type: 'error' 
      });
    } finally {
      setProfileLoading(false);
    }
  }, [getToken]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Update profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileUpdateLoading(true);
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axios.put(
        'https://courselearn-2.onrender.com/api/auth/profile',
        profileForm,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setToast({
        message: 'Profile updated successfully!',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Profile update error:', error);
      setToast({
        message: error.response?.data?.message || 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({
        message: 'New passwords do not match',
        type: 'error'
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setToast({
        message: 'Password must be at least 6 characters long',
        type: 'error'
      });
      return;
    }

    setPasswordUpdateLoading(true);
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      await axios.put(
        'https://courselearn-2.onrender.com/api/auth/change-password',
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setToast({
        message: 'Password changed successfully!',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Password change error:', error);
      setToast({
        message: error.response?.data?.message || 'Failed to change password',
        type: 'error'
      });
    } finally {
      setPasswordUpdateLoading(false);
    }
  };

  // Get AI course recommendations
  const getAiRecommendations = async () => {
    if (!aiPrompt.trim()) {
      setToast({ message: 'Please enter what you\'re looking to learn', type: 'error' });
      return;
    }

    const token = getToken();
    if (!token) {
      setToast({ 
        message: 'Please log in to get AI recommendations', 
        type: 'error' 
      });
      navigate('/login');
      return;
    }

    setAiLoading(true);
    try {
      try {
        await axios.get('https://courselearn-2.onrender.com/api/auth/verify-token', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (verifyError) {
        localStorage.removeItem('token');
        setToast({ 
          message: 'Your session has expired. Please log in again.', 
          type: 'error' 
        });
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'https://courselearn-2.onrender.com/api/chatgpt/recommendations',
        { prompt: aiPrompt },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000
        }
      );

      if (response.data && response.data.recommendations) {
        setAiRecommendations(response.data.recommendations);
        setAiExplanation(response.data.explanation || 'Here are some courses we recommend based on your interests.');
        setShowAiSection(true);
        
        if (response.data.recommendations.length === 0) {
          setToast({ 
            message: 'No specific recommendations found. Try being more specific about your learning goals.', 
            type: 'info' 
          });
        }
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      
      let errorMessage = 'Failed to get AI recommendations';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
          localStorage.removeItem('token');
          navigate('/login');
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setToast({ 
        message: errorMessage,
        type: 'error' 
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Fetch enrollments and available courses
  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const [enrollmentsRes, coursesRes] = await Promise.all([
        axios.get(`https://courselearn-2.onrender.com/api/enrollments/my-enrollments`, { headers })
        .then(response => response)
        .catch(err => {
          console.error('Detailed enrollment error:', err);
          return { data: { enrollments: [] } };
        }),
          
        axios.get(`https://courselearn-2.onrender.com/api/courses`, { headers })
          .catch(err => {
            console.error('Error fetching courses:', err.response?.data || err.message);
            return { data: { courses: [] } };
          })
      ]);
      
      const enrollmentsData = enrollmentsRes.data.enrollments || [];
      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
      
      const enrolledCourseIds = new Set(
        enrollmentsData
          .map(e => e.course?.id || e.course)
          .filter(Boolean)
      );
      
      const coursesData = Array.isArray(coursesRes.data.courses) ? coursesRes.data.courses : [];
      const available = coursesData.filter(
        course => course && course.id && !enrolledCourseIds.has(course.id)
      );
      
      setAvailableCourses(available);
      
    } catch (err) {
      console.error('Error in fetchEnrollments:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
      setCoursesLoading(false);
    }
  }, [getToken]);

  // Enroll in a course
  const handleEnroll = async (courseId) => {
    const aiCourse = aiRecommendations.find(c => c.id === courseId);
    if (aiCourse) {
      setAvailableCourses(prev => [{
        _id: aiCourse.id,
        title: aiCourse.title,
        description: aiCourse.description,
        category: aiCourse.category,
        level: aiCourse.level,
        duration: aiCourse.duration,
        price: aiCourse.price,
        tags: aiCourse.tags || []
      }, ...prev]);
    }
    
    if (!courseId) {
      setToast({ message: 'Invalid course ID', type: 'error' });
      return;
    }
    
    setEnrollLoading(prev => ({ ...prev, [courseId]: true }));
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      await axios.post(
        `https://courselearn-2.onrender.com/api/enrollments/${courseId}`, 
        {},
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      await fetchEnrollments();
      setToast({ 
        message: 'Successfully enrolled in the course!', 
        type: 'success' 
      });
      
    } catch (err) {
      console.error('Enrollment error:', err.response?.data || err.message);
      setToast({ 
        message: err.response?.data?.message || 'Failed to enroll in the course. Please try again.', 
        type: 'error' 
      });
    } finally {
      setEnrollLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  // Open course details modal
  const openDetails = async (enrollment) => {
    setSelectedEnrollment(enrollment);
    setDetailsLoading(true);
    setCourseDetails(null);
    setProgress(enrollment.progress || 0);
    setReview({ rating: '', reviewComment: '' });
    setReviewSuccess('');
    
    try {
      const courseId = enrollment.course?._id || enrollment.course?.id || enrollment.course;
      if (!courseId) {
        throw new Error('Course ID not found in enrollment');
      }
      
      const res = await axios.get(
        `https://courselearn-2.onrender.com/api/courses/${courseId}`, 
        { 
          headers: { 
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setCourseDetails(res.data.course);
    } catch (err) {
      setToast({ 
        message: 'Failed to load course details.', 
        type: 'error' 
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  // Update progress
  const handleProgressUpdate = async () => {
    if (!selectedEnrollment?.id) {
      setToast({ message: 'No enrollment selected', type: 'error' });
      return;
    }
    
    setProgressLoading(true);
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      await axios.put(
        `https://courselearn-2.onrender.com/api/enrollments/${selectedEnrollment.id}/progress`, 
        { progress: Math.min(100, Math.max(0, Number(progress))) },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setEnrollments(prev => 
        prev.map(e => 
          e.id === selectedEnrollment.id 
            ? { ...e, progress: Number(progress) } 
            : e
        )
      );
      
      setToast({ 
        message: 'Progress updated successfully!', 
        type: 'success' 
      });
      
    } catch (err) {
      console.error('Progress update error:', err.response?.data || err.message);
      setToast({ 
        message: err.response?.data?.message || 'Failed to update progress. Please try again.', 
        type: 'error' 
      });
    } finally {
      setProgressLoading(false);
    }
  };

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEnrollment?.id) {
      setToast({ message: 'No enrollment selected', type: 'error' });
      return;
    }
    
    if (!review.rating) {
      setToast({ message: 'Please select a rating', type: 'error' });
      return;
    }
    
    setReviewLoading(true);
    setReviewSuccess('');
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      await axios.post(
        `https://courselearn-2.onrender.com/api/enrollments/${selectedEnrollment.id}/review`, 
        {
          rating: Number(review.rating),
          reviewComment: review.reviewComment || ''
        },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setReviewSuccess('Review submitted successfully!');
      setToast({ 
        message: 'Thank you for your review!', 
        type: 'success' 
      });
      
      setReview({ rating: '', reviewComment: '' });
      
    } catch (err) {
      console.error('Review submission error:', err.response?.data || err.message);
      setToast({ 
        message: err.response?.data?.message || 'Failed to submit review. Please try again.', 
        type: 'error' 
      });
    } finally {
      setReviewLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchEnrollments();
    fetchUserProfile();
  }, [fetchEnrollments, fetchUserProfile]);

  // Filter courses based on search term
  const filteredAvailableCourses = availableCourses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.tags && course.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  // Filter enrolled courses based on search term
  const filteredEnrollments = enrollments.filter(enrollment => 
    enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (enrollment.course.tags && enrollment.course.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  // Calculate stats
  const completedCourses = enrollments.filter(e => e.progress >= 100).length;
  const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
  const averageProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
            <Header isScrolled={true} />
      
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mt-20 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            icon={BookOpenIcon} 
            title="Enrolled Courses" 
            value={enrollments.length} 
            color="indigo"
          />
          <StatsCard 
            icon={CheckCircleIcon} 
            title="Completed" 
            value={completedCourses} 
            color="green"
          />
          <StatsCard 
            icon={ClockIcon} 
            title="In Progress" 
            value={inProgressCourses} 
            color="yellow"
          />
          <StatsCard 
            icon={ChartBarIcon} 
            title="Average Progress" 
            value={`${averageProgress}%`} 
            color="purple"
          />
        </div>

        {/* AI Recommendations Section */}
        <div className="mb-8">
          <div className="p-8 text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl">
            <div className="flex items-center mb-4">
              <SparklesIcon className="w-6 h-6 mr-2" />
              <h2 className="text-2xl font-bold">AI-Powered Course Recommendations</h2>
            </div>
            <p className="mb-6 text-indigo-100">
              Tell us what you want to learn, and our AI will recommend the perfect courses for you.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., I want to learn Python for data science..."
                  className="w-full px-4 py-3 text-white border rounded-lg bg-white/20 border-white/30 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                  onKeyPress={(e) => e.key === 'Enter' && getAiRecommendations()}
                />
              </div>
              <button
                onClick={getAiRecommendations}
                disabled={aiLoading}
                className="px-6 py-3 font-semibold text-indigo-600 transition-all bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2 border-2 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    Searching...
                  </div>
                ) : (
                  'Get Recommendations'
                )}
              </button>
            </div>

            {showAiSection && (
              <div className="mt-6">
                {aiLoading ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-4 rounded-lg bg-white/20 animate-pulse">
                        <div className="w-3/4 h-4 mb-2 rounded bg-white/30"></div>
                        <div className="w-1/2 h-3 mb-2 rounded bg-white/20"></div>
                        <div className="w-2/3 h-3 rounded bg-white/20"></div>
                      </div>
                    ))}
                  </div>
                ) : aiRecommendations.length > 0 ? (
                  <>
                    <div className="p-4 mb-4 rounded-lg bg-white/10">
                      <p className="text-sm text-white/90">{aiExplanation}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {aiRecommendations.map((course, index) => (
                        <div key={index} className="p-4 transition-colors rounded-lg bg-white/20 hover:bg-white/30">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-white">{course.title}</h4>
                            <span className="px-2 py-1 text-xs text-white rounded-full bg-white/30">
                              {course.level}
                            </span>
                          </div>
                          <p className="mb-2 text-sm text-white/80">{course.category}</p>
                          <p className="mb-3 text-xs text-white/70">{course.reason}</p>
                          <button
                            onClick={() => handleEnroll(course.id)}
                            disabled={enrollLoading[course.id]}
                            className="w-full py-2 font-medium text-indigo-600 transition-all bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {enrollLoading[course.id] ? 'Enrolling...' : 'Enroll Now'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center rounded-lg bg-white/10">
                    <p className="text-white/80">
                      No recommendations found. Try being more specific about your learning goals.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
            <nav className="flex space-x-1">
              {[
                { id: 'enrolled', label: 'My Enrollments', icon: AcademicCapIcon },
                { id: 'available', label: 'Available Courses', icon: BookOpenIcon },
                { id: 'profile', label: 'Profile Settings', icon: UserIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    activeTab === tab.id 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search bar (only show for course tabs) */}
        {(activeTab === 'enrolled' || activeTab === 'available') && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full py-2 pl-10 pr-4 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Information */}
            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
                <div className="flex items-center">
                  <UserIcon className="w-6 h-6 mr-3 text-white" />
                  <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                </div>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="p-6">
                <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                      className="w-full px-4 py-2 transition-colors border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                      className="w-full px-4 py-2 transition-colors border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                      className="w-full px-4 py-2 transition-colors border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your username"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      className="w-full px-4 py-2 transition-colors border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="bio" className="block mb-2 text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows="4"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                    className="w-full px-4 py-2 transition-colors border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={profileUpdateLoading}
                    className="inline-flex items-center px-6 py-2 text-sm font-medium text-white transition-all bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {profileUpdateLoading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Change Password */}
            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-pink-600">
                <div className="flex items-center">
                  <KeyIcon className="w-6 h-6 mr-3 text-white" />
                  <h2 className="text-xl font-semibold text-white">Change Password</h2>
                </div>
              </div>
              
              <form onSubmit={handlePasswordChange} className="p-6">
                <div className="mb-6">
                  <label htmlFor="currentPassword" className="block mb-2 text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full px-4 py-2 transition-colors border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full px-4 py-2 transition-colors border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter new password"
                      required
                      minLength="6"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 transition-colors border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Confirm new password"
                      required
                      minLength="6"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordUpdateLoading}
                    className="inline-flex items-center px-6 py-2 text-sm font-medium text-white transition-all bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordUpdateLoading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enrolled Courses Tab */}
        {activeTab === 'enrolled' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Enrollments</h2>
              <div className="text-sm text-gray-500">
                {filteredEnrollments.length} of {enrollments.length} courses
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <div className="p-6 text-center border border-red-200 rounded-lg bg-red-50">
                <div className="mb-2 text-lg font-medium text-red-600">Oops! Something went wrong</div>
                <div className="text-sm text-red-500">{error}</div>
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="p-12 text-center bg-white border border-gray-200 shadow-sm rounded-xl">
                <AcademicCapIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">No Enrolled Courses</h3>
                <p className="mb-6 text-gray-500">
                  {searchTerm ? 'No courses match your search criteria.' : 'You haven\'t enrolled in any courses yet.'}
                </p>
                {!searchTerm && (
                  <button 
                    onClick={() => setActiveTab('available')}
                    className="inline-flex items-center px-6 py-3 text-sm font-medium text-white transition-all bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <BookOpenIcon className="w-4 h-4 mr-2" />
                    Browse Available Courses
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="overflow-hidden transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md group">
                    {enrollment.course.thumbnail && (
                      <div className="overflow-hidden bg-gray-100 aspect-video">
                        <img 
                          src={enrollment.course.thumbnail} 
                          alt={enrollment.course.title}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                        {enrollment.course.title}
                      </h3>
                      <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                        {enrollment.course.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs font-medium text-indigo-800 bg-indigo-100 rounded-full">
                            {enrollment.course.level || 'Beginner'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {enrollment.course.category}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <StarIcon className="w-4 h-4 mr-1 text-yellow-400" />
                          <span className="text-sm text-gray-600">4.5</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm font-semibold text-indigo-600">
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 transition-all duration-300 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" 
                            style={{ width: `${enrollment.progress || 0}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => openDetails(enrollment)}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-indigo-700 transition-all bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <PlayIcon className="w-4 h-4 mr-1" />
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Available Courses Tab */}
        {activeTab === 'available' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Courses</h2>
              <div className="text-sm text-gray-500">
                {filteredAvailableCourses.length} courses available
              </div>
            </div>

            {coursesLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : filteredAvailableCourses.length === 0 ? (
              <div className="p-12 text-center bg-white border border-gray-200 shadow-sm rounded-xl">
                <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">No Available Courses</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'No courses match your search criteria. Try adjusting your search terms.'
                    : 'There are no available courses at the moment.'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAvailableCourses.map((course) => (
                  <div key={course.id} className="overflow-hidden transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md group">
                    {course.thumbnail && (
                      <div className="overflow-hidden bg-gray-100 aspect-video">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                            {course.level || 'Beginner'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {course.category}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <StarIcon className="w-4 h-4 mr-1 text-yellow-400" />
                          <span className="text-sm text-gray-600">4.5</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">
                          By {course.instructorName || 'Instructor'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {course.duration || 'Self-paced'}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrollLoading[course.id]}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                          enrollLoading[course.id]
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                        }`}
                      >
                        {enrollLoading[course.id] ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 mr-2 border-2 border-gray-400 rounded-full border-t-transparent animate-spin"></div>
                            Enrolling...
                          </div>
                        ) : (
                          'Enroll Now'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Course Details Modal */}
        {selectedEnrollment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {detailsLoading ? (
                <div className="p-8">
                  <div className="space-y-6 animate-pulse">
                    <div className="w-3/4 h-8 bg-gray-200 rounded"></div>
                    <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                    <div className="h-48 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
                      <div className="w-4/6 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  {/* Modal Header */}
                  <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <div className="flex items-start justify-between">
                      <div className="text-white">
                        <h3 className="mb-1 text-2xl font-bold">
                          {selectedEnrollment.course.title}
                        </h3>
                        <p className="text-indigo-100">
                          By {courseDetails?.instructorName || 'Instructor'}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedEnrollment(null)}
                        className="text-white transition-colors hover:text-indigo-200"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                      {courseDetails?.thumbnail && (
                        <div className="overflow-hidden bg-gray-100 rounded-lg aspect-video">
                          <img
                            src={courseDetails.thumbnail}
                            alt={selectedEnrollment.course.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      
                      <div>
                        <h4 className="mb-3 font-semibold text-gray-900">Course Description</h4>
                        <p className="leading-relaxed text-gray-600">
                          {selectedEnrollment.course.description}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="p-4 rounded-lg bg-gray-50">
                          <p className="mb-1 text-sm text-gray-500">Category</p>
                          <p className="font-medium text-gray-900">{selectedEnrollment.course.category || 'General'}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50">
                          <p className="mb-1 text-sm text-gray-500">Level</p>
                          <p className="font-medium text-gray-900">{selectedEnrollment.course.level || 'Beginner'}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50">
                          <p className="mb-1 text-sm text-gray-500">Duration</p>
                          <p className="font-medium text-gray-900">{selectedEnrollment.course.duration || 'Self-paced'}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50">
                          <p className="mb-1 text-sm text-gray-500">Enrolled</p>
                          <p className="font-medium text-gray-900">
                            {new Date(selectedEnrollment.enrolledAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress Update Section */}
                      <div className="p-6 rounded-lg bg-indigo-50">
                        <h4 className="mb-4 font-semibold text-gray-900">Update Your Progress</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Current Progress</span>
                              <span className="text-sm font-semibold text-indigo-600">{progress}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={progress}
                              onChange={(e) => setProgress(e.target.value)}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>
                          <button
                            onClick={handleProgressUpdate}
                            disabled={progressLoading}
                            className="inline-flex items-center px-4 py-2 text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {progressLoading ? (
                              <>
                                <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                Updating...
                              </>
                            ) : (
                              <>
                                <CheckCircleIcon className="w-4 h-4 mr-2" />
                                Update Progress
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Review Section */}
                      <div className="p-6 rounded-lg bg-yellow-50">
                        <h4 className="mb-4 font-semibold text-gray-900">Leave a Review</h4>
                        {reviewSuccess ? (
                          <div className="px-4 py-3 text-green-700 bg-green-100 border border-green-400 rounded-lg">
                            <div className="flex items-center">
                              <CheckCircleIcon className="w-5 h-5 mr-2" />
                              {reviewSuccess}
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Rating
                              </label>
                              <select
                                value={review.rating}
                                onChange={(e) => setReview({...review, rating: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                              >
                                <option value="">Select rating</option>
                                {[5, 4, 3, 2, 1].map((num) => (
                                  <option key={num} value={num}>
                                    {'★'.repeat(num) + '☆'.repeat(5 - num)} {num}.0
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Review (Optional)
                              </label>
                              <textarea
                                value={review.reviewComment}
                                onChange={(e) => setReview({...review, reviewComment: e.target.value})}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Share your experience with this course..."
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={reviewLoading}
                              className="inline-flex items-center px-4 py-2 text-white transition-all bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {reviewLoading ? (
                                <>
                                  <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <StarIcon className="w-4 h-4 mr-2" />
                                  Submit Review
                                </>
                              )}
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Modal Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedEnrollment(null)}
                        className="px-6 py-2 text-gray-700 transition-all border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
            <Footer />
    </div>
  );
};

export default StudentDashboard;
