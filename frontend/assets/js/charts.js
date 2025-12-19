/* charts.js — chart rendering using Chart.js. Exposes functions to render charts
   The data source is provided by admin-ui.js (sampleData or live API). */

let revenueChart = null;
let ordersChart = null;
let categoryChart = null;

function renderRevenueChart(series) {
  const ctx = document.getElementById('revenueChart').getContext('2d');
  if (revenueChart) revenueChart.destroy();
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: series.labels,
      datasets: [{
        label: 'Revenue',
        data: series.values,
        fill: true,
        tension: 0.25,
        pointRadius: 3,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend:{display:false} },
      scales: {
        y: { ticks: { callback: v => `AED ${v}` } },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderOrdersByStatusChart(counts) {
  const ctx = document.getElementById('ordersChart').getContext('2d');
  if (ordersChart) ordersChart.destroy();
  ordersChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(counts),
      datasets: [{ data: Object.values(counts) }]
    },
    options: { responsive: true, plugins:{legend:{position:'bottom'}} }
  });
}

function renderCategoryChart(data) {
  const ctx = document.getElementById('categoryChart').getContext('2d');
  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(ctx, {
    type: 'bar',
    data: { labels: data.labels, datasets: [{ label: 'Sales', data: data.values, borderRadius:6 }] },
    options: { responsive:true, plugins:{legend:{display:false}} }
  });
}
