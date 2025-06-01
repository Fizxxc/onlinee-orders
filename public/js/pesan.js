import { auth, db } from './firebase-config.js';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// DOM Elements
const chatButton = document.getElementById('chatButton');
const chatPopup = document.getElementById('chatPopup');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');

// Chat state
let currentConversationId = null;
let messagesUnsubscribe = null;

// Initialize Chat
const initChat = () => {
  // Toggle chat popup
  if (chatButton) {
    chatButton.addEventListener('click', toggleChat);
  }
  
  if (closeChat) {
    closeChat.addEventListener('click', toggleChat);
  }
  
  // Chat form submission
  if (chatForm) {
    chatForm.addEventListener('submit', handleSendMessage);
  }
  
  // Check auth state
  auth.onAuthStateChanged(user => {
    if (user) {
      // User is signed in, check for existing conversation
      checkForExistingConversation(user.uid);
    }
  });
};

// Toggle chat popup
const toggleChat = () => {
  if (chatPopup) {
    chatPopup.classList.toggle('open');
    
    if (chatPopup.classList.contains('open')) {
      messageInput.focus();
    }
  }
};

// Check for existing conversation
const checkForExistingConversation = async (userId) => {
  try {
    // In a real app, query Firestore for existing conversation
    // For demo, just create a new conversation if user is logged in
    
    if (!currentConversationId) {
      // For demo, use a dummy conversation ID
      currentConversationId = `conv-${userId}-${Date.now()}`;
      
      // Load messages
      loadMessages();
    }
  } catch (error) {
    console.error('Error checking for existing conversation:', error);
  }
};

// Load messages
const loadMessages = () => {
  // For a real app, use Firestore
  // In a real app:
  // if (messagesUnsubscribe) {
  //   messagesUnsubscribe();
  // }
  // 
  // messagesUnsubscribe = onSnapshot(
  //   query(
  //     collection(db, 'messages'),
  //     where('conversationId', '==', currentConversationId),
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
  
  // For demo, just show the welcome message
  renderMessages([]);
};

// Render messages
const renderMessages = (messages) => {
  if (!chatMessages) return;
  
  // Keep the welcome message
  chatMessages.innerHTML = `
    <div class="message system-message">
      <p>Welcome to FoodFlex support! How can we help you today?</p>
      <span class="message-time">Just now</span>
    </div>
  `;
  
  // Add all messages
  messages.forEach(message => {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.sender}-message`;
    
    const messageTime = formatTime(message.timestamp);
    
    messageElement.innerHTML = `
      <p>${message.text}</p>
      <span class="message-time">${messageTime}</span>
    `;
    
    chatMessages.appendChild(messageElement);
  });
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

// Handle send message
const handleSendMessage = (e) => {
  e.preventDefault();
  
  const text = messageInput.value.trim();
  
  if (text === '') return;
  
  const user = auth.currentUser;
  
  if (!user) {
    // User not logged in, show login prompt
    chatMessages.innerHTML += `
      <div class="message system-message">
        <p>Please <a href="user.html">login</a> to continue the conversation.</p>
        <span class="message-time">Just now</span>
      </div>
    `;
    
    // Clear input
    messageInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return;
  }
  
  // Create conversation if it doesn't exist
  if (!currentConversationId) {
    currentConversationId = `conv-${user.uid}-${Date.now()}`;
  }
  
  // For a real app, save to Firestore
  // In a real app:
  // const newMessage = {
  //   conversationId: currentConversationId,
  //   text,
  //   timestamp: serverTimestamp(),
  //   sender: 'user',
  //   userId: user.uid
  // };
  // 
  // addDoc(collection(db, 'messages'), newMessage);
  // 
  // // Check if conversation exists, if not create it
  // checkOrCreateConversation(user, text);
  
  // For demo, just add to UI
  const messageElement = document.createElement('div');
  messageElement.className = 'message user-message';
  
  messageElement.innerHTML = `
    <p>${text}</p>
    <span class="message-time">Just now</span>
  `;
  
  chatMessages.appendChild(messageElement);
  
  // Add dummy response after a delay
  setTimeout(() => {
    const responseElement = document.createElement('div');
    responseElement.className = 'message admin-message';
    
    responseElement.innerHTML = `
      <p>Thank you for your message. Our team will get back to you shortly.</p>
      <span class="message-time">Just now</span>
    `;
    
    chatMessages.appendChild(responseElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 1000);
  
  // Clear input
  messageInput.value = '';
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

// Check or create conversation
const checkOrCreateConversation = async (user, firstMessage) => {
  try {
    // In a real app, check if conversation exists, if not create it
    // For demo, just assume it's created
  } catch (error) {
    console.error('Error creating conversation:', error);
  }
};

// Format time
const formatTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initChat);