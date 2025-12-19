const addEventOnElem = function (elem, type, callback) {
  if (!elem) return;
  if (elem.length !== undefined && elem.forEach) {
    elem.forEach(item => item.addEventListener(type, callback));
  } else {
    elem.addEventListener(type, callback);
  }
}

/**
 * navbar toggle
 */
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const navbar = document.querySelector("[data-navbar]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
  if (navbar) navbar.classList.toggle("active");
  if (overlay) overlay.classList.toggle("active");
  document.body.classList.toggle("active");
}

addEventOnElem(navTogglers, "click", toggleNavbar);

// Add specific close listeners for individual links to ensure they close the navbar
if (navbarLinks.length) {
  addEventOnElem(navbarLinks, "click", function () {
    if (navbar) navbar.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    document.body.classList.remove("active");
  });
}

// Ensure clicking the overlay also closes the navbar
if (overlay) {
  overlay.addEventListener("click", function () {
    if (navbar) navbar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("active");
  });
}


/**
 * header sticky & back top btn active
 */
const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

const headerActive = function () {
  if (window.scrollY > 150) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
}

addEventOnElem(window, "scroll", headerActive);

let lastScrolledPos = 0;

const headerSticky = function () {
  if (lastScrolledPos >= window.scrollY) {
    header.classList.remove("header-hide");
  } else {
    header.classList.add("header-hide");
  }

  lastScrolledPos = window.scrollY;
}

addEventOnElem(window, "scroll", headerSticky);

/**
 * scroll reveal effect
 */
const sections = document.querySelectorAll("[data-section]");

const scrollReveal = function () {
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].getBoundingClientRect().top < window.innerHeight / 2) {
      sections[i].classList.add("active");
    }
  }
}

scrollReveal();
addEventOnElem(window, "scroll", scrollReveal);

/**
 * Hero Carousel Functionality
 */
class HeroCarousel {
  constructor() {
    this.slides = document.querySelectorAll('.hero-slide');
    if (this.slides.length === 0) return; // Don't run on shop page

    this.indicators = document.querySelectorAll('.indicator');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.currentSlide = 0;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000; // 5 seconds

    this.init();
  }

  init() {
    // Add event listeners
    this.prevBtn.addEventListener('click', () => this.prevSlide());
    this.nextBtn.addEventListener('click', () => this.nextSlide());

    // Add indicator click events
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });

    // Start auto-play
    this.startAutoPlay();

    // Pause auto-play on hover
    const heroCarousel = document.querySelector('.hero-carousel');
    heroCarousel.addEventListener('mouseenter', () => this.stopAutoPlay());
    heroCarousel.addEventListener('mouseleave', () => this.startAutoPlay());
  }

  goToSlide(slideIndex) {
    // Remove active class from current slide and indicator
    this.slides[this.currentSlide].classList.remove('active');
    this.indicators[this.currentSlide].classList.remove('active');

    // Update current slide
    this.currentSlide = slideIndex;

    // Add active class to new slide and indicator
    this.slides[this.currentSlide].classList.add('active');
    this.indicators[this.currentSlide].classList.add('active');
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  prevSlide() {
    const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
}

/**
 * Helper function to resolve image paths from any page
 */
function getImagePath(imagePath) {
  if (!imagePath) return '';

  // If it's already an absolute path or starts with http, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
    return imagePath;
  }

  // Check if we're in a subdirectory (frontend/pages/)
  const currentPath = window.location.pathname;
  const isInSubdir = currentPath.includes('/frontend/pages/') || currentPath.includes('\\frontend\\pages\\');

  // If image path starts with 'frontend/', adjust based on location
  if (imagePath.startsWith('frontend/')) {
    if (isInSubdir) {
      // We're in frontend/pages/, so go up two levels to reach root
      return '../../' + imagePath;
    } else {
      // We're at root, use as is
      return imagePath;
    }
  }

  // If it starts with '../', we're already accounting for subdirectory
  return imagePath;
}

/**
 * Cart System
 */
class CartSystem {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
    this.cartBtn = document.getElementById('cart-btn');
    this.cartPanel = document.getElementById('cart-panel');
    this.closeCartBtn = document.getElementById('close-cart-panel');
    this.cartItemsContainer = document.getElementById('cart-items');
    this.cartCount = document.getElementById('cart-count');
    this.cartTotal = document.getElementById('cart-total');
    this.modalCartTotal = document.getElementById('modal-cart-total');
    this.overlay = document.querySelector("[data-overlay]");

    this.init();
  }

  init() {
    // Event listeners
    this.cartBtn.addEventListener('click', () => this.openCartPanel());
    this.closeCartBtn.addEventListener('click', () => this.closeCartPanel());

    // Add to cart buttons
    this.addCartButtonListeners();

    this.updateCartUI();
  }

  addCartButtonListeners() {
    // Add to cart buttons
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    addToCartBtns.forEach(btn => {
      // Remove old listener to prevent duplicates
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productCard = e.target.closest('.shop-card') || e.target.closest('.qv-modal-body');
        const productData = JSON.parse(productCard.dataset.product);
        this.addToCart(productData);
      });
    });
  }

  addToCart(product) {
    const existingItem = this.cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        ...product,
        quantity: 1
      });
    }

    this.saveCart();
    this.updateCartUI();
    this.showNotification(`${product.name} added to cart!`);
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartUI();
    this.renderCartItems();
  }

  updateQuantity(productId, newQuantity) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      if (newQuantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = newQuantity;
        this.saveCart();
        this.updateCartUI();
        this.renderCartItems();
      }
    }
  }

  calculateTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  updateCartUI() {
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = this.calculateTotal();

    this.cartCount.textContent = totalItems;
    this.cartTotal.textContent = `AED ${totalPrice.toFixed(2)}`;
    if (this.modalCartTotal) {
      this.modalCartTotal.textContent = `AED ${totalPrice.toFixed(2)}`;
    }
  }

  renderCartItems() {
    if (!this.cartItemsContainer) return;

    if (this.cart.length === 0) {
      this.cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
      return;
    }

    this.cartItemsContainer.innerHTML = this.cart.map(item => `
      <div class="cart-item">
        <img src="${getImagePath(item.image)}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.name}</h4>
          <p class="cart-item-price">AED ${item.price.toFixed(2)}</p>
          <div class="quantity-controls">
            <button class="quantity-btn minus" onclick="cartSystem.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn plus" onclick="cartSystem.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
          </div>
        </div>
        <button class="remove-item" onclick="cartSystem.removeFromCart(${item.id})">
          <ion-icon name="trash-outline"></ion-icon>
        </button>
      </div>
    `).join('');
  }

  openCartPanel() {
    this.cartPanel.classList.add('active');
    this.overlay.classList.add('active');
    document.body.classList.add('active');
    this.renderCartItems();
  }

  closeCartPanel() {
    this.cartPanel.classList.remove('active');
    if (!document.querySelector('.side-panel.active, .mobile-navbar.active, .qv-modal.active')) {
      this.overlay.classList.remove('active');
      document.body.classList.remove('active');
    }
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // Add to body
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }
}

/**
 * Wishlist System
 */
class WishlistSystem {
  constructor() {
    this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    this.wishlistBtn = document.getElementById('wishlist-btn');
    this.wishlistPanel = document.getElementById('wishlist-panel');
    this.closeWishlistBtn = document.getElementById('close-wishlist-panel');
    this.wishlistItemsContainer = document.getElementById('wishlist-items');
    this.wishlistCount = document.getElementById('wishlist-count');
    this.overlay = document.querySelector("[data-overlay]");

    this.init();
  }

  init() {
    // Event listeners
    this.wishlistBtn.addEventListener('click', () => this.openWishlistPanel());
    this.closeWishlistBtn.addEventListener('click', () => this.closeWishlistPanel());

    // Add to wishlist buttons
    this.addWishlistButtonListeners();

    this.updateWishlistUI();
    this.updateWishlistButtons();
  }

