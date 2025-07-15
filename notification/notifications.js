// ==========================================
// Notifications Page - Complete JavaScript
// Health Food E-commerce Platform
// Standalone Implementation
// ==========================================

// Global State Management
const NotificationState = {
  notifications: [],
  currentFilter: 'all',
  unreadCount: 0,
  isLoading: false,
  settingsOpen: false,
  page: 1,
  hasMore: true
};

// Notification Categories
const NotificationTypes = {
  ORDER: 'orders',
  PROMOTION: 'promotions', 
  HEALTH: 'health',
  SYSTEM: 'system',
  NEWS: 'news'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Notifications app initializing...');
  initializeNotifications();
  setupEventListeners();
  loadNotificationSettings();
  updateUnreadCount();
  console.log('✅ Notifications app ready!');
});

// ==========================================
// Core Functions
// ==========================================

function initializeNotifications() {
  // Get existing notifications from DOM
  const notificationElements = document.querySelectorAll('.notification-item');
  NotificationState.notifications = Array.from(notificationElements).map((el, index) => ({
    id: el.dataset.id || `not-${index + 1}`,
    type: el.dataset.type || 'system',
    read: el.dataset.read === 'true',
    important: el.dataset.important === 'true',
    element: el,
    timestamp: new Date(Date.now() - (index * 3600000)) // Simulate different times
  }));
  
  console.log('📋 Notifications initialized:', NotificationState.notifications.length);
}

function setupEventListeners() {
  console.log('🔧 Setting up event listeners...');
  
  // Filter tab buttons
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', function() {
      const filter = this.dataset.filter;
      if (filter) {
        filterNotifications(filter);
      }
    });
  });

  // Settings panel toggle
  const settingsBtn = document.querySelector('.settings-btn');
  const closeSettingsBtn = document.querySelector('.close-settings-btn');
  const overlay = document.getElementById('overlay');
  
  if (settingsBtn) {
    settingsBtn.addEventListener('click', toggleSettings);
  }
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', toggleSettings);
  }
  if (overlay) {
    overlay.addEventListener('click', toggleSettings);
  }

  // Toggle switches in settings
  document.querySelectorAll('.toggle-switch').forEach(toggle => {
    toggle.addEventListener('change', function() {
      saveNotificationSetting(this.id, this.checked);
    });
  });

  // Load more button
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', loadMoreNotifications);
  }

  // Floating action button
  const fabBtn = document.querySelector('.floating-action-btn');
  if (fabBtn) {
    fabBtn.addEventListener('click', markAllAsRead);
  }

  // Back button
  const backBtn = document.querySelector('.back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', goBack);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
  
  console.log('✅ Event listeners ready');
}

// ==========================================
// Navigation Functions
// ==========================================

function goBack() {
  console.log('🔙 Going back...');
  // Check if we can go back in history
  if (window.history.length > 1) {
    window.history.back();
  } else {
    // Fallback to homepage
    window.location.href = '../../home/index.html';
  }
}

function handleKeyboardShortcuts(event) {
  // ESC key to close settings panel
  if (event.key === 'Escape' && NotificationState.settingsOpen) {
    toggleSettings();
  }
  
  // Ctrl/Cmd + A to mark all as read
  if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
    event.preventDefault();
    markAllAsRead();
  }
}

// ==========================================
// Filter Functions
// ==========================================

