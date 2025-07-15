import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  BookOpen, 
  DollarSign,  
  Search, 
  X, 
  Save, 
  LogOut,
  User,
  Settings,
  TrendingUp,
  Award,
  Eye,
  Star
} from 'lucide-react';

// Toast component
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded-lg shadow-lg text-white transition-all ${
      type === 'success' ? 'bg-green-600' : 'bg-red-500'
    }`}>
      {message}
    </div>
  );
}

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, color, trend }) => (
  <div className="p-6 transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <div className={`flex items-center mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">{trend.value}</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

// User Profile Modal
const UserProfileModal = ({ isOpen, onClose, user, onUpdateProfile, onChangePassword, loading }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    email: '',
    username: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        email: user.email || '',
        username: user.username || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await onUpdateProfile(profileForm);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await onChangePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-white">
              <User className="w-6 h-6 mr-3" />
              <h2 className="text-xl font-semibold">Profile Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white transition-colors hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'profile' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'password' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-2 text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {profileLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    minLength="6"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    minLength="6"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-2 text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    level: 'Beginner',
    duration: '',
    price: '',
    thumbnail: '',
    tags: '',
    prerequisites: '',
    learningObjectives: '',
    maxStudents: ''
  });

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // API Base URL
  const API_BASE = 'http://localhost:5000/api';

  // API helper function
  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...options,
      };

      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }, [token]);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/profile`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setToast({ 
        message: error.response?.data?.message || 'Failed to fetch user profile', 
        type: 'error' 
      });
    }
  }, [token]);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiCall('/courses/instructor/my-courses');
      setCourses(data.courses || []);
    } catch (error) {
      setError('Failed to fetch courses');
      setToast({ message: 'Failed to fetch courses', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Handle profile update
  const handleUpdateProfile = async (profileData) => {
    try {
      const response = await axios.put(`${API_BASE}/auth/profile`, profileData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Profile update error:', error);
      setToast({ 
        message: error.response?.data?.message || 'Failed to update profile', 
        type: 'error' 
      });
      throw error;
    }
  };

  // Handle password change
  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put(`${API_BASE}/auth/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setToast({ message: 'Password changed successfully!', type: 'success' });
    } catch (error) {
      console.error('Password change error:', error);
      setToast({ 
        message: error.response?.data?.message || 'Failed to change password', 
        type: 'error' 
      });
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const courseData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        prerequisites: formData.prerequisites.split(',').map(req => req.trim()).filter(req => req),
        learningObjectives: formData.learningObjectives.split(',').map(obj => obj.trim()).filter(obj => obj),
        price: parseFloat(formData.price) || 0,
        maxStudents: parseInt(formData.maxStudents) || null
      };

      const endpoint = editingCourse ? `/courses/${editingCourse._id}` : '/courses';
      const method = editingCourse ? 'PUT' : 'POST';

      await apiCall(endpoint, {
        method,
        body: JSON.stringify(courseData),
      });

      setToast({ 
        message: editingCourse ? 'Course updated successfully!' : 'Course created successfully!', 
        type: 'success' 
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        content: '',
        category: '',
        level: 'Beginner',
        duration: '',
        price: '',
        thumbnail: '',
        tags: '',
        prerequisites: '',
        learningObjectives: '',
        maxStudents: ''
      });
      setShowCreateForm(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      setToast({ 
        message: editingCourse ? 'Failed to update course' : 'Failed to create course', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    console.log('Course ID passed to delete function:', courseId);
  
    if (!courseId) {
      console.error('[❌] No courseId passed!');
      setToast({ message: 'Invalid course ID', type: 'error' });
      return;
    }
  
    if (!window.confirm('Are you sure you want to delete this course?')) return;
  
    try {
      await apiCall(`/courses/${courseId}`, {
        method: 'DELETE',
      });
  
      setToast({ message: 'Course deleted successfully!', type: 'success' });
      fetchCourses(); // Refresh course list
    } catch (error) {
      console.error('Delete error:', error);
      setToast({
        message: error?.response?.data?.message || error.message || 'Failed to delete course',
        type: 'error',
      });
    }
  };

  // Handle edit course
  const handleEditCourse = (course) => {
    // Ensure _id is present (some APIs return course.id instead of _id)
    const id = course._id || course.id;
  
    setEditingCourse({ ...course, _id: id }); // ⬅️ this line is crucial
  
    setFormData({
      title: course.title,
      description: course.description,
      content: course.content,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price?.toString() || '',
      thumbnail: course.thumbnail || '',
      tags: course.tags?.join(', ') || '',
      prerequisites: course.prerequisites?.join(', ') || '',
      learningObjectives: course.learningObjectives?.join(', ') || '',
      maxStudents: course.maxStudents?.toString() || ''
    });
  
    setShowCreateForm(true);
  };
  
  // Calculate stats
  const stats = {
    totalCourses: courses.length,
    totalStudents: courses.reduce((sum, course) => sum + (course.enrolledStudents?.length || 0), 0),
    totalRevenue: courses.reduce((sum, course) => sum + ((course.price || 0) * (course.enrolledStudents?.length || 0)), 0),
    averageRating: courses.length > 0 ? (courses.reduce((sum, course) => sum + (course.averageRating || 0), 0) / courses.length).toFixed(1) : '0.0'
  };

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
    fetchCourses();

  }, [token, navigate, fetchUserProfile, fetchCourses]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 mr-3 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              
              <button
                onClick={() => setShowProfileModal(true)}
                className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                title="Profile Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 transition-colors hover:text-red-600"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Toast */}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'courses' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Courses
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="p-8 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="mb-2 text-3xl font-bold">
                    Welcome back, {user?.firstName || 'Instructor'}!
                  </h2>
                  <p className="text-blue-100">
                    Ready to inspire and educate your students today?
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="flex items-center justify-center w-24 h-24 bg-white rounded-full bg-opacity-20">
                    <BookOpen className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                icon={BookOpen}
                title="Total Courses"
                value={stats.totalCourses}
                color="from-blue-500 to-blue-600"
                trend={{ positive: true, value: "+2 this month" }}
              />
              <StatsCard
                icon={Users}
                title="Total Students"
                value={stats.totalStudents}
                color="from-green-500 to-green-600"
                trend={{ positive: true, value: "+15% this month" }}
              />
              <StatsCard
                icon={DollarSign}
                title="Total Revenue"
                value={`$${stats.totalRevenue.toLocaleString()}`}
                color="from-purple-500 to-purple-600"
                trend={{ positive: true, value: "+8% this month" }}
              />
              <StatsCard
                icon={Star}
                title="Average Rating"
                value={stats.averageRating}
                color="from-yellow-500 to-yellow-600"
                trend={{ positive: true, value: "+0.2 this month" }}
              />
            </div>

            {/* Quick Actions */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <button
                  onClick={() => {
                    setActiveTab('courses');
                    setShowCreateForm(true);
                  }}
                  className="flex items-center justify-center p-4 transition-colors border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100"
                >
                  <Plus className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="font-medium text-blue-600">Create New Course</span>
                </button>
                <button
                  onClick={() => setActiveTab('courses')}
                  className="flex items-center justify-center p-4 transition-colors border border-green-200 rounded-lg bg-green-50 hover:bg-green-100"
                >
                  <Eye className="w-5 h-5 mr-2 text-green-600" />
                  <span className="font-medium text-green-600">View All Courses</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="flex items-center justify-center p-4 transition-colors border border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100"
                >
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                  <span className="font-medium text-purple-600">View Analytics</span>
                </button>
              </div>
            </div>

            {/* Recent Courses */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Courses</h3>
                <button
                  onClick={() => setActiveTab('courses')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All →
                </button>
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 p-4 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="py-8 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No courses created yet.</p>
                  <button
                    onClick={() => {
                      setActiveTab('courses');
                      setShowCreateForm(true);
                    }}
                    className="px-4 py-2 mt-4 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Create Your First Course
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.slice(0, 3).map((course) => (
                    <div key={course._id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{course.title}</h4>
                          <p className="text-sm text-gray-500">
                            {course.enrolledStudents?.length || 0} students • {course.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          ${course.price || 0}
                        </span>
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="p-2 text-gray-400 transition-colors hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
                <p className="text-gray-600">Manage your course content and student enrollment</p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Course
              </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Courses Grid */}
            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 p-6 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={() => fetchCourses()}
                  className="px-4 py-2 mt-4 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  {searchTerm ? 'No courses found' : 'No courses created yet'}
                </h3>
                <p className="mb-6 text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Get started by creating your first course'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Create Your First Course
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => (
                  <div key={course._id} className="overflow-hidden transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                    <div className="relative bg-gray-100 aspect-video">
                      {course.thumbnail ? (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <BookOpen className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          course.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.status || 'Create'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="w-4 h-4 mr-1" />
                            {course.enrolledStudents?.length || 0}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {course.price || 0}
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="w-4 h-4 mr-1 text-yellow-400" />
                          {course.averageRating?.toFixed(1) || '0.0'}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {course.category} • {course.level}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="p-2 text-gray-400 transition-colors hover:text-blue-600"
                            title="Edit course"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course._id || course.id)}
                            className="p-2 text-gray-400 transition-colors hover:text-red-600"
                            title="Delete course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
              <p className="text-gray-600">Track your course performance and student engagement</p>
            </div>

            {/* Analytics Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Course Views</p>
                    <p className="text-2xl font-bold text-gray-900">1,234</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+12% from last month</span>
                </div>
              </div>

              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">78%</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+5% from last month</span>
                </div>
              </div>

              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New Enrollments</p>
                    <p className="text-2xl font-bold text-gray-900">45</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+23% from last month</span>
                </div>
              </div>

              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${(stats.totalRevenue * 0.3).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+8% from last month</span>
                </div>
              </div>
            </div>

            {/* Course Performance */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Course Performance</h3>
              <div className="space-y-4">
                {courses.slice(0, 5).map((course) => (
                  <div key={course._id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-500">
                          {course.enrolledStudents?.length || 0} students enrolled
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${((course.price || 0) * (course.enrolledStudents?.length || 0)).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Revenue</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {course.averageRating?.toFixed(1) || '0.0'}
                        </p>
                        <p className="text-xs text-gray-500">Rating</p>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="w-4 h-4 mr-1 text-yellow-400" />
                        {course.averageRating?.toFixed(1) || '0.0'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Course Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingCourse(null);
                    setFormData({
                      title: '',
                      description: '',
                      content: '',
                      category: '',
                      level: 'Beginner',
                      duration: '',
                      price: '',
                      thumbnail: '',
                      tags: '',
                      prerequisites: '',
                      learningObjectives: '',
                      maxStudents: ''
                    });
                  }}
                  className="text-white transition-colors hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Enter course title"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <input
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Describe what students will learn in this course"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Course Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter the detailed course content, lessons, and modules"
                  />
                </div>

                {/* Course Details */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Level *
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 8 weeks, 40 hours"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      placeholder="99.99"
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Thumbnail URL
                    </label>
                    <input
                      type="url"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Max Students
                    </label>
                    <input
                      type="number"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData({...formData, maxStudents: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      placeholder="50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="javascript, react, frontend (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Prerequisites
                  </label>
                  <input
                    type="text"
                    value={formData.prerequisites}
                    onChange={(e) => setFormData({...formData, prerequisites: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Basic HTML, CSS knowledge (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Learning Objectives
                  </label>
                  <input
                    type="text"
                    value={formData.learningObjectives}
                    onChange={(e) => setFormData({...formData, learningObjectives: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Build web applications, Understand React concepts (comma-separated)"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end pt-6 space-x-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingCourse(null);
                      setFormData({
                        title: '',
                        description: '',
                        content: '',
                        category: '',
                        level: 'Beginner',
                        duration: '',
                        price: '',
                        thumbnail: '',
                        tags: '',
                        prerequisites: '',
                        learningObjectives: '',
                        maxStudents: ''
                      });
                    }}
                    className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        {editingCourse ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {editingCourse ? 'Update Course' : 'Create Course'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onUpdateProfile={handleUpdateProfile}
        onChangePassword={handleChangePassword}
        loading={loading}
      />
    </div>
  );
};

export default InstructorDashboard;
