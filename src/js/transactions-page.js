/**
 * Transactions page functionality
 */
document.addEventListener('DOMContentLoaded', () => {
  // Display all transactions
  displayTransactions();

  // Set up event listeners
  setupTransactionsListeners();
});

/**
 * Display transactions with current filters
 */
function displayTransactions() {
  const transactionsList = document.getElementById('transactions-list');
  if (!transactionsList) return;
  
  // Get current filter values
  const searchQuery = document.getElementById('search-transactions')?.value || '';
  const dateFilter = document.getElementById('filter-date')?.value || 'all';
  const typeFilter = document.getElementById('filter-type')?.value || 'all';
  const categoryFilter = document.getElementById('filter-category')?.value || 'all';
  
  // Get and filter transactions
  let transactions = StorageManager.getTransactions();
  
  // Apply filters
  transactions = TransactionManager.filterTransactionsByDate(transactions, dateFilter);
  transactions = TransactionManager.filterTransactionsByType(transactions, typeFilter);
  transactions = TransactionManager.filterTransactionsByCategory(transactions, categoryFilter);
  transactions = TransactionManager.searchTransactions(transactions, searchQuery);
  
  // Sort by date, newest first
  transactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Clear list
  transactionsList.innerHTML = '';
  
  // Show empty state if no transactions
  if (transactions.length === 0) {
    transactionsList.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="3" x2="21" y1="9" y2="9"></line><line x1="9" x2="9" y1="21" y2="9"></line></svg>
        <p>No transactions found</p>
        <button id="add-first-transaction-page" class="btn btn-outline">Add your first transaction</button>
      </div>
    `;
    
    // Attach event listener to the button
    const addButton = document.getElementById('add-first-transaction-page');
    if (addButton) {
      addButton.addEventListener('click', () => {
        const modal = document.getElementById('transaction-modal');
        openModal(modal);
      });
    }
    
    return;
  }
  
  // Create transaction items
  transactions.forEach(transaction => {
    const transactionItem = document.createElement('div');
    transactionItem.className = 'transaction-item';
    transactionItem.dataset.id = transaction.id;
    
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
      <div class="transaction-actions">
        <button class="action-btn edit-btn" title="Edit" data-id="${transaction.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
        </button>
        <button class="action-btn delete-btn" title="Delete" data-id="${transaction.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
    
    transactionsList.appendChild(transactionItem);
  });
  
  // Add event listeners to edit and delete buttons
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = button.dataset.id;
      TransactionManager.editTransaction(id);
    });
  });
  
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = button.dataset.id;
      TransactionManager.deleteTransaction(id);
    });
  });
}

/**
 * Set up transaction page specific event listeners
 */
function setupTransactionsListeners() {
  // Add transaction button
  const addButton = document.getElementById('add-transaction-button');
  if (addButton) {
    addButton.addEventListener('click', () => {
      // Clear the form for a new transaction
      const form = document.getElementById('transaction-form');
      if (form) {
        form.reset();
        document.getElementById('transaction-id').value = '';
      }
      
      // Update modal title
      const modalTitle = document.getElementById('modal-title');
      if (modalTitle) {
        modalTitle.textContent = 'Add New Transaction';
      }
      
      // Update save button text
      const saveButton = document.getElementById('save-transaction-btn');
      if (saveButton) {
        saveButton.textContent = 'Save Transaction';
      }
      
      // Set today's date as default
      const dateInput = document.getElementById('transaction-date');
      if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
      }
      
      // Open modal
      const modal = document.getElementById('transaction-modal');
      openModal(modal);
    });
  }
  
  // Search input
  const searchInput = document.getElementById('search-transactions');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      displayTransactions();
    }, 300));
  }
  
  // Filter controls
  const filterControls = [
    document.getElementById('filter-date'),
    document.getElementById('filter-type'),
    document.getElementById('filter-category')
  ];
  
  filterControls.forEach(control => {
    if (control) {
      control.addEventListener('change', () => {
        displayTransactions();
      });
    }
  });
}

/**
 * Debounce function to limit how often a function is called
 * 
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, delay) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}