/**
 * Main application functionality
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the application
  initApp();

  // Set up event listeners
  setupEventListeners();
});

/**
 * Initialize the application
 */
function initApp() {
  // Apply the current theme
  applyTheme();

  // Set up PIN lock if enabled
  checkPINLock();

  // Highlight active page in navigation
  highlightActivePage();
}

/**
 * Apply the current theme to the document
 */
function applyTheme() {
  const theme = StorageManager.getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  
  // Update theme toggle if it exists
  const themeToggle = document.getElementById('dark-mode-toggle');
  if (themeToggle) {
    themeToggle.checked = theme === 'dark';
  }
}

/**
 * Check if PIN lock is enabled and show PIN modal if needed
 */
function checkPINLock() {
  if (StorageManager.isPINEnabled()) {
    // Check if we're already on the settings page
    const isSettingsPage = window.location.pathname.includes('settings.html');
    if (!isSettingsPage) {
      showPINModal('verify');
    }
  }
}

/**
 * Set up global event listeners
 */
function setupEventListeners() {
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Quick add transaction button (dashboard)
  const quickAddButton = document.getElementById('quick-add-button');
  if (quickAddButton) {
    quickAddButton.addEventListener('click', () => {
      const modal = document.getElementById('transaction-modal');
      openModal(modal);
    });
  }

  // Add first transaction buttons
  const addFirstTransactionButtons = [
    document.getElementById('add-first-transaction'),
    document.getElementById('add-first-transaction-page')
  ];
  
  addFirstTransactionButtons.forEach(button => {
    if (button) {
      button.addEventListener('click', () => {
        const modal = document.getElementById('transaction-modal');
        openModal(modal);
      });
    }
  });

  // Modal close buttons
  document.querySelectorAll('.modal-close, .modal-cancel').forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      closeModal(modal);
    });
  });

  // Close modal when clicking outside
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Set current date as default for transaction date inputs
  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach(input => {
    const today = new Date().toISOString().split('T')[0];
    input.value = today;
  });

  // Set current month as default for budget month inputs
  const monthInputs = document.querySelectorAll('input[type="month"]');
  monthInputs.forEach(input => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    input.value = currentMonth;
  });
}

/**
 * Toggle the theme between light and dark
 */
function toggleTheme() {
  const currentTheme = StorageManager.getTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  // Update in localStorage
  StorageManager.setTheme(newTheme);
  
  // Apply to document
  document.documentElement.setAttribute('data-theme', newTheme);
}

/**
 * Format currency amount
 * 
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
  const currency = StorageManager.getCurrency();
  return `${currency}${Math.abs(amount).toFixed(2)}`;
}

/**
 * Format date for display
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Show a PIN modal
 * 
 * @param {string} mode - 'set', 'verify', or 'change'
 */
function showPINModal(mode = 'set') {
  const modal = document.getElementById('pin-modal');
  const title = document.getElementById('pin-modal-title');
  const confirmGroup = document.getElementById('confirm-pin-group');
  const saveButton = document.getElementById('save-pin-btn');
  const errorElement = document.getElementById('pin-error');
  
  // Reset form
  const pinInputs = document.querySelectorAll('.pin-digit');
  const confirmPinInputs = document.querySelectorAll('.confirm-pin-digit');
  
  pinInputs.forEach(input => input.value = '');
  confirmPinInputs.forEach(input => input.value = '');
  errorElement.textContent = '';
  
  // Set up modal based on mode
  if (mode === 'set') {
    title.textContent = 'Set PIN';
    confirmGroup.style.display = 'block';
    saveButton.textContent = 'Set PIN';
  } else if (mode === 'verify') {
    title.textContent = 'Enter PIN';
    confirmGroup.style.display = 'none';
    saveButton.textContent = 'Unlock';
  } else if (mode === 'change') {
    title.textContent = 'Change PIN';
    confirmGroup.style.display = 'block';
    saveButton.textContent = 'Change PIN';
  }
  
  // Setup PIN inputs
  setupPINInputs();
  
  // Open modal
  openModal(modal);
}

/**
 * Setup PIN input fields for automatic focus
 */
function setupPINInputs() {
  document.querySelectorAll('.pin-digit, .confirm-pin-digit').forEach(input => {
    input.addEventListener('input', function() {
      if (this.value.length === this.maxLength) {
        const nextIndex = parseInt(this.dataset.index) + 1;
        const selector = this.classList.contains('pin-digit') 
          ? `.pin-digit[data-index="${nextIndex}"]` 
          : `.confirm-pin-digit[data-index="${nextIndex}"]`;
        
        const nextInput = document.querySelector(selector);
        if (nextInput) {
          nextInput.focus();
        }
      }
    });
    
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && this.value.length === 0) {
        const prevIndex = parseInt(this.dataset.index) - 1;
        const selector = this.classList.contains('pin-digit') 
          ? `.pin-digit[data-index="${prevIndex}"]` 
          : `.confirm-pin-digit[data-index="${prevIndex}"]`;
        
        const prevInput = document.querySelector(selector);
        if (prevInput) {
          prevInput.focus();
          // Place cursor at the end
          prevInput.selectionStart = prevInput.value.length;
        }
      }
    });
  });
}

