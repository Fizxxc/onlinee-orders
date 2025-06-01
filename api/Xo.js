// Main serverless function that serves as the API controller
export default async function handler(req, res) {
  try {
    // Parse request body if it exists
    const body = req.body ? (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) : {};
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res, body);
      case 'PUT':
        return handlePut(req, res, body);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

// Handle GET requests
async function handleGet(req, res) {
  const { action, id } = req.query;
  
  switch (action) {
    case 'menu':
      return getMenu(req, res);
    case 'menuItem':
      return getMenuItem(req, res, id);
    case 'orders':
      return getOrders(req, res);
    case 'order':
      return getOrder(req, res, id);
    case 'users':
      return getUsers(req, res);
    case 'user':
      return getUser(req, res, id);
    case 'conversations':
      return getConversations(req, res);
    case 'messages':
      return getMessages(req, res, id);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

// Handle POST requests
async function handlePost(req, res, body) {
  const { action } = req.query;
  
  switch (action) {
    case 'register':
      return register(req, res, body);
    case 'login':
      return login(req, res, body);
    case 'adminLogin':
      return adminLogin(req, res, body);
    case 'createOrder':
      return createOrder(req, res, body);
    case 'addMenuItem':
      return addMenuItem(req, res, body);
    case 'sendMessage':
      return sendMessage(req, res, body);
    case 'createConversation':
      return createConversation(req, res, body);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

// Handle PUT requests
async function handlePut(req, res, body) {
  const { action, id } = req.query;
  
  switch (action) {
    case 'updateOrder':
      return updateOrder(req, res, id, body);
    case 'updateMenuItem':
      return updateMenuItem(req, res, id, body);
    case 'updateUser':
      return updateUser(req, res, id, body);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

// Handle DELETE requests
async function handleDelete(req, res) {
  const { action, id } = req.query;
  
  switch (action) {
    case 'deleteOrder':
      return deleteOrder(req, res, id);
    case 'deleteMenuItem':
      return deleteMenuItem(req, res, id);
    case 'deleteUser':
      return deleteUser(req, res, id);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

// Menu Functions
async function getMenu(req, res) {
  // In a real app, fetch from Firebase
  // This would connect to Firebase to get the menu items
  
  // For demo, return sample menu data
  const sampleMenu = [
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
    // Other menu items...
  ];
  
  return res.status(200).json({ menu: sampleMenu });
}

async function getMenuItem(req, res, id) {
  // In a real app, fetch from Firebase
  return res.status(200).json({ message: 'Menu item retrieved', id });
}

async function addMenuItem(req, res, body) {
  // In a real app, add to Firebase
  return res.status(201).json({ message: 'Menu item added', item: body });
}

async function updateMenuItem(req, res, id, body) {
  // In a real app, update in Firebase
  return res.status(200).json({ message: 'Menu item updated', id, item: body });
}

async function deleteMenuItem(req, res, id) {
  // In a real app, delete from Firebase
  return res.status(200).json({ message: 'Menu item deleted', id });
}

// Order Functions
async function getOrders(req, res) {
  // In a real app, fetch from Firebase
  return res.status(200).json({ message: 'Orders retrieved' });
}

async function getOrder(req, res, id) {
  // In a real app, fetch from Firebase
  return res.status(200).json({ message: 'Order retrieved', id });
}

async function createOrder(req, res, body) {
  // In a real app, add to Firebase
  return res.status(201).json({ message: 'Order created', order: body });
}

async function updateOrder(req, res, id, body) {
  // In a real app, update in Firebase
  return res.status(200).json({ message: 'Order updated', id, order: body });
}

async function deleteOrder(req, res, id) {
  // In a real app, delete from Firebase
  return res.status(200).json({ message: 'Order deleted', id });
}

// User Functions
async function getUsers(req, res) {
  // In a real app, fetch from Firebase
  return res.status(200).json({ message: 'Users retrieved' });
}

async function getUser(req, res, id) {
  // In a real app, fetch from Firebase
  return res.status(200).json({ message: 'User retrieved', id });
}

async function register(req, res, body) {
  // In a real app, register in Firebase Auth
  return res.status(201).json({ message: 'User registered', user: body });
}

async function login(req, res, body) {
  // In a real app, authenticate with Firebase Auth
  return res.status(200).json({ message: 'User logged in', user: body });
}

async function adminLogin(req, res, body) {
  // In a real app, authenticate with Firebase Auth and check admin status
  return res.status(200).json({ message: 'Admin logged in', user: body });
}

async function updateUser(req, res, id, body) {
  // In a real app, update in Firebase
  return res.status(200).json({ message: 'User updated', id, user: body });
}

async function deleteUser(req, res, id) {
  // In a real app, delete from Firebase
  return res.status(200).json({ message: 'User deleted', id });
}

// Chat Functions
async function getConversations(req, res) {
  // In a real app, fetch from Firebase
  return res.status(200).json({ message: 'Conversations retrieved' });
}

async function getMessages(req, res, conversationId) {
  // In a real app, fetch from Firebase
  return res.status(200).json({ message: 'Messages retrieved', conversationId });
}

async function sendMessage(req, res, body) {
  // In a real app, add to Firebase
  return res.status(201).json({ message: 'Message sent', msg: body });
}

async function createConversation(req, res, body) {
  // In a real app, add to Firebase
  return res.status(201).json({ message: 'Conversation created', conversation: body });
}