function filterNotifications(filterType) {
  console.log('🔍 Filtering notifications by:', filterType);
  
  // Update active tab
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeTab = document.querySelector(`[data-filter="${filterType}"]`);
  if (activeTab) {
    activeTab.classList.add('active');
  }
  
  // Update state
  NotificationState.currentFilter = filterType;
  
  // Filter notifications
  const notifications = document.querySelectorAll('.notification-item');
  let visibleCount = 0;
  
  notifications.forEach(notification => {
    const notType = notification.dataset.type;
    const isRead = notification.dataset.read === 'true';
    const isImportant = notification.dataset.important === 'true';
    
    let shouldShow = true;
    
    switch (filterType) {
      case 'all':
        shouldShow = true;
        break;
      case 'unread':
        shouldShow = !isRead;
        break;
      case 'important':
        shouldShow = isImportant;
        break;
      case 'orders':
        shouldShow = notType === 'orders';
        break;
      case 'promotions':
        shouldShow = notType === 'promotions';
        break;
      case 'health':
        shouldShow = notType === 'health';
        break;
      case 'system':
        shouldShow = notType === 'system';
        break;
      default:
        shouldShow = true;
    }
    
    if (shouldShow) {
      notification.classList.remove('hidden');
      notification.style.display = 'flex';
      visibleCount++;
      // Add animation
      notification.style.animation = 'fadeInUp 0.3s ease-out';
    } else {
      notification.classList.add('hidden');
      notification.style.display = 'none';
    }
  });
  
  // Show/hide empty state
  const emptyState = document.getElementById('emptyState');
  const notificationsList = document.getElementById('notificationsList');
  
  if (visibleCount === 0) {
    if (emptyState) {
      emptyState.style.display = 'block';
      const titleEl = emptyState.querySelector('.empty-title');
      const messageEl = emptyState.querySelector('.empty-message');
      if (titleEl) titleEl.textContent = getEmptyStateTitle(filterType);
      if (messageEl) messageEl.textContent = getEmptyStateMessage(filterType);
    }
    if (notificationsList) {
      notificationsList.style.display = 'none';
    }
  } else {
    if (emptyState) {
      emptyState.style.display = 'none';
    }
    if (notificationsList) {
      notificationsList.style.display = 'flex';
    }
  }
  
  console.log(`📊 Filtered: ${visibleCount} notifications shown`);
}

function getEmptyStateTitle(filterType) {
  const titles = {
    'all': 'ไม่มีการแจ้งเตือน',
    'unread': 'ไม่มีข้อความที่ยังไม่ได้อ่าน',
    'important': 'ไม่มีการแจ้งเตือนสำคัญ',
    'orders': 'ไม่มีการแจ้งเตือนคำสั่งซื้อ',
    'promotions': 'ไม่มีโปรโมชั่น',
    'health': 'ไม่มีเคล็ดลับสุขภาพ',
    'system': 'ไม่มีการแจ้งเตือนระบบ'
  };
  return titles[filterType] || 'ไม่มีการแจ้งเตือน';
}

function getEmptyStateMessage(filterType) {
  const messages = {
    'all': 'เมื่อมีการแจ้งเตือนใหม่ จะปรากฏที่นี่',
    'unread': 'คุณได้อ่านข้อความทั้งหมดแล้ว',
    'important': 'ไม่มีการแจ้งเตือนสำคัญในขณะนี้',
    'orders': 'การแจ้งเตือนเกี่ยวกับคำสั่งซื้อจะปรากฏที่นี่',
    'promotions': 'โปรโมชั่นและข้อเสนอพิเศษจะปรากฏที่นี่',
    'health': 'เคล็ดลับและคำแนะนำสุขภาพจะปรากฏที่นี่',
    'system': 'การแจ้งเตือนจากระบบจะปรากฏที่นี่'
  };
  return messages[filterType] || 'ไม่มีข้อมูลในหมวดหมู่นี้';
}

// ==========================================
// Notification Actions
// ==========================================

function markAsRead(notificationId) {
  console.log('✅ Marking notification as read:', notificationId);
  
  const notification = document.querySelector(`[data-id="${notificationId}"]`);
  if (!notification) {
    console.warn('⚠️ Notification not found:', notificationId);
    return;
  }
  
  // Update DOM
  notification.classList.remove('unread');
  notification.dataset.read = 'true';
  
  // Hide mark as read button
  const markReadBtn = notification.querySelector('.mark-read-btn');
  if (markReadBtn) {
    markReadBtn.style.opacity = '0';
    markReadBtn.style.pointerEvents = 'none';
  }
  
  // Update state
  const notificationData = NotificationState.notifications.find(n => n.id === notificationId);
  if (notificationData) {
    notificationData.read = true;
  }
  
  // Update counters
  updateUnreadCount();
  
  // Show success feedback
  showToast('ทำเครื่องหมายว่าอ่านแล้ว', 'success');
  
  // Analytics tracking
  trackNotificationAction('mark_read', notificationId);
}

