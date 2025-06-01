import { auth, db } from './firebase-config.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// DOM Elements
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.admin-sidebar');
const navLinks = document.querySelectorAll('.admin-nav a');
const logoutBtn = document.getElementById('logoutBtn');
const adminNameElements = document.querySelectorAll('#adminName, #headerAdminName');
const adminEmailElement = document.getElementById('adminEmail');
const sections = document.querySelectorAll('.content-section');
const totalOrdersCount = document.getElementById('totalOrdersCount');
const totalRevenue = document.getElementById('totalRevenue');
const totalCustomers = document.getElementById('totalCustomers');
const totalMenuItems = document.getElementById('totalMenuItems');
const recentOrdersTable = document.getElementById('recentOrdersTable');
const ordersTable = document.getElementById('ordersTable');
const topProductsList = document.getElementById('topProductsList');
const recentActivitiesList = document.getElementById('recentActivitiesList');
const menuItemsGrid = document.getElementById('menuItemsGrid');
const addMenuItem = document.getElementById('addMenuItem');
const menuItemModal = document.getElementById('menuItemModal');
const menuItemForm = document.getElementById('menuItemForm');
const cancelMenuItem = document.getElementById('cancelMenuItem');
const menuModalTitle = document.getElementById('menuModalTitle');
const customersTable = document.getElementById('customersTable');
const adminOverlay = document.getElementById('adminOverlay');
const closeModalButtons = document.querySelectorAll('.close-modal');
const viewOrderModal = document.getElementById('viewOrderModal');

