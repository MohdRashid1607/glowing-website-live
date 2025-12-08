class CheckoutManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
    this.subtotal = 0;
    this.tax = 0;
    this.shipping = 0;
    this.total = 0;
    this.promoCodes = {
      'WELCOME10': { discount: 10, type: 'percentage' },
      'SAVE20': { discount: 20, type: 'percentage' },
      'FREESHIP': { discount: 15, type: 'fixed', freeShipping: true },
      'NEWUSER': { discount: 25, type: 'percentage' }
    };
    this.appliedPromo = null;
    
    this.init();
  }

  init() {
    this.loadCartItems();
    this.calculateTotals();
    this.bindEvents();
    this.setupFormValidation();
    this.setupPaymentMethodToggle();
    this.updateProgressStep(2);
  }

  loadCartItems() {
    const summaryItems = document.getElementById('summary-items');
    
    if (this.cart.length === 0) {
      summaryItems.innerHTML = `
        <div class="empty-cart">
          <ion-icon name="bag-outline"></ion-icon>
          <p>Your cart is empty</p>
          <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
        </div>
      `;
      return;
    }

    summaryItems.innerHTML = this.cart.map(item => `
      <div class="summary-item">
        <div class="item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="item-details">
          <h4>${item.name}</h4>
          <p class="item-price">AED ${item.price.toFixed(2)}</p>
          <div class="item-quantity">
            <button class="qty-btn minus" onclick="checkoutManager.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
            <span class="qty">${item.quantity}</span>
            <button class="qty-btn plus" onclick="checkoutManager.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
          </div>
        </div>
        <div class="item-total">
          <span>AED ${(item.price * item.quantity).toFixed(2)}</span>
          <button class="remove-item" onclick="checkoutManager.removeItem(${item.id})">
            <ion-icon name="trash-outline"></ion-icon>
          </button>
        </div>
      </div>
    `).join('');
  }

  updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const itemIndex = this.cart.findIndex(item => item.id === productId);
    if (itemIndex !== -1) {
      this.cart[itemIndex].quantity = newQuantity;
      localStorage.setItem('cart', JSON.stringify(this.cart));
      this.loadCartItems();
      this.calculateTotals();
      this.updateCartDisplay();
    }
  }

  removeItem(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.loadCartItems();
    this.calculateTotals();
    this.updateCartDisplay();
  }

  calculateTotals() {
    this.subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate shipping
    this.shipping = this.subtotal >= 50 || (this.appliedPromo && this.appliedPromo.freeShipping) ? 0 : 15;
    
    // Calculate tax (5% VAT)
    this.tax = this.subtotal * 0.05;
    
    // Apply promo discount
    let discount = 0;
    if (this.appliedPromo) {
      if (this.appliedPromo.type === 'percentage') {
        discount = this.subtotal * (this.appliedPromo.discount / 100);
      } else {
        discount = this.appliedPromo.discount;
      }
    }
    
    this.total = this.subtotal + this.tax + this.shipping - discount;
    
    // Update display
    document.getElementById('subtotal').textContent = `AED ${this.subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `AED ${this.tax.toFixed(2)}`;
    document.getElementById('shipping').textContent = this.shipping === 0 ? 'Free' : `AED ${this.shipping.toFixed(2)}`;
    document.getElementById('total').textContent = `AED ${this.total.toFixed(2)}`;
    
    if (this.appliedPromo) {
      this.showPromoDiscount(discount);
    }
  }

  showPromoDiscount(discount) {
    const calculations = document.querySelector('.summary-calculations');
    let discountRow = calculations.querySelector('.discount-row');
    
    if (!discountRow) {
      discountRow = document.createElement('div');
      discountRow.className = 'calc-row discount-row';
      calculations.insertBefore(discountRow, calculations.querySelector('.total'));
    }
    
    discountRow.innerHTML = `
      <span>Discount (${this.appliedPromo.code}):</span>
      <span class="discount-amount">-AED ${discount.toFixed(2)}</span>
    `;
  }

  bindEvents() {
    // Promo code application
    const applyPromoBtn = document.getElementById('apply-promo');
    const promoInput = document.getElementById('promoCode');
    
    if (applyPromoBtn) {
      applyPromoBtn.addEventListener('click', () => {
        this.applyPromoCode(promoInput.value.toUpperCase());
      });
    }
    
    if (promoInput) {
      promoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.applyPromoCode(promoInput.value.toUpperCase());
        }
      });
    }

    // Form submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.processOrder();
      });
    }
  }

  applyPromoCode(code) {
    const promoInput = document.getElementById('promoCode');
    const applyBtn = document.getElementById('apply-promo');
    
    if (!code) {
      this.showNotification('Please enter a promo code', 'error');
      return;
    }
    
    if (this.promoCodes[code]) {
      this.appliedPromo = { ...this.promoCodes[code], code };
      this.calculateTotals();
      
      promoInput.value = '';
      promoInput.placeholder = `${code} applied!`;
      promoInput.style.borderColor = '#10b981';
      applyBtn.textContent = 'Applied';
      applyBtn.style.backgroundColor = '#10b981';
      applyBtn.disabled = true;
      
      this.showNotification(`Promo code ${code} applied successfully!`, 'success');
    } else {
      this.showNotification('Invalid promo code', 'error');
      promoInput.style.borderColor = '#ef4444';
      
      setTimeout(() => {
        promoInput.style.borderColor = '';
      }, 2000);
    }
  }

  setupFormValidation() {
    const form = document.getElementById('checkout-form');
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      input.addEventListener('input', () => {
        this.clearFieldError(input);
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    // Required field validation
    if (field.required && !value) {
      isValid = false;
      message = 'This field is required';
    }

    // Email validation
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        message = 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (field.type === 'tel' && value) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        message = 'Please enter a valid phone number';
      }
    }

    // Card number validation
    if (field.name === 'cardNumber' && value) {
      const cardNumber = value.replace(/\s/g, '');
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        isValid = false;
        message = 'Please enter a valid card number';
      }
    }

    // CVV validation
    if (field.name === 'cvv' && value) {
      if (value.length < 3 || value.length > 4) {
        isValid = false;
        message = 'Please enter a valid CVV';
      }
    }

    // Expiry date validation
    if (field.name === 'expiryDate' && value) {
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expiryRegex.test(value)) {
        isValid = false;
        message = 'Please enter a valid expiry date (MM/YY)';
      }
    }

    if (isValid) {
      this.clearFieldError(field);
    } else {
      this.showFieldError(field, message);
    }

    return isValid;
  }

  showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    formGroup.classList.add('error');
    errorElement.textContent = message;
  }

  clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('error');
  }

  setupPaymentMethodToggle() {
    const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
    const cardDetails = document.getElementById('card-details');
    
    paymentOptions.forEach(option => {
      option.addEventListener('change', () => {
        if (option.value === 'card') {
          cardDetails.style.display = 'block';
          cardDetails.style.animation = 'slideDown 0.3s ease';
        } else {
          cardDetails.style.display = 'none';
        }
      });
    });
  }

  async processOrder() {
    const form = document.getElementById('checkout-form');
    
    // Validate form
    if (!this.validateForm(form)) {
      this.showNotification('Please fill in all required fields correctly', 'error');
      return;
    }

    if (this.cart.length === 0) {
      this.showNotification('Your cart is empty', 'error');
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('.checkout-btn');
    this.setLoadingState(submitBtn, true);
    
    try {
      // Update progress
      this.updateProgressStep(3);
      
      // Simulate payment processing
      await this.delay(2000);
      
      // Process payment if card is selected
      const paymentMethod = form.querySelector('input[name="paymentMethod"]:checked').value;
      
      if (paymentMethod === 'card') {
        // Validate card using credit card animation
        if (window.creditCardAnimation && !window.creditCardAnimation.validateCard()) {
          throw new Error('Invalid card details');
        }
        
        // Simulate card processing
        await window.creditCardAnimation.processPayment();
      }
      
      // Create order
      const orderData = this.createOrderData(form);
      
      // Save order
      this.saveOrder(orderData);
      
      // Update progress
      this.updateProgressStep(4);
      
      // Show success
      this.showOrderSuccess(orderData);
      
      // Clear cart
      this.clearCart();
      
    } catch (error) {
      this.showNotification(error.message || 'Order processing failed. Please try again.', 'error');
      this.updateProgressStep(2);
    } finally {
      this.setLoadingState(submitBtn, false);
    }
  }

  createOrderData(form) {
    const formData = new FormData(form);
    const paymentMethod = formData.get('paymentMethod');
    
    return {
      orderNumber: 'GLW' + Date.now().toString().slice(-6),
      customer: {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone')
      },
      shipping: {
        address: formData.get('address'),
        city: formData.get('city'),
        emirate: formData.get('emirate'),
        postalCode: formData.get('postalCode'),
        country: formData.get('country')
      },
      items: [...this.cart],
      subtotal: `AED ${this.subtotal.toFixed(2)}`,
      tax: `AED ${this.tax.toFixed(2)}`,
      shipping: this.shipping === 0 ? 'Free' : `AED ${this.shipping.toFixed(2)}`,
      total: `AED ${this.total.toFixed(2)}`,
      paymentMethod: paymentMethod,
      promoCode: this.appliedPromo ? this.appliedPromo.code : null,
      orderNotes: formData.get('orderNotes'),
      date: new Date().toISOString(),
      status: 'pending'
    };
  }

  saveOrder(orderData) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.unshift(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
  }

  showOrderSuccess(orderData) {
    const modal = document.getElementById('success-modal');
    const orderNumber = document.getElementById('order-number');
    const orderTotal = document.getElementById('order-total');
    
    orderNumber.textContent = orderData.orderNumber;
    orderTotal.textContent = orderData.total;
    
    modal.classList.add('active');
    
    // Add celebration effect
    this.createCelebrationEffect();
  }

  createCelebrationEffect() {
    // Create confetti effect
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background-color: ${['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'][Math.floor(Math.random() * 5)]};
        top: -10px;
        left: ${Math.random() * 100}vw;
        z-index: 10001;
        border-radius: 50%;
        animation: confetti-fall 3s linear forwards;
      `;
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        if (document.body.contains(confetti)) {
          document.body.removeChild(confetti);
        }
      }, 3000);
    }
  }

  clearCart() {
    this.cart = [];
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartDisplay();
  }

  updateCartDisplay() {
    // Update header cart
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    if (cartCount) {
      const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems;
    }
    
    if (cartTotal) {
      const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cartTotal.textContent = `AED ${total.toFixed(2)}`;
    }
  }

  updateProgressStep(step) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((stepEl, index) => {
      if (index < step) {
        stepEl.classList.add('active');
      } else {
        stepEl.classList.remove('active');
      }
    });
  }

  validateForm(form) {
    const requiredInputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;

    requiredInputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  setLoadingState(button, loading) {
    if (loading) {
      button.classList.add('loading');
      button.querySelector('.btn-text').textContent = 'Processing...';
    } else {
      button.classList.remove('loading');
      button.querySelector('.btn-text').textContent = 'Place Order';
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
      ${type === 'error' ? 'background-color: #ef4444;' : 
        type === 'success' ? 'background-color: #10b981;' : 'background-color: #3b82f6;'}
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

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Add confetti animation CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes confetti-fall {
    0% {
      transform: translateY(-10px) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .checkout-btn.loading .btn-text::after {
    content: '';
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    display: inline-block;
    margin-left: 10px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Initialize checkout manager
let checkoutManager;
document.addEventListener('DOMContentLoaded', () => {
  checkoutManager = new CheckoutManager();
});