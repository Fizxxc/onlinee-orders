import { auth, checkAuthState } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { db } from './firebase-config.js';

// DOM Elements
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const overlay = document.getElementById('overlay');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const loginMessage = document.getElementById('loginMessage');
const checkoutForm = document.getElementById('checkoutForm');
const cashPayment = document.getElementById('cashOnDelivery');
const cardPayment = document.getElementById('cardPayment');
const cardDetails = document.getElementById('cardDetails');
const subtotalElement = document.getElementById('subtotal');
const deliveryFeeElement = document.getElementById('deliveryFee');
const orderTotalElement = document.getElementById('orderTotal');
const confirmationModal = document.getElementById('confirmationModal');
const orderIdElement = document.getElementById('orderId');
const trackOrderBtn = document.getElementById('trackOrderBtn');
const continueShoppingBtn = document.getElementById('continueShoppingBtn');

// Initialize Order Page
const initOrderPage = () => {
  // Update cart count
  updateCartCount();
  
  // Load cart items
  loadCartItems();
  
  // Cart toggling
  if (cartBtn) {
    cartBtn.addEventListener('click', toggleCart);
  }
  
  if (closeCart) {
    closeCart.addEventListener('click', toggleCart);
  }
  
  if (overlay) {
    overlay.addEventListener('click', () => {
      if (cartSidebar.classList.contains('open')) {
        toggleCart();
      }
      closeAllModals();
    });
  }
  
  // Checkout button
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', openCheckout);
  }
  
  // Close modal buttons
  if (closeModalButtons.length > 0) {
    closeModalButtons.forEach(button => {
      button.addEventListener('click', () => {
        closeAllModals();
      });
    });
  }
  
  // Payment method toggle
  if (cashPayment && cardPayment && cardDetails) {
    cashPayment.addEventListener('change', togglePaymentMethod);
    cardPayment.addEventListener('change', togglePaymentMethod);
  }
  
  // Checkout form submission
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', processOrder);
  }
  
  // Confirmation modal buttons
  if (trackOrderBtn) {
    trackOrderBtn.addEventListener('click', () => {
      // This would redirect to a tracking page in a real app
      window.location.href = 'index.html';
    });
  }
  
  if (continueShoppingBtn) {
    continueShoppingBtn.addEventListener('click', () => {
      closeAllModals();
      window.location.reload();
    });
  }
  
  // Check authentication state
  checkAuthState(user => {
    if (loginMessage) {
      loginMessage.style.display = user ? 'none' : 'block';
    }
    
    if (checkoutForm) {
      checkoutForm.style.display = user ? 'block' : 'none';
    }
  });
};

// Toggle cart sidebar
const toggleCart = () => {
  cartSidebar.classList.toggle('open');
  overlay.classList.toggle('active');
  document.body.style.overflow = cartSidebar.classList.contains('open') ? 'hidden' : '';
};