function markAllAsRead() {
  console.log('✅ Marking all notifications as read');
  
  const unreadNotifications = document.querySelectorAll('.notification-item.unread');
  
  if (unreadNotifications.length === 0) {
    showToast('ไม่มีข้อความที่ยังไม่ได้อ่าน', 'info');
    return;
  }
  
  // Animate and mark each notification
  unreadNotifications.forEach((notification, index) => {
    setTimeout(() => {
      notification.classList.remove('unread');
      notification.dataset.read = 'true';
      
      const markReadBtn = notification.querySelector('.mark-read-btn');
      if (markReadBtn) {
        markReadBtn.style.opacity = '0';
        markReadBtn.style.pointerEvents = 'none';
      }
    }, index * 100); // Stagger animation
  });
  
  // Update state
  NotificationState.notifications.forEach(n => {
    n.read = true;
  });
  
  // Update counters
  setTimeout(() => {
    updateUnreadCount();
    showToast(`ทำเครื่องหมาย ${unreadNotifications.length} ข้อความว่าอ่านแล้ว`, 'success');
  }, unreadNotifications.length * 100);
  
  // Analytics tracking
  trackNotificationAction('mark_all_read', null, unreadNotifications.length);
}

function updateUnreadCount() {
  const unreadNotifications = document.querySelectorAll('.notification-item.unread');
  const count = unreadNotifications.length;
  
  NotificationState.unreadCount = count;
  
  // Update count displays
  const unreadCountEl = document.getElementById('unreadCount');
  const tabBadge = document.querySelector('[data-filter="unread"] .tab-badge');
  
  if (unreadCountEl) {
    unreadCountEl.textContent = count;
    unreadCountEl.style.display = count > 0 ? 'block' : 'none';
  }
  
  if (tabBadge) {
    tabBadge.textContent = count;
    tabBadge.style.display = count > 0 ? 'inline-block' : 'none';
  }
  
  // Update page title
  if (count > 0) {
    document.title = `(${count}) การแจ้งเตือน - Health Food Platform`;
  } else {
    document.title = 'การแจ้งเตือน - Health Food Platform';
  }
  
  console.log('📊 Unread count updated:', count);
}

// ==========================================
// Action Handlers
// ==========================================

function trackOrder(orderId) {
  console.log('📦 Tracking order:', orderId);
  showToast('กำลังเปิดหน้าติดตามการส่ง...', 'info');
  
  // Simulate navigation delay
  setTimeout(() => {
    // In real app, this would navigate to order tracking page
    alert(`ติดตามคำสั่งซื้อ: ${orderId}\n\nในแอปจริงจะไปหน้าติดตามการส่ง`);
  }, 500);
  
  trackNotificationAction('track_order', orderId);
}

function callRider(orderId) {
  console.log('📞 Calling rider for order:', orderId);
  
  // Simulate phone call
  const phoneNumber = '081-234-5678'; // Mock rider phone
  showToast(`กำลังโทรหาไรเดอร์: ${phoneNumber}`, 'info');
  
  // On mobile devices, this would initiate a phone call
  if (navigator.userAgent.match(/iPhone|Android/i)) {
    window.location.href = `tel:${phoneNumber}`;
  } else {
    alert(`โทรหาไรเดอร์: ${phoneNumber}\n\nบนมือถือจะโทรออกจริง`);
  }
  
  trackNotificationAction('call_rider', orderId);
}

function usePoints() {
  console.log('⭐ Using points');
  showToast('กำลังเปิดหน้าใช้แต้ม...', 'info');
  
  setTimeout(() => {
    alert('เปิดหน้าใช้แต้ม\n\nในแอปจริงจะไปหน้ารีวอร์ด');
  }, 500);
  
  trackNotificationAction('use_points');
}

function viewRewards() {
  console.log('🎁 Viewing rewards');
  showToast('กำลังเปิดหน้ารีวอร์ด...', 'info');
  setTimeout(() => {
    alert('เปิดหน้ารีวอร์ด\n\nในแอปจริงจะไปหน้ารีวอร์ด');
  }, 500);
  trackNotificationAction('view_rewards');
}

