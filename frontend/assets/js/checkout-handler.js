'use strict';

/**
 * Checkout System with Email Integration
 */

class CheckoutSystem {
  constructor() {
    this.checkoutData = {
      contact: {},
      shipping: {},
      cart: [],
      total: 0
    };
    this.emailjsInitialized = false;
    this.init();
  }

  init() {
    this.initializeEmailJS();
    this.loadCart();
    this.bindCheckoutFormEvents();
  }

  initializeEmailJS() {
    // Initialize EmailJS - Replace with your actual public key
    if (typeof emailjs !== 'undefined') {
      emailjs.init('0BzPUIhPRGnSUiKCv'); // Your EmailJS public key
      this.emailjsInitialized = true;
      console.log('✅ EmailJS initialized');
    } else {
      console.warn('⚠️ EmailJS not loaded');
    }
  }

  loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    this.checkoutData.cart = cart;

    // Calculate total
    let subtotal = 0;
    cart.forEach(item => {
      subtotal += item.price * item.quantity;
    });

    const shipping = subtotal > 55 ? 0 : 15;
    const tax = subtotal * 0.05;
    this.checkoutData.total = subtotal + shipping + tax;
    this.checkoutData.subtotal = subtotal;
    this.checkoutData.shipping = shipping;
    this.checkoutData.tax = tax;
  }

  bindCheckoutFormEvents() {
    // This runs on checkout.html page
    const checkoutForm = document.querySelector('.checkout-main');
    if (!checkoutForm) return;

    // Collect contact and shipping info when payment method is clicked
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
      method.addEventListener('click', (e) => {
        e.preventDefault();

        // Validate and save checkout info
        if (this.validateCheckoutForm()) {
          this.saveCheckoutData();

          // Redirect to selected payment method
          const paymentType = method.dataset.method;
          this.redirectToPayment(paymentType);
        }
      });
    });
  }

  validateCheckoutForm() {
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#dc3545';
        isValid = false;

        // Show error message
        if (!field.nextElementSibling?.classList.contains('error-message')) {
          const error = document.createElement('span');
          error.className = 'error-message';
          error.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 5px; display: block;';
          error.textContent = 'This field is required';
          field.parentNode.appendChild(error);
        }
      } else {
        field.style.borderColor = '#e9ecef';
        const errorMsg = field.parentNode.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
      }
    });

    if (!isValid) {
      alert('Please fill in all required fields before proceeding to payment.');
    }

    return isValid;
  }

  saveCheckoutData() {
    // Collect contact information
    const email = document.querySelector('input[type="email"]').value;
    const phone = document.querySelector('input[type="tel"]').value;

    // Collect shipping information
    const firstName = document.querySelectorAll('input[type="text"]')[0].value;
    const lastName = document.querySelectorAll('input[type="text"]')[1].value;
    const address = document.querySelectorAll('input[type="text"]')[2].value;
    const city = document.querySelectorAll('input[type="text"]')[3].value;
    const emirate = document.querySelector('select').value;

    // Save to checkoutData
    this.checkoutData.contact = { email, phone };
    this.checkoutData.shipping = { firstName, lastName, address, city, emirate };

    // Store in localStorage for payment pages to access
    localStorage.setItem('checkoutData', JSON.stringify(this.checkoutData));

    console.log('✅ Checkout data saved:', this.checkoutData);
  }

  redirectToPayment(paymentType) {
    const paymentPages = {
      'card': 'credit-card.html',
      'paypal': 'paypal-payment.html',
      'apple': 'apple-pay.html',
      'cod': 'cod-payment.html'
    };

    const page = paymentPages[paymentType];
    if (page) {
      window.location.href = page;
    }
  }

  // Call this method after successful payment
  async sendOrderConfirmationEmail(orderNumber, paymentMethod) {
    if (!this.emailjsInitialized) {
      console.warn('EmailJS not initialized');
      return false;
    }

    // Get checkout data
    const data = JSON.parse(localStorage.getItem('checkoutData')) || this.checkoutData;

    // Prepare cart items HTML
    let cartItemsHTML = '';
    data.cart.forEach(item => {
      cartItemsHTML += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">AED ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    });

    // Email template parameters
    const templateParams = {
      to_email: data.contact.email,
      customer_name: `${data.shipping.firstName} ${data.shipping.lastName}`,
      order_number: orderNumber,
      order_date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),

      // Shipping details
      shipping_name: `${data.shipping.firstName} ${data.shipping.lastName}`,
      shipping_address: data.shipping.address,
      shipping_city: data.shipping.city,
      shipping_emirate: data.shipping.emirate,
      shipping_phone: data.contact.phone,

      // Order details
      cart_items: cartItemsHTML,
      subtotal: `AED ${data.subtotal.toFixed(2)}`,
      shipping_cost: data.shipping === 0 ? 'FREE' : `AED ${data.shipping.toFixed(2)}`,
      tax: `AED ${data.tax.toFixed(2)}`,
      total: `AED ${data.total.toFixed(2)}`,

      payment_method: paymentMethod,

      // Estimated delivery
      estimated_delivery: this.getEstimatedDelivery()
    };

    try {
      // Send email using EmailJS
      const response = await emailjs.send(
        'service_rxiqeg6',    //EmailJS service ID
        'template_r2p27yh',     //  EmailJS
        templateParams
      );

      console.log('✅ Order confirmation email sent:', response);
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return false;
    }
  }

  getEstimatedDelivery() {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 3); // 3 days from now

    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  generateOrderNumber(prefix = 'GLW') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}${timestamp}${random}`.slice(0, 12);
  }
}

// Initialize checkout system
if (document.querySelector('.checkout-container')) {
  window.checkoutSystem = new CheckoutSystem();
}

/**
 * Payment Page Integration
 * Add this to each payment page (paypal, apple-pay, cod, credit-card)
 */

function completeOrder(paymentMethod) {
  const checkoutSystem = new CheckoutSystem();
  const orderNumber = checkoutSystem.generateOrderNumber();

  // Send confirmation email
  checkoutSystem.sendOrderConfirmationEmail(orderNumber, paymentMethod)
    .then(success => {
      if (success) {
        console.log('✅ Confirmation email sent successfully');
      } else {
        console.log('⚠️ Email not sent, but order completed');
      }

      // Clear cart and checkout data
      localStorage.removeItem('cart');
      localStorage.removeItem('checkoutData');

      // Redirect to success page or home
      setTimeout(() => {
        window.location.href = '../../index.html';
      }, 2000);
    });

  return orderNumber;
}

// Export for use in payment pages
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CheckoutSystem, completeOrder };
}
// End of file