// Load cart items
const loadCartItems = () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cart.length === 0) {
    // Show empty cart message
    cartItems.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-basket"></i>
        <p>Your cart is empty</p>
        <p class="empty-cart-message">Add some delicious items to get started!</p>
      </div>
    `;
    
    if (cartTotal) cartTotal.textContent = '$0.00';
    if (checkoutBtn) checkoutBtn.disabled = true;
    
    return;
  }
  
  // Calculate total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Update cart items
  cartItems.innerHTML = '';
  
  cart.forEach(item => {
    const cartItemHTML = `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.name}</h4>
          <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
          <div class="cart-item-controls">
            <div class="quantity-control">
              <button class="quantity-btn decrease">-</button>
              <span class="quantity-display">${item.quantity}</span>
              <button class="quantity-btn increase">+</button>
            </div>
            <button class="remove-item">Remove</button>
          </div>
        </div>
      </div>
    `;
    
    cartItems.innerHTML += cartItemHTML;
  });
  
  // Update total
  if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
  if (checkoutBtn) checkoutBtn.disabled = false;
  
  // Add event listeners to quantity buttons
  document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
    button.addEventListener('click', decreaseQuantity);
  });
  
  document.querySelectorAll('.quantity-btn.increase').forEach(button => {
    button.addEventListener('click', increaseQuantity);
  });
  
  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', removeItem);
  });
  
  // Update checkout summary if elements exist
  if (subtotalElement && deliveryFeeElement && orderTotalElement) {
    const subtotal = total;
    const deliveryFee = 2.99;
    const orderTotal = subtotal + deliveryFee;
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    deliveryFeeElement.textContent = `$${deliveryFee.toFixed(2)}`;
    orderTotalElement.textContent = `$${orderTotal.toFixed(2)}`;
  }
};

// Increase item quantity
const increaseQuantity = (e) => {
  const cartItem = e.target.closest('.cart-item');
  const itemId = cartItem.getAttribute('data-id');
  
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Find the item
  const itemIndex = cart.findIndex(item => item.id === itemId);
  
  if (itemIndex !== -1) {
    // Increase quantity
    cart[itemIndex].quantity += 1;
    
    // Update localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Reload cart items
    loadCartItems();
    updateCartCount();
  }
};

// Decrease item quantity
const decreaseQuantity = (e) => {
  const cartItem = e.target.closest('.cart-item');
  const itemId = cartItem.getAttribute('data-id');
  
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Find the item
  const itemIndex = cart.findIndex(item => item.id === itemId);
  
  if (itemIndex !== -1) {
    // Decrease quantity
    cart[itemIndex].quantity -= 1;
    
    // Remove item if quantity is 0
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
    
    // Update localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Reload cart items
    loadCartItems();
    updateCartCount();
  }
};

// Remove item from cart
const removeItem = (e) => {
  const cartItem = e.target.closest('.cart-item');
  const itemId = cartItem.getAttribute('data-id');
  
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Remove the item
  const updatedCart = cart.filter(item => item.id !== itemId);
  
  // Update localStorage
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  
  // Reload cart items
  loadCartItems();
  updateCartCount();
};

// Update cart count
const updateCartCount = () => {
  const cartCountElement = document.querySelector('.cart-count');
  if (cartCountElement) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = itemCount;
  }
};

// Open checkout modal
const openCheckout = () => {
  // Close cart sidebar
  toggleCart();
  
  // Open checkout modal
  if (checkoutModal) {
    checkoutModal.classList.add('active');
    overlay.classList.add('active');
  }
};

// Close all modals
const closeAllModals = () => {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.classList.remove('active');
  });
  
  overlay.classList.remove('active');
  document.body.style.overflow = '';
};

// Toggle payment method
const togglePaymentMethod = () => {
  if (cardDetails) {
    cardDetails.style.display = cardPayment.checked ? 'block' : 'none';
  }
};

// Process order
const processOrder = async (e) => {
  e.preventDefault();
  
  // Get user
  const user = auth.currentUser;
  
  if (!user) {
    // User not logged in
    if (loginMessage) {
      loginMessage.style.display = 'block';
    }
    return;
  }
  
  // Get cart items
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cart.length === 0) {
    return;
  }
  
  // Get form data
  const address = document.getElementById('address').value;
  const city = document.getElementById('city').value;
  const zipcode = document.getElementById('zipcode').value;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 2.99;
  const total = subtotal + deliveryFee;
  
  try {
    // In a real app, we would save to Firestore
    const orderRef = await addDoc(collection(db, 'orders'), {
      userId: user.uid,
      items: cart,
      shipping: {
        address,
        city,
        zipcode
      },
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      status: 'pending',
      subtotal,
      deliveryFee,
      total,
      createdAt: serverTimestamp()
    });
    
    // // For demo purposes, create a fake order ID
    // const orderId = 'ORD-' + Math.floor(Math.random() * 1000000);
    
    // Show confirmation modal
    checkoutModal.classList.remove('active');
    confirmationModal.classList.add('active');
    
    if (orderIdElement) {
      orderIdElement.textContent = orderId;
    }
    
    // Clear cart
    localStorage.removeItem('cart');
    updateCartCount();
    
  } catch (error) {
    console.error('Error processing order:', error);
    alert('There was an error processing your order. Please try again.');
  }
};

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initOrderPage);