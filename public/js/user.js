import { auth, db } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const googleLoginBtn = document.getElementById('googleLogin');
const passwordToggles = document.querySelectorAll('.toggle-password');

// Initialize User Authentication
const initUserAuth = () => {
  // Login form
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Register form
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
    
    // Password strength meter
    const passwordInput = document.getElementById('registerPassword');
    if (passwordInput) {
      passwordInput.addEventListener('input', updatePasswordStrength);
    }
  }
  
  // Google login button
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', handleGoogleLogin);
  }
  
  // Password toggle visibility
  if (passwordToggles.length > 0) {
    passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', togglePasswordVisibility);
    });
  }
};

// Handle login form submission
const handleLogin = async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    // Show loading state
    loginForm.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginForm.querySelector('button[type="submit"]').disabled = true;
    
    // Attempt login
    await signInWithEmailAndPassword(auth, email, password);
    
    // Redirect after successful login
    window.location.href = 'index.html';
    
  } catch (error) {
    // Handle errors
    console.error('Login error:', error);
    
    let errorMessage = 'Failed to login. Please try again.';
    
    if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    }
    
    if (loginError) {
      loginError.textContent = errorMessage;
      loginError.style.display = 'block';
    }
    
    // Reset button
    loginForm.querySelector('button[type="submit"]').innerHTML = 'Login';
    loginForm.querySelector('button[type="submit"]').disabled = false;
  }
};

// Handle register form submission
const handleRegister = async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('registerEmail').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const termsAccepted = document.getElementById('terms').checked;
  
  // Validate input
  if (password !== confirmPassword) {
    registerError.textContent = 'Passwords do not match.';
    registerError.style.display = 'block';
    return;
  }
  
  if (!isStrongPassword(password)) {
    registerError.textContent = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';
    registerError.style.display = 'block';
    return;
  }
  
  if (!termsAccepted) {
    registerError.textContent = 'You must accept the Terms & Conditions.';
    registerError.style.display = 'block';
    return;
  }
  
  try {
    // Show loading state
    registerForm.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    registerForm.querySelector('button[type="submit"]').disabled = true;
    
    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store additional user info in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      phone,
      createdAt: new Date().toISOString()
    });
    
    // Redirect after successful registration
    window.location.href = 'index.html';
    
  } catch (error) {
    // Handle errors
    console.error('Registration error:', error);
    
    let errorMessage = 'Failed to create account. Please try again.';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    }
    
    if (registerError) {
      registerError.textContent = errorMessage;
      registerError.style.display = 'block';
    }
    
    // Reset button
    registerForm.querySelector('button[type="submit"]').innerHTML = 'Create Account';
    registerForm.querySelector('button[type="submit"]').disabled = false;
  }
};

// Handle Google login
const handleGoogleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if this is a new user
    const isNewUser = result._tokenResponse.isNewUser;
    
    if (isNewUser) {
      // Store user info in Firestore for new users
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName,
        email: user.email,
        phone: user.phoneNumber || '',
        createdAt: new Date().toISOString()
      });
    }
    
    // Redirect after successful login
    window.location.href = 'index.html';
    
  } catch (error) {
    console.error('Google login error:', error);
    
    if (loginError) {
      loginError.textContent = 'Google login failed. Please try again.';
      loginError.style.display = 'block';
    }
  }
};

// Toggle password visibility
const togglePasswordVisibility = (e) => {
  const toggle = e.target;
  const passwordInput = toggle.previousElementSibling;
  
  // Toggle input type
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggle.classList.remove('fa-eye');
    toggle.classList.add('fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    toggle.classList.remove('fa-eye-slash');
    toggle.classList.add('fa-eye');
  }
};

// Check if password is strong
const isStrongPassword = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  return password.length >= minLength && 
         hasUppercase && 
         hasLowercase && 
         hasNumber && 
         hasSpecial;
};

// Update password strength meter
const updatePasswordStrength = (e) => {
  const password = e.target.value;
  const strengthMeter = document.querySelector('.strength-meter span');
  const strengthText = document.querySelector('.strength-text');
  
  if (!strengthMeter || !strengthText) return;
  
  let strength = 0;
  let strengthLabel = '';
  
  // Calculate strength
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[a-z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 12.5;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 12.5;
  
  // Update strength meter
  strengthMeter.style.width = `${strength}%`;
  
  // Determine color based on strength
  if (strength < 25) {
    strengthMeter.style.backgroundColor = '#EF4444';
    strengthLabel = 'Very Weak';
  } else if (strength < 50) {
    strengthMeter.style.backgroundColor = '#F59E0B';
    strengthLabel = 'Weak';
  } else if (strength < 75) {
    strengthMeter.style.backgroundColor = '#10B981';
    strengthLabel = 'Good';
  } else {
    strengthMeter.style.backgroundColor = '#22C55E';
    strengthLabel = 'Strong';
  }
  
  strengthText.textContent = `Password strength: ${strengthLabel}`;
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initUserAuth);