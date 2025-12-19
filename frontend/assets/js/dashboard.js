// Dashboard Manager
class DashboardManager {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    if (!this.currentUser) {
      // Redirect to signup if not logged in
      window.location.href = 'signup.html';
      return;
    }

    this.init();
  }

  init() {
    this.loadUserData();
    this.setupNavigation();
    this.setupLogout();
    this.setupUserDropdown();
    this.loadWishlist();
    this.updateStats();
  }

  loadUserData() {
    // Update profile section
    document.getElementById('profile-firstname').textContent = this.currentUser.firstName || 'N/A';
    document.getElementById('profile-lastname').textContent = this.currentUser.lastName || 'N/A';
    document.getElementById('profile-email').textContent = this.currentUser.email || 'N/A';
    document.getElementById('profile-phone').textContent = this.currentUser.phone || 'N/A';

    // Format created date
    if (this.currentUser.createdAt) {
      const date = new Date(this.currentUser.createdAt);
      document.getElementById('profile-created').textContent = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    // Update header dropdown
    const initials = `${this.currentUser.firstName?.charAt(0) || ''}${this.currentUser.lastName?.charAt(0) || ''}`;
    document.getElementById('user-initials').textContent = initials;
    document.getElementById('dropdown-user-name').textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    document.getElementById('dropdown-user-email').textContent = this.currentUser.email;
  }

  setupNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
    const sections = document.querySelectorAll('.dashboard-section');

    sidebarLinks.forEach(link => {
      link.addEventListener('click', () => {
        const sectionId = link.dataset.section;

        // Update active states
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Show selected section
        sections.forEach(section => {
          section.classList.remove('active');
          if (section.id === `${sectionId}-section`) {
            section.classList.add('active');
          }
        });

        // Reload wishlist if wishlist section is selected
        if (sectionId === 'wishlist') {
          this.loadWishlist();
        }
      });
    });
  }

  setupLogout() {
    const logoutBtns = [
      document.getElementById('logout-btn'),
      document.getElementById('sidebar-logout-btn')
    ];

    logoutBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.logout();
        });
      }
    });
  }

  setupUserDropdown() {
    const dropdownBtn = document.getElementById('user-dropdown-btn');
    const dropdown = document.getElementById('user-dropdown');

    if (dropdownBtn && dropdown) {
      dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !dropdownBtn.contains(e.target)) {
          dropdown.classList.remove('active');
        }
      });
    }
  }

  loadWishlist() {
    this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistGrid = document.getElementById('dashboard-wishlist-grid');

    if (!wishlistGrid) return;

    if (this.wishlist.length === 0) {
      wishlistGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <ion-icon name="heart-outline"></ion-icon>
          <h3>Your Wishlist is Empty</h3>
          <p>Start adding products you love to your wishlist</p>
          <a href="shop.html" class="btn btn-primary">Browse Products</a>
        </div>
      `;
      return;
    }

    wishlistGrid.innerHTML = this.wishlist.map(item => `
      <div class="wishlist-item">
        <img src="${item.image}" alt="${item.name}" class="wishlist-item-image">
        <div class="wishlist-item-content">
          <h3 class="wishlist-item-name">${item.name}</h3>
          <p class="wishlist-item-price">AED ${item.price.toFixed(2)}</p>
          <div class="wishlist-item-actions">
            <button class="btn-add-cart" onclick="dashboardManager.addToCartFromWishlist(${item.id})">
              Add to Cart
            </button>
            <button class="btn-remove" onclick="dashboardManager.removeFromWishlist(${item.id})">
              Remove
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  addToCartFromWishlist(productId) {
    const product = this.wishlist.find(item => item.id === productId);
    if (product && window.cartSystem) {
      window.cartSystem.addToCart(product);
      this.showNotification('Added to cart!', 'success');
    }
  }

  removeFromWishlist(productId) {
    this.wishlist = this.wishlist.filter(item => item.id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    this.loadWishlist();
    this.updateStats();

    // Update wishlist system if available
    if (window.wishlistSystem) {
      window.wishlistSystem.wishlist = this.wishlist;
      window.wishlistSystem.updateWishlistUI();
    }

    this.showNotification('Removed from wishlist', 'info');
  }

  updateStats() {
    // Update wishlist count
    const wishlistCount = this.wishlist.length;
    document.getElementById('total-wishlist').textContent = wishlistCount;

    // Orders and reviews are placeholders for now
    document.getElementById('total-orders').textContent = '0';
    document.getElementById('total-reviews').textContent = '0';
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('rememberUser');
      this.showNotification('Logged out successfully', 'success');
      setTimeout(() => {
        window.location.href = '../../index.html';
      }, 1000);
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 10001;
      transform: translateX(400px);
      opacity: 0;
      transition: all 0.3s ease;
      ${type === 'error' ? 'background-color: #ef4444;' : type === 'success' ? 'background-color: #10b981;' : 'background-color: #3b82f6;'}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 100);

    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      notification.style.opacity = '0';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }
}

// Initialize dashboard when DOM is loaded
let dashboardManager;
document.addEventListener('DOMContentLoaded', () => {
  dashboardManager = new DashboardManager();
});
