import { auth, checkAuthState } from './firebase-config.js';

// DOM Elements
const loginBtn = document.getElementById('loginBtn');

// Initialize App
const initApp = () => {
  // Check authentication state
  checkAuthState((user) => {
    if (user) {
      // User is signed in
      if (loginBtn) {
        loginBtn.textContent = 'My Account';
        loginBtn.href = 'user-profile.html'; // A page we could add later
      }
    } else {
      // User is signed out
      if (loginBtn) {
        loginBtn.textContent = 'Login';
        loginBtn.href = 'user.html';
      }
    }
  });

  // Initialize animations
  initAnimations();
};

// Handle Animations
const initAnimations = () => {
  // Animate elements when scrolled into view
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('visible');
      }
    });
  };

  window.addEventListener('scroll', animateOnScroll);
  animateOnScroll(); // Run once on load
  
  // Mobile menu toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.nav');
  
  if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);