  addWishlistButtonListeners() {
    const addToWishlistBtns = document.querySelectorAll('.add-to-wishlist');
    addToWishlistBtns.forEach(btn => {
      // Remove old listener to prevent duplicates
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productCard = e.target.closest('.shop-card');
        const productData = JSON.parse(productCard.dataset.product);
        this.toggleWishlist(productData, newBtn);
      });
    });
  }

  toggleWishlist(product, button) {
    const existingIndex = this.wishlist.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      // Remove from wishlist
      this.wishlist.splice(existingIndex, 1);
      button.querySelector('ion-icon').name = 'star-outline';
      button.classList.remove('active');
      this.showNotification(`${product.name} removed from wishlist!`);
    } else {
      // Add to wishlist
      this.wishlist.push(product);
      button.querySelector('ion-icon').name = 'star';
      button.classList.add('active');
      this.showNotification(`${product.name} added to wishlist!`);
    }

    this.saveWishlist();
    this.updateWishlistUI();
  }

  removeFromWishlist(productId) {
    this.wishlist = this.wishlist.filter(item => item.id !== productId);
    this.saveWishlist();
    this.updateWishlistUI();
    this.updateWishlistButtons();
    this.renderWishlistItems();
  }

  updateWishlistUI() {
    this.wishlistCount.textContent = this.wishlist.length;
  }

  updateWishlistButtons() {
    const addToWishlistBtns = document.querySelectorAll('.add-to-wishlist');
    addToWishlistBtns.forEach(btn => {
      const productCard = btn.closest('.shop-card');
      if (!productCard) return; // Skip buttons not in a shop-card (like in QV modal)

      const productData = JSON.parse(productCard.dataset.product);
      const isInWishlist = this.wishlist.some(item => item.id === productData.id);

      if (isInWishlist) {
        btn.querySelector('ion-icon').name = 'star';
        btn.classList.add('active');
      } else {
        btn.querySelector('ion-icon').name = 'star-outline';
        btn.classList.remove('active');
      }
    });
  }

  renderWishlistItems() {
    if (!this.wishlistItemsContainer) return;

    if (this.wishlist.length === 0) {
      this.wishlistItemsContainer.innerHTML = '<p class="empty-wishlist">Your wishlist is empty</p>';
      return;
    }

    this.wishlistItemsContainer.innerHTML = this.wishlist.map(item => `
      <div class="wishlist-item">
        <img src="${getImagePath(item.image)}" alt="${item.name}" class="wishlist-item-image">
        <div class="wishlist-item-details">
          <h4 class="wishlist-item-name">${item.name}</h4>
          <p class="wishlist-item-price">AED ${item.price.toFixed(2)}</p>
          <div class="wishlist-item-actions">
            <button class="btn btn-primary add-to-cart-from-wishlist" onclick="wishlistSystem.addToCartFromWishlist(${item.id})">
              Add to Cart
            </button>
          </div>
        </div>
        <button class="remove-item" onclick="wishlistSystem.removeFromWishlist(${item.id})">
          <ion-icon name="trash-outline"></ion-icon>
        </button>
      </div>
    `).join('');
  }

  addToCartFromWishlist(productId) {
    const product = this.wishlist.find(item => item.id === productId);
    if (product && window.cartSystem) {
      window.cartSystem.addToCart(product);
    }
  }

  openWishlistPanel() {
    this.wishlistPanel.classList.add('active');
    this.overlay.classList.add('active');
    document.body.classList.add('active');
    this.renderWishlistItems();
  }

  closeWishlistPanel() {
    this.wishlistPanel.classList.remove('active');
    if (!document.querySelector('.side-panel.active, .mobile-navbar.active, .qv-modal.active')) {
      this.overlay.classList.remove('active');
      document.body.classList.remove('active');
    }
  }

  saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
  }

  showNotification(message) {
    // Re-use cart notification system
    if (window.cartSystem) {
      window.cartSystem.showNotification(message);
    }
  }
}

/**
 * Price Range Slider
 */
function initPriceSlider() {
  const minSlider = document.getElementById('price-range-min');
  const maxSlider = document.getElementById('price-range-max');
  const minValSpan = document.getElementById('price-min-value');
  const maxValSpan = document.getElementById('price-max-value');
  const track = document.getElementById('price-slider-track');

  if (!minSlider || !maxSlider) return; // Only run on shop page

  function updateTrack() {
    const min = parseInt(minSlider.value);
    const max = parseInt(maxSlider.value);
    const minPercent = (min / minSlider.max) * 100;
    const maxPercent = (max / maxSlider.max) * 100;

    track.style.left = `${minPercent}%`;
    track.style.width = `${maxPercent - minPercent}%`;
  }

  minSlider.addEventListener('input', () => {
    let min = parseInt(minSlider.value);
    let max = parseInt(maxSlider.value);

    if (min > max - 10) { // 10 is the min gap
      min = max - 10;
      minSlider.value = min;
    }

    minValSpan.textContent = `AED ${min}`;
    updateTrack();
  });

  maxSlider.addEventListener('input', () => {
    let min = parseInt(minSlider.value);
    let max = parseInt(maxSlider.value);

    if (max < min + 10) {
      max = min + 10;
      maxSlider.value = max;
    }

    maxValSpan.textContent = `AED ${max}`;
    updateTrack();
  });

  // Initial call
  updateTrack();
}


/**
 * Quick View Modal System
 */
class QuickViewSystem {
  constructor() {
    this.modal = document.getElementById('quick-view-modal');
    this.closeBtn = document.getElementById('close-qv-modal');
    this.body = document.getElementById('quick-view-body');
    this.overlay = document.querySelector("[data-overlay]");

    if (!this.modal) return; // Only run on pages with the modal

    this.init();
  }

  init() {
    document.querySelectorAll('.quick-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productCard = e.target.closest('.shop-card');
        const productData = JSON.parse(productCard.dataset.product);
        this.openModal(productData);
      });
    });

    this.closeBtn.addEventListener('click', () => this.closeModal());
  }

  openModal(product) {
    this.body.innerHTML = this.renderModalContent(product);
    this.body.dataset.product = JSON.stringify(product); // Store data for cart
    this.modal.classList.add('active');
    this.overlay.classList.add('active');
    document.body.classList.add('active');

    // Re-attach listeners for the new "Add to Cart" button inside the modal
    if (window.cartSystem) {
      window.cartSystem.addCartButtonListeners();
    }
  }

  closeModal() {
    this.modal.classList.remove('active');
    if (!document.querySelector('.side-panel.active, .mobile-navbar.active')) {
      this.overlay.classList.remove('active');
      document.body.classList.remove('active');
    }
  }

  renderModalContent(product) {
    const originalPriceHTML = product.originalPrice ? `<del class="del">AED ${product.originalPrice.toFixed(2)}</del>` : '';
    const ratingHTML = `
      <div class="rating-wrapper" aria-label="${product.rating} start rating">
        ${'<ion-icon name="star" aria-hidden="true"></ion-icon>'.repeat(product.rating)}
      </div>
      <p class="rating-text">${product.reviews} reviews</p>
    `;

    return `
      <div class="qv-image-wrapper">
        <img src="${getImagePath(product.image)}" alt="${product.name}" class="img-cover">
      </div>
      <div class="qv-details">
        <h2 class="h2 qv-title">${product.name}</h2>
        <div class="qv-price">
          ${originalPriceHTML}
          <span class="span">AED ${product.price.toFixed(2)}</span>
        </div>
        <div class="qv-rating">
          ${ratingHTML}
        </div>
        <p class="qv-description">
          ${product.description || 'Made using clean, non-toxic ingredients, our products are designed for everyone.'}
        </p>
        <div class="qv-actions">
          <button class="btn btn-primary add-to-cart">
            <ion-icon name="bag-handle-outline" aria-hidden="true"></ion-icon>
            <span class="span">Add to Cart</span>
          </button>
          <button class="btn view-details-btn">
            <span class="span">View Full Details</span>
          </button>
        </div>
      </div>
    `;
  }
}

/**
 * Recently Viewed Products System
 */
class RecentlyViewed {
  constructor() {
    this.container = document.getElementById('recently-viewed-list');
    this.products = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

    if (!this.container) return; // Only run on shop page

    this.init();
  }

  init() {
    this.renderProducts();
    this.addClickListeners();
  }

  addClickListeners() {
    document.querySelectorAll('.product-link, .quick-view').forEach(link => {
      link.addEventListener('click', (e) => {
        const productCard = e.target.closest('.shop-card');
        const productData = JSON.parse(productCard.dataset.product);
        this.addProduct(productData);
      });
    });
  }

  addProduct(product) {
    // Check if product is already in the list
    const existingIndex = this.products.findIndex(p => p.id === product.id);

    // If it exists, remove it to re-add it to the front
    if (existingIndex > -1) {
      this.products.splice(existingIndex, 1);
    }

    // Add new product to the beginning
    this.products.unshift(product);

    // Keep only the 5 most recent
    if (this.products.length > 5) {
      this.products.pop();
    }

    localStorage.setItem('recentlyViewed', JSON.stringify(this.products));
    this.renderProducts();
  }

  renderProducts() {
    if (this.products.length === 0) {
      this.container.innerHTML = ''; // Empty state is handled by CSS
      return;
    }

    this.container.innerHTML = this.products.map(product => {
      const originalPriceHTML = product.originalPrice ? `<del class="del">AED ${product.originalPrice.toFixed(2)}</del>` : '';

      return `
        <li class="scrollbar-item">
          <div class="shop-card" data-product='${JSON.stringify(product)}'>
            <div class="card-banner img-holder" style="--width: 540; --height: 720;">
              <img src="${getImagePath(product.image)}" width="540" height="720" loading="lazy" alt="${product.name}" class="img-cover">
              <div class="card-actions">
                <button class="action-btn quick-view" aria-label="quick view">
                  <ion-icon name="eye-outline" aria-hidden="true"></ion-icon>
                </button>
                <button class="action-btn add-to-cart" aria-label="add to cart">
                  <ion-icon name="bag-handle-outline" aria-hidden="true"></ion-icon>
                </button>
                <button class="action-btn add-to-wishlist" aria-label="add to wishlist">
                  <ion-icon name="star-outline" aria-hidden="true"></ion-icon>
                </button>
              </div>
            </div>
            <div class="card-content">
              <div class="price">
                ${originalPriceHTML}
                <span class="span">AED ${product.price.toFixed(2)}</span>
              </div>
              <h3><a href="#" class="card-title product-link">${product.name}</a></h3>
              <div class="card-rating">
                <div class="rating-wrapper" aria-label="${product.rating} start rating">
                  ${'<ion-icon name="star" aria-hidden="true"></ion-icon>'.repeat(product.rating)}
                </div>
                <p class="rating-text">${product.reviews} reviews</p>
              </div>
            </div>
          </div>
        </li>
      `;
    }).join('');

    // After rendering, we must re-initialize all systems that rely on these cards
    if (window.cartSystem) window.cartSystem.addCartButtonListeners();
    if (window.wishlistSystem) {
      window.wishlistSystem.addWishlistButtonListeners();
      window.wishlistSystem.updateWishlistButtons();
    }
    if (window.quickViewSystem) window.quickViewSystem.init(); // Re-init to catch new QV buttons
  }
}

/**
 * Authentication UI Manager
 */
class AuthUIManager {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    this.signupLink = document.getElementById('signup-link');
    this.userDropdownBtn = document.getElementById('user-dropdown-btn');
    this.userDropdown = document.getElementById('user-dropdown');
    this.userInitials = document.getElementById('user-initials');
    this.dropdownUserName = document.getElementById('dropdown-user-name');
    this.dropdownUserEmail = document.getElementById('dropdown-user-email');
    this.logoutBtn = document.getElementById('header-logout-btn');

    this.init();
  }

  init() {
    this.updateUI();
    this.setupEventListeners();
  }

  updateUI() {
    if (this.currentUser) {
      // User is logged in - show avatar and dropdown
      if (this.signupLink) this.signupLink.style.display = 'none';
      if (this.userDropdownBtn) this.userDropdownBtn.style.display = 'block';

      // Set user initials
      const initials = `${this.currentUser.firstName?.charAt(0) || ''}${this.currentUser.lastName?.charAt(0) || ''}`;
      if (this.userInitials) this.userInitials.textContent = initials;

      // Set dropdown info
      if (this.dropdownUserName) {
        this.dropdownUserName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
      }
      if (this.dropdownUserEmail) {
        this.dropdownUserEmail.textContent = this.currentUser.email;
      }
    } else {
      // User is logged out - show signup link
      if (this.signupLink) this.signupLink.style.display = 'block';
      if (this.userDropdownBtn) this.userDropdownBtn.style.display = 'none';
    }
  }

  setupEventListeners() {
    // Toggle dropdown
    if (this.userDropdownBtn && this.userDropdown) {
      this.userDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.userDropdown.classList.toggle('active');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.userDropdown.contains(e.target) && !this.userDropdownBtn.contains(e.target)) {
          this.userDropdown.classList.remove('active');
        }
      });
    }

    // Logout button
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('rememberUser');
      const isPage = window.location.pathname.includes('pages/');
      window.location.href = isPage ? './frontend/./frontend/index.html' : 'index.html';
    }
  }
}

// Initialize systems when DOM is loaded

document.addEventListener('DOMContentLoaded', function () {

  // Initialize Hero Carousel (will only run on index.html)
  new HeroCarousel();

  // Initialize Cart System
  window.cartSystem = new CartSystem();

  // Initialize Wishlist System
  window.wishlistSystem = new WishlistSystem();

  // Initialize Quick View (will only run on shop.html)
  window.quickViewSystem = new QuickViewSystem();

  // Initialize Price Slider (will only run on shop.html)
  initPriceSlider();

  // Initialize Recently Viewed (will only run on shop.html)
  new RecentlyViewed();

  // Initialize Authentication UI Manager
  new AuthUIManager();

  // Unified Overlay Click Handler
  const mainOverlay = document.querySelector("[data-overlay]");
  if (mainOverlay) {
    mainOverlay.addEventListener('click', () => {
      // Close Navbar
      if (navbar.classList.contains('active')) {
        closeNavbar();
      }
      // Close Cart
      if (window.cartSystem && window.cartSystem.cartPanel.classList.contains('active')) {
        window.cartSystem.closeCartPanel();
      }
      // Close Wishlist
      if (window.wishlistSystem && window.wishlistSystem.wishlistPanel.classList.contains('active')) {
        window.wishlistSystem.closeWishlistPanel();
      }
      // Close Quick View
      if (window.quickViewSystem && window.quickViewSystem.modal.classList.contains('active')) {
        window.quickViewSystem.closeModal();
      }
    });
  }

});

// Initialize Testimonial Carousel (will only run on index.html)
const testimonialList = document.querySelector('[data-testimonial-list]');
if (testimonialList) {
  const items = testimonialList.querySelectorAll('.testimonial-item');
  items.forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    testimonialList.appendChild(clone);
  });
}


/**
 * Shop Page Functionality
 */

// Sample product data - in a real app, this would come from an API
const PRODUCTS_DATA = [
  {
    id: 13,
    name: "Vitamin C Brightening Serum",
    price: 45.00,
    originalPrice: 55.00,
    image: "/frontend/assets/images/product-01.jpg",
    category: "skincare",
    brand: "glowing",
    rating: 5,
    reviews: 2847,
    stock: 15,
    description: "A powerful vitamin C serum that brightens and evens skin tone while providing antioxidant protection.",
    isNew: true,
    onSale: true
  },
  {
    id: 14,
    name: "Hydrating Facial Cleanser",
    price: 28.00,
    image: "/frontend/assets/images/product-02.jpg",
    category: "skincare",
    brand: "glowing",
    rating: 5,
    reviews: 1923,
    stock: 8,
    description: "Gentle yet effective cleanser that removes impurities while maintaining skin's natural moisture barrier."
  },
  {
    id: 15,
    name: "Nourishing Hair Oil",
    price: 32.00,
    originalPrice: 40.00,
    image: "/frontend/assets/images/product-03.jpg",
    category: "haircare",
    brand: "bio-essence",
    rating: 4,
    reviews: 1456,
    stock: 23,
    description: "Luxurious hair oil blend that strengthens, shines, and protects hair from damage.",
    onSale: true
  },
  {
    id: 16,
    name: "Rose Gold Perfume",
    price: 89.00,
    image: "/frontend/assets/images/product-04.jpg",
    category: "perfume",
    brand: "natural-glow",
    rating: 5,
    reviews: 892,
    stock: 12,
    description: "Elegant floral fragrance with notes of rose, gold amber, and white musk.",
    isNew: true
  },
  {
    id: 17,
    name: "Anti-Aging Night Cream",
    price: 67.00,
    originalPrice: 85.00,
    image: "/frontend/assets/images/product-05.jpg",
    category: "skincare",
    brand: "glowing",
    rating: 5,
    reviews: 3421,
    stock: 5,
    description: "Rich night cream with retinol and peptides to reduce fine lines and improve skin texture.",
    onSale: true
  },
  {
    id: 18,
    name: "Silk Hair Scrunchies Set",
    price: 15.00,
    image: "/frontend/assets/images/product-06.jpg",
    category: "accessories",
    brand: "pure-skin",
    rating: 4,
    reviews: 567,
    stock: 45,
    description: "Set of 3 premium silk scrunchies that protect hair from breakage and reduce frizz."
  },
  {
    id: 19,
    name: "Exfoliating Body Scrub",
    price: 38.00,
    image: "/frontend/assets/images/product-07.jpg",
    category: "skincare",
    brand: "glowing",
    rating: 5,
    reviews: 1789,
    stock: 18,
    description: "Invigorating body scrub with natural sea salt and essential oils for smooth, radiant skin."
  },
  {
    id: 20,
    name: "Argan Hair Mask",
    price: 42.00,
    originalPrice: 52.00,
    image: "/frontend/assets/images/product-08.jpg",
    category: "haircare",
    brand: "bio-essence",
    rating: 5,
    reviews: 1234,
    stock: 3,
    description: "Deep conditioning hair mask enriched with argan oil for intense hydration and repair.",
    onSale: true
  },
  {
    id: 21,
    name: "Citrus Burst Perfume",
    price: 76.00,
    image: "/frontend/assets/images/product-09.jpg",
    category: "perfume",
    brand: "natural-glow",
    rating: 4,
    reviews: 678,
    stock: 29,
    description: "Fresh and energizing citrus fragrance perfect for daily wear.",
    isNew: true
  },
  {
    id: 22,
    name: "Retinol Eye Cream",
    price: 54.00,
    image: "/frontend/assets/images/product-10.jpg",
    category: "skincare",
    brand: "glowing",
    rating: 5,
    reviews: 2156,
    stock: 11,
    description: "Gentle retinol eye cream that reduces dark circles and fine lines around the delicate eye area."
  },
  {
    id: 23,
    name: "Volumizing Shampoo",
    price: 26.00,
    image: "/frontend/assets/images/product-11.jpg",
    category: "haircare",
    brand: "bio-essence",
    rating: 4,
    reviews: 987,
    stock: 34,
    description: "Lightweight shampoo that adds volume and body to fine, limp hair."
  },
  {
    id: 24,
    name: "Makeup Brush Set",
    price: 48.00,
    originalPrice: 65.00,
    image: "/frontend/assets/images/product-01.jpg",
    category: "accessories",
    brand: "pure-skin",
    rating: 5,
    reviews: 1543,
    stock: 7,
    description: "Professional makeup brush set with synthetic bristles for flawless application.",
    onSale: true
  },
  {
    id: 25,
    name: "Hyaluronic Acid Serum",
    price: 39.00,
    image: "/frontend/assets/images/product-02.jpg",
    category: "skincare",
    brand: "glowing",
    rating: 5,
    reviews: 4567,
    stock: 22,
    description: "Intensive hydrating serum with multiple types of hyaluronic acid for plump, dewy skin."
  },
  {
    id: 26,
    name: "Coconut Hair Conditioner",
    price: 24.00,
    image: "/frontend/assets/images/product-03.jpg",
    category: "haircare",
    brand: "bio-essence",
    rating: 4,
    reviews: 1876,
    stock: 16,
    description: "Nourishing conditioner with coconut oil that softens and detangles hair."
  },
  {
    id: 27,
    name: "Vanilla Orchid Perfume",
    price: 94.00,
    image: "/frontend/assets/images/product-04.jpg",
    category: "perfume",
    brand: "natural-glow",
    rating: 5,
    reviews: 743,
    stock: 9,
    description: "Sophisticated fragrance with warm vanilla and exotic orchid notes.",
    isNew: true
  },
  {
    id: 28,
    name: "Jade Facial Roller",
    price: 22.00,
    image: "/frontend/assets/images/product-05.jpg",
    category: "accessories",
    brand: "pure-skin",
    rating: 4,
    reviews: 892,
    stock: 31,
    description: "Authentic jade facial roller for lymphatic drainage and improved circulation."
  },
  {
    id: 29,
    name: "Peptide Firming Cream",
    price: 72.00,
    originalPrice: 90.00,
    image: "/frontend/assets/images/product-06.jpg",
    category: "skincare",
    brand: "glowing",
    rating: 5,
    reviews: 2891,
    stock: 6,
    description: "Advanced firming cream with peptides and collagen boosters for youthful-looking skin.",
    onSale: true
  },
  {
    id: 30,
    name: "Keratin Hair Treatment",
    price: 58.00,
    image: "/frontend/assets/images/product-07.jpg",
    category: "haircare",
    brand: "bio-essence",
    rating: 5,
    reviews: 1654,
    stock: 14,
    description: "Professional-grade keratin treatment that smooths frizz and adds shine."
  },
  {
    id: 31,
    name: "Ocean Breeze Perfume",
    price: 68.00,
    image: "/frontend/assets/images/product-08.jpg",
    category: "perfume",
    brand: "natural-glow",
    rating: 4,
    reviews: 567,
    stock: 19,
    description: "Fresh aquatic fragrance that captures the essence of ocean waves and sea breeze."
  },
  {
    id: 32,
    name: "Gua Sha Stone Set",
    price: 18.00,
    image: "/frontend/assets/images/product-09.jpg",
    category: "accessories",
    brand: "pure-skin",
    rating: 4,
    reviews: 1234,
    stock: 28,
    description: "Traditional gua sha stones for facial massage and tension relief."
  },
  {
    id: 33,
    name: "Niacinamide Pore Serum",
    price: 35.00,
    image: "/frontend/assets/images/product-10.jpg",
    category: "skincare",
    brand: "glowing",
    rating: 5,
    reviews: 3456,
    stock: 13,
    description: "Pore-refining serum with niacinamide that minimizes appearance of large pores."
  },
  {
    id: 34,
    name: "Protein Hair Mask",
    price: 36.00,
    originalPrice: 45.00,
    image: "/frontend/assets/images/product-11.jpg",
    category: "haircare",
    brand: "bio-essence",
    rating: 5,
    reviews: 987,
    stock: 2,
    description: "Strengthening protein mask for damaged and chemically-treated hair.",
    onSale: true
  },
  {
    id: 35,
    name: "Lavender Dreams Perfume",
    price: 82.00,
    image: "/frontend/assets/images/product-01.jpg",
    category: "perfume",
    brand: "natural-glow",
    rating: 5,
    reviews: 654,
    stock: 17,
    description: "Calming lavender fragrance with hints of bergamot and white tea."
  },
  {
    id: 36,
    name: "LED Light Therapy Mask",
    price: 125.00,
    originalPrice: 150.00,
    image: "/frontend/assets/images/product-02.jpg",
    category: "accessories",
    brand: "pure-skin",
    rating: 5,
    reviews: 432,
    stock: 4,
    description: "Advanced LED light therapy mask for acne treatment and anti-aging benefits.",
    onSale: true,
    isNew: true
  }
];

