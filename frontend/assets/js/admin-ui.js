/* admin-ui.js — main UI behavior, data scaffolding, table renderers, modals, exports.
   Replace `sampleData` with fetch calls to your backend endpoints when ready.
*/

const sampleData = {
  users: [
    { id: 1, name: 'Ali Khan', email: 'ali@example.com', role: 'user', joined: '2025-06-01' },
    { id: 2, name: 'Sara', email: 'sara@example.com', role: 'user', joined: '2025-08-02' },
    { id: 99, name: 'Admin', email: 'admin@glowing.com', role: 'admin', joined: '2025-01-01' }
  ],
  products: [
    { id: 1, title: 'Cleanser', price: 45, stock: 3, category: 'skincare', unitsSold: 120, img: '' },
    { id: 2, title: 'Perfume A', price: 120, stock: 22, category: 'perfume', unitsSold: 60, img: '' }
  ],
  orders: [
    { id: 'ORD-001', customer: 'Ali Khan', date: '2025-12-01', items: 2, total: 150, status: 'delivered' },
    { id: 'ORD-002', customer: 'Sara', date: '2025-12-02', items: 1, total: 40, status: 'pending' },
    { id: 'ORD-003', customer: 'Guest', date: '2025-12-03', items: 3, total: 110, status: 'shipped' }
  ]
};

/* ------- Utilities ------- */
function $(sel){ return document.querySelector(sel) }
function $all(sel){ return Array.from(document.querySelectorAll(sel)) }
function formatCurrency(v){ return `AED ${Number(v).toFixed(2)}` }
function debounce(fn,delay=250){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),delay) } }
function toast(msg,ms=2500){ const t=document.createElement('div'); t.className='toast'; t.innerText=msg; document.body.appendChild(t); setTimeout(()=>t.classList.add('show'),10); setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300) }, ms) }

/* ------- Navigation & section display ------- */
function showSection(name){
  $all('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.target === name));
  $all('.section').forEach(s => s.classList.toggle('active', s.id === name));
  // optional: load data on demand
  if (name === 'dashboard') renderDashboard();
  if (name === 'orders') renderOrdersTable();
  if (name === 'products') renderProductsTable();
  if (name === 'analytics') renderAnalytics();
}
$all('.nav-item').forEach(n => n.addEventListener('click', () => showSection(n.dataset.target)));

/* ------- Dashboard Render ------- */
function computeMetrics(data){
  const revenue = data.orders.reduce((s,o)=>s+Number(o.total),0);
  const lowStock = data.products.filter(p=>p.stock < 5).length;
  return { revenue, totalOrders: data.orders.length, totalUsers: data.users.length, lowStock };
}

function topProducts(data, limit=5){
  return data.products.slice().sort((a,b)=>b.unitsSold - a.unitsSold).slice(0,limit);
}

function recentOrders(data, limit=6){
  return data.orders.slice().slice(-limit).reverse();
}

function renderDashboard(){
  const data = sampleData;
  const m = computeMetrics(data);
  $('#todaySales').innerText = formatCurrency(m.revenue); // demo: treat all revenue as today's
  $('#totalOrders').innerText = m.totalOrders;
  $('#totalCustomers').innerText = m.totalUsers;
  $('#lowStockItems').innerText = m.lowStock;
  $('#notifCount').innerText = Math.max(0, data.orders.filter(o=>o.status==='pending').length);

  // Recent Orders table
  const rec = recentOrders(data);
  const recentHTML = `<table class="table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>
    ${rec.map(o=>`<tr>
      <td>${o.id}</td>
      <td>${o.customer}</td>
      <td>${o.date}</td>
      <td>${formatCurrency(o.total)}</td>
      <td><span class="status-badge status-${o.status}">${o.status}</span></td>
      <td><button class="btn btn-sm btn-secondary" onclick="openOrderModal('${o.id}')">View</button></td>
    </tr>`).join('')}
  </tbody></table>`;
  $('#recentOrdersTable').innerHTML = recentHTML;

  // Top products
  const top = topProducts(data, 6);
  $('#topProductsTable').innerHTML = `<table class="table"><thead><tr><th>Product</th><th>Units Sold</th><th>Revenue</th></tr></thead><tbody>
    ${top.map(p=>`<tr><td class="product-info"><img src="${p.img||'https://via.placeholder.com/48'}" class="product-thumb" /> <div><div class="product-name">${p.title}</div><div style="font-size:12px;color:var(--gray)">${p.category}</div></div></td><td>${p.unitsSold||0}</td><td>${formatCurrency((p.unitsSold||0)*p.price)}</td></tr>`).join('')}
  </tbody></table>`;

  // charts: prepare simple series for demo
  const revLabels = ['-6','-5','-4','-3','-2','-1','Today'];
  const revValues = [50,120,90,160,80,200, Math.round(m.revenue)];
  renderRevenueChart({ labels: revLabels, values: revValues });

  const statusCounts = data.orders.reduce((acc,o)=>{ acc[o.status]=(acc[o.status]||0)+1; return acc }, {});
  renderOrdersByStatusChart(statusCounts);
}

/* ------- Orders table ------- */
function renderOrdersTable(){
  const data = sampleData;
  const statusFilter = $('#ordersStatusFilter').value;
  const q = ($('#ordersSearch').value || '').toLowerCase();
  const rows = data.orders.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (!q) return true;
    return o.id.toLowerCase().includes(q) || (o.customer || '').toLowerCase().includes(q);
  });

  const html = `<table class="table"><thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>
    ${rows.map(o=>`<tr>
      <td>${o.id}</td>
      <td>${o.customer}</td>
      <td>${o.date}</td>
      <td>${o.items}</td>
      <td>${formatCurrency(o.total)}</td>
      <td><span class="status-badge status-${o.status}">${o.status}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="openOrderModal('${o.id}')">View</button>
        <button class="btn btn-sm" onclick="updateOrderStatus('${o.id}','shipped')">Mark Shipped</button>
      </td>
    </tr>`).join('')}
  </tbody></table>`;

  $('#ordersTableContainer').innerHTML = html;
}