function viewHealthTips() {
  console.log('💪 Viewing health tips');
  showToast('กำลังเปิดศูนย์สุขภาพ...', 'info');
  setTimeout(() => {
    alert('เปิดศูนย์สุขภาพ\n\nในแอปจริงจะไปหน้าเคล็ดลับสุขภาพ');
  }, 500);
  trackNotificationAction('view_health_tips');
}

function exploreProducts() {
  console.log('🛍️ Exploring products');
  showToast('กำลังเปิดหน้าสินค้า...', 'info');
  setTimeout(() => {
    alert('เปิดหน้าสินค้า\n\nในแอปจริงจะไปหน้าแสดงสินค้า');
  }, 500);
  trackNotificationAction('explore_products');
}

function setupProfile() {
  console.log('👤 Setting up profile');
  showToast('กำลังเปิดหน้าโปรไฟล์...', 'info');
  setTimeout(() => {
    alert('เปิดหน้าโปรไฟล์\n\nในแอปจริงจะไปหน้าตั้งค่าโปรไฟล์');
  }, 500);
  trackNotificationAction('setup_profile');
}

function viewFlashSale() {
  console.log('⚡ Viewing flash sale');
  showToast('กำลังเปิดหน้า Flash Sale...', 'info');
  setTimeout(() => {
    alert('เปิดหน้า Flash Sale\n\nในแอปจริงจะไปหน้าโปรโมชั่น');
  }, 500);
  trackNotificationAction('view_flash_sale');
}

function handleNewsAction(button) {
  console.log('📰 Handling news action');
  const card = button.closest('.highlight-card');
  const newsType = card ? card.dataset.type : 'unknown';
  
  showToast('กำลังเปิดหน้าข่าวสาร...', 'info');
  
  setTimeout(() => {
    alert('เปิดหน้าข่าวสาร\n\nในแอปจริงจะไปหน้าเมนูใหม่');
  }, 500);
  
  trackNotificationAction('view_news', newsType);
}

// ==========================================
// Settings Functions
// ==========================================

