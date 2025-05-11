/**
 * Charts module for rendering data visualizations
 */
const ChartManager = (() => {
  // Chart colors
  const COLORS = getChartColors(10);
  
  /**
   * Create a pie chart
   * 
   * @param {string} canvasId - Canvas element ID
   * @param {Object} data - Chart data with labels and values
   * @param {string} legendId - Legend element ID (optional)
   */
  const createPieChart = (canvasId, data, legendId = null) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.parentElement.clientWidth * 0.7;
    canvas.height = canvas.parentElement.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Prepare data
    const labels = Object.keys(data);
    const values = Object.values(data);
    const total = values.reduce((sum, value) => sum + value, 0);
    
    // Don't draw if no data
    if (total <= 0) {
      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
      ctx.textAlign = 'center';
      ctx.fillText('No data to display', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    // Calculate position and radius
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    
    // Draw pie chart
    let startAngle = 0;
    labels.forEach((label, index) => {
      const value = values[index];
      const sliceAngle = (value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      ctx.fillStyle = COLORS[index % COLORS.length];
      ctx.fill();
      
      // Move to next slice
      startAngle = endAngle;
    });
    
    // Create legend if specified
    if (legendId) {
      const legendElement = document.getElementById(legendId);
      if (legendElement) {
        // Clear legend
        legendElement.innerHTML = '';
        
        // Create legend items
        labels.forEach((label, index) => {
          const value = values[index];
          const percentage = Math.round((value / total) * 100);
          
          const legendItem = document.createElement('div');
          legendItem.className = 'legend-item';
          legendItem.innerHTML = `
            <div class="legend-color" style="background-color: ${COLORS[index % COLORS.length]}"></div>
            <div class="legend-label">${label} - ${formatCurrency(value)} (${percentage}%)</div>
          `;
          
          legendElement.appendChild(legendItem);
        });
      }
    }
  };
  
  /**
   * Create a bar chart
   * 
   * @param {string} canvasId - Canvas element ID
   * @param {Array} data - Array of objects with label and values properties
   * @param {Object} options - Chart options
   */
  const createBarChart = (canvasId, data, options = {}) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Default options
    const defaultOptions = {
      padding: 40,
      barWidth: 40,
      barSpacing: 20,
      yAxisLabel: '',
      xAxisLabel: '',
      colors: COLORS
    };
    
    // Merge options
    const chartOptions = {...defaultOptions, ...options};
    
    // Don't draw if no data
    if (data.length === 0) {
      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
      ctx.textAlign = 'center';
      ctx.fillText('No data to display', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    // Calculate chart dimensions
    const chartWidth = canvas.width - chartOptions.padding * 2;
    const chartHeight = canvas.height - chartOptions.padding * 2;
    
    // Calculate bar width and spacing
    const totalBars = data.length;
    const barWidth = Math.min(
      chartOptions.barWidth,
      (chartWidth / totalBars) - chartOptions.barSpacing
    );
    
    // Find max value for y-axis scale
    const maxValue = Math.max(...data.flatMap(item => Object.values(item.values)));
    const yScale = chartHeight / maxValue;
    
    // Draw bars
    data.forEach((item, index) => {
      const x = chartOptions.padding + index * (barWidth + chartOptions.barSpacing);
      
      // Draw grouped bars
      Object.entries(item.values).forEach(([key, value], groupIndex) => {
        const barX = x + (groupIndex * (barWidth / Object.keys(item.values).length));
        const barY = canvas.height - chartOptions.padding - (value * yScale);
        const barHeight = value * yScale;
        const groupBarWidth = barWidth / Object.keys(item.values).length;
        
        // Draw bar
        ctx.fillStyle = chartOptions.colors[groupIndex % chartOptions.colors.length];
        ctx.fillRect(barX, barY, groupBarWidth, barHeight);
        
        // Draw value on top of bar
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(formatCurrency(value), barX + groupBarWidth / 2, barY - 5);
      });
      
      // Draw x-axis label
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x + barWidth / 2, canvas.height - chartOptions.padding / 2);
    });
    
    // Draw y-axis
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
    ctx.beginPath();
    ctx.moveTo(chartOptions.padding, chartOptions.padding);
    ctx.lineTo(chartOptions.padding, canvas.height - chartOptions.padding);
    ctx.stroke();
    
    // Draw x-axis
    ctx.beginPath();
    ctx.moveTo(chartOptions.padding, canvas.height - chartOptions.padding);
    ctx.lineTo(canvas.width - chartOptions.padding, canvas.height - chartOptions.padding);
    ctx.stroke();
  };
  
  /**
   * Create a line chart
   * 
   * @param {string} canvasId - Canvas element ID
   * @param {Array} data - Array of data points with x and y values
   * @param {Object} options - Chart options
   */
  const createLineChart = (canvasId, data, options = {}) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Default options
    const defaultOptions = {
      padding: 40,
      pointRadius: 4,
      lineWidth: 2,
      gridLines: true,
      yAxisLabel: '',
      xAxisLabel: '',
      colors: COLORS
    };
    
    // Merge options
    const chartOptions = {...defaultOptions, ...options};
    
    // Don't draw if no data
    if (data.length === 0 || Object.keys(data[0].values).length === 0) {
      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
      ctx.textAlign = 'center';
      ctx.fillText('No data to display', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    // Calculate chart dimensions
    const chartWidth = canvas.width - chartOptions.padding * 2;
    const chartHeight = canvas.height - chartOptions.padding * 2;
    
    // Find min and max values for y-axis scale
    const allValues = data.flatMap(item => Object.values(item.values));
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(0, ...allValues); // Ensure 0 is included
    const valueRange = maxValue - minValue;
    const yScale = chartHeight / valueRange;
    
    // Calculate x-axis spacing
    const xSpacing = chartWidth / (data.length - 1);
    
    // Draw grid lines if enabled
    if (chartOptions.gridLines) {
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
      ctx.setLineDash([2, 2]);
      ctx.lineWidth = 1;
      
      // Draw horizontal grid lines
      const gridLines = 5;
      for (let i = 0; i <= gridLines; i++) {
        const y = chartOptions.padding + (chartHeight / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(chartOptions.padding, y);
        ctx.lineTo(canvas.width - chartOptions.padding, y);
        ctx.stroke();
        
        // Draw y-axis value
        const value = maxValue - (valueRange / gridLines) * i;
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(formatCurrency(value), chartOptions.padding - 5, y + 4);
      }
      
      // Reset line dash
      ctx.setLineDash([]);
    }
    
    // Get all series names (keys in values object)
    const seriesNames = Object.keys(data[0].values);
    
    // Draw each data series
    seriesNames.forEach((seriesName, seriesIndex) => {
      const color = chartOptions.colors[seriesIndex % chartOptions.colors.length];
      
      // Draw connecting lines
      ctx.strokeStyle = color;
      ctx.lineWidth = chartOptions.lineWidth;
      ctx.beginPath();
      
      data.forEach((point, index) => {
        const value = point.values[seriesName] || 0;
        const x = chartOptions.padding + index * xSpacing;
        const y = canvas.height - chartOptions.padding - ((value - minValue) * yScale);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // Draw data points
      ctx.fillStyle = color;
      
      data.forEach((point, index) => {
        const value = point.values[seriesName] || 0;
        const x = chartOptions.padding + index * xSpacing;
        const y = canvas.height - chartOptions.padding - ((value - minValue) * yScale);
        
        ctx.beginPath();
        ctx.arc(x, y, chartOptions.pointRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw value on hover point (for the last point only)
        if (index === data.length - 1) {
          ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
          ctx.font = '12px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(formatCurrency(value), x, y - 10);
          ctx.fillStyle = color;
        }
      });
    });
    
    // Draw x-axis labels
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    data.forEach((point, index) => {
      const x = chartOptions.padding + index * xSpacing;
      ctx.fillText(point.label, x, canvas.height - chartOptions.padding / 2);
    });
  };
  
  /**
   * Generate CSV data from transactions
   * 
   * @param {Array} transactions - Array of transactions
   * @returns {string} - CSV string
   */
  const generateCSV = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return '';
    }
    
    // Define column headers
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    
    // Create CSV rows
    const rows = [headers.join(',')];
    
    transactions.forEach(t => {
      const type = t.amount >= 0 ? 'Income' : 'Expense';
      const amount = Math.abs(t.amount);
      
      const row = [
        t.date,
        `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
        t.category,
        type,
        amount
      ];
      
      rows.push(row.join(','));
    });
    
    return rows.join('\n');
  };
  
  /**
   * Export data to CSV file
   * 
   * @param {Array} transactions - Array of transactions
   */
  const exportToCSV = (transactions) => {
    const csv = generateCSV(transactions);
    
    // Create blob and download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set up download
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Return public API
  return {
    createPieChart,
    createBarChart,
    createLineChart,
    exportToCSV
  };
})();