/**
 * Reports page functionality
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the reports page
  initReports();

  // Set up event listeners
  setupReportsListeners();
});

/**
 * Initialize the reports page
 */
function initReports() {
  updateReportSummary();
  generateExpensePieChart();
  generateIncomeExpenseChart();
  generateTrendChart();
}

/**
 * Update report summary cards
 */
function updateReportSummary() {
  const netSavingsElement = document.getElementById('report-net-savings');
  const incomeElement = document.getElementById('report-total-income');
  const expensesElement = document.getElementById('report-total-expenses');
  
  // Get filtered transactions based on selected period
  const transactions = getFilteredTransactions();
  
  // Calculate totals
  const income = TransactionManager.calculateTotalIncome(transactions);
  const expenses = TransactionManager.calculateTotalExpenses(transactions);
  const netSavings = income - expenses;
  
  // Update elements
  if (netSavingsElement) {
    netSavingsElement.textContent = formatCurrency(netSavings);
    netSavingsElement.className = 'amount';
    if (netSavings < 0) {
      netSavingsElement.classList.add('expense-amount');
    } else if (netSavings > 0) {
      netSavingsElement.classList.add('income-amount');
    }
  }
  
  if (incomeElement) {
    incomeElement.textContent = formatCurrency(income);
  }
  
  if (expensesElement) {
    expensesElement.textContent = formatCurrency(expenses);
  }
}

/**
 * Generate expense pie chart
 */
function generateExpensePieChart() {
  // Get filtered transactions based on selected period
  const transactions = getFilteredTransactions();
  
  // Get expenses by category
  const expensesByCategory = TransactionManager.calculateExpensesByCategory(transactions);
  
  // Draw pie chart
  ChartManager.createPieChart('category-pie-chart', expensesByCategory, 'pie-chart-legend');
}

/**
 * Generate income vs expense chart
 */
function generateIncomeExpenseChart() {
  // Get period filter
  const periodFilter = document.getElementById('report-period').value;
  
  // Prepare data based on selected period
  const data = [];
  
  if (periodFilter === 'month') {
    // Current month - show by week
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get weeks in the month
    const weeks = getWeeksInMonth(currentMonth, currentYear);
    
    weeks.forEach((week, index) => {
      const weekTransactions = StorageManager.getTransactions().filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= week.start && transactionDate <= week.end;
      });
      
      const income = TransactionManager.calculateTotalIncome(weekTransactions);
      const expenses = TransactionManager.calculateTotalExpenses(weekTransactions);
      
      data.push({
        label: `Week ${index + 1}`,
        values: { income, expenses }
      });
    });
  } else if (periodFilter === '3months' || periodFilter === '6months') {
    // Last 3 or 6 months - show by month
    const now = new Date();
    const monthsToShow = periodFilter === '3months' ? 3 : 6;
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const monthTransactions = StorageManager.getTransactions().filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= month && transactionDate <= monthEnd;
      });
      
      const income = TransactionManager.calculateTotalIncome(monthTransactions);
      const expenses = TransactionManager.calculateTotalExpenses(monthTransactions);
      
      data.push({
        label: getShortMonth(month),
        values: { income, expenses }
      });
    }
  } else if (periodFilter === 'year') {
    // Current year - show by month
    const now = new Date();
    const currentYear = now.getFullYear();
    
    for (let month = 0; month < now.getMonth() + 1; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0);
      
      const monthTransactions = StorageManager.getTransactions().filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });
      
      const income = TransactionManager.calculateTotalIncome(monthTransactions);
      const expenses = TransactionManager.calculateTotalExpenses(monthTransactions);
      
      data.push({
        label: getShortMonth(monthStart),
        values: { income, expenses }
      });
    }
  }
  
  // Draw bar chart
  ChartManager.createBarChart('income-expense-chart', data, {
    colors: ['#4CAF50', '#f44336'] // Green for income, red for expenses
  });
}

/**
 * Generate trend line chart
 */
