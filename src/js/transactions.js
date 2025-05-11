/**
 * Transactions module for managing transactions
 */
const TransactionManager = (() => {
  /**
   * Initialize the transaction form
   */
  const initTransactionForm = () => {
    const form = document.getElementById('transaction-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      handleFormSubmit(this);
    });

    // Type change affects category options
    const typeSelect = document.getElementById('transaction-type');
    const categorySelect = document.getElementById('transaction-category');
    
    if (typeSelect && categorySelect) {
      typeSelect.addEventListener('change', function() {
        updateCategoryOptions(this.value, categorySelect);
      });
    }
  };

  /**
   * Handle transaction form submission
   * 
   * @param {HTMLFormElement} form - Transaction form
   */
  const handleFormSubmit = (form) => {
    const description = document.getElementById('transaction-description').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const type = document.getElementById('transaction-type').value;
    const category = document.getElementById('transaction-category').value;
    const date = document.getElementById('transaction-date').value;
    const id = document.getElementById('transaction-id')?.value;

    // Validate form
    if (!description || isNaN(amount) || !type || !category || !date) {
      alert('Please fill in all fields');
      return;
    }

    // Create transaction object
    const transaction = {
      description,
      amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      type,
      category,
      date,
      timestamp: new Date().toISOString()
    };

    // Update or add transaction
    if (id) {
      StorageManager.updateTransaction(id, transaction);
    } else {
      StorageManager.addTransaction(transaction);
    }

    // Close modal and reset form
    const modal = document.getElementById('transaction-modal');
    closeModal(modal);

    // Refresh transactions display
    if (typeof displayTransactions === 'function') {
      displayTransactions();
    }

    // Refresh dashboard if on dashboard
    if (typeof updateDashboard === 'function') {
      updateDashboard();
    }
  };

  /**
   * Update category select options based on transaction type
   * 
   * @param {string} type - Transaction type ('income' or 'expense')
   * @param {HTMLSelectElement} categorySelect - Category select element
   */
  const updateCategoryOptions = (type, categorySelect) => {
    const currentValue = categorySelect.value;
    
    // Clear existing options
    categorySelect.innerHTML = '';
    
    // Common categories for expenses
    const expenseCategories = [
      { value: 'food', text: 'Food' },
      { value: 'transport', text: 'Transport' },
      { value: 'utilities', text: 'Utilities' },
      { value: 'entertainment', text: 'Entertainment' },
      { value: 'shopping', text: 'Shopping' },
      { value: 'housing', text: 'Housing' },
      { value: 'other', text: 'Other' }
    ];
    
    // Categories for income
    const incomeCategories = [
      { value: 'income', text: 'Income' },
      { value: 'salary', text: 'Salary' },
      { value: 'freelance', text: 'Freelance' },
      { value: 'interest', text: 'Interest' },
      { value: 'gift', text: 'Gift' },
      { value: 'other', text: 'Other' }
    ];
    
    // Add options based on type
    const categories = type === 'income' ? incomeCategories : expenseCategories;
    
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.value;
      option.textContent = category.text;
      categorySelect.appendChild(option);
    });
    
    // Try to preserve selected value if valid
    if (categories.some(c => c.value === currentValue)) {
      categorySelect.value = currentValue;
    }
  };

  /**
   * Edit a transaction
   * 
   * @param {string} id - Transaction ID
   */
  const editTransaction = (id) => {
    const transactions = StorageManager.getTransactions();
    const transaction = transactions.find(t => t.id === id);
    
    if (!transaction) return;
    
    // Set form values
    document.getElementById('transaction-id').value = id;
    document.getElementById('transaction-description').value = transaction.description;
    document.getElementById('transaction-amount').value = Math.abs(transaction.amount);
    document.getElementById('transaction-type').value = transaction.amount >= 0 ? 'income' : 'expense';
    
    // Make sure category options are set correctly for the transaction type
    const categorySelect = document.getElementById('transaction-category');
    updateCategoryOptions(transaction.amount >= 0 ? 'income' : 'expense', categorySelect);
    
    // Then set the category
    document.getElementById('transaction-category').value = transaction.category;
    document.getElementById('transaction-date').value = transaction.date;
    
    // Update modal title
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) {
      modalTitle.textContent = 'Edit Transaction';
    }
    
    // Update save button text
    const saveButton = document.getElementById('save-transaction-btn');
    if (saveButton) {
      saveButton.textContent = 'Update Transaction';
    }
    
    // Open modal
    const modal = document.getElementById('transaction-modal');
    openModal(modal);
  };

  /**
   * Delete a transaction
   * 
   * @param {string} id - Transaction ID
   */
  const deleteTransaction = (id) => {
    const confirmModal = document.getElementById('delete-confirmation-modal');
    if (!confirmModal) return;
    
    // Set up confirm button action
    const confirmButton = document.getElementById('confirm-delete-btn');
    confirmButton.dataset.id = id;
    
    confirmButton.onclick = function() {
      const transactionId = this.dataset.id;
      StorageManager.deleteTransaction(transactionId);
      
      // Close modal
      closeModal(confirmModal);
      
      // Refresh transactions display
      if (typeof displayTransactions === 'function') {
        displayTransactions();
      }
      
      // Refresh dashboard if on dashboard
      if (typeof updateDashboard === 'function') {
        updateDashboard();
      }
    };
    
    // Open confirmation modal
    openModal(confirmModal);
  };

  /**
   * Calculate total income
   * 
   * @param {Array} transactions - Array of transactions
   * @returns {number} - Total income
   */
  const calculateTotalIncome = (transactions = null) => {
    const allTransactions = transactions || StorageManager.getTransactions();
    return allTransactions
      .filter(t => t.amount > 0)
      .reduce((total, t) => total + t.amount, 0);
  };

  /**
   * Calculate total expenses
   * 
   * @param {Array} transactions - Array of transactions
   * @returns {number} - Total expenses
   */
  const calculateTotalExpenses = (transactions = null) => {
    const allTransactions = transactions || StorageManager.getTransactions();
    return Math.abs(allTransactions
      .filter(t => t.amount < 0)
      .reduce((total, t) => total + t.amount, 0));
  };

  /**
   * Calculate current balance
   * 
   * @param {Array} transactions - Array of transactions
   * @returns {number} - Current balance
   */
  const calculateBalance = (transactions = null) => {
    const allTransactions = transactions || StorageManager.getTransactions();
    return allTransactions.reduce((total, t) => total + t.amount, 0);
  };

  /**
   * Filter transactions by date range
   * 
   * @param {Array} transactions - Transactions to filter
   * @param {string} range - Date range: 'all', 'today', 'week', 'month', 'year'
   * @returns {Array} - Filtered transactions
   */
  const filterTransactionsByDate = (transactions, range) => {
    if (range === 'all') return transactions;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'today':
        return transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getFullYear() === today.getFullYear() &&
                 transactionDate.getMonth() === today.getMonth() &&
                 transactionDate.getDate() === today.getDate();
        });
        
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return transactions.filter(t => new Date(t.date) >= weekAgo);
        
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return transactions.filter(t => new Date(t.date) >= monthStart);
        
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return transactions.filter(t => new Date(t.date) >= yearStart);
        
      default:
        return transactions;
    }
  };

  /**
   * Filter transactions by category
   * 
   * @param {Array} transactions - Transactions to filter
   * @param {string} category - Category to filter by
   * @returns {Array} - Filtered transactions
   */
  const filterTransactionsByCategory = (transactions, category) => {
    if (category === 'all') return transactions;
    return transactions.filter(t => t.category === category);
  };

  /**
   * Filter transactions by type
   * 
   * @param {Array} transactions - Transactions to filter
   * @param {string} type - Type to filter by ('income' or 'expense')
   * @returns {Array} - Filtered transactions
   */
  const filterTransactionsByType = (transactions, type) => {
    if (type === 'all') return transactions;
    return transactions.filter(t => t.type === type);
  };

  /**
   * Search transactions
   * 
   * @param {Array} transactions - Transactions to search
   * @param {string} query - Search query
   * @returns {Array} - Filtered transactions
   */
  const searchTransactions = (transactions, query) => {
    if (!query) return transactions;
    
    const lowerQuery = query.toLowerCase();
    return transactions.filter(t => 
      t.description.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery)
    );
  };

  /**
   * Calculate expenses by category
   * 
   * @param {Array} transactions - Transactions to analyze
   * @returns {Object} - Object with categories as keys and total amounts as values
   */
  const calculateExpensesByCategory = (transactions = null) => {
    const allTransactions = transactions || StorageManager.getTransactions();
    const expenses = allTransactions.filter(t => t.amount < 0);
    
    return expenses.reduce((categories, t) => {
      if (!categories[t.category]) {
        categories[t.category] = 0;
      }
      categories[t.category] += Math.abs(t.amount);
      return categories;
    }, {});
  };

  /**
   * Get transactions for current month
   * 
   * @returns {Array} - Current month's transactions
   */
  const getCurrentMonthTransactions = () => {
    const transactions = StorageManager.getTransactions();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return transactions.filter(t => new Date(t.date) >= monthStart);
  };

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initTransactionForm();
  });

  // Return public API
  return {
    editTransaction,
    deleteTransaction,
    calculateTotalIncome,
    calculateTotalExpenses,
    calculateBalance,
    filterTransactionsByDate,
    filterTransactionsByCategory,
    filterTransactionsByType,
    searchTransactions,
    calculateExpensesByCategory,
    getCurrentMonthTransactions
  };
})();