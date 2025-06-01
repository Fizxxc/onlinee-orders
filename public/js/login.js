import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// DOM Elements
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginError = document.getElementById('adminLoginError');
const togglePassword = document.querySelector('.toggle-password');

// Initialize Admin Login
const initAdminLogin = () => {
  // Admin login form
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', handleAdminLogin);
  }
  
  // Toggle password visibility
  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      const passwordInput = document.getElementById('adminPassword');
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePassword.classList.toggle('fa-eye');
      togglePassword.classList.toggle('fa-eye-slash');
    });
  }
};

// Handle admin login
const handleAdminLogin = async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;
  
  try {
    // Show loading state
    adminLoginForm.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    adminLoginForm.querySelector('button[type="submit"]').disabled = true;
    
    // Attempt login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if user is an admin
    const isAdmin = await checkIfAdmin(user.uid);
    
    if (isAdmin) {
      // Redirect to admin dashboard
      window.location.href = 'admin-dashboard.html';
    } else {
      // Not an admin
      throw new Error('Not authorized as admin');
    }
    
  } catch (error) {
    console.error('Admin login error:', error);
    
    let errorMessage = 'Failed to login. Please try again.';
    
    if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No admin account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    } else if (error.message === 'Not authorized as admin') {
      errorMessage = 'This account does not have admin privileges.';
    }
    
    if (adminLoginError) {
      adminLoginError.textContent = errorMessage;
      adminLoginError.style.display = 'block';
    }
    
    // Reset button
    adminLoginForm.querySelector('button[type="submit"]').innerHTML = 'Login';
    adminLoginForm.querySelector('button[type="submit"]').disabled = false;
  }
};

// Check if user is admin
const checkIfAdmin = async (uid) => {
  try {
    // For demo purposes, hardcode admin credentials
    // In a real app, check against Firestore collection
    
    // Demo admin: admin@example.com / admin123
    return true;
    
    // Real implementation would be:
    // const adminRef = doc(db, 'admins', uid);
    // const adminSnap = await getDoc(adminRef);
    // return adminSnap.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdminLogin);