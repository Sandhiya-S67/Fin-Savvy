/**
 * Budget page functionality
 */
document.addEventListener('DOMContentLoaded', () => {
  // Display all budgets
  displayBudgets();

  // Set up event listeners
  setupBudgetListeners();
});

/**
 * Display budgets with current filters
 */
function displayBudgets() {
  displaySavingsGoal();
  displayCategoryBudgets();
}

/**
 * Display savings goal section
 */
function displaySavingsGoal() {
  const container = document.getElementById('savings-goal-container');
  const emptyState = document.getElementById('empty-savings');
  if (!container) return;
  
  // Get current month's savings goal
  const savingsGoal = BudgetManager.getSavingsGoal();
  
  // Clear content except empty state
  const content = container.innerHTML;
  container.innerHTML = '';
  
  // If no savings goal, show empty state
  if (!savingsGoal) {
    container.appendChild(emptyState);
    return;
  }
  
  // Hide empty state
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  // Calculate savings progress
  const progress = BudgetManager.calculateBudgetProgress('savings');
  const percentageClass = getProgressClass(progress.percentage);
  
  // Create savings goal card
  const savingsCard = document.createElement('div');
  savingsCard.className = 'savings-goal-card';
  savingsCard.innerHTML = `
    <div class="budget-card-header">
      <div>
        <h4>Monthly Savings Target</h4>
        <div class="budget-amount">Goal: ${formatCurrency(progress.budget)}</div>
      </div>
      <div class="budget-actions">
        <button class="action-btn edit-btn" title="Edit" data-id="${savingsGoal.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
        </button>
        <button class="action-btn delete-btn" title="Delete" data-id="${savingsGoal.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
    <div class="progress-container">
      <div class="progress-bar ${percentageClass}" style="width: ${progress.percentage}%"></div>
    </div>
    <div class="progress-stats">
      <div>Saved: ${formatCurrency(progress.spent)}</div>
      <div class="progress-percentage">${progress.percentage}%</div>
    </div>
  `;
  
  container.appendChild(savingsCard);
  
  // Add event listeners to edit and delete buttons
  container.querySelector('.edit-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const id = e.target.closest('.edit-btn').dataset.id;
    BudgetManager.editBudget(id);
  });
  
  container.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const id = e.target.closest('.delete-btn').dataset.id;
    BudgetManager.deleteBudget(id);
  });
}

/**
 * Display category budgets section
 */
function displayCategoryBudgets() {
  const container = document.getElementById('budget-list');
  const emptyState = document.getElementById('empty-budgets');
  if (!container) return;
  
  // Get current month's category budgets
  const budgets = BudgetManager.getCurrentMonthBudgets();
  const categoryBudgets = budgets.filter(b => b.type === 'category');
  
  // Clear content
  container.innerHTML = '';
  
  // If no category budgets, show empty state
  if (categoryBudgets.length === 0) {
    container.appendChild(emptyState);
    return;
  }
  
  // Hide empty state
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  // Create budget cards for each category
  categoryBudgets.forEach(budget => {
    const progress = BudgetManager.calculateBudgetProgress(budget.category);
    const percentageClass = getProgressClass(progress.percentage);
    
    const budgetCard = document.createElement('div');
    budgetCard.className = 'budget-card';
    budgetCard.innerHTML = `
      <div class="budget-card-header">
        <div class="budget-category">${budget.category}</div>
        <div class="budget-actions">
          <button class="action-btn edit-btn" title="Edit" data-id="${budget.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
          </button>
          <button class="action-btn delete-btn" title="Delete" data-id="${budget.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          </button>
        </div>
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
    
    container.appendChild(budgetCard);
  });
  
  // Add event listeners to edit and delete buttons
  container.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = button.dataset.id;
      BudgetManager.editBudget(id);
    });
  });
  
  container.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = button.dataset.id;
      BudgetManager.deleteBudget(id);
    });
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
 * Set up budget page specific event listeners
 */
function setupBudgetListeners() {
  // Add budget button
  const addButton = document.getElementById('add-budget-button');
  if (addButton) {
    addButton.addEventListener('click', () => {
      // Clear the form for a new budget
      const form = document.getElementById('budget-form');
      if (form) {
        form.reset();
        document.getElementById('budget-id').value = '';
      }
      
      // Update modal title
      const modalTitle = document.getElementById('budget-modal-title');
      if (modalTitle) {
        modalTitle.textContent = 'Add Budget Goal';
      }
      
      // Set current month as default
      const monthInput = document.getElementById('budget-month');
      if (monthInput) {
        monthInput.value = new Date().toISOString().substring(0, 7);
      }
      
      // Show or hide category group based on selected type
      const typeSelect = document.getElementById('budget-type');
      const categoryGroup = document.getElementById('category-group');
      if (typeSelect && categoryGroup) {
        categoryGroup.style.display = typeSelect.value === 'category' ? 'block' : 'none';
      }
      
      // Open modal
      const modal = document.getElementById('budget-modal');
      openModal(modal);
    });
  }
  
  // Add savings goal button
  const addSavingsButton = document.getElementById('add-savings-goal');
  if (addSavingsButton) {
    addSavingsButton.addEventListener('click', () => {
      // Clear the form and set type to savings
      const form = document.getElementById('budget-form');
      if (form) {
        form.reset();
        document.getElementById('budget-id').value = '';
        document.getElementById('budget-type').value = 'savings';
      }
      
      // Hide category group
      const categoryGroup = document.getElementById('category-group');
      if (categoryGroup) {
        categoryGroup.style.display = 'none';
      }
      
      // Update modal title
      const modalTitle = document.getElementById('budget-modal-title');
      if (modalTitle) {
        modalTitle.textContent = 'Set Savings Goal';
      }
      
      // Set current month as default
      const monthInput = document.getElementById('budget-month');
      if (monthInput) {
        monthInput.value = new Date().toISOString().substring(0, 7);
      }
      
      // Open modal
      const modal = document.getElementById('budget-modal');
      openModal(modal);
    });
  }
  
  // Add category budget button
  const addCategoryButton = document.getElementById('add-category-budget');
  if (addCategoryButton) {
    addCategoryButton.addEventListener('click', () => {
      // Clear the form and set type to category
      const form = document.getElementById('budget-form');
      if (form) {
        form.reset();
        document.getElementById('budget-id').value = '';
        document.getElementById('budget-type').value = 'category';
      }
      
      // Show category group
      const categoryGroup = document.getElementById('category-group');
      if (categoryGroup) {
        categoryGroup.style.display = 'block';
      }
      
      // Update modal title
      const modalTitle = document.getElementById('budget-modal-title');
      if (modalTitle) {
        modalTitle.textContent = 'Add Category Budget';
      }
      
      // Set current month as default
      const monthInput = document.getElementById('budget-month');
      if (monthInput) {
        monthInput.value = new Date().toISOString().substring(0, 7);
      }
      
      // Open modal
      const modal = document.getElementById('budget-modal');
      openModal(modal);
    });
  }
}