// Sample data for demo
const sampleOrders = [
  {
    id: 'ORD-123456',
    customer: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '(123) 456-7890'
    },
    items: [
      { id: '1', name: 'Classic Burger', price: 12.99, quantity: 2, image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '4', name: 'Chocolate Cake', price: 7.99, quantity: 1, image: 'https://images.pexels.com/photos/132694/pexels-photo-132694.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }
    ],
    shipping: {
      address: '123 Main St, Apt 4B',
      city: 'New York',
      zipcode: '10001'
    },
    payment: {
      method: 'card',
      status: 'completed'
    },
    status: 'completed',
    subtotal: 33.97,
    deliveryFee: 2.99,
    total: 36.96,
    date: '2025-05-01T14:30:00Z'
  },
  {
    id: 'ORD-123457',
    customer: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '(234) 567-8901'
    },
    items: [
      { id: '2', name: 'Margherita Pizza', price: 14.99, quantity: 1, image: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '6', name: 'Iced Coffee', price: 3.99, quantity: 2, image: 'https://images.pexels.com/photos/2638019/pexels-photo-2638019.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }
    ],
    shipping: {
      address: '456 Oak Ave',
      city: 'Chicago',
      zipcode: '60007'
    },
    payment: {
      method: 'cash',
      status: 'pending'
    },
    status: 'delivering',
    subtotal: 22.97,
    deliveryFee: 2.99,
    total: 25.96,
    date: '2025-05-02T10:15:00Z'
  },
  {
    id: 'ORD-123458',
    customer: {
      id: '3',
      name: 'Michael Johnson',
      email: 'michael@example.com',
      phone: '(345) 678-9012'
    },
    items: [
      { id: '7', name: 'Pasta Carbonara', price: 13.99, quantity: 1, image: 'https://images.pexels.com/photos/1487511/pexels-photo-1487511.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '3', name: 'Caesar Salad', price: 9.99, quantity: 1, image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '8', name: 'Fresh Orange Juice', price: 4.99, quantity: 1, image: 'https://images.pexels.com/photos/158053/fresh-orange-juice-squeezed-refreshing-citrus-158053.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }
    ],
    shipping: {
      address: '789 Pine Blvd',
      city: 'Los Angeles',
      zipcode: '90001'
    },
    payment: {
      method: 'card',
      status: 'completed'
    },
    status: 'preparing',
    subtotal: 28.97,
    deliveryFee: 2.99,
    total: 31.96,
    date: '2025-05-02T16:45:00Z'
  },
  {
    id: 'ORD-123459',
    customer: {
      id: '4',
      name: 'Emily Davis',
      email: 'emily@example.com',
      phone: '(456) 789-0123'
    },
    items: [
      { id: '1', name: 'Classic Burger', price: 12.99, quantity: 1, image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '5', name: 'French Fries', price: 4.99, quantity: 1, image: 'https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }
    ],
    shipping: {
      address: '321 Maple St',
      city: 'Boston',
      zipcode: '02108'
    },
    payment: {
      method: 'cash',
      status: 'pending'
    },
    status: 'pending',
    subtotal: 17.98,
    deliveryFee: 2.99,
    total: 20.97,
    date: '2025-05-03T09:30:00Z'
  },
  {
    id: 'ORD-123460',
    customer: {
      id: '5',
      name: 'Robert Wilson',
      email: 'robert@example.com',
      phone: '(567) 890-1234'
    },
    items: [
      { id: '2', name: 'Margherita Pizza', price: 14.99, quantity: 2, image: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '4', name: 'Chocolate Cake', price: 7.99, quantity: 1, image: 'https://images.pexels.com/photos/132694/pexels-photo-132694.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }
    ],
    shipping: {
      address: '654 Cedar Rd',
      city: 'Miami',
      zipcode: '33101'
    },
    payment: {
      method: 'card',
      status: 'completed'
    },
    status: 'cancelled',
    subtotal: 37.97,
    deliveryFee: 2.99,
    total: 40.96,
    date: '2025-05-03T13:15:00Z'
  }
];

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

const sampleCustomers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(123) 456-7890',
    orderCount: 5,
    totalSpent: 185.45,
    joinedDate: '2025-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '(234) 567-8901',
    orderCount: 3,
    totalSpent: 92.85,
    joinedDate: '2025-02-10T14:45:00Z'
  },
  {
    id: '3',
    name: 'Michael Johnson',
    email: 'michael@example.com',
    phone: '(345) 678-9012',
    orderCount: 7,
    totalSpent: 213.50,
    joinedDate: '2025-01-05T09:15:00Z'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    phone: '(456) 789-0123',
    orderCount: 2,
    totalSpent: 45.90,
    joinedDate: '2025-03-20T16:30:00Z'
  },
  {
    id: '5',
    name: 'Robert Wilson',
    email: 'robert@example.com',
    phone: '(567) 890-1234',
    orderCount: 4,
    totalSpent: 132.75,
    joinedDate: '2025-02-25T11:20:00Z'
  }
];

const sampleActivities = [
  {
    id: '1',
    type: 'order',
    text: 'New order #ORD-123459 from Emily Davis',
    time: '2025-05-03T09:30:00Z'
  },
  {
    id: '2',
    type: 'user',
    text: 'New customer registered: Robert Wilson',
    time: '2025-05-03T08:15:00Z'
  },
  {
    id: '3',
    type: 'order',
    text: 'Order #ORD-123458 status changed to Preparing',
    time: '2025-05-02T17:00:00Z'
  },
  {
    id: '4',
    type: 'product',
    text: 'Menu item updated: Margherita Pizza',
    time: '2025-05-02T15:30:00Z'
  },
  {
    id: '5',
    type: 'order',
    text: 'Order #ORD-123457 status changed to Delivering',
    time: '2025-05-02T12:45:00Z'
  }
];

// Initialize Admin Dashboard
const initAdminDashboard = () => {
  // Check if user is logged in and is admin
  checkAdminAuth();
  
  // Toggle sidebar
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }
  
  // Navigation links
  if (navLinks.length > 0) {
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        if (section) {
          changeSection(section);
        }
      });
    });
  }
  
  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Load dashboard data
  loadDashboardData();
  
  // Menu item modal events
  if (addMenuItem) {
    addMenuItem.addEventListener('click', () => openMenuItemModal());
  }
  
  if (menuItemForm) {
    menuItemForm.addEventListener('submit', handleMenuItemSubmit);
  }
  
  if (cancelMenuItem) {
    cancelMenuItem.addEventListener('click', () => closeMenuItemModal());
  }
  
  // Close modal buttons
  if (closeModalButtons.length > 0) {
    closeModalButtons.forEach(button => {
      button.addEventListener('click', () => {
        closeAllModals();
      });
    });
  }
  
  // Admin overlay
  if (adminOverlay) {
    adminOverlay.addEventListener('click', () => {
      closeAllModals();
    });
  }
  
  // Image preview on menu item form
  const itemImageInput = document.getElementById('itemImage');
  if (itemImageInput) {
    itemImageInput.addEventListener('input', updateImagePreview);
  }
};

// Check if user is admin
const checkAdminAuth = () => {
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      // User not logged in, redirect to login
      window.location.href = 'login.html';
      return;
    }
    
    // For demo purposes, assume user is admin
    // In a real app, check admin status in Firestore
    
    // Update admin info
    if (adminNameElements.length > 0) {
      adminNameElements.forEach(element => {
        element.textContent = user.displayName || 'Admin User';
      });
    }
    
    if (adminEmailElement) {
      adminEmailElement.textContent = user.email;
    }
  });
};

