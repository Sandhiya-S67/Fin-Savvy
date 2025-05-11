/**
 * Settings page functionality
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize settings form
  initSettings();

  // Set up event listeners
  setupSettingsListeners();
});

/**
 * Initialize settings with stored values
 */
function initSettings() {
  const settings = StorageManager.getSettings();
  
  // Set theme toggle
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.checked = settings.theme === 'dark';
  }
  
  // Set currency select
  const currencySelect = document.getElementById('currency-select');
  if (currencySelect) {
    currencySelect.value = settings.currency || '$';
  }
  
  // Set PIN toggle
  const pinToggle = document.getElementById('pin-lock-toggle');
  const pinSettings = document.getElementById('pin-settings');
  if (pinToggle && pinSettings) {
    pinToggle.checked = settings.pinEnabled || false;
    pinSettings.style.display = pinToggle.checked ? 'flex' : 'none';
  }
}

/**
 * Set up settings page specific event listeners
 */
function setupSettingsListeners() {
  // Dark mode toggle
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', () => {
      const theme = darkModeToggle.checked ? 'dark' : 'light';
      StorageManager.setTheme(theme);
      document.documentElement.setAttribute('data-theme', theme);
    });
  }
  
  // Currency select
  const currencySelect = document.getElementById('currency-select');
  if (currencySelect) {
    currencySelect.addEventListener('change', () => {
      StorageManager.setCurrency(currencySelect.value);
    });
  }
  
  // PIN lock toggle
  const pinToggle = document.getElementById('pin-lock-toggle');
  const pinSettings = document.getElementById('pin-settings');
  if (pinToggle && pinSettings) {
    pinToggle.addEventListener('change', () => {
      if (pinToggle.checked) {
        // Show PIN setup modal
        showPINModal('set');
      } else {
        // Disable PIN lock
        StorageManager.setPINEnabled(false);
        pinSettings.style.display = 'none';
      }
    });
  }
  
  // Change PIN button
  const changePinBtn = document.getElementById('change-pin-btn');
  if (changePinBtn) {
    changePinBtn.addEventListener('click', () => {
      showPINModal('change');
    });
  }
  
  // PIN form submission
  const pinForm = document.getElementById('pin-form');
  if (pinForm) {
    pinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handlePINSubmit();
    });
  }
  
  // Export data button
  const exportDataBtn = document.getElementById('export-data-btn');
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', () => {
      exportAllData();
    });
  }
  
  // Clear data button
  const clearDataBtn = document.getElementById('clear-data-btn');
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
      showClearDataConfirmation();
    });
  }
  
  // Confirm reset text input
  const confirmResetText = document.getElementById('confirm-reset-text');
  const confirmResetBtn = document.getElementById('confirm-reset-btn');
  if (confirmResetText && confirmResetBtn) {
    confirmResetText.addEventListener('input', () => {
      confirmResetBtn.disabled = confirmResetText.value !== 'DELETE';
    });
  }
  
  // Confirm reset button
  if (confirmResetBtn) {
    confirmResetBtn.addEventListener('click', () => {
      clearAllData();
    });
  }
}

/**
 * Handle PIN form submission
 */
function handlePINSubmit() {
  const pinDigits = Array.from(document.querySelectorAll('.pin-digit')).map(input => input.value);
  const pin = pinDigits.join('');
  
  const confirmPinDigits = Array.from(document.querySelectorAll('.confirm-pin-digit')).map(input => input.value);
  const confirmPin = confirmPinDigits.join('');
  
  const modalTitle = document.getElementById('pin-modal-title').textContent;
  const errorElement = document.getElementById('pin-error');
  
  // Validate PIN
  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    errorElement.textContent = 'PIN must be 4 digits';
    return;
  }
  
  // Handle different modes
  if (modalTitle === 'Set PIN' || modalTitle === 'Change PIN') {
    // Confirm PIN must match
    if (confirmPin !== pin) {
      errorElement.textContent = 'PINs do not match';
      return;
    }
    
    // Save PIN
    StorageManager.setPIN(pin);
    StorageManager.setPINEnabled(true);
    
    // Show PIN settings
    const pinSettings = document.getElementById('pin-settings');
    if (pinSettings) {
      pinSettings.style.display = 'flex';
    }
    
    // Close modal
    const modal = document.getElementById('pin-modal');
    closeModal(modal);
    
    // Update PIN toggle
    const pinToggle = document.getElementById('pin-lock-toggle');
    if (pinToggle) {
      pinToggle.checked = true;
    }
  } else if (modalTitle === 'Enter PIN') {
    // Verify PIN
    const storedPIN = StorageManager.getPIN();
    
    if (pin !== storedPIN) {
      errorElement.textContent = 'Incorrect PIN';
      return;
    }
    
    // Close modal
    const modal = document.getElementById('pin-modal');
    closeModal(modal);
  }
}

/**
 * Show clear data confirmation modal
 */
function showClearDataConfirmation() {
  const modal = document.getElementById('confirm-reset-modal');
  
  // Reset input
  const confirmResetText = document.getElementById('confirm-reset-text');
  if (confirmResetText) {
    confirmResetText.value = '';
  }
  
  // Disable confirm button
  const confirmResetBtn = document.getElementById('confirm-reset-btn');
  if (confirmResetBtn) {
    confirmResetBtn.disabled = true;
  }
  
  openModal(modal);
}

/**
 * Clear all application data
 */
function clearAllData() {
  StorageManager.clearAllData();
  
  // Close modal
  const modal = document.getElementById('confirm-reset-modal');
  closeModal(modal);
  
  // Reset form to defaults
  initSettings();
  
  // Show success message
  alert('All data has been cleared successfully.');
  
  // Redirect to dashboard
  window.location.href = 'index.html';
}

/**
 * Export all application data
 */
function exportAllData() {
  const data = {
    transactions: StorageManager.getTransactions(),
    budgets: StorageManager.getBudgets(),
    settings: StorageManager.getSettings()
  };
  
  // Convert to JSON
  const jsonData = JSON.stringify(data, null, 2);
  
  // Create blob and download link
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set up download
  link.setAttribute('href', url);
  link.setAttribute('download', `finsavvy-data-${new Date().toISOString().slice(0, 10)}.json`);
  link.style.display = 'none';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}