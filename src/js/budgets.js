/**
 * Budget management module
 */
const BudgetManager = (() => {
  /**
   * Initialize the budget form
   */
  const initBudgetForm = () => {
    const form = document.getElementById('budget-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      handleFormSubmit(this);
    });

    // Budget type change affects category visibility
    const typeSelect = document.getElementById('budget-type');
    const categoryGroup = document.getElementById('category-group');
    
    if (typeSelect && categoryGroup) {
      typeSelect.addEventListener('change', function() {
        categoryGroup.style.display = this.value === 'category' ? 'block' : 'none';
      });
    }
  };

  /**
   * Handle budget form submission
   * 
   * @param {HTMLFormElement} form - Budget form
   */
  const handleFormSubmit = (form) => {
    const type = document.getElementById('budget-type').value;
    const amount = parseFloat(document.getElementById('budget-amount').value);
    const month = document.getElementById('budget-month').value;
    const id = document.getElementById('budget-id')?.value;
    
    let category = null;
    if (type === 'category') {
      category = document.getElementById('budget-category').value;
    }

    // Validate form
    if (!type || isNaN(amount) || !month || (type === 'category' && !category)) {
      alert('Please fill in all fields');
      return;
    }

    // Create budget object
    const budget = {
      type,
      amount,
      month,
      category: type === 'category' ? category : 'savings'
    };

    // Update or add budget
    if (id) {
      StorageManager.updateBudget(id, budget);
    } else {
      StorageManager.addBudget(budget);
    }

    // Close modal and reset form
    const modal = document.getElementById('budget-modal');
    closeModal(modal);

    // Refresh budgets display
    if (typeof displayBudgets === 'function') {
      displayBudgets();
    }

    // Refresh dashboard if on dashboard
    if (typeof updateDashboard === 'function') {
      updateDashboard();
    }
  };

  /**
   * Edit a budget
   * 
   * @param {string} id - Budget ID
   */
  const editBudget = (id) => {
    const budgets = StorageManager.getBudgets();
    const budget = budgets.find(b => b.id === id);
    
    if (!budget) return;
    
    // Set form values
    document.getElementById('budget-id').value = id;
    document.getElementById('budget-type').value = budget.type;
    document.getElementById('budget-amount').value = budget.amount;
    document.getElementById('budget-month').value = budget.month;
    
    // Show/hide category group
    const categoryGroup = document.getElementById('category-group');
    categoryGroup.style.display = budget.type === 'category' ? 'block' : 'none';
    
    // Set category if applicable
    if (budget.type === 'category') {
      document.getElementById('budget-category').value = budget.category;
    }
    
    // Update modal title
    const modalTitle = document.getElementById('budget-modal-title');
    if (modalTitle) {
      modalTitle.textContent = 'Edit Budget Goal';
    }
    
    // Open modal
    const modal = document.getElementById('budget-modal');
    openModal(modal);
  };

  /**
   * Delete a budget
   * 
   * @param {string} id - Budget ID
   */
  const deleteBudget = (id) => {
    const confirmModal = document.getElementById('delete-budget-modal');
    if (!confirmModal) return;
    
    // Set up confirm button action
    const confirmButton = document.getElementById('confirm-delete-budget-btn');
    confirmButton.dataset.id = id;
    
    confirmButton.onclick = function() {
      const budgetId = this.dataset.id;
      StorageManager.deleteBudget(budgetId);
      
      // Close modal
      closeModal(confirmModal);
      
      // Refresh budgets display
      if (typeof displayBudgets === 'function') {
        displayBudgets();
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
   * Get current month budgets
   * 
   * @returns {Array} - Current month's budgets
   */
  const getCurrentMonthBudgets = () => {
    const budgets = StorageManager.getBudgets();
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    
    return budgets.filter(b => b.month === currentMonth);
  };

  /**
   * Get a budget by category for the current month
   * 
   * @param {string} category - Category to find budget for
   * @returns {Object|null} - Budget object or null if not found
   */
  const getBudgetByCategory = (category) => {
    const currentMonthBudgets = getCurrentMonthBudgets();
    return currentMonthBudgets.find(b => b.type === 'category' && b.category === category) || null;
  };

  /**
   * Get savings goal for the current month
   * 
   * @returns {Object|null} - Savings goal object or null if not found
   */
  const getSavingsGoal = () => {
    const currentMonthBudgets = getCurrentMonthBudgets();
    return currentMonthBudgets.find(b => b.type === 'savings') || null;
  };

  /**
   * Calculate spending by category for current month
   * 
   * @param {string} category - Category to calculate spending for
   * @returns {number} - Total spent in the category
   */
  const calculateCategorySpending = (category) => {
    const transactions = TransactionManager.getCurrentMonthTransactions();
    const categoryTransactions = transactions.filter(t => t.category === category && t.amount < 0);
    
    return Math.abs(categoryTransactions.reduce((total, t) => total + t.amount, 0));
  };

  /**
   * Calculate total spending for current month
   * 
   * @returns {number} - Total spending for the month
   */
  const calculateTotalSpending = () => {
    const transactions = TransactionManager.getCurrentMonthTransactions();
    const expenses = transactions.filter(t => t.amount < 0);
    
    return Math.abs(expenses.reduce((total, t) => total + t.amount, 0));
  };

  /**
   * Calculate total income for current month
   * 
   * @returns {number} - Total income for the month
   */
  const calculateTotalIncome = () => {
    const transactions = TransactionManager.getCurrentMonthTransactions();
    const income = transactions.filter(t => t.amount > 0);
    
    return income.reduce((total, t) => total + t.amount, 0);
  };

  /**
   * Calculate savings for current month
   * 
   * @returns {number} - Total savings for the month
   */
  const calculateSavings = () => {
    const income = calculateTotalIncome();
    const spending = calculateTotalSpending();
    
    return income - spending;
  };

  /**
   * Calculate budget progress
   * 
   * @param {string} category - Category to calculate progress for
   * @returns {Object} - Progress info (amount, budget, percentage)
   */
  const calculateBudgetProgress = (category) => {
    let spending, budget;
    
    if (category === 'savings') {
      spending = calculateSavings();
      budget = getSavingsGoal()?.amount || 0;
    } else {
      spending = calculateCategorySpending(category);
      budget = getBudgetByCategory(category)?.amount || 0;
    }
    
    const percentage = budget > 0 ? Math.min(100, Math.round((spending / budget) * 100)) : 0;
    
    return {
      spent: spending,
      budget,
      percentage
    };
  };

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initBudgetForm();
  });

  // Return public API
  return {
    editBudget,
    deleteBudget,
    getCurrentMonthBudgets,
    getBudgetByCategory,
    getSavingsGoal,
    calculateCategorySpending,
    calculateTotalSpending,
    calculateTotalIncome,
    calculateSavings,
    calculateBudgetProgress
  };
})();