import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, BookOpen, ChevronDown, User, Settings, LogOut } from 'lucide-react';

const Header = ({ isScrolled }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    
    if (token && userJson) {
      try {
        const userData = JSON.parse(userJson);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const handleDashboard = () => {
    setIsDropdownOpen(false);
    if (user?.role === 'instructor') {
      navigate('/instructor/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-500 ${
      isScrolled ? 'bg-slate-900/95 backdrop-blur-lg shadow-xl' : 'bg-transparent'
    }`}>
      <div className="container px-4 py-4 mx-auto sm:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex items-center justify-center w-12 h-12 transition-all duration-300 transform rounded-xl bg-gradient-to-br from-blue-600 to-purple-700 group-hover:scale-110 group-hover:rotate-3">
              <BookOpen className="text-white w-7 h-7" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">LearnHub</span>
          </Link>
          
          <nav className="items-center hidden space-x-10 md:flex">
            <Link to="/" className="font-medium text-white transition-all duration-300 hover:text-purple-300 hover:scale-105">Home</Link>
            <Link to="#about" className="font-medium text-white transition-all duration-300 hover:text-purple-300 hover:scale-105">About</Link>
            <Link to="#services" className="font-medium text-white transition-all duration-300 hover:text-purple-300 hover:scale-105">Services</Link>
            <Link to="#contact" className="font-medium text-white transition-all duration-300 hover:text-purple-300 hover:scale-105">Contact</Link>
          </nav>

          <div className="items-center hidden space-x-6 md:flex">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center px-5 py-2.5 space-x-3 text-white transition-all duration-300 rounded-full hover:bg-white/20 active:scale-95"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{user.firstName} {user.lastName}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 z-50 w-56 mt-3 overflow-hidden transition-all duration-300 transform scale-100 bg-white shadow-2xl opacity-100 rounded-2xl">
                    <button
                      onClick={handleDashboard}
                      className="flex items-center w-full px-5 py-3 space-x-3 text-left text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Dashboard</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-5 py-3 space-x-3 text-left text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="font-medium text-white transition-all duration-300 hover:text-purple-300">
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-6 py-2.5 text-white font-medium transition-all duration-300 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button 
            className="p-2 text-white transition-transform duration-300 rounded-lg md:hidden hover:bg-white/10 active:scale-90"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="p-5 mt-4 rounded-2xl md:hidden bg-white/10 backdrop-blur-lg">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="font-medium text-white transition-colors hover:text-purple-300" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="#about" className="font-medium text-white transition-colors hover:text-purple-300" onClick={() => setIsMenuOpen(false)}>About</Link>
              <Link to="#services" className="font-medium text-white transition-colors hover:text-purple-300" onClick={() => setIsMenuOpen(false)}>Services</Link>
              <Link to="#contact" className="font-medium text-white transition-colors hover:text-purple-300" onClick={() => setIsMenuOpen(false)}>Contact</Link>
              <hr className="border-white/20" />
              {user ? (
                <>
                  <button
                    onClick={handleDashboard}
                    className="flex items-center space-x-3 text-left text-white transition-colors hover:text-purple-300"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 text-left text-red-400 transition-colors hover:text-red-300"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="font-medium text-left text-white transition-colors hover:text-purple-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-6 py-3 font-medium text-center text-white transition-all shadow-lg rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-500/25"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
