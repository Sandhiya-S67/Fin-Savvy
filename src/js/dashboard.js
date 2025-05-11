/**
 * Dashboard functionality
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize dashboard
  updateDashboard();

  // Set up event listeners
  setupDashboardListeners();
});

/**
 * Update the dashboard with latest data
 */
function updateDashboard() {
  updateSummaryCards();
  displayRecentTransactions();
  displayBudgetOverview();
}

/**
 * Update summary cards with totals
 */
function updateSummaryCards() {
  const balanceElement = document.getElementById('current-balance');
  const incomeElement = document.getElementById('total-income');
  const expensesElement = document.getElementById('total-expenses');
  
  if (balanceElement) {
    const balance = TransactionManager.calculateBalance();
    balanceElement.textContent = formatCurrency(balance);
    
    // Add color class based on balance
    balanceElement.className = 'amount';
    if (balance < 0) {
      balanceElement.classList.add('expense-amount');
    } else if (balance > 0) {
      balanceElement.classList.add('income-amount');
    }
  }
  
  if (incomeElement) {
    const income = TransactionManager.calculateTotalIncome();
    incomeElement.textContent = formatCurrency(income);
  }
  
  if (expensesElement) {
    const expenses = TransactionManager.calculateTotalExpenses();
    expensesElement.textContent = formatCurrency(expenses);
  }
}

/**
 * Display recent transactions on dashboard
 */
function displayRecentTransactions() {
  const transactionsList = document.getElementById('recent-transactions-list');
  if (!transactionsList) return;
  
  const transactions = StorageManager.getTransactions();
  
  // Sort by date, newest first
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  // Take only the 5 most recent
  const recentTransactions = sortedTransactions.slice(0, 5);
  
  // Clear list and show empty state if no transactions
  transactionsList.innerHTML = '';
  
  if (recentTransactions.length === 0) {
    transactionsList.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="3" x2="21" y1="9" y2="9"></line><line x1="9" x2="9" y1="21" y2="9"></line></svg>
        <p>No transactions yet</p>
        <button id="add-first-transaction" class="btn btn-outline">Add your first transaction</button>
      </div>
    `;
    
    // Attach event listener to the button
    const addButton = document.getElementById('add-first-transaction');
    if (addButton) {
      addButton.addEventListener('click', () => {
        const modal = document.getElementById('transaction-modal');
        openModal(modal);
      });
    }
    
    return;
  }
  
  // Create transaction items
  recentTransactions.forEach(transaction => {
    const transactionItem = document.createElement('div');
    transactionItem.className = 'transaction-item';
    
    const isIncome = transaction.amount >= 0;
    const amountClass = isIncome ? 'income-amount' : 'expense-amount';
    
    transactionItem.innerHTML = `
      <div class="transaction-icon">
        ${getCategoryIcon(transaction.category)}
      </div>
      <div class="transaction-details">
        <div class="transaction-title">${transaction.description}</div>
        <div class="transaction-category">${transaction.category}</div>
      </div>
      <div class="transaction-amount ${amountClass}">
        ${formatCurrency(transaction.amount)}
      </div>
      <div class="transaction-date">
        ${formatDate(transaction.date)}
      </div>
    `;
    
    transactionsList.appendChild(transactionItem);
  });
}

/**
 * Display budget overview on dashboard
 */
function displayBudgetOverview() {
  const budgetOverview = document.getElementById('budget-overview');
  if (!budgetOverview) return;
  
  const currentMonthBudgets = BudgetManager.getCurrentMonthBudgets();
  
  // Clear and show empty state if no budgets
  budgetOverview.innerHTML = '';
  
  if (currentMonthBudgets.length === 0) {
    budgetOverview.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H6"></path><path d="M12 18v2"></path><path d="M12 4v2"></path></svg>
        <p>No budget goals set</p>
        <a href="budget.html" class="btn btn-outline">Set up your first budget</a>
      </div>
    `;
    return;
  }
  
  // Show savings goal if exists
  const savingsGoal = BudgetManager.getSavingsGoal();
  if (savingsGoal) {
    const savingsProgress = BudgetManager.calculateBudgetProgress('savings');
    const percentageClass = getProgressClass(savingsProgress.percentage);
    
    const savingsCard = document.createElement('div');
    savingsCard.className = 'budget-card';
    savingsCard.innerHTML = `
      <div class="budget-card-header">
        <div class="budget-category">Monthly Savings Goal</div>
      </div>
      <div class="budget-amount">Goal: ${formatCurrency(savingsProgress.budget)}</div>
      <div class="progress-container">
        <div class="progress-bar ${percentageClass}" style="width: ${savingsProgress.percentage}%"></div>
      </div>
      <div class="progress-stats">
        <div>Saved: ${formatCurrency(savingsProgress.spent)}</div>
        <div class="progress-percentage">${savingsProgress.percentage}%</div>
      </div>
    `;
    
    budgetOverview.appendChild(savingsCard);
  }
  
  // Show category budgets
  const categoryBudgets = currentMonthBudgets.filter(b => b.type === 'category');
  categoryBudgets.forEach(budget => {
    const progress = BudgetManager.calculateBudgetProgress(budget.category);
    const percentageClass = getProgressClass(progress.percentage);
    
    const budgetCard = document.createElement('div');
    budgetCard.className = 'budget-card';
    budgetCard.innerHTML = `
      <div class="budget-card-header">
        <div class="budget-category">${budget.category}</div>
      </div>
      <div class="budget-amount">Budget: ${formatCurrency(budget.amount)}</div>
      <div class="progress-container">
        <div class="progress-bar ${percentageClass}" style="width: ${progress.percentage}%"></div>
      </div>
      <div class="progress-stats">
        <div>Spent: ${formatCurrency(progress.spent)}</div>
        <div class="progress-percentage">${progress.percentage}%</div>
      </div>
    `;
    
    budgetOverview.appendChild(budgetCard);
  });
}

/**
 * Get CSS class for progress bar based on percentage
 * 
 * @param {number} percentage - Progress percentage
 * @returns {string} - CSS class name
 */
function getProgressClass(percentage) {
  if (percentage >= 90) return 'danger';
  if (percentage >= 70) return 'warning';
  return '';
}

/**
 * Set up dashboard-specific event listeners
 */
function setupDashboardListeners() {
  // Quick add transaction button
  const quickAddButton = document.getElementById('quick-add-button');
  if (quickAddButton) {
    quickAddButton.addEventListener('click', () => {
      const modal = document.getElementById('transaction-modal');
      
      // Reset the form to default state for new transaction
      const form = document.getElementById('transaction-form');
      if (form) form.reset();
      
      // Set today's date as default
      const dateInput = document.getElementById('transaction-date');
      if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
      }
      
      openModal(modal);
    });
  }
}