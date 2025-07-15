import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, BookOpen, Users, Award, TrendingUp, Star, Play, ArrowRight, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    {
      icon: BookOpen,
      title: "Interactive Learning",
      description: "Engage with hands-on courses designed by industry experts",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from professionals with real-world experience",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Award,
      title: "Certifications",
      description: "Earn recognized certificates upon course completion",
      color: "from-pink-500 to-red-600"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics",
      color: "from-green-500 to-blue-600"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Students" },
    { number: "500+", label: "Courses" },
    { number: "100+", label: "Instructors" },
    { number: "95%", label: "Success Rate" }
  ];

  const features = [
    "Access to premium courses",
    "Live interactive sessions",
    "Downloadable resources",
    "Community support",
    "Mobile learning app",
    "Lifetime access"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      <Header isScrolled={isScrolled} />

      {/* Hero Section */}
      <section id="home" className="px-6 pt-20 pb-16">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl">
              Master New Skills with
              <span className="block text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                Expert-Led Courses
              </span>
            </h1>
            <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-300">
              Join thousands of learners advancing their careers with our comprehensive online courses. 
              Learn at your own pace with interactive content and real-world projects.
            </p>
            
            <div className="flex flex-col justify-center gap-4 mb-12 sm:flex-row">
              <Link 
                to="/login"
                className="flex items-center justify-center px-8 py-4 space-x-2 font-semibold text-white transition-all transform rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105"
              >
                <Play className="w-5 h-5" />
                <span>Start Learning</span>
              </Link>
              <button className="flex items-center justify-center px-8 py-4 space-x-2 font-semibold text-purple-400 transition-all border-2 border-purple-400 rounded-full hover:bg-purple-400 hover:text-white">
                <span>Explore Courses</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid max-w-3xl grid-cols-2 gap-8 mx-auto md:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="mb-2 text-3xl font-bold text-white md:text-4xl">{stat.number}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-6 py-20">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-4xl font-bold text-white">
                  Empowering Learners
                  <span className="block text-purple-400">Worldwide</span>
                </h2>
                <p className="mb-6 text-lg text-gray-300">
                  At LearnHub, we believe in democratizing education through technology. 
                  Our platform connects passionate learners with industry experts, creating 
                  an ecosystem where knowledge flows freely and skills are developed practically.
                </p>
                <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-400" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
                <button className="px-8 py-3 font-semibold text-white transition-all transform rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105">
                  Learn More About Us
                </button>
              </div>
              <div className="relative">
                <div className="p-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl backdrop-blur-sm">
                  <div className="p-6 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                    <h3 className="mb-4 text-2xl font-bold">Why Choose LearnHub?</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span>4.9/5 average rating from students</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span>Expert instructors from top companies</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Award className="w-5 h-5 text-purple-400" />
                        <span>Industry-recognized certifications</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span>Proven career advancement results</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="px-6 py-20">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white">Our Services</h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-300">
              Comprehensive learning solutions designed to accelerate your professional growth
            </p>
          </div>
          
          <div className="grid max-w-6xl gap-8 mx-auto md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <div key={index} className="relative group">
                <div className="p-8 text-center transition-all duration-300 transform border bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 hover:scale-105 border-white/10">
                  <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="mb-4 text-xl font-semibold text-white">{service.title}</h3>
                  <p className="leading-relaxed text-gray-300">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-6 text-4xl font-bold text-white">
              Ready to Transform Your Career?
            </h2>
            <p className="mb-8 text-xl text-gray-300">
              Join thousands of professionals who have already upgraded their skills with LearnHub
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="flex items-center justify-center px-8 py-4 space-x-2 font-semibold text-white transition-all transform rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105"
              >
                <span>Get Started Today</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
              <button className="px-8 py-4 font-semibold text-white transition-all border-2 rounded-full border-white/30 hover:bg-white/10">
                View All Courses
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