/**
 * Open a modal
 * 
 * @param {HTMLElement} modal - Modal element to open
 */
function openModal(modal) {
  if (modal) {
    modal.classList.add('show');
    
    // Auto-focus the first input field
    const firstInput = modal.querySelector('input');
    if (firstInput) {
      setTimeout(() => {
        firstInput.focus();
      }, 100);
    }
  }
}

/**
 * Close a modal
 * 
 * @param {HTMLElement} modal - Modal element to close
 */
function closeModal(modal) {
  if (modal) {
    modal.classList.remove('show');
    
    // Reset form if exists
    const form = modal.querySelector('form');
    if (form) {
      form.reset();
    }
  }
}

/**
 * Highlight the active page in the navigation
 */
function highlightActivePage() {
  const currentPath = window.location.pathname;
  const filename = currentPath.split('/').pop() || 'index.html';
  
  // Remove active class from all nav items
  document.querySelectorAll('.nav-menu li').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to current page
  const activeItem = document.querySelector(`.nav-menu a[href="${filename}"]`);
  if (activeItem) {
    activeItem.parentElement.classList.add('active');
  }
}

/**
 * Get category icon HTML
 * 
 * @param {string} category - Transaction category
 * @returns {string} - SVG icon HTML
 */
function getCategoryIcon(category) {
  const icons = {
    food: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2"></path><path d="M18 15V2"></path><path d="M15 8h-3"></path><path d="M21 8h-3"></path><path d="M21 11h-6"></path><path d="M15 15h-3a3 3 0 1 0 0 6h.3"></path><path d="M21 15h-3a3 3 0 1 0 0 6h.3"></path></svg>',
    transport: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2V8H9v9h9Z"></path><path d="M5 17h3V8H3v9h1"></path><path d="M14 17v-4"></path><path d="M5 11h3"></path><circle cx="6.5" cy="17.5" r="2.5"></circle><circle cx="16.5" cy="17.5" r="2.5"></circle></svg>',
    utilities: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h5"></path><path d="M5 12v7a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-7"></path><path d="M5 12V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5"></path><path d="M14 12h7"></path><path d="M17 12v7a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-7"></path><path d="M17 12V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5"></path></svg>',
    entertainment: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 2h7a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-7a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Z"></path><path d="m9 22 3-3 3 3"></path><path d="m10 7 4 4-4 4"></path></svg>',
    shopping: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V9a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2Z"></path><path d="M7 10V7a5 5 0 0 1 10 0v3"></path></svg>',
    housing: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    income: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path><line x1="2" y1="20" x2="2" y2="20"></line></svg>',
    other: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="12" x2="12" y1="8" y2="16"></line><line x1="8" x2="16" y1="12" y2="12"></line></svg>'
  };
  
  return icons[category] || icons.other;
}

/**
 * Get random colors for charts
 * 
 * @param {number} count - Number of colors needed
 * @returns {Array} - Array of hex color codes
 */
function getChartColors(count) {
  const colors = [
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#FFC107', // Amber
    '#9C27B0', // Purple
    '#FF5722', // Deep Orange
    '#3F51B5', // Indigo
    '#E91E63', // Pink
    '#009688', // Teal
    '#FF9800', // Orange
    '#673AB7', // Deep Purple
    '#8BC34A', // Light Green
    '#03A9F4', // Light Blue
    '#F44336', // Red
    '#CDDC39', // Lime
    '#00BCD4', // Cyan
    '#607D8B'  // Blue Grey
  ];
  
  // If we need more colors than available, duplicate and slightly modify
  if (count > colors.length) {
    for (let i = 0; i < count - colors.length; i++) {
      // Get a random color and slightly modify it
      const baseColor = colors[i % colors.length];
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      
      // Adjust the color slightly
      const newR = Math.min(255, r + 20);
      const newG = Math.min(255, g + 30);
      const newB = Math.min(255, b + 40);
      
      const newColor = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
      colors.push(newColor);
    }
  }
  
  return colors.slice(0, count);
}

/**
 * Get a short month name from date
 * 
 * @param {Date} date - Date object
 * @returns {string} - Short month name
 */
function getShortMonth(date) {
  return date.toLocaleString('en-US', { month: 'short' });
}