// Handle logout
const handleLogout = async () => {
  try {
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

// Change active section
const changeSection = (sectionId) => {
  // Update active nav link
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-section') === sectionId) {
      link.classList.add('active');
    }
  });
  
  // Update active section
  sections.forEach(section => {
    section.classList.remove('active');
    if (section.id === sectionId) {
      section.classList.add('active');
      
      // Load section data if needed
      if (sectionId === 'orders' && ordersTable) {
        loadOrdersTable();
      } else if (sectionId === 'menu' && menuItemsGrid) {
        loadMenuItemsGrid();
      } else if (sectionId === 'customers' && customersTable) {
        loadCustomersTable();
      }
    }
  });
};

// Load dashboard data
const loadDashboardData = () => {
  // Set stats counts
  if (totalOrdersCount) totalOrdersCount.textContent = sampleOrders.length;
  
  if (totalRevenue) {
    const revenue = sampleOrders.reduce((sum, order) => sum + order.total, 0);
    totalRevenue.textContent = `$${revenue.toFixed(2)}`;
  }
  
  if (totalCustomers) totalCustomers.textContent = sampleCustomers.length;
  if (totalMenuItems) totalMenuItems.textContent = sampleMenuItems.length;
  
  // Load recent orders table
  loadRecentOrdersTable();
  
  // Load top products
  loadTopProducts();
  
  // Load recent activities
  loadRecentActivities();
  
  // Load orders table
  if (document.getElementById('orders').classList.contains('active') && ordersTable) {
    loadOrdersTable();
  }
  
  // Load menu items grid
  if (document.getElementById('menu').classList.contains('active') && menuItemsGrid) {
    loadMenuItemsGrid();
  }
  
  // Load customers table
  if (document.getElementById('customers').classList.contains('active') && customersTable) {
    loadCustomersTable();
  }
};

