import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import videoSource from "../media/11269279-uhd_3840_2160_24fps.mp4";
import volovolovolo from "../media/volovolovolo.avif";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000"; // Django backend URL

export default function Homepage() {
  const [activeSection, setActiveSection] = useState("home");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const slide = {
    image: volovolovolo,
    title: "Efficient Task Allocation",
    description: "Ensure the right tasks reach the right teams with our intelligent assignment system."
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      setTimeout(() => {
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }, 400);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'features', 'about', 'contact'];
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementId(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-yellow-600">VOLO</h1>
        </div>
        
        <div className="hidden md:flex space-x-8">
          <button 
            onClick={() => scrollToSection('home')}
            className={`${activeSection === 'home' ? 'text-orange-600 font-semibold' : 'text-gray-700'} hover:text-orange-500 transition-colors`}
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('features')}
            className={`${activeSection === 'features' ? 'text-orange-600 font-semibold' : 'text-gray-700'} hover:text-orange-500 transition-colors`}
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('about')}
            className={`${activeSection === 'about' ? 'text-orange-600 font-semibold' : 'text-gray-700'} hover:text-orange-500 transition-colors`}
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('contact')}
            className={`${activeSection === 'contact' ? 'text-orange-600 font-semibold' : 'text-gray-700'} hover:text-orange-500 transition-colors`}
          >
            Contact
          </button>
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section with Static Image */}
      <section id="home" className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            onError={() => console.error(`Failed to load image: ${slide.image}`)}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-3xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">{slide.title}</h2>
              <p className="text-xl md:text-2xl mb-8">{slide.description}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/signup')}
                  className="px-8 py-3 bg-orange-600 text-white rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  Get Started
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="px-8 py-3 bg-white text-orange-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => scrollToSection('features')}
            className="animate-bounce text-white"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Streamline Your Department Communication</h2>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Our platform is specifically designed to address the communication challenges faced by companies like Volo Africa
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-orange-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Communication</h3>
              <p className="text-gray-600">Chat instantly with team members across departments with our integrated messaging system.</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Task Management</h3>
              <p className="text-gray-600">Assign, track, and manage tasks efficiently with role-based allocation and progress monitoring.</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Performance Analytics</h3>
              <p className="text-gray-600">Gain insights into team performance, task completion rates, and departmental efficiency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-black text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-5xl font-bold text-orange-600 mb-2">89%</p>
            <p className="text-lg">Increase in inter-department communication efficiency</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-orange-600 mb-2">42%</p>
            <p className="text-lg">Reduction in task completion time</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-orange-600 mb-2">76%</p>
            <p className="text-lg">Decrease in misallocated tasks</p>
          </div>
        </div>
      </section>

      <div>
      {/* About Section with Video */}
      <section id="about" className="relative w-full h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <video
            src={videoSource}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            onError={() => console.error("Failed to load video:", videoSource)}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-3xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-yellow-400">Our Mission</h2>
              <p className="text-xl md:text-2xl mb-8">Happy drivers, happy riders, and a better environment.</p>
            </div>
          </div>
        </div>
      </section>
    </div>

      {/* Footer */}
      <footer id="contact" className="bg-gray-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-orange-500">VOLO</h3>
            <p className="text-gray-400">OWN THE JOURNEY, OWN THE PLATFORM.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => scrollToSection('home')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <address className="text-gray-400 not-italic">
              <p>Ngong Road, Nairobi</p>
              <p>Kenya</p>
              <p>info@volo.africa</p>
              <p>+254 746 821 567</p>
            </address>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Volo Africa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}