class ShopManager {
  constructor() {
    this.products = [...PRODUCTS_DATA];
    this.filteredProducts = [...PRODUCTS_DATA];
    this.currentPage = 1;
    this.productsPerPage = 12;
    this.currentView = 'grid';
    this.filters = {
      categories: ['skincare'],
      brands: [],
      ratings: [],
      availability: ['in-stock'],
      priceRange: { min: 0, max: 200 },
      search: ''
    };
    this.sortBy = 'popular';

    this.init();
  }

  init() {
    this.bindEvents();
    this.applyFilters();
    this.renderProducts();
    this.updateResultsCount();
  }

  bindEvents() {
    // Filter toggle for mobile
    const filterToggle = document.getElementById('filter-toggle');
    const shopFilters = document.getElementById('shop-filters');

    if (filterToggle) {
      filterToggle.addEventListener('click', () => {
        shopFilters.classList.toggle('active');
        if (shopFilters.classList.contains('active')) {
          const overlay = document.querySelector("[data-overlay]");
          if (overlay) overlay.classList.add('active');
          document.body.classList.add('active');
        }
      });
    }

    const closeFilters = document.getElementById('close-filters');
    if (closeFilters) {
      closeFilters.addEventListener('click', () => {
        shopFilters.classList.remove('active');
        const overlay = document.querySelector("[data-overlay]");
        if (overlay) overlay.classList.remove('active');
        document.body.classList.remove('active');
      });
    }

    // View toggle
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentView = btn.dataset.view;
        this.renderProducts();
      });
    });

    // Sort dropdown
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        this.sortBy = sortSelect.value;
        this.applyFilters();
        this.renderProducts();
      });
    }

    // Search
    const searchInput = document.getElementById('shop-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value.toLowerCase();
        this.applyFilters();
        this.renderProducts();
        this.updateResultsCount();
      });
    }

    // Filter checkboxes
    const filterInputs = document.querySelectorAll('.filter-option input[type="checkbox"]');
    filterInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.updateFilters();
        this.applyFilters();
        this.renderProducts();
        this.updateResultsCount();
      });
    });

    // Clear filters
    const clearFilters = document.getElementById('clear-filters');
    if (clearFilters) {
      clearFilters.addEventListener('click', () => {
        this.resetFilters();
      });
    }

    // Load more
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.loadMore();
      });
    }

    // Clear recently viewed
    const clearHistory = document.getElementById('clear-history');
    if (clearHistory) {
      clearHistory.addEventListener('click', () => {
        localStorage.removeItem('recentlyViewed');
        const recentlyViewedList = document.getElementById('recently-viewed-list');
        if (recentlyViewedList) {
          recentlyViewedList.innerHTML = '';
        }
      });
    }
  }

  updateFilters() {
    // Categories
    this.filters.categories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
      .map(input => input.value);

    // Brands
    this.filters.brands = Array.from(document.querySelectorAll('input[name="brand"]:checked'))
      .map(input => input.value);

    // Ratings
    this.filters.ratings = Array.from(document.querySelectorAll('input[name="rating"]:checked'))
      .map(input => parseInt(input.value));

    // Availability
    this.filters.availability = Array.from(document.querySelectorAll('input[name="availability"]:checked'))
      .map(input => input.value);

    // Price range is handled by the slider
  }

  applyFilters() {
    let filtered = [...this.products];

    // Apply category filter
    if (this.filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        this.filters.categories.includes(product.category)
      );
    }

    // Apply brand filter
    if (this.filters.brands.length > 0) {
      filtered = filtered.filter(product =>
        this.filters.brands.includes(product.brand)
      );
    }

    // Apply rating filter
    if (this.filters.ratings.length > 0) {
      filtered = filtered.filter(product =>
        this.filters.ratings.includes(product.rating)
      );
    }

    // Apply availability filter
    if (this.filters.availability.length > 0) {
      filtered = filtered.filter(product => {
        if (this.filters.availability.includes('in-stock') && product.stock > 5) return true;
        if (this.filters.availability.includes('low-stock') && product.stock <= 5 && product.stock > 0) return true;
        if (this.filters.availability.includes('sale') && product.onSale) return true;
        return false;
      });
    }

    // Apply price range filter
    filtered = filtered.filter(product =>
      product.price >= this.filters.priceRange.min &&
      product.price <= this.filters.priceRange.max
    );

    // Apply search filter
    if (this.filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(this.filters.search) ||
        product.description.toLowerCase().includes(this.filters.search) ||
        product.brand.toLowerCase().includes(this.filters.search)
      );
    }

    // Apply sorting
    this.sortProducts(filtered);

    this.filteredProducts = filtered;
    this.currentPage = 1; // Reset to first page when filters change
  }

  sortProducts(products) {
    switch (this.sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
        break;
      case 'name':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popular':
      default:
        products.sort((a, b) => b.reviews - a.reviews);
        break;
    }
  }

  renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    // Apply view class
    productsGrid.className = `products-grid ${this.currentView}-view`;

    const startIndex = 0;
    const endIndex = this.currentPage * this.productsPerPage;
    const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

    if (productsToShow.length === 0) {
      productsGrid.innerHTML = this.renderEmptyState();
      this.updateLoadMoreButton(false);
      return;
    }

    productsGrid.innerHTML = productsToShow.map(product => this.renderProductCard(product)).join('');

    // Update load more button
    const hasMore = endIndex < this.filteredProducts.length;
    this.updateLoadMoreButton(hasMore);

    // Re-initialize interactive elements
    this.initializeProductInteractions();
  }

  renderProductCard(product) {
    const discountPercentage = product.originalPrice ?
      Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    const badgeHTML = discountPercentage > 0 ?
      `<span class="badge" aria-label="${discountPercentage}% off">-${discountPercentage}%</span>` : '';

    const stockAlertHTML = product.stock <= 5 && product.stock > 0 ?
      `<span class="stock-alert ${product.stock <= 3 ? '' : 'low-stock'}">Only ${product.stock} left!</span>` : '';

    const originalPriceHTML = product.originalPrice ?
      `<del class="del">AED ${product.originalPrice.toFixed(2)}</del>` : '';

    const ratingHTML = Array(5).fill(0).map((_, i) =>
      `<ion-icon name="${i < product.rating ? 'star' : 'star-outline'}" aria-hidden="true"></ion-icon>`
    ).join('');

    return `
      <div class="shop-card" data-product='${JSON.stringify(product)}'>
        <div class="card-banner img-holder" style="--width: 540; --height: 720;">
          <img src="${product.image}" width="540" height="720" loading="lazy" alt="${product.name}" class="img-cover">
          
          ${badgeHTML}
          ${stockAlertHTML}
          
          <div class="card-actions">
            <button class="action-btn quick-view" aria-label="quick view" title="Quick View">
              <ion-icon name="eye-outline" aria-hidden="true"></ion-icon>
            </button>
            <button class="action-btn add-to-cart" aria-label="add to cart" title="Add to Cart">
              <ion-icon name="bag-handle-outline" aria-hidden="true"></ion-icon>
            </button>
            <button class="action-btn add-to-wishlist" aria-label="add to wishlist" title="Add to Wishlist">
              <ion-icon name="star-outline" aria-hidden="true"></ion-icon>
            </button>
          </div>
        </div>

        <div class="card-content">
          <div class="price">
            ${originalPriceHTML}
            <span class="span">AED ${product.price.toFixed(2)}</span>
          </div>

          <h3>
            <a href="#" class="card-title product-link">${product.name}</a>
          </h3>

          <div class="card-rating">
            <div class="rating-wrapper" aria-label="${product.rating} star rating">
              ${ratingHTML}
            </div>
            <p class="rating-text">${product.reviews} reviews</p>
          </div>
        </div>
      </div>
    `;
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <ion-icon name="search-outline"></ion-icon>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search terms to find what you're looking for.</p>
      </div>
    `;
  }

  initializeProductInteractions() {
    // Re-initialize cart system
    if (window.cartSystem) {
      window.cartSystem.addCartButtonListeners();
    }

    // Re-initialize wishlist system
    if (window.wishlistSystem) {
      window.wishlistSystem.addWishlistButtonListeners();
      window.wishlistSystem.updateWishlistButtons();
    }

    // Re-initialize quick view
    if (window.quickViewSystem) {
      window.quickViewSystem.init();
    }

    // Add product click tracking for recently viewed
    const productLinks = document.querySelectorAll('.product-link, .quick-view');
    productLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const productCard = e.target.closest('.shop-card');
        if (productCard) {
          const productData = JSON.parse(productCard.dataset.product);
          this.addToRecentlyViewed(productData);
        }
      });
    });
  }

  addToRecentlyViewed(product) {
    let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

    // Remove if already exists
    recentlyViewed = recentlyViewed.filter(p => p.id !== product.id);

    // Add to beginning
    recentlyViewed.unshift(product);

    // Keep only 5 items
    if (recentlyViewed.length > 5) {
      recentlyViewed = recentlyViewed.slice(0, 5);
    }

    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    this.renderRecentlyViewed();
  }

  renderRecentlyViewed() {
    const container = document.getElementById('recently-viewed-list');
    if (!container) return;

    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

    if (recentlyViewed.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = recentlyViewed.map(product => {
      const originalPriceHTML = product.originalPrice ?
        `<del class="del">AED ${product.originalPrice.toFixed(2)}</del>` : '';

      const ratingHTML = Array(5).fill(0).map((_, i) =>
        `<ion-icon name="${i < product.rating ? 'star' : 'star-outline'}" aria-hidden="true"></ion-icon>`
      ).join('');

      return `
        <li class="scrollbar-item">
          <div class="shop-card" data-product='${JSON.stringify(product)}'>
            <div class="card-banner img-holder" style="--width: 540; --height: 720;">
              <img src="${product.image}" width="540" height="720" loading="lazy" alt="${product.name}" class="img-cover">
              <div class="card-actions">
                <button class="action-btn quick-view" aria-label="quick view">
                  <ion-icon name="eye-outline" aria-hidden="true"></ion-icon>
                </button>
                <button class="action-btn add-to-cart" aria-label="add to cart">
                  <ion-icon name="bag-handle-outline" aria-hidden="true"></ion-icon>
                </button>
                <button class="action-btn add-to-wishlist" aria-label="add to wishlist">
                  <ion-icon name="star-outline" aria-hidden="true"></ion-icon>
                </button>
              </div>
            </div>
            <div class="card-content">
              <div class="price">
                ${originalPriceHTML}
                <span class="span">AED ${product.price.toFixed(2)}</span>
              </div>
              <h3><a href="#" class="card-title product-link">${product.name}</a></h3>
              <div class="card-rating">
                <div class="rating-wrapper" aria-label="${product.rating} star rating">
                  ${ratingHTML}
                </div>
                <p class="rating-text">${product.reviews} reviews</p>
              </div>
            </div>
          </div>
        </li>
      `;
    }).join('');

    // Re-initialize interactions for recently viewed products
    setTimeout(() => {
      this.initializeProductInteractions();
    }, 100);
  }

  updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    const totalProducts = document.getElementById('total-products');

    if (resultsCount) {
      const showing = Math.min(this.currentPage * this.productsPerPage, this.filteredProducts.length);
      resultsCount.textContent = `Showing ${showing} of ${this.filteredProducts.length} products`;
    }

    if (totalProducts) {
      totalProducts.textContent = `${this.products.length}+`;
    }
  }

  updateLoadMoreButton(hasMore) {
    const loadMoreBtn = document.getElementById('load-more');
    if (!loadMoreBtn) return;

    if (hasMore) {
      loadMoreBtn.style.display = 'inline-flex';
      loadMoreBtn.querySelector('.btn-text').textContent = 'Load More Products';
    } else {
      loadMoreBtn.style.display = 'none';
    }
  }

  loadMore() {
    this.currentPage++;
    this.renderProducts();
    this.updateResultsCount();
  }

  resetFilters() {
    // Reset checkboxes
    const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });

    // Check default filters
    const defaultCategories = document.querySelectorAll('input[name="category"][value="skincare"]');
    const defaultAvailability = document.querySelectorAll('input[name="availability"][value="in-stock"]');

    defaultCategories.forEach(cb => cb.checked = true);
    defaultAvailability.forEach(cb => cb.checked = true);

    // Reset price range
    const minSlider = document.getElementById('price-range-min');
    const maxSlider = document.getElementById('price-range-max');
    if (minSlider && maxSlider) {
      minSlider.value = 0;
      maxSlider.value = 200;
      document.getElementById('price-min-value').textContent = 'AED 0';
      document.getElementById('price-max-value').textContent = 'AED 200';

      // Update track
      const track = document.getElementById('price-slider-track');
      if (track) {
        track.style.left = '0%';
        track.style.width = '100%';
      }
    }

    // Reset search
    const searchInput = document.getElementById('shop-search');
    if (searchInput) {
      searchInput.value = '';
    }

    // Reset sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.value = 'popular';
    }

    // Reset filters object
    this.filters = {
      categories: ['skincare'],
      brands: [],
      ratings: [],
      availability: ['in-stock'],
      priceRange: { min: 0, max: 200 },
      search: ''
    };
    this.sortBy = 'popular';

    // Apply and render
    this.applyFilters();
    this.renderProducts();
    this.updateResultsCount();
  }
}

// Enhanced Quick View System for Shop Page
class ShopQuickViewSystem extends QuickViewSystem {
  renderModalContent(product) {
    const originalPriceHTML = product.originalPrice ?
      `<del class="del">AED ${product.originalPrice.toFixed(2)}</del>` : '';

    const ratingHTML = Array(5).fill(0).map((_, i) =>
      `<ion-icon name="${i < product.rating ? 'star' : 'star-outline'}" aria-hidden="true"></ion-icon>`
    ).join('');

    const stockStatusHTML = product.stock <= 5 ?
      `<p class="stock-status ${product.stock <= 3 ? 'critical' : 'low'}">
        ${product.stock <= 3 ? `Only ${product.stock} left in stock!` : `${product.stock} items remaining`}
      </p>` : '';

    return `
      <div class="qv-image-wrapper">
        <img src="${product.image}" alt="${product.name}" class="img-cover">
        ${product.onSale ? '<span class="qv-badge">On Sale</span>' : ''}
        ${product.isNew ? '<span class="qv-badge new">New</span>' : ''}
      </div>
      <div class="qv-details">
        <h2 class="h2 qv-title">${product.name}</h2>
        <div class="qv-price">
          ${originalPriceHTML}
          <span class="span">AED ${product.price.toFixed(2)}</span>
        </div>
        <div class="qv-rating">
          <div class="rating-wrapper">
            ${ratingHTML}
          </div>
          <p class="rating-text">${product.reviews} reviews</p>
        </div>
        ${stockStatusHTML}
        <p class="qv-description">${product.description}</p>
        <div class="qv-meta">
          <p><strong>Brand:</strong> ${product.brand.charAt(0).toUpperCase() + product.brand.slice(1)}</p>
          <p><strong>Category:</strong> ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
        </div>
        <div class="qv-actions">
          <button class="btn btn-primary add-to-cart">
            <ion-icon name="bag-handle-outline" aria-hidden="true"></ion-icon>
            <span class="span">Add to Cart</span>
          </button>
          <button class="btn view-details-btn">
            <span class="span">View Full Details</span>
          </button>
        </div>
      </div>
    `;
  }
}

// Initialize shop page when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Only initialize on shop page
  if (document.getElementById('products-grid')) {
    window.shopManager = new ShopManager();
    window.quickViewSystem = new ShopQuickViewSystem();

    // Initialize recently viewed on load
    if (window.shopManager) {
      window.shopManager.renderRecentlyViewed();
    }
  }

  'use strict';

  /**
   * PRELOAD
   * 
   * loading will be end after document is loaded
   */

  const preloader = document.querySelector("[data-preload]");

  window.addEventListener("load", function () {
    preloader.classList.add("loaded");
    document.body.classList.add("loaded");
  });

  /**
   * add event listener on multiple elements
   */

  const addEventOnElements = function (elements, eventType, callback) {
    for (let i = 0, len = elements.length; i < len; i++) {
      elements[i].addEventListener(eventType, callback);
    }
  }

  /**
   * NAVBAR REMOVED REDUNDANT
   */

  /**
   * HEADER & BACK TOP BTN
   */

  const header = document.querySelector("[data-header]");
  const backTopBtn = document.querySelector("[data-back-top-btn]");

  let lastScrollPos = 0;

  const hideHeader = function () {
    const isScrollBottom = lastScrollPos < window.scrollY;
    if (isScrollBottom) {
      header.classList.add("hide");
    } else {
      header.classList.remove("hide");
    }

    lastScrollPos = window.scrollY;
  }

  window.addEventListener("scroll", function () {
    if (window.scrollY >= 50) {
      header.classList.add("active");
      backTopBtn.classList.add("active");
      hideHeader();
    } else {
      header.classList.remove("active");
      backTopBtn.classList.remove("active");
    }
  });

  /**
   * HERO SLIDER
   */

  const heroSlider = document.querySelector("[data-hero-slider]");
  const heroSliderItems = document.querySelectorAll("[data-hero-slider-item]");
  const heroSliderPrevBtn = document.querySelector("[data-prev-btn]");
  const heroSliderNextBtn = document.querySelector("[data-next-btn]");

  let currentSlidePos = 0;
  let lastActiveSliderItem = heroSliderItems[0];

  const updateSliderPos = function () {
    lastActiveSliderItem.classList.remove("active");
    heroSliderItems[currentSlidePos].classList.add("active");
    lastActiveSliderItem = heroSliderItems[currentSlidePos];
  }

  const slideNext = function () {
    if (currentSlidePos >= heroSliderItems.length - 1) {
      currentSlidePos = 0;
    } else {
      currentSlidePos++;
    }

    updateSliderPos();
  }

  const slidePrev = function () {
    if (currentSlidePos <= 0) {
      currentSlidePos = heroSliderItems.length - 1;
    } else {
      currentSlidePos--;
    }

    updateSliderPos();
  }

  if (heroSliderNextBtn) {
    heroSliderNextBtn.addEventListener("click", slideNext);
  }

  if (heroSliderPrevBtn) {
    heroSliderPrevBtn.addEventListener("click", slidePrev);
  }

  /**
   * auto slide
   */

  const autoSlideInterval = 7000;

  const autoSlide = function () {
    slideNext();
  }

  let autoSlideTimer = setInterval(autoSlide, autoSlideInterval);

  const pauseAutoSlide = function () {
    clearInterval(autoSlideTimer);
  }

  const resumeAutoSlide = function () {
    autoSlideTimer = setInterval(autoSlide, autoSlideInterval);
  }

  if (heroSlider) {
    heroSlider.addEventListener("mouseenter", pauseAutoSlide);
    heroSlider.addEventListener("mouseleave", resumeAutoSlide);
  }

  /**
   * SCROLL REVEAL
   */

  const revealElements = document.querySelectorAll("[data-reveal]");
  const revealDelayElements = document.querySelectorAll("[data-reveal-delay]");

  const reveal = function () {
    for (let i = 0, len = revealElements.length; i < len; i++) {
      if (revealElements[i].getBoundingClientRect().top < window.innerHeight / 1.2) {
        revealElements[i].classList.add("revealed");
      }
    }
  }

  for (let i = 0, len = revealDelayElements.length; i < len; i++) {
    revealDelayElements[i].style.transitionDelay = revealDelayElements[i].dataset.revealDelay;
  }

  window.addEventListener("scroll", reveal);
  window.addEventListener("load", reveal);

  /**
   * CART SYSTEM
   */

  class CartSystem {
    constructor() {
      this.cart = JSON.parse(localStorage.getItem('cart')) || [];
      this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

      this.init();
    }

    init() {
      this.bindEvents();
      this.updateCartDisplay();
      this.updateWishlistDisplay();
      this.loadCartPanel();
      this.loadWishlistPanel();
    }

    bindEvents() {
      // Add to cart buttons
      const addToCartBtns = document.querySelectorAll('.add-to-cart');
      addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const productCard = e.target.closest('.shop-card');
          if (productCard) {
            const productData = JSON.parse(productCard.dataset.product);
            this.addToCart(productData);
          }
        });
      });

      // Add to wishlist buttons
      const addToWishlistBtns = document.querySelectorAll('.add-to-wishlist');
      addToWishlistBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const productCard = e.target.closest('.shop-card');
          if (productCard) {
            const productData = JSON.parse(productCard.dataset.product);
            this.addToWishlist(productData);
          }
        });
      });

      // Cart button
      const cartBtn = document.getElementById('cart-btn');
      if (cartBtn) {
        cartBtn.addEventListener('click', () => {
          this.toggleCartPanel();
        });
      }

      // Wishlist button
      const wishlistBtn = document.getElementById('wishlist-btn');
      if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
          this.toggleWishlistPanel();
        });
      }

      // Close panel buttons
      const closeCartBtn = document.getElementById('close-cart-panel');
      const closeWishlistBtn = document.getElementById('close-wishlist-panel');

      if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
          this.closeCartPanel();
        });
      }

      if (closeWishlistBtn) {
        closeWishlistBtn.addEventListener('click', () => {
          this.closeWishlistPanel();
        });
      }

      // Click outside to close panels
      document.addEventListener('click', (e) => {
        const cartPanel = document.getElementById('cart-panel');
        const wishlistPanel = document.getElementById('wishlist-panel');
        const cartBtn = document.getElementById('cart-btn');
        const wishlistBtn = document.getElementById('wishlist-btn');

        if (cartPanel && cartPanel.classList.contains('active') &&
          !cartPanel.contains(e.target) && !cartBtn.contains(e.target)) {
          this.closeCartPanel();
        }

        if (wishlistPanel && wishlistPanel.classList.contains('active') &&
          !wishlistPanel.contains(e.target) && !wishlistBtn.contains(e.target)) {
          this.closeWishlistPanel();
        }
      });
    }

    addToCart(product) {
      const existingItem = this.cart.find(item => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.cart.push({
          ...product,
          quantity: 1
        });
      }

      localStorage.setItem('cart', JSON.stringify(this.cart));
      this.updateCartDisplay();
      this.loadCartPanel();
      this.showNotification(`${product.name} added to cart!`);

      // Add animation to cart button
      const cartBtn = document.getElementById('cart-btn');
      if (cartBtn) {
        cartBtn.style.animation = 'bounce 0.6s ease';
        setTimeout(() => {
          cartBtn.style.animation = '';
        }, 600);
      }
    }

    addToWishlist(product) {
      const existingItem = this.wishlist.find(item => item.id === product.id);

      if (existingItem) {
        this.showNotification(`${product.name} is already in your wishlist!`, 'info');
        return;
      }

      this.wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
      this.updateWishlistDisplay();
      this.loadWishlistPanel();
      this.showNotification(`${product.name} added to wishlist!`);

      // Add animation to wishlist button
      const wishlistBtn = document.getElementById('wishlist-btn');
      if (wishlistBtn) {
        wishlistBtn.style.animation = 'bounce 0.6s ease';
        setTimeout(() => {
          wishlistBtn.style.animation = '';
        }, 600);
      }
    }

    removeFromCart(productId) {
      this.cart = this.cart.filter(item => item.id !== productId);
      localStorage.setItem('cart', JSON.stringify(this.cart));
      this.updateCartDisplay();
      this.loadCartPanel();
      this.showNotification('Item removed from cart');
    }

    removeFromWishlist(productId) {
      this.wishlist = this.wishlist.filter(item => item.id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
      this.updateWishlistDisplay();
      this.loadWishlistPanel();
      this.showNotification('Item removed from wishlist');
    }

    updateQuantity(productId, newQuantity) {
      if (newQuantity <= 0) {
        this.removeFromCart(productId);
        return;
      }

      const item = this.cart.find(item => item.id === productId);
      if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartDisplay();
        this.loadCartPanel();
      }
    }

    updateCartDisplay() {
      const cartCount = document.getElementById('cart-count');
      const cartTotal = document.getElementById('cart-total');

      if (cartCount) {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
      }

      if (cartTotal) {
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `AED ${total.toFixed(2)}`;
      }
    }

    updateWishlistDisplay() {
      const wishlistCount = document.getElementById('wishlist-count');

      if (wishlistCount) {
        wishlistCount.textContent = this.wishlist.length;
        wishlistCount.style.display = this.wishlist.length > 0 ? 'block' : 'none';
      }
    }

    loadCartPanel() {
      const cartItems = document.getElementById('cart-items');
      const modalCartTotal = document.getElementById('modal-cart-total');

      if (!cartItems) return;

      if (this.cart.length === 0) {
        cartItems.innerHTML = `
        <div class="empty-cart">
          <ion-icon name="bag-outline"></ion-icon>
          <p>Your cart is empty</p>
          <a href="shop.html" class="btn btn-secondary">Start Shopping</a>
        </div>
      `;
      } else {
        cartItems.innerHTML = this.cart.map(item => `
        <div class="cart-item">
          <div class="item-image">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="item-details">
            <h4>${item.name}</h4>
            <p class="item-price">AED ${item.price.toFixed(2)}</p>
            <div class="quantity-controls">
              <button class="qty-btn" onclick="cartSystem.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
              <span class="quantity">${item.quantity}</span>
              <button class="qty-btn" onclick="cartSystem.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
          </div>
          <div class="item-actions">
            <span class="item-total">AED ${(item.price * item.quantity).toFixed(2)}</span>
            <button class="remove-btn" onclick="cartSystem.removeFromCart(${item.id})">
              <ion-icon name="trash-outline"></ion-icon>
            </button>
          </div>
        </div>
      `).join('');
      }

      if (modalCartTotal) {
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        modalCartTotal.textContent = `AED ${total.toFixed(2)}`;
      }
    }

    loadWishlistPanel() {
      const wishlistItems = document.getElementById('wishlist-items');

      if (!wishlistItems) return;

      if (this.wishlist.length === 0) {
        wishlistItems.innerHTML = `
        <div class="empty-wishlist">
          <ion-icon name="heart-outline"></ion-icon>
          <p>Your wishlist is empty</p>
          <a href="shop.html" class="btn btn-secondary">Discover Products</a>
        </div>
      `;
      } else {
        wishlistItems.innerHTML = this.wishlist.map(item => `
        <div class="wishlist-item">
          <div class="item-image">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="item-details">
            <h4>${item.name}</h4>
            <p class="item-price">AED ${item.price.toFixed(2)}</p>
            <div class="item-actions">
              <button class="btn btn-primary btn-small" onclick="cartSystem.addToCart(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                Add to Cart
              </button>
              <button class="remove-btn" onclick="cartSystem.removeFromWishlist(${item.id})">
                <ion-icon name="trash-outline"></ion-icon>
              </button>
            </div>
          </div>
        </div>
      `).join('');
      }
    }

    toggleCartPanel() {
      const cartPanel = document.getElementById('cart-panel');
      if (cartPanel) {
        cartPanel.classList.toggle('active');
        if (cartPanel.classList.contains('active')) {
          this.loadCartPanel();
        }
      }
    }

    toggleWishlistPanel() {
      const wishlistPanel = document.getElementById('wishlist-panel');
      if (wishlistPanel) {
        wishlistPanel.classList.toggle('active');
        if (wishlistPanel.classList.contains('active')) {
          this.loadWishlistPanel();
        }
      }
    }

    closeCartPanel() {
      const cartPanel = document.getElementById('cart-panel');
      if (cartPanel) {
        cartPanel.classList.remove('active');
      }
    }

    closeWishlistPanel() {
      const wishlistPanel = document.getElementById('wishlist-panel');
      if (wishlistPanel) {
        wishlistPanel.classList.remove('active');
      }
    }

    showNotification(message, type = 'success') {
      console.log('Notification shown:', message);
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;

      notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: ${type === 'error' ? '#ef4444' : type === 'info' ? '#3b82f6' : '#10b981'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 10001;
      transform: translateX(400px);
      opacity: 0;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
      }, 100);

      setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        notification.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 3000);
    }

    // Method to get cart for checkout
    getCart() {
      return this.cart;
    }

    // Method to clear cart after successful order
    clearCart() {
      this.cart = [];
      localStorage.setItem('cart', JSON.stringify(this.cart));
      this.updateCartDisplay();
      this.loadCartPanel();
    }
  }

  // Initialize all systems and global functions
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Cart System
    window.cartSystem = new CartSystem();

    // 2. Initialize Wishlist System
    window.wishlistSystem = new WishlistSystem();

    // 3. Initialize Quick View Modal
    window.quickViewSystem = new QuickViewSystem();

    // 4. Initialize Recently Viewed
    window.recentlyViewed = new RecentlyViewed();

    // 5. Initialize Auth UI
    window.authUIManager = new AuthUIManager();

    // 6. Initialize Price Slider if present
    if (typeof initPriceSlider === 'function') {
      initPriceSlider();
    }

    /**
     * GLOBAL CHECKOUT FUNCTION
     */
    window.proceedToCheckout = function () {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      if (cart.length === 0) {
        if (window.cartSystem) {
          window.cartSystem.showNotification('Your cart is empty! Please add some products before checkout.', 'error');
        } else {
          alert('Your cart is empty! Please add some products before checkout.');
        }
        return;
      }

      // Handle path correctly based on where we are
      const isInSubdir = window.location.pathname.includes('/frontend/pages/') || window.location.pathname.includes('\\frontend\\pages\\');
      window.location.href = isInSubdir ? 'checkout.html' : 'frontend/pages/checkout.html';
    };
  });
});