/* ------- Products table ------- */
function renderProductsTable(){
  const data = sampleData;
  const cat = $('#productCategoryFilter').value;
  const q = ($('#productsSearch').value || '').toLowerCase();
  const rows = data.products.filter(p => {
    if (cat && p.category !== cat) return false;
    if (!q) return true;
    return (p.title || '').toLowerCase().includes(q);
  });

  const html = `<table class="table"><thead><tr><th></th><th>Product</th><th>Price</th><th>Category</th><th>Stock</th><th>Units Sold</th><th>Actions</th></tr></thead><tbody>
    ${rows.map(p=>`<tr>
      <td><input type="checkbox" data-id="${p.id}" /></td>
      <td class="product-info"><img src="${p.img||'https://via.placeholder.com/48'}" class="product-thumb" alt="thumb"/><div><div class="product-name">${p.title}</div></div></td>
      <td>${formatCurrency(p.price)}</td>
      <td>${p.category}</td>
      <td>${p.stock < 5 ? `<span class="status-badge status-pending">${p.stock} low</span>` : p.stock}</td>
      <td>${p.unitsSold||0}</td>
      <td><button class="btn btn-sm btn-secondary" onclick="editProduct(${p.id})">Edit</button> <button class="btn btn-sm" onclick="deleteProduct(${p.id})">Delete</button></td>
    </tr>`).join('')}
  </tbody></table>`;
  $('#productsTableContainer').innerHTML = html;
}

/* ------- Inventory, Customers, etc placeholders ------- */
function renderInventory(){
  const html = `<table class="table"><thead><tr><th>Product</th><th>Stock</th><th>Last Restock</th></tr></thead><tbody>
    ${sampleData.products.map(p=>`<tr><td>${p.title}</td><td>${p.stock}</td><td>-</td></tr>`).join('')}
  </tbody></table>`;
  $('#inventoryContainer').innerHTML = html;
}

function renderCustomers(){
  const html = `<table class="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
    ${sampleData.users.map(u=>`<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.joined}</td><td><button class="btn btn-sm btn-secondary" onclick="openUserModal(${u.id})">View</button></td></tr>`).join('')}
  </tbody></table>`;
  $('#customersContainer').innerHTML = html;
}

/* ------- Analytics view ------- */
function renderAnalytics(){
  const data = sampleData;
  const revenue = data.orders.reduce((s,o)=>s+Number(o.total),0);
  $('#monthlyRevenue').innerText = formatCurrency(revenue);
  $('#avgOrderValue').innerText = formatCurrency(data.orders.length ? (revenue / data.orders.length) : 0);
  $('#conversionRate').innerText = '—';
  $('#returningCustomers').innerText = '—';

  const catAgg = data.products.reduce((acc,p)=>{ acc[p.category]=(acc[p.category]||0) + (p.unitsSold||0); return acc }, {});
  renderCategoryChart({ labels: Object.keys(catAgg), values: Object.values(catAgg) });
}

