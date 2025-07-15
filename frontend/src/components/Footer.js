import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="px-6 py-12 bg-black backdrop-blur-sm">
      <div className="container mx-auto">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center mb-4 space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">LearnHub</span>
            </div>
            <p className="mb-4 text-gray-400">
              Empowering learners worldwide with cutting-edge online education.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center justify-center w-8 h-8 transition-colors rounded-full cursor-pointer bg-white/10 hover:bg-white/20">
                <span className="text-xs text-white">f</span>
              </div>
              <div className="flex items-center justify-center w-8 h-8 transition-colors rounded-full cursor-pointer bg-white/10 hover:bg-white/20">
                <span className="text-xs text-white">t</span>
              </div>
              <div className="flex items-center justify-center w-8 h-8 transition-colors rounded-full cursor-pointer bg-white/10 hover:bg-white/20">
                <span className="text-xs text-white">in</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 transition-colors hover:text-white">Home</Link></li>
              <li><Link to="/courses" className="text-gray-400 transition-colors hover:text-white">Courses</Link></li>
              <li><Link to="/about" className="text-gray-400 transition-colors hover:text-white">About</Link></li>
              <li><Link to="/contact" className="text-gray-400 transition-colors hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 font-semibold text-white">Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/courses?category=programming" className="text-gray-400 transition-colors hover:text-white">Programming</Link></li>
              <li><Link to="/courses?category=design" className="text-gray-400 transition-colors hover:text-white">Design</Link></li>
              <li><Link to="/courses?category=marketing" className="text-gray-400 transition-colors hover:text-white">Marketing</Link></li>
              <li><Link to="/courses?category=business" className="text-gray-400 transition-colors hover:text-white">Business</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 font-semibold text-white">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-400 transition-colors hover:text-white">Help Center</Link></li>
              <li><Link to="/privacy" className="text-gray-400 transition-colors hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 transition-colors hover:text-white">Terms of Service</Link></li>
              <li><Link to="/faq" className="text-gray-400 transition-colors hover:text-white">FAQ</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 mt-8 text-center border-t border-white/10">
          <p className="text-gray-400">
            © 2025 LearnHub. All rights reserved. Built with React & Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
