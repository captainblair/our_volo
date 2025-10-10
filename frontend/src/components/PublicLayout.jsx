import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { BsList, BsX } from 'react-icons/bs';

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      // Small delay to ensure the page has loaded before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    if (location.pathname === '/') {
      const handleScroll = () => {
        const sections = ['home', 'features', 'about', 'contact'];
        const scrollPosition = window.scrollY + 100;
        
        for (const section of sections) {
          const element = document.getElementById(section);
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
    }
  }, [location.pathname]);

  return (
    <div className={`min-h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
    }`}>
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-40 dark:bg-gray-800">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">VOLO</h1>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          <button 
            onClick={() => scrollToSection('home')}
            className={`${activeSection === 'home' ? 'text-orange-600 dark:text-orange-400 font-semibold' : 'text-gray-700 dark:text-gray-300'} hover:text-orange-500 dark:hover:text-orange-400 transition-colors`}
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('features')}
            className={`${activeSection === 'features' ? 'text-orange-600 dark:text-orange-400 font-semibold' : 'text-gray-700 dark:text-gray-300'} hover:text-orange-500 dark:hover:text-orange-400 transition-colors`}
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('about')}
            className={`${activeSection === 'about' ? 'text-orange-600 dark:text-orange-400 font-semibold' : 'text-gray-700 dark:text-gray-300'} hover:text-orange-500 dark:hover:text-orange-400 transition-colors`}
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('contact')}
            className={`${activeSection === 'contact' ? 'text-orange-600 dark:text-orange-400 font-semibold' : 'text-gray-700 dark:text-gray-300'} hover:text-orange-500 dark:hover:text-orange-400 transition-colors`}
          >
            Contact
          </button>
        </div>
        
        <div className="hidden md:flex space-x-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-orange-600 dark:text-orange-400 border border-orange-600 dark:border-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors"
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
        
        {/* Mobile menu button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <BsX className="h-6 w-6" />
          ) : (
            <BsList className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden fixed inset-0 bg-white dark:bg-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-yellow-600 dark:text-yellow-500">VOLO</h2>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close menu"
              >
                <BsX className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <button
              onClick={() => scrollToSection('home')}
              className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium ${
                activeSection === 'home' 
                  ? 'bg-orange-50 text-orange-600 dark:bg-gray-700 dark:text-orange-400' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Home
            </button>
            
            <button
              onClick={() => scrollToSection('features')}
              className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium ${
                activeSection === 'features' 
                  ? 'bg-orange-50 text-orange-600 dark:bg-gray-700 dark:text-orange-400' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Features
            </button>
            
            <button
              onClick={() => scrollToSection('about')}
              className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium ${
                activeSection === 'about' 
                  ? 'bg-orange-50 text-orange-600 dark:bg-gray-700 dark:text-orange-400' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              About
            </button>
            
            <button
              onClick={() => scrollToSection('contact')}
              className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium ${
                activeSection === 'contact' 
                  ? 'bg-orange-50 text-orange-600 dark:bg-gray-700 dark:text-orange-400' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Contact
            </button>
            
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full mb-3 px-4 py-2 text-orange-600 dark:text-orange-400 border border-orange-600 dark:border-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors text-center"
              >
                Login
              </button>
              <button 
                onClick={() => {
                  navigate('/signup');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-center"
              >
                Sign Up
              </button>
            </div>
          </nav>
        </div>
      </div>


      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