/* ------- Modals & actions ------- */
function openOrderModal(orderId){
  const order = sampleData.orders.find(o=>o.id===orderId);
  fetch('order-modal.html').then(r=>r.text()).then(template=>{
    const t = template.replace('{{ORDER_ID}}', order.id)
                      .replace('{{ORDER_CUSTOMER}}', order.customer)
                      .replace('{{ORDER_DATE}}', order.date)
                      .replace('{{ORDER_TOTAL}}', formatCurrency(order.total))
                      .replace('{{ORDER_STATUS}}', order.status)
                      .replace('{{ORDER_ITEMS}}', (order.items || 0));
    showModal(t);
  });
}

function openUserModal(userId){
  const user = sampleData.users.find(u=>u.id===userId);
  fetch('user-modal.html').then(r=>r.text()).then(template=>{
    const orders = sampleData.orders.filter(o=>o.customer === user.name).map(o=>`<li>${o.id} — ${formatCurrency(o.total)} — ${o.status}</li>`).join('') || '<li>No orders</li>';
    const t = template.replace('{{USER_NAME}}', user.name)
                      .replace('{{USER_EMAIL}}', user.email)
                      .replace('{{USER_ROLE}}', user.role)
                      .replace('{{USER_JOINED}}', user.joined)
                      .replace('{{USER_ORDERS}}', orders);
    showModal(t);
  });
}

function showModal(innerHTML){
  const root = $('#modalRoot');
  root.innerHTML = `<div class="modal" id="activeModal"><div class="modal-content"><div class="modal-body">${innerHTML}</div><div style="padding:12px 18px;border-top:1px solid var(--border);text-align:right"><button class="btn btn-secondary" onclick="closeModal()">Close</button></div></div></div>`;
}

function closeModal(){
  const root = $('#modalRoot');
  root.innerHTML = '';
}

/* ------- CRUD stub actions (replace with fetch to backend) ------- */
function updateOrderStatus(id, status){
  if(!confirm(`Update ${id} -> ${status}?`)) return;
  const o = sampleData.orders.find(x=>x.id===id);
  if(o){ o.status = status; toast('Order updated'); renderOrdersTable(); renderDashboard(); }
}

function deleteProduct(id){
  if(!confirm('Delete product?')) return;
  const idx = sampleData.products.findIndex(p=>p.id===id);
  if(idx>-1){ sampleData.products.splice(idx,1); renderProductsTable(); toast('Product deleted'); }
}
function editProduct(id){ toast('Open edit product modal (not implemented)'); }
function showAddProduct(){ toast('Add product modal (not implemented)'); }
function showAddUser(){ toast('Add user modal (not implemented)'); }

/* ------- CSV Export ------- */
function exportOrders(){
  const rows = [['Order ID','Customer','Date','Items','Total','Status']];
  sampleData.orders.forEach(o => rows.push([o.id,o.customer,o.date,o.items,o.total,o.status]));
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click(); URL.revokeObjectURL(url);
}

/* ------- Global search (simple) ------- */
$('#globalSearch').addEventListener('input', debounce((e)=>{
  const q = e.target.value.trim().toLowerCase();
  if(!q) return;
  // try to find an order, user or product
  const order = sampleData.orders.find(o=>o.id.toLowerCase()===q);
  if(order){ showSection('orders'); $('#ordersSearch').value = q; renderOrdersTable(); return; }
  const user = sampleData.users.find(u=>u.email.toLowerCase()===q || u.name.toLowerCase()===q);
  if(user){ showSection('customers'); openUserModal(user.id); return; }
  const product = sampleData.products.find(p=>p.title.toLowerCase()===q);
  if(product){ showSection('products'); renderProductsTable(); toast('Product found'); return; }
  toast('No exact match — try broader search');
}, 300));

/* ------- Init ------- */
function initAdmin(){
  renderDashboard();
  renderOrdersTable();
  renderProductsTable();
  renderInventory();
  renderCustomers();
  renderAnalytics();

  // revenue range change
  $('#revenueRange').addEventListener('change', ()=> renderDashboard());

  // quick listeners
  $('#ordersSearch').addEventListener('keydown', e => { if(e.key==='Enter') renderOrdersTable(); });
  $('#productsSearch').addEventListener('keydown', e => { if(e.key==='Enter') renderProductsTable(); });
}

window.addEventListener('DOMContentLoaded', initAdmin);
