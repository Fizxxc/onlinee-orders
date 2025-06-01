import { db } from './firebase-config.js';
import { collection, getDocs, query, where, limit, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// DOM Elements
const popularItemsContainer = document.getElementById('popularItems');
const menuItemsContainer = document.getElementById('menuItems');

// Sample menu data (will be replaced with Firebase data)
const sampleMenuItems = [
  {
    id: '1',
    name: 'Classic Burger',
    description: 'Juicy beef patty with fresh lettuce, tomatoes, and our special sauce',
    price: 12.99,
    category: 'main',
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    featured: true,
    available: true
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    description: 'Traditional Italian pizza with fresh mozzarella, tomatoes, and basil',
    price: 14.99,
    category: 'main',
    image: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    featured: true,
    available: true
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with Caesar dressing, croutons, and parmesan cheese',
    price: 9.99,
    category: 'sides',
    image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    featured: false,
    available: true
  },
  {
    id: '4',
    name: 'Chocolate Cake',
    description: 'Rich and moist chocolate cake with a smooth ganache topping',
    price: 7.99,
    category: 'desserts',
    image: 'https://images.pexels.com/photos/132694/pexels-photo-132694.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    featured: true,
    available: true
  },
  {
    id: '5',
    name: 'French Fries',
    description: 'Crispy golden fries seasoned to perfection',
    price: 4.99,
    category: 'sides',
    image: 'https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    featured: false,
    available: true
  },
  {
    id: '6',
    name: 'Iced Coffee',
    description: 'Refreshing cold coffee with cream and ice',
    price: 3.99,
    category: 'drinks',
    image: 'https://images.pexels.com/photos/2638019/pexels-photo-2638019.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    featured: false,
    available: true
  },
  {
    id: '7',
    name: 'Pasta Carbonara',
    description: 'Creamy pasta with bacon, eggs, and parmesan cheese',
    price: 13.99,
    category: 'main',
    image: 'https://images.pexels.com/photos/1487511/pexels-photo-1487511.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    featured: true,
    available: true
  },
  {
    id: '8',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 4.99,
    category: 'drinks',
    image: 'https://images.pexels.com/photos/158053/fresh-orange-juice-squeezed-refreshing-citrus-158053.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    featured: false,
    available: true
  }
];

// Load menu items from Firestore
const loadMenuItems = async () => {
  try {
    // In a real app, we would fetch from Firestore
    // const menuSnapshot = await getDocs(collection(db, 'menuItems'));
    // const menuItems = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // For demo purposes, using sample data
    const menuItems = sampleMenuItems;
    
    // Load popular items for the homepage
    if (popularItemsContainer) {
      loadPopularItems(menuItems);
    }
    
    // Load all menu items for the order page
    if (menuItemsContainer) {
      loadAllMenuItems(menuItems);
      setupMenuFilters(menuItems);
    }
    
    return menuItems;
  } catch (error) {
    console.error('Error loading menu items:', error);
    return [];
  }
};

// Load popular items for the homepage
const loadPopularItems = (menuItems) => {
  const featuredItems = menuItems.filter(item => item.featured);
  popularItemsContainer.innerHTML = '';
  
  featuredItems.forEach(item => {
    const menuItemHTML = createMenuItemCard(item);
    popularItemsContainer.innerHTML += menuItemHTML;
  });
  
  // Add event listeners to Add to Cart buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const itemId = e.currentTarget.getAttribute('data-id');
      addToCart(itemId);
    });
  });
};

// Load all menu items for the order page
const loadAllMenuItems = (menuItems) => {
  menuItemsContainer.innerHTML = '';
  
  menuItems.forEach(item => {
    const menuItemHTML = createMenuItemCard(item);
    menuItemsContainer.innerHTML += menuItemHTML;
  });
  
  // Add event listeners to Add to Cart buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const itemId = e.currentTarget.getAttribute('data-id');
      addToCart(itemId);
    });
  });
};

// Create menu item card HTML
const createMenuItemCard = (item) => {
  return `
    <div class="menu-item" data-category="${item.category}">
      <div class="menu-item-image">
        <img src="${item.image}" alt="${item.name}">
        <span class="menu-category">${getCategoryName(item.category)}</span>
      </div>
      <div class="menu-item-content">
        <h3 class="menu-item-title">${item.name}</h3>
        <p class="menu-item-description">${item.description}</p>
        <div class="menu-item-footer">
          <span class="menu-item-price">$${item.price.toFixed(2)}</span>
          <button class="add-to-cart" data-id="${item.id}">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `;
};

// Get category name from category code
const getCategoryName = (category) => {
  const categories = {
    main: 'Main Dish',
    sides: 'Side',
    desserts: 'Dessert',
    drinks: 'Drink'
  };
  
  return categories[category] || category;
};

// Setup menu filters for the order page
const setupMenuFilters = (menuItems) => {
  const searchInput = document.getElementById('searchMenu');
  const categoryButtons = document.querySelectorAll('.filter-btn');
  const sortSelect = document.getElementById('sortMenu');
  
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterMenuItems();
    });
  }
  
  if (categoryButtons.length > 0) {
    categoryButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        filterMenuItems();
      });
    });
  }
  
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      filterMenuItems();
    });
  }
  
  // Filter function
  const filterMenuItems = () => {
    const searchValue = searchInput ? searchInput.value.toLowerCase() : '';
    const activeCategory = document.querySelector('.filter-btn.active').getAttribute('data-category');
    const sortValue = sortSelect ? sortSelect.value : 'name';
    
    // First filter by search and category
    let filteredItems = menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchValue) || 
                           item.description.toLowerCase().includes(searchValue);
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    // Then sort the filtered items
    switch(sortValue) {
      case 'name':
        filteredItems.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        filteredItems.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredItems.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filteredItems.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
    
    // Update the display
    loadAllMenuItems(filteredItems);
  };
};

// Add item to cart
const addToCart = (itemId) => {
  // Get existing cart from localStorage or create empty cart
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Find the item in the cart
  const existingItemIndex = cart.findIndex(item => item.id === itemId);
  
  if (existingItemIndex !== -1) {
    // Item already in cart, increase quantity
    cart[existingItemIndex].quantity += 1;
  } else {
    // Item not in cart, find it in menu items and add with quantity 1
    const menuItem = sampleMenuItems.find(item => item.id === itemId);
    if (menuItem) {
      cart.push({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image,
        quantity: 1
      });
    }
  }
  
  // Save updated cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart count
  updateCartCount();
  
  // Show notification
  showNotification(`Added ${sampleMenuItems.find(item => item.id === itemId).name} to cart`);
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

// Show notification
const showNotification = (message) => {
  // Check if notification container exists, if not create it
  let notificationContainer = document.querySelector('.notification-container');
  
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
    
    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
      }
      .notification {
        background-color: var(--primary-color);
        color: white;
        padding: 12px 24px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        transform: translateX(120%);
        transition: transform 0.3s ease;
      }
      .notification.show {
        transform: translateX(0);
      }
      .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
        margin-left: 10px;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    ${message}
    <button class="notification-close">&times;</button>
  `;
  
  // Add notification to container
  notificationContainer.appendChild(notification);
  
  // Show notification with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Add close button event
  const closeButton = notification.querySelector('.notification-close');
  closeButton.addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 3000);
};

// Initialize menu
document.addEventListener('DOMContentLoaded', () => {
  loadMenuItems();
  updateCartCount();
});