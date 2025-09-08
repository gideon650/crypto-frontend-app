// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
// Replace these with your actual Firebase config values
firebase.initializeApp({
  apiKey: "AIzaSyAf7y029COfcBwjrnFikMzq4XeLdGg9thk",
  authDomain: "amalunwa.firebaseapp.com", 
  projectId: "amalunwa",
  storageBucket: "amalunwa.firebasestorage.app",
  messagingSenderId: "582475691199",
  appId: "1:582475691199:web:0c8b2f91721a808e1e020a"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title || 'Notification';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new notification',
    icon: '/firebase-logo.png',
    badge: '/badge-icon.png',
    data: payload.data,
    actions: getNotificationActions(payload.data),
    tag: payload.data?.type || 'general',
    requireInteraction: payload.data?.type === 'deposit_approval' || payload.data?.type === 'withdrawal_confirmation'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'approve' || action === 'decline' || action === 'confirm') {
    // Handle quick actions - you might want to implement API calls here
    handleQuickAction(action, data);
  } else {
    // Open the app
    event.waitUntil(
      clients.matchAll().then(clientList => {
        if (clientList.length > 0) {
          // Focus existing window
          return clientList[0].focus();
        }
        // Open new window
        return clients.openWindow('/notifications');
      })
    );
  }
});

function getNotificationActions(data) {
  const actions = [];
  
  if (data?.type === 'deposit_approval') {
    actions.push(
      { action: 'approve', title: 'Approve' },
      { action: 'decline', title: 'Decline' }
    );
  } else if (data?.type === 'withdrawal_confirmation') {
    actions.push(
      { action: 'confirm', title: 'Confirm' },
      { action: 'decline', title: 'Decline' }
    );
  }
  
  actions.push({ action: 'view', title: 'View' });
  return actions;
}

async function handleQuickAction(action, data) {
  try {
    // Get auth token from IndexedDB or make a postMessage to get it
    // For now, just open the notifications page
    const url = `/notifications?action=${action}&id=${data.id || ''}`;
    await clients.openWindow(url);
  } catch (error) {
    console.error('Error handling quick action:', error);
    clients.openWindow('/notifications');
  }
}