function generateTrendChart() {
  // Get period filter
  const periodFilter = document.getElementById('report-period').value;
  
  // Prepare data based on selected period
  const data = [];
  
  if (periodFilter === 'month') {
    // Current month - show by day
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      
      // Only include days up to today
      if (date > now) break;
      
      const dayTransactions = StorageManager.getTransactions().filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getDate() === day &&
               transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      });
      
      const balance = TransactionManager.calculateBalance(dayTransactions);
      
      // Running balance - sum of all transactions up to this day
      const runningBalanceTransactions = StorageManager.getTransactions().filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate <= date;
      });
      
      const runningBalance = TransactionManager.calculateBalance(runningBalanceTransactions);
      
      data.push({
        label: day.toString(),
        values: { 
          daily: balance,
          balance: runningBalance
        }
      });
    }
  } else if (periodFilter === '3months' || periodFilter === '6months') {
    // Last 3 or 6 months - show by week
    const now = new Date();
    const monthsToShow = periodFilter === '3months' ? 3 : 6;
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsToShow + 1, 1);
    
    // Get all weeks since start date
    const weeks = getWeeksSince(startDate);
    
    weeks.forEach((week, index) => {
      const weekTransactions = StorageManager.getTransactions().filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= week.start && transactionDate <= week.end;
      });
      
      const weekBalance = TransactionManager.calculateBalance(weekTransactions);
      
      // Running balance
      const runningBalanceTransactions = StorageManager.getTransactions().filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate <= week.end;
      });
      
      const runningBalance = TransactionManager.calculateBalance(runningBalanceTransactions);
      
      data.push({
        label: `${getShortMonth(week.start)} ${week.start.getDate()}`,
        values: { 
          weekly: weekBalance,
          balance: runningBalance
        }
      });
    });
  } else if (periodFilter === 'year') {
    // Current year - show by month
    const now = new Date();
    const currentYear = now.getFullYear();
    
    for (let month = 0; month < now.getMonth() + 1; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0);
      
      const monthTransactions = StorageManager.getTransactions().filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });
      
      const monthBalance = TransactionManager.calculateBalance(monthTransactions);
      
      // Running balance
      const runningBalanceTransactions = StorageManager.getTransactions().filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate <= monthEnd;
      });
      
      const runningBalance = TransactionManager.calculateBalance(runningBalanceTransactions);
      
      data.push({
        label: getShortMonth(monthStart),
        values: { 
          monthly: monthBalance,
          balance: runningBalance
        }
      });
    }
  }
  
  // Draw line chart
  ChartManager.createLineChart('trend-line-chart', data, {
    colors: ['#2196F3', '#4CAF50'] // Blue for period balance, green for running balance
  });
}

/**
 * Get transactions filtered by report period
 * 
 * @returns {Array} - Filtered transactions
 */
function getFilteredTransactions() {
  const periodFilter = document.getElementById('report-period').value;
  let transactions = StorageManager.getTransactions();
  
  const now = new Date();
  
  switch (periodFilter) {
    case 'month':
      // Current month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      transactions = transactions.filter(t => new Date(t.date) >= monthStart);
      break;
      
    case '3months':
      // Last 3 months
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      transactions = transactions.filter(t => new Date(t.date) >= threeMonthsAgo);
      break;
      
    case '6months':
      // Last 6 months
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      transactions = transactions.filter(t => new Date(t.date) >= sixMonthsAgo);
      break;
      
    case 'year':
      // Current year
      const yearStart = new Date(now.getFullYear(), 0, 1);
      transactions = transactions.filter(t => new Date(t.date) >= yearStart);
      break;
  }
  
  return transactions;
}

/**
 * Get weeks in a month
 * 
 * @param {number} month - Month (0-11)
 * @param {number} year - Year
 * @returns {Array} - Array of week objects with start and end dates
 */
function getWeeksInMonth(month, year) {
  const weeks = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Start from the first day of the month
  let weekStart = new Date(firstDay);
  
  // Create weeks until we pass the end of the month
  while (weekStart <= lastDay) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // Adjust end date if it goes beyond month end
    if (weekEnd > lastDay) {
      weeks.push({
        start: new Date(weekStart),
        end: new Date(lastDay)
      });
    } else {
      weeks.push({
        start: new Date(weekStart),
        end: new Date(weekEnd)
      });
    }
    
    // Move to next week
    weekStart.setDate(weekStart.getDate() + 7);
  }
  
  return weeks;
}

/**
 * Get weeks since a date
 * 
 * @param {Date} startDate - Start date
 * @returns {Array} - Array of week objects with start and end dates
 */
function getWeeksSince(startDate) {
  const weeks = [];
  const now = new Date();
  
  // Start from the provided date
  let weekStart = new Date(startDate);
  
  // Create weeks until we reach today
  while (weekStart <= now) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // Adjust end date if it goes beyond today
    if (weekEnd > now) {
      weeks.push({
        start: new Date(weekStart),
        end: new Date(now)
      });
    } else {
      weeks.push({
        start: new Date(weekStart),
        end: new Date(weekEnd)
      });
    }
    
    // Move to next week
    weekStart.setDate(weekStart.getDate() + 7);
  }
  
  return weeks;
}

/**
 * Set up reports page specific event listeners
 */
function setupReportsListeners() {
  // Period filter change
  const periodFilter = document.getElementById('report-period');
  if (periodFilter) {
    periodFilter.addEventListener('change', () => {
      updateReportSummary();
      generateExpensePieChart();
      generateIncomeExpenseChart();
      generateTrendChart();
    });
  }
  
  // Export CSV button
  const exportButton = document.getElementById('export-csv');
  if (exportButton) {
    exportButton.addEventListener('click', () => {
      const transactions = getFilteredTransactions();
      ChartManager.exportToCSV(transactions);
    });
  }
  
  // Handle window resize to redraw charts
  window.addEventListener('resize', debounce(() => {
    generateExpensePieChart();
    generateIncomeExpenseChart();
    generateTrendChart();
  }, 250));
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