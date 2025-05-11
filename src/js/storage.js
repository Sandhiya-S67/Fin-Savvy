/**
 * Storage module for handling localStorage operations
 */
const StorageManager = (() => {
  // Storage keys
  const KEYS = {
    TRANSACTIONS: 'finsavvy_transactions',
    BUDGETS: 'finsavvy_budgets',
    SETTINGS: 'finsavvy_settings',
    THEME: 'finsavvy_theme',
    PIN: 'finsavvy_pin',
    PIN_ENABLED: 'finsavvy_pin_enabled'
  };

  // Default settings
  const DEFAULT_SETTINGS = {
    currency: '$',
    theme: 'light',
    pinEnabled: false
  };

  /**
   * Get data from localStorage
   * 
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} - Parsed data or default value
   */
  const getData = (key, defaultValue = null) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return defaultValue;
    }
  };

  /**
   * Save data to localStorage
   * 
   * @param {string} key - Storage key
   * @param {any} data - Data to save
   */
  const saveData = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
    }
  };

  /**
   * Get all transactions
   * 
   * @returns {Array} - Array of transactions
   */
  const getTransactions = () => {
    return getData(KEYS.TRANSACTIONS, []);
  };

  /**
   * Save transactions
   * 
   * @param {Array} transactions - Array of transactions to save
   */
  const saveTransactions = (transactions) => {
    saveData(KEYS.TRANSACTIONS, transactions);
  };

  /**
   * Add a new transaction
   * 
   * @param {Object} transaction - Transaction object to add
   */
  const addTransaction = (transaction) => {
    const transactions = getTransactions();
    // Ensure transaction has an ID
    if (!transaction.id) {
      transaction.id = generateId();
    }
    // Ensure transaction has a timestamp
    if (!transaction.timestamp) {
      transaction.timestamp = new Date().toISOString();
    }
    
    transactions.push(transaction);
    saveTransactions(transactions);
    return transaction;
  };

  /**
   * Update an existing transaction
   * 
   * @param {string} id - Transaction ID
   * @param {Object} updatedTransaction - Updated transaction data
   * @returns {Object|null} - Updated transaction or null if not found
   */
  const updateTransaction = (id, updatedTransaction) => {
    const transactions = getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index !== -1) {
      // Update the transaction while preserving the id
      transactions[index] = {
        ...updatedTransaction,
        id,
        timestamp: new Date().toISOString() // Update timestamp
      };
      saveTransactions(transactions);
      return transactions[index];
    }
    
    return null;
  };

  /**
   * Delete a transaction
   * 
   * @param {string} id - Transaction ID to delete
   * @returns {boolean} - Whether the transaction was deleted
   */
  const deleteTransaction = (id) => {
    const transactions = getTransactions();
    const filteredTransactions = transactions.filter(t => t.id !== id);
    
    if (filteredTransactions.length < transactions.length) {
      saveTransactions(filteredTransactions);
      return true;
    }
    
    return false;
  };

  /**
   * Get all budgets
   * 
   * @returns {Array} - Array of budgets
   */
  const getBudgets = () => {
    return getData(KEYS.BUDGETS, []);
  };

  /**
   * Save budgets
   * 
   * @param {Array} budgets - Array of budgets to save
   */
  const saveBudgets = (budgets) => {
    saveData(KEYS.BUDGETS, budgets);
  };

  /**
   * Add a new budget
   * 
   * @param {Object} budget - Budget object to add
   */
  const addBudget = (budget) => {
    const budgets = getBudgets();
    // Ensure budget has an ID
    if (!budget.id) {
      budget.id = generateId();
    }
    budgets.push(budget);
    saveBudgets(budgets);
    return budget;
  };

  /**
   * Update an existing budget
   * 
   * @param {string} id - Budget ID
   * @param {Object} updatedBudget - Updated budget data
   * @returns {Object|null} - Updated budget or null if not found
   */
  const updateBudget = (id, updatedBudget) => {
    const budgets = getBudgets();
    const index = budgets.findIndex(b => b.id === id);
    
    if (index !== -1) {
      // Update the budget while preserving the id
      budgets[index] = {
        ...updatedBudget,
        id
      };
      saveBudgets(budgets);
      return budgets[index];
    }
    
    return null;
  };

  /**
   * Delete a budget
   * 
   * @param {string} id - Budget ID to delete
   * @returns {boolean} - Whether the budget was deleted
   */
  const deleteBudget = (id) => {
    const budgets = getBudgets();
    const filteredBudgets = budgets.filter(b => b.id !== id);
    
    if (filteredBudgets.length < budgets.length) {
      saveBudgets(filteredBudgets);
      return true;
    }
    
    return false;
  };

  /**
   * Get application settings
   * 
   * @returns {Object} - Settings object
   */
  const getSettings = () => {
    return getData(KEYS.SETTINGS, DEFAULT_SETTINGS);
  };

  /**
   * Save application settings
   * 
   * @param {Object} settings - Settings object to save
   */
  const saveSettings = (settings) => {
    saveData(KEYS.SETTINGS, settings);
  };

  /**
   * Update theme setting
   * 
   * @param {string} theme - Theme ('light' or 'dark')
   */
  const setTheme = (theme) => {
    const settings = getSettings();
    settings.theme = theme;
    saveSettings(settings);
  };

  /**
   * Get current theme
   * 
   * @returns {string} - Current theme
   */
  const getTheme = () => {
    const settings = getSettings();
    return settings.theme || 'light';
  };

  /**
   * Update currency setting
   * 
   * @param {string} currency - Currency symbol
   */
  const setCurrency = (currency) => {
    const settings = getSettings();
    settings.currency = currency;
    saveSettings(settings);
  };

  /**
   * Get current currency symbol
   * 
   * @returns {string} - Current currency symbol
   */
  const getCurrency = () => {
    const settings = getSettings();
    return settings.currency || '$';
  };

  /**
   * Set PIN
   * 
   * @param {string} pin - PIN to set
   */
  const setPIN = (pin) => {
    saveData(KEYS.PIN, pin);
  };

  /**
   * Get PIN
   * 
   * @returns {string|null} - Current PIN or null if not set
   */
  const getPIN = () => {
    return getData(KEYS.PIN, null);
  };

  /**
   * Enable/disable PIN lock
   * 
   * @param {boolean} enabled - Whether PIN lock is enabled
   */
  const setPINEnabled = (enabled) => {
    const settings = getSettings();
    settings.pinEnabled = enabled;
    saveSettings(settings);
  };

  /**
   * Check if PIN lock is enabled
   * 
   * @returns {boolean} - Whether PIN lock is enabled
   */
  const isPINEnabled = () => {
    const settings = getSettings();
    return settings.pinEnabled || false;
  };

  /**
   * Clear all data
   */
  const clearAllData = () => {
    localStorage.removeItem(KEYS.TRANSACTIONS);
    localStorage.removeItem(KEYS.BUDGETS);
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.PIN);
  };

  /**
   * Generate a unique ID
   * 
   * @returns {string} - Unique ID
   */
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Public API
  return {
    getTransactions,
    saveTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getBudgets,
    saveBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    getSettings,
    saveSettings,
    setTheme,
    getTheme,
    setCurrency,
    getCurrency,
    setPIN,
    getPIN,
    setPINEnabled,
    isPINEnabled,
    clearAllData
  };
})();