function toggleSettings() {
  const settingsPanel = document.getElementById('settingsPanel');
  const overlay = document.getElementById('overlay');
  
  if (!settingsPanel) return;
  
  NotificationState.settingsOpen = !NotificationState.settingsOpen;
  
  if (NotificationState.settingsOpen) {
    settingsPanel.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  } else {
    settingsPanel.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  console.log('⚙️ Settings panel toggled:', NotificationState.settingsOpen);
}

function saveNotificationSetting(settingId, enabled) {
  console.log('💾 Saving notification setting:', settingId, enabled);
  
  // Save to localStorage
  const settings = getNotificationSettings();
  settings[settingId] = enabled;
  
  try {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('❌ Error saving settings:', error);
  }
  
  // Show feedback
  const settingLabels = {
    orderStatus: 'สถานะการสั่งซื้อ',
    deliveryStatus: 'การจัดส่ง',
    paymentStatus: 'การชำระเงิน',
    promotions: 'โปรโมชั่นพิเศษ',
    flashSales: 'Flash Sale',
    rewards: 'แต้มสะสมและรีวอร์ด',
    healthTips: 'เคล็ดลับสุขภาพ',
    menuSuggestions: 'เมนูแนะนำ',
    pushNotifications: 'การแจ้งเตือน Push',
    notificationSound: 'เสียงแจ้งเตือน'
  };
  
  const label = settingLabels[settingId] || settingId;
  const status = enabled ? 'เปิด' : 'ปิด';
  showToast(`${label}: ${status}`, 'success');
  
  // Update notification preferences on server (simulate)
  updateServerNotificationSettings(settingId, enabled);
}

function loadNotificationSettings() {
  const settings = getNotificationSettings();
  
  // Apply settings to toggle switches
  Object.keys(settings).forEach(settingId => {
    const toggle = document.getElementById(settingId);
    if (toggle) {
      toggle.checked = settings[settingId];
    }
  });
  
  console.log('📥 Notification settings loaded:', settings);
}

function getNotificationSettings() {
  const defaultSettings = {
    orderStatus: true,
    deliveryStatus: true,
    paymentStatus: true,
    promotions: true,
    flashSales: true,
    rewards: true,
    healthTips: true,
    menuSuggestions: true,
    pushNotifications: true,
    notificationSound: true
  };
  
  try {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch (error) {
    console.error('❌ Error loading notification settings:', error);
    return defaultSettings;
  }
}

function updateServerNotificationSettings(settingId, enabled) {
  // Simulate API call to update server settings
  console.log('🌐 Updating server notification settings...');
  
  // This would be a real API call in production
  // Example:
  // fetch('/api/user/notification-settings', {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ [settingId]: enabled })
  // });
  
  setTimeout(() => {
    console.log('✅ Server settings updated');
  }, 1000);
}

// ==========================================
// Load More Functions
// ==========================================

function loadMoreNotifications() {
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (!loadMoreBtn || NotificationState.isLoading || !NotificationState.hasMore) return;
  
  NotificationState.isLoading = true;
  loadMoreBtn.classList.add('loading');
  loadMoreBtn.innerHTML = `
    <div class="spinner"></div>
    กำลังโหลด...
  `;
  
  console.log('📥 Loading more notifications...');
  
  // Simulate API call delay
  setTimeout(() => {
    const newNotifications = generateMockNotifications(5);
    appendNotifications(newNotifications);
    
    NotificationState.page++;
    NotificationState.isLoading = false;
    
    // Simulate end of data after 3 pages
    if (NotificationState.page >= 3) {
      NotificationState.hasMore = false;
      loadMoreBtn.style.display = 'none';
      showToast('โหลดข้อมูลครบทั้งหมดแล้ว', 'info');
    } else {
      loadMoreBtn.classList.remove('loading');
      loadMoreBtn.innerHTML = `
        โหลดเพิ่มเติม
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12L12 19L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }
    
    console.log('✅ Loaded more notifications, page:', NotificationState.page);
  }, 1500);
  
  trackNotificationAction('load_more');
}

function generateMockNotifications(count) {
  const mockNotifications = [
    {
      type: 'health',
      title: 'เคล็ดลับการออกกำลังกาย',
      message: 'การออกกำลังกายสม่ำเสมอ 30 นาทีต่อวัน ช่วยเสริมสร้างระบบภูมิคุ้มกัน',
      category: 'สุขภาพ',
      time: '2 ชม.ที่แล้ว'
    },
    {
      type: 'promotions',
      title: 'คูปองส่วนลด 15%',
      message: 'ใช้โค้ด HEALTHY15 รับส่วนลดทันที สำหรับออเดอร์ขั้นต่ำ 500 บาท',
      category: 'โปรโมชั่น',
      time: '4 ชม.ที่แล้ว'
    },
    {
      type: 'system',
      title: 'อัพเดทแอปพลิเคชั่น',
      message: 'เวอร์ชั่นใหม่พร้อมฟีเจอร์ที่ปรับปรุงแล้ว อัพเดทเลย!',
      category: 'ระบบ',
      time: '1 วันที่แล้ว'
    },
    {
      type: 'health',
      title: 'สูตรสมูทตี้เพื่อสุขภาพ',
      message: 'ลองทำสมูทตี้ผักโขมกับกล้วยหอม อุดมไปด้วยวิตามินและแร่ธาตุ',
      category: 'สุขภาพ',
      time: '2 วันที่แล้ว'
    },
    {
      type: 'promotions',
      title: 'โปรแกรมลูกค้าใหม่',
      message: 'สมัครสมาชิกใหม่วันนี้ รับแต้มโบนัส 200 แต้มทันที',
      category: 'โปรโมชั่น',
      time: '3 วันที่แล้ว'
    }
  ];
  
  return mockNotifications.slice(0, count).map((notification, index) => ({
    ...notification,
    id: `mock-${Date.now()}-${index}`,
    read: Math.random() > 0.7, // 30% chance of being unread
    important: Math.random() > 0.8 // 20% chance of being important
  }));
}

function appendNotifications(notifications) {
  const notificationsList = document.getElementById('notificationsList');
  if (!notificationsList) return;
  
  notifications.forEach(notification => {
    const notificationEl = createNotificationElement(notification);
    notificationsList.appendChild(notificationEl);
    
    // Add to state
    NotificationState.notifications.push({
      ...notification,
      element: notificationEl,
      timestamp: new Date()
    });
  });
  
  // Update counters
  updateUnreadCount();
  
  // Re-apply current filter
  if (NotificationState.currentFilter !== 'all') {
    filterNotifications(NotificationState.currentFilter);
  }
  
  showToast(`โหลดการแจ้งเตือนใหม่ ${notifications.length} รายการ`, 'success');
}

function createNotificationElement(notification) {
  const div = document.createElement('div');
  div.className = `notification-item ${notification.type} ${!notification.read ? 'unread' : ''}`;
  div.dataset.type = notification.type;
  div.dataset.read = notification.read;
  div.dataset.important = notification.important;
  div.dataset.id = notification.id;
  
  const iconSvgs = {
    health: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M19 14C19 18.4 15.4 22 11 22C6.6 22 3 18.4 3 14C3 12.3 3.6 10.6 4.7 9.3L11 2L17.3 9.3C18.4 10.6 19 12.3 19 14Z" stroke="currentColor" stroke-width="2"/>
      <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    promotions: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    system: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21" stroke="currentColor" stroke-width="2"/>
      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
    </svg>`
  };
  
  div.innerHTML = `
    ${!notification.read ? '<div class="notification-indicator"></div>' : ''}
    <div class="notification-icon">
      ${iconSvgs[notification.type] || iconSvgs.system}
    </div>
    <div class="notification-content">
      <h3 class="notification-title">${notification.title}</h3>
      <p class="notification-message">${notification.message}</p>
      <div class="notification-meta">
        <span class="notification-time">${notification.time}</span>
        <span class="notification-category">${notification.category}</span>
      </div>
    </div>
    ${!notification.read ? `
      <button class="mark-read-btn" onclick="markAsRead('${notification.id}')" title="ทำเครื่องหมายว่าอ่านแล้ว">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    ` : ''}
  `;
  
  // Add fade in animation
  div.style.opacity = '0';
  div.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    div.style.transition = 'all 0.3s ease-out';
    div.style.opacity = '1';
    div.style.transform = 'translateY(0)';
  }, 100);
  
  return div;
}

// ==========================================
// Utility Functions
// ==========================================

function showToast(message, type = 'info') {
  // Remove existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'slideUp 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
  
  console.log(`🍞 Toast (${type}):`, message);
}

function trackNotificationAction(action, notificationId = null, extra = null) {
  // Analytics tracking - would integrate with Google Analytics, Firebase, etc.
  const trackingData = {
    event: 'notification_action',
    action: action,
    notification_id: notificationId,
    extra: extra,
    timestamp: new Date().toISOString(),
    page: 'notifications'
  };
  
  console.log('📊 Tracking:', trackingData);
  
  // Example integrations:
  // gtag('event', action, { notification_id: notificationId });
  // firebase.analytics().logEvent('notification_action', trackingData);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==========================================
// Accessibility Features
// ==========================================

function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    if (announcement.parentNode) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}

// ==========================================
// Performance Optimizations
// ==========================================

// Intersection Observer for lazy loading
function setupIntersectionObserver() {
  if (!window.IntersectionObserver) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const notification = entry.target;
        // Mark as viewed for analytics
        trackNotificationAction('viewed', notification.dataset.id);
        observer.unobserve(notification);
      }
    });
  }, { threshold: 0.5 });
  
  // Observe all notifications
  document.querySelectorAll('.notification-item').forEach(notification => {
    observer.observe(notification);
  });
}

// Initialize intersection observer after DOM load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(setupIntersectionObserver, 1000);
});

// ==========================================
// Error Handling
// ==========================================

window.addEventListener('error', function(e) {
  console.error('❌ JavaScript Error:', e.error);
  showToast('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('❌ Unhandled Promise Rejection:', e.reason);
  showToast('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error');
});

// ==========================================
// Export for testing (if needed)
// ==========================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NotificationState,
    filterNotifications,
    markAsRead,
    markAllAsRead,
    toggleSettings,
    trackNotificationAction
  };
}

console.log('🎯 Notifications JavaScript loaded successfully!');