// Load recent orders table
const loadRecentOrdersTable = () => {
  if (!recentOrdersTable) return;
  
  const tbody = recentOrdersTable.querySelector('tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  // Get 5 most recent orders
  const recentOrders = [...sampleOrders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  
  recentOrders.forEach(order => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.customer.name}</td>
      <td><span class="order-status status-${order.status}">${capitalize(order.status)}</span></td>
      <td>$${order.total.toFixed(2)}</td>
      <td>${formatDate(order.date)}</td>
    `;
    
    tbody.appendChild(row);
  });
};

// Load top products
const loadTopProducts = () => {
  if (!topProductsList) return;
  
  topProductsList.innerHTML = '';
  
  // Sort menu items by featured status
  const topItems = [...sampleMenuItems].sort((a, b) => b.featured - a.featured).slice(0, 5);
  
  topItems.forEach(item => {
    const li = document.createElement('li');
    
    li.innerHTML = `
      <div class="product-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="product-info">
        <h4 class="product-name">${item.name}</h4>
        <div class="product-meta">
          <span>${getCategoryName(item.category)}</span>
          <span>•</span>
          <span>$${item.price.toFixed(2)}</span>
        </div>
      </div>
      <div class="product-sales">
        ${item.featured ? '<i class="fas fa-star"></i>' : ''} 
        ${Math.floor(Math.random() * 50) + 20} sold
      </div>
    `;
    
    topProductsList.appendChild(li);
  });
};

// Load recent activities
const loadRecentActivities = () => {
  if (!recentActivitiesList) return;
  
  recentActivitiesList.innerHTML = '';
  
  sampleActivities.forEach(activity => {
    const li = document.createElement('li');
    
    li.innerHTML = `
      <div class="activity-icon ${activity.type}">
        <i class="fas fa-${getActivityIcon(activity.type)}"></i>
      </div>
      <div class="activity-details">
        <p class="activity-text">${activity.text}</p>
        <span class="activity-time">${formatDate(activity.time)}</span>
      </div>
    `;
    
    recentActivitiesList.appendChild(li);
  });
};

// Load orders table
const loadOrdersTable = () => {
  if (!ordersTable) return;
  
  const tbody = ordersTable.querySelector('tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  sampleOrders.forEach(order => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.customer.name}</td>
      <td>${order.items.length} items</td>
      <td>$${order.total.toFixed(2)}</td>
      <td>${formatDate(order.date)}</td>
      <td><span class="order-status status-${order.status}">${capitalize(order.status)}</span></td>
      <td>
        <div class="table-actions">
          <button class="action-btn view-btn" data-id="${order.id}" title="View Order">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn edit-btn" data-id="${order.id}" title="Edit Order">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" data-id="${order.id}" title="Delete Order">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    tbody.appendChild(row);
  });
  
  // Add event listeners to view buttons
  const viewButtons = tbody.querySelectorAll('.view-btn');
  viewButtons.forEach(button => {
    button.addEventListener('click', () => {
      const orderId = button.getAttribute('data-id');
      openViewOrderModal(orderId);
    });
  });
};

// Open view order modal
const openViewOrderModal = (orderId) => {
  const order = sampleOrders.find(order => order.id === orderId);
  if (!order || !viewOrderModal) return;
  
  // Populate modal with order details
  document.getElementById('modalOrderId').textContent = order.id;
  document.getElementById('modalOrderDate').textContent = formatDate(order.date);
  document.getElementById('modalOrderStatus').textContent = capitalize(order.status);
  document.getElementById('modalOrderStatus').className = `order-status status-${order.status}`;
  
  document.getElementById('modalCustomerName').textContent = order.customer.name;
  document.getElementById('modalCustomerEmail').textContent = order.customer.email;
  document.getElementById('modalCustomerPhone').textContent = order.customer.phone;
  
  document.getElementById('modalDeliveryAddress').textContent = order.shipping.address;
  document.getElementById('modalDeliveryCity').textContent = order.shipping.city;
  document.getElementById('modalDeliveryZip').textContent = order.shipping.zipcode;
  
  document.getElementById('modalPaymentMethod').textContent = capitalize(order.payment.method);
  document.getElementById('modalPaymentStatus').textContent = capitalize(order.payment.status);
  
  const orderItemsList = document.getElementById('modalOrderItems');
  orderItemsList.innerHTML = '';
  
  order.items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'order-item';
    
    itemElement.innerHTML = `
      <div class="order-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="order-item-details">
        <h4 class="order-item-name">${item.name}</h4>
        <div class="order-item-meta">
          <span>Qty: ${item.quantity}</span>
        </div>
      </div>
      <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
    `;
    
    orderItemsList.appendChild(itemElement);
  });
  
  document.getElementById('modalSubtotal').textContent = `$${order.subtotal.toFixed(2)}`;
  document.getElementById('modalDeliveryFee').textContent = `$${order.deliveryFee.toFixed(2)}`;
  document.getElementById('modalTotal').textContent = `$${order.total.toFixed(2)}`;
  
  // Set status dropdown to current status
  document.getElementById('updateStatusSelect').value = order.status;
  
  // Add event listener to update status button
  const updateStatusBtn = document.getElementById('updateStatusBtn');
  updateStatusBtn.onclick = () => {
    const newStatus = document.getElementById('updateStatusSelect').value;
    // In a real app, update the status in the database
    closeAllModals();
    alert(`Order ${order.id} status updated to ${capitalize(newStatus)}`);
  };
  
  // Show modal
  viewOrderModal.classList.add('active');
  adminOverlay.classList.add('active');
};

// Load menu items grid
const loadMenuItemsGrid = () => {
  if (!menuItemsGrid) return;
  
  menuItemsGrid.innerHTML = '';
  
  sampleMenuItems.forEach(item => {
    const menuItemCard = document.createElement('div');
    menuItemCard.className = 'menu-item-card';
    
    menuItemCard.innerHTML = `
      <div class="menu-item-actions">
        <button class="action-btn edit-btn" data-id="${item.id}" title="Edit Item">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete-btn" data-id="${item.id}" title="Delete Item">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      
      ${item.featured ? `<span class="menu-item-badge badge-featured">Featured</span>` : ''}
      
      ${!item.available ? `<div class="menu-availability">Unavailable</div>` : ''}
      
      <div class="menu-item-img">
        <img src="${item.image}" alt="${item.name}">
      </div>
      
      <div class="menu-item-details">
        <div class="menu-item-header">
          <h3 class="menu-item-title">${item.name}</h3>
          <span class="menu-item-price">$${item.price.toFixed(2)}</span>
        </div>
        
        <p class="menu-item-text">${item.description}</p>
        
        <div class="menu-item-footer">
          <span class="menu-item-category">${getCategoryName(item.category)}</span>
        </div>
      </div>
    `;
    
    menuItemsGrid.appendChild(menuItemCard);
  });
  
  // Add event listeners to edit buttons
  const editButtons = menuItemsGrid.querySelectorAll('.edit-btn');
  editButtons.forEach(button => {
    button.addEventListener('click', () => {
      const itemId = button.getAttribute('data-id');
      openMenuItemModal(itemId);
    });
  });
};

// Open menu item modal
const openMenuItemModal = (itemId = null) => {
  if (!menuItemModal) return;
  
  const isEdit = itemId !== null;
  
  // Set modal title
  if (menuModalTitle) {
    menuModalTitle.textContent = isEdit ? 'Edit Menu Item' : 'Add New Menu Item';
  }
  
  // Reset form
  if (menuItemForm) {
    menuItemForm.reset();
  }
  
  // Reset image preview
  const imagePreview = document.getElementById('imagePreview');
  if (imagePreview) {
    imagePreview.innerHTML = '<i class="fas fa-image"></i><p>Image Preview</p>';
  }
  
  // If editing, populate form with item data
  if (isEdit) {
    const item = sampleMenuItems.find(item => item.id === itemId);
    if (item) {
      document.getElementById('itemName').value = item.name;
      document.getElementById('itemPrice').value = item.price;
      document.getElementById('itemDescription').value = item.description;
      document.getElementById('itemCategory').value = item.category;
      document.getElementById('itemAvailability').value = item.available ? 'available' : 'unavailable';
      document.getElementById('itemImage').value = item.image;
      document.getElementById('itemFeatured').checked = item.featured;
      document.getElementById('itemId').value = item.id;
      
      // Update image preview
      updateImagePreview();
    }
  } else {
    // Clear hidden ID field
    document.getElementById('itemId').value = '';
  }
  
  // Show modal
  menuItemModal.classList.add('active');
  adminOverlay.classList.add('active');
};

// Close menu item modal
const closeMenuItemModal = () => {
  if (menuItemModal) {
    menuItemModal.classList.remove('active');
    adminOverlay.classList.remove('active');
  }
};

// Handle menu item form submission
const handleMenuItemSubmit = (e) => {
  e.preventDefault();
  
  const itemId = document.getElementById('itemId').value;
  const isEdit = itemId !== '';
  
  // Get form values
  const name = document.getElementById('itemName').value;
  const price = parseFloat(document.getElementById('itemPrice').value);
  const description = document.getElementById('itemDescription').value;
  const category = document.getElementById('itemCategory').value;
  const available = document.getElementById('itemAvailability').value === 'available';
  const image = document.getElementById('itemImage').value;
  const featured = document.getElementById('itemFeatured').checked;
  
  // In a real app, save to Firestore
  // For demo, just show success message
  
  closeMenuItemModal();
  
  const message = isEdit ? 
    `Menu item "${name}" has been updated successfully.` : 
    `Menu item "${name}" has been added successfully.`;
  
  alert(message);
};

// Update image preview
const updateImagePreview = () => {
  const imageInput = document.getElementById('itemImage');
  const imagePreview = document.getElementById('imagePreview');
  
  if (imageInput && imagePreview && imageInput.value) {
    imagePreview.innerHTML = `<img src="${imageInput.value}" alt="Preview">`;
  } else if (imagePreview) {
    imagePreview.innerHTML = '<i class="fas fa-image"></i><p>Image Preview</p>';
  }
};

// Load customers table
const loadCustomersTable = () => {
  if (!customersTable) return;
  
  const tbody = customersTable.querySelector('tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  sampleCustomers.forEach(customer => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${customer.id}</td>
      <td>${customer.name}</td>
      <td>${customer.email}</td>
      <td>${customer.phone}</td>
      <td>${customer.orderCount}</td>
      <td>$${customer.totalSpent.toFixed(2)}</td>
      <td>${formatDate(customer.joinedDate)}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn view-btn" data-id="${customer.id}" title="View Customer">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn edit-btn" data-id="${customer.id}" title="Edit Customer">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" data-id="${customer.id}" title="Delete Customer">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    tbody.appendChild(row);
  });
};

// Close all modals
const closeAllModals = () => {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.classList.remove('active');
  });
  
  if (adminOverlay) {
    adminOverlay.classList.remove('active');
  }
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

// Get activity icon
const getActivityIcon = (type) => {
  const icons = {
    order: 'shopping-bag',
    user: 'user',
    product: 'utensils'
  };
  
  return icons[type] || 'bell';
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Capitalize first letter
const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdminDashboard);