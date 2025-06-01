import { auth, db } from './firebase-config.js';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// DOM Elements
const conversationList = document.getElementById('conversationList');
const chatHeader = document.getElementById('chatHeader');
const adminChatMessages = document.getElementById('adminChatMessages');
const adminChatForm = document.getElementById('adminChatForm');
const adminMessageInput = document.getElementById('adminMessageInput');
const refreshChat = document.getElementById('refreshChat');
const endChat = document.getElementById('endChat');
const chatFilters = document.querySelectorAll('.chat-filter');
const toggleInfo = document.getElementById('toggleInfo');
const chatInfo = document.querySelector('.chat-info');
const customerDetails = document.getElementById('customerDetails');
const customerOrderHistory = document.getElementById('customerOrderHistory');
const quickResponses = document.querySelectorAll('.quick-response');
const logoutBtn = document.getElementById('logoutBtn');
const chatCount = document.getElementById('chatCount');

// Current conversation state
let currentConversation = null;
let conversationsUnsubscribe = null;
let messagesUnsubscribe = null;

// Sample conversations for demo
const sampleConversations = [
  {
    id: 'conv1',
    customer: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '(123) 456-7890',
      joinedDate: '2025-01-15T10:30:00Z'
    },
    lastMessage: {
      text: 'I have a question about my order',
      timestamp: '2025-05-03T14:30:00Z',
      sender: 'customer'
    },
    status: 'active',
    unread: true
  },
  {
    id: 'conv2',
    customer: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '(234) 567-8901',
      joinedDate: '2025-02-10T14:45:00Z'
    },
    lastMessage: {
      text: 'Thank you for your help!',
      timestamp: '2025-05-02T16:15:00Z',
      sender: 'customer'
    },
    status: 'active',
    unread: false
  },
  {
    id: 'conv3',
    customer: {
      id: '3',
      name: 'Michael Johnson',
      email: 'michael@example.com',
      phone: '(345) 678-9012',
      joinedDate: '2025-01-05T09:15:00Z'
    },
    lastMessage: {
      text: 'Is my order on the way?',
      timestamp: '2025-05-03T10:45:00Z',
      sender: 'customer'
    },
    status: 'active',
    unread: true
  }
];

// Sample messages for each conversation
const sampleMessages = {
  'conv1': [
    {
      id: 'msg1',
      conversationId: 'conv1',
      text: 'Hello, I have a question about my order',
      timestamp: '2025-05-03T14:30:00Z',
      sender: 'customer'
    }
  ],
  'conv2': [
    {
      id: 'msg2',
      conversationId: 'conv2',
      text: 'Hi, I ordered a pizza but received a burger instead',
      timestamp: '2025-05-02T15:30:00Z',
      sender: 'customer'
    },
    {
      id: 'msg3',
      conversationId: 'conv2',
      text: 'I apologize for the mix-up. I will arrange for the correct order to be delivered to you right away.',
      timestamp: '2025-05-02T15:35:00Z',
      sender: 'admin'
    },
    {
      id: 'msg4',
      conversationId: 'conv2',
      text: 'Thank you for your help!',
      timestamp: '2025-05-02T16:15:00Z',
      sender: 'customer'
    }
  ],
  'conv3': [
    {
      id: 'msg5',
      conversationId: 'conv3',
      text: 'Is my order on the way?',
      timestamp: '2025-05-03T10:45:00Z',
      sender: 'customer'
    }
  ]
};

// Sample order history
const sampleOrderHistory = {
  '1': [
    { id: 'ORD-123456', date: '2025-04-15T14:30:00Z', total: 36.96 },
    { id: 'ORD-122345', date: '2025-03-28T12:15:00Z', total: 24.50 },
    { id: 'ORD-120987', date: '2025-03-10T18:45:00Z', total: 42.75 }
  ],
  '2': [
    { id: 'ORD-123457', date: '2025-05-02T10:15:00Z', total: 25.96 },
    { id: 'ORD-121234', date: '2025-04-20T19:30:00Z', total: 33.45 }
  ],
  '3': [
    { id: 'ORD-123458', date: '2025-05-02T16:45:00Z', total: 31.96 },
    { id: 'ORD-122456', date: '2025-04-18T11:30:00Z', total: 29.50 },
    { id: 'ORD-121567', date: '2025-04-05T20:15:00Z', total: 45.75 },
    { id: 'ORD-119876', date: '2025-03-22T13:45:00Z', total: 18.99 }
  ]
};

// Initialize Live Chat
const initLiveChat = () => {
  // Check if user is logged in and is admin
  checkAdminAuth();
  
  // Load conversations
  loadConversations();
  
  // Chat filters
  if (chatFilters.length > 0) {
    chatFilters.forEach(filter => {
      filter.addEventListener('click', () => {
        chatFilters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        filterConversations(filter.getAttribute('data-filter'));
      });
    });
  }
  
  // Chat form submission
  if (adminChatForm) {
    adminChatForm.addEventListener('submit', handleSendMessage);
  }
  
  // Refresh chat button
  if (refreshChat) {
    refreshChat.addEventListener('click', () => {
      if (currentConversation) {
        loadMessages(currentConversation.id);
      }
    });
  }
  
  // End chat button
  if (endChat) {
    endChat.addEventListener('click', handleEndChat);
  }
  
  // Toggle info panel
  if (toggleInfo) {
    toggleInfo.addEventListener('click', () => {
      chatInfo.classList.toggle('open');
    });
  }
  
  // Quick responses
  if (quickResponses.length > 0) {
    quickResponses.forEach(response => {
      response.addEventListener('click', () => {
        const text = response.getAttribute('data-response');
        if (adminMessageInput) {
          adminMessageInput.value = text;
          adminMessageInput.focus();
        }
      });
    });
  }
  
  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Handle mobile sidebar toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.admin-sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
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
    const adminNameElements = document.querySelectorAll('#adminName, #headerAdminName');
    if (adminNameElements.length > 0) {
      adminNameElements.forEach(element => {
        element.textContent = user.displayName || 'Admin User';
      });
    }
    
    const adminEmailElement = document.getElementById('adminEmail');
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

// Load conversations
const loadConversations = () => {
  // For a real app, use Firestore
  // In a real app:
  // conversationsUnsubscribe = onSnapshot(
  //   query(
  //     collection(db, 'conversations'),
  //     where('status', '==', 'active'),
  //     orderBy('lastMessage.timestamp', 'desc')
  //   ),
  //   (snapshot) => {
  //     const conversations = snapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data()
  //     }));
  //     renderConversations(conversations);
  //   }
  // );
  
  // For demo, use sample data
  renderConversations(sampleConversations);
  
  // Update unread count
  updateUnreadCount();
};

// Render conversations
const renderConversations = (conversations) => {
  if (!conversationList) return;
  
  if (conversations.length === 0) {
    conversationList.innerHTML = `
      <div class="no-conversations">
        <i class="fas fa-comments"></i>
        <p>No active conversations</p>
      </div>
    `;
    return;
  }
  
  conversationList.innerHTML = '';
  
  conversations.forEach(conversation => {
    const conversationItem = document.createElement('div');
    conversationItem.className = `conversation-item${conversation.unread ? ' unread' : ''}`;
    conversationItem.setAttribute('data-id', conversation.id);
    
    if (currentConversation && currentConversation.id === conversation.id) {
      conversationItem.classList.add('active');
    }
    
    const lastMessageTime = formatTime(conversation.lastMessage.timestamp);
    
    conversationItem.innerHTML = `
      <div class="conversation-avatar">
        <i class="fas fa-user"></i>
      </div>
      <div class="conversation-details">
        <div class="conversation-header">
          <span class="conversation-name">${conversation.customer.name}</span>
          <span class="conversation-time">${lastMessageTime}</span>
        </div>
        <p class="conversation-preview">
          ${conversation.lastMessage.sender === 'admin' ? 'You: ' : ''}
          ${conversation.lastMessage.text}
        </p>
      </div>
    `;
    
    conversationItem.addEventListener('click', () => {
      selectConversation(conversation);
    });
    
    conversationList.appendChild(conversationItem);
  });
};

// Filter conversations
const filterConversations = (filter) => {
  // In a real app, query Firestore with the filter
  // For demo, filter the sample conversations
  
  let filteredConversations;
  
  switch (filter) {
    case 'active':
      filteredConversations = sampleConversations.filter(conv => conv.status === 'active');
      break;
    case 'unread':
      filteredConversations = sampleConversations.filter(conv => conv.unread);
      break;
    default:
      filteredConversations = sampleConversations;
  }
  
  renderConversations(filteredConversations);
};

// Select conversation
const selectConversation = (conversation) => {
  // Update current conversation
  currentConversation = conversation;
  
  // Update UI
  const conversationItems = document.querySelectorAll('.conversation-item');
  conversationItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-id') === conversation.id) {
      item.classList.remove('unread');
      item.classList.add('active');
    }
  });
  
  // Update chat header
  if (chatHeader) {
    const customerName = document.getElementById('chatUserName');
    const customerStatus = document.getElementById('chatUserStatus');
    
    if (customerName) customerName.textContent = conversation.customer.name;
    if (customerStatus) customerStatus.textContent = 'Online';
  }
  
  // Enable chat input
  if (adminMessageInput) {
    adminMessageInput.disabled = false;
  }
  
  if (adminChatForm) {
    adminChatForm.querySelector('button[type="submit"]').disabled = false;
  }
  
  // Load messages
  loadMessages(conversation.id);
  
  // Load customer info
  loadCustomerInfo(conversation.customer);
  
  // Mark as read (in a real app, update in Firestore)
  // For demo, update the sample data
  const index = sampleConversations.findIndex(conv => conv.id === conversation.id);
  if (index !== -1) {
    sampleConversations[index].unread = false;
  }
  
  // Update unread count
  updateUnreadCount();
};

// Load messages
const loadMessages = (conversationId) => {
  // For a real app, use Firestore
  // In a real app:
  // if (messagesUnsubscribe) {
  //   messagesUnsubscribe();
  // }
  // 
  // messagesUnsubscribe = onSnapshot(
  //   query(
  //     collection(db, 'messages'),
  //     where('conversationId', '==', conversationId),
  //     orderBy('timestamp')
  //   ),
  //   (snapshot) => {
  //     const messages = snapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data()
  //     }));
  //     renderMessages(messages);
  //   }
  // );
  
  // For demo, use sample data
  const messages = sampleMessages[conversationId] || [];
  renderMessages(messages);
};

// Render messages
const renderMessages = (messages) => {
  if (!adminChatMessages) return;
  
  adminChatMessages.innerHTML = '';
  
  if (messages.length === 0) {
    adminChatMessages.innerHTML = `
      <div class="system-message">
        <p>No messages yet. Start the conversation!</p>
      </div>
    `;
    return;
  }
  
  messages.forEach(message => {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.sender}-message`;
    
    const messageTime = formatTime(message.timestamp);
    
    messageElement.innerHTML = `
      <p>${message.text}</p>
      <span class="message-time">${messageTime}</span>
    `;
    
    adminChatMessages.appendChild(messageElement);
  });
  
  // Scroll to bottom
  adminChatMessages.scrollTop = adminChatMessages.scrollHeight;
};

// Load customer info
const loadCustomerInfo = (customer) => {
  // Update customer details
  if (customerDetails) {
    customerDetails.classList.remove('hidden');
    
    document.getElementById('infoCustomerName').textContent = customer.name;
    document.getElementById('infoCustomerEmail').textContent = customer.email;
    document.getElementById('infoCustomerPhone').textContent = customer.phone;
    document.getElementById('infoCustomerSince').textContent = formatDate(customer.joinedDate);
  }
  
  // Load order history
  loadCustomerOrderHistory(customer.id);
};

// Load customer order history
const loadCustomerOrderHistory = (customerId) => {
  if (!customerOrderHistory) return;
  
  // For a real app, query Firestore for customer orders
  // For demo, use sample data
  const orders = sampleOrderHistory[customerId] || [];
  
  if (orders.length === 0) {
    customerOrderHistory.innerHTML = '<p>No order history available.</p>';
    return;
  }
  
  customerOrderHistory.innerHTML = '';
  
  orders.forEach(order => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    historyItem.innerHTML = `
      <span class="history-id">${order.id}</span>
      <span>${formatDate(order.date)} • $${order.total.toFixed(2)}</span>
    `;
    
    customerOrderHistory.appendChild(historyItem);
  });
};

// Handle send message
const handleSendMessage = (e) => {
  e.preventDefault();
  
  if (!currentConversation || !adminMessageInput) return;
  
  const text = adminMessageInput.value.trim();
  
  if (text === '') return;
  
  // For a real app, save to Firestore
  // In a real app:
  // const newMessage = {
  //   conversationId: currentConversation.id,
  //   text,
  //   timestamp: serverTimestamp(),
  //   sender: 'admin'
  // };
  // 
  // addDoc(collection(db, 'messages'), newMessage);
  // 
  // // Update last message in conversation
  // updateDoc(doc(db, 'conversations', currentConversation.id), {
  //   lastMessage: {
  //     text,
  //     timestamp: serverTimestamp(),
  //     sender: 'admin'
  //   }
  // });
  
  // For demo, add to sample data
  const newMessage = {
    id: `msg${Date.now()}`,
    conversationId: currentConversation.id,
    text,
    timestamp: new Date().toISOString(),
    sender: 'admin'
  };
  
  if (!sampleMessages[currentConversation.id]) {
    sampleMessages[currentConversation.id] = [];
  }
  
  sampleMessages[currentConversation.id].push(newMessage);
  
  // Update last message in conversation
  const index = sampleConversations.findIndex(conv => conv.id === currentConversation.id);
  if (index !== -1) {
    sampleConversations[index].lastMessage = {
      text,
      timestamp: new Date().toISOString(),
      sender: 'admin'
    };
  }
  
  // Clear input
  adminMessageInput.value = '';
  
  // Reload messages
  loadMessages(currentConversation.id);
  
  // Reload conversations
  renderConversations(sampleConversations);
};

// Handle end chat
const handleEndChat = () => {
  if (!currentConversation) return;
  
  // For a real app, update in Firestore
  // In a real app:
  // updateDoc(doc(db, 'conversations', currentConversation.id), {
  //   status: 'closed',
  //   closedAt: serverTimestamp()
  // });
  
  // For demo, update sample data
  const index = sampleConversations.findIndex(conv => conv.id === currentConversation.id);
  if (index !== -1) {
    sampleConversations[index].status = 'closed';
    // Remove from array
    sampleConversations.splice(index, 1);
  }
  
  // Update UI
  adminChatMessages.innerHTML = `
    <div class="no-chat-selected">
      <i class="fas fa-comments"></i>
      <p>Select a conversation to start chatting</p>
    </div>
  `;
  
  // Disable chat input
  if (adminMessageInput) {
    adminMessageInput.disabled = true;
    adminMessageInput.value = '';
  }
  
  if (adminChatForm) {
    adminChatForm.querySelector('button[type="submit"]').disabled = true;
  }
  
  // Update customer info
  if (customerDetails) {
    customerDetails.classList.add('hidden');
  }
  
  // Reset current conversation
  currentConversation = null;
  
  // Update chat header
  if (chatHeader) {
    const customerName = document.getElementById('chatUserName');
    const customerStatus = document.getElementById('chatUserStatus');
    
    if (customerName) customerName.textContent = 'Select a conversation';
    if (customerStatus) customerStatus.textContent = 'No active chat selected';
  }
  
  // Reload conversations
  renderConversations(sampleConversations);
  
  // Show notification
  alert('Chat has been ended');
};

// Update unread count
const updateUnreadCount = () => {
  if (chatCount) {
    const unreadCount = sampleConversations.filter(conv => conv.unread).length;
    chatCount.textContent = unreadCount;
    chatCount.style.display = unreadCount > 0 ? 'flex' : 'none';
  }
};

// Format time
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // If same day, show time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If within a week, show day name
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  // Otherwise show date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initLiveChat);