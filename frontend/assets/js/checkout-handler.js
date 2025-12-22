'use strict';

/**
 * Global API Configuration
 */
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : ''; // Relative for production

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

    // Store updated data in localStorage as well to be safe
    const existingData = JSON.parse(localStorage.getItem('checkoutData')) || {};
    localStorage.setItem('checkoutData', JSON.stringify({
      ...existingData,
      cart,
      total: this.checkoutData.total,
      subtotal: this.checkoutData.subtotal,
      shipping: this.checkoutData.shipping,
      tax: this.checkoutData.tax
    }));
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
    const emailInput = document.querySelector('input[type="email"]');
    const telInput = document.querySelector('input[type="tel"]');

    if (!emailInput || !telInput) return;

    const email = emailInput.value;
    const phone = telInput.value;

    // Collect shipping information
    const textInputs = document.querySelectorAll('input[type="text"]');
    if (textInputs.length < 4) return;

    const firstName = textInputs[0].value;
    const lastName = textInputs[1].value;
    const address = textInputs[2].value;
    const city = textInputs[3].value;
    const select = document.querySelector('select');
    const emirate = select ? select.value : 'N/A';

    // Save to checkoutData
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    this.checkoutData.contact = { email, phone };
    this.checkoutData.shipping = { firstName, lastName, address, city, emirate };
    this.checkoutData.cart = cart;

    // Store in localStorage for payment pages to access
    localStorage.setItem('checkoutData', JSON.stringify({
      customerName: `${firstName} ${lastName}`,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: `${address}, ${city}, ${emirate}`,
      ...this.checkoutData
    }));

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
    const cart = data.cart || [];
    cart.forEach(item => {
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
      to_email: data.customerEmail || data.contact.email,
      customer_name: data.customerName || `${data.shipping.firstName} ${data.shipping.lastName}`,
      order_number: orderNumber,
      order_date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),

      // Shipping details
      shipping_name: data.customerName || `${data.shipping.firstName} ${data.shipping.lastName}`,
      shipping_address: data.shipping.address,
      shipping_city: data.shipping.city,
      shipping_emirate: data.shipping.emirate,
      shipping_phone: data.customerPhone || data.contact.phone,

      // Order details
      cart_items: cartItemsHTML,
      subtotal: `AED ${(data.subtotal || 0).toFixed(2)}`,
      shipping_cost: (data.shipping === 0) ? 'FREE' : `AED ${(data.shipping || 0).toFixed(2)}`,
      tax: `AED ${(data.tax || 0).toFixed(2)}`,
      total: `AED ${(data.total || 0).toFixed(2)}`,

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

  async submitOrderToBackend(paymentMethod, extraDetails = {}) {
    const data = JSON.parse(localStorage.getItem('checkoutData')) || this.checkoutData;
    const cart = JSON.parse(localStorage.getItem('cart')) || data.cart || [];
    const token = localStorage.getItem('token');

    // Map payment method to enum expected by backend
    let mappedPaymentMethod = 'COD';
    if (paymentMethod.toLowerCase().includes('paypal')) mappedPaymentMethod = 'PayPal';
    else if (paymentMethod.toLowerCase().includes('card') || paymentMethod.toLowerCase().includes('credit')) mappedPaymentMethod = 'Card';
    else if (paymentMethod.toLowerCase().includes('bank')) mappedPaymentMethod = 'Bank Transfer';

    // Helper to get image URL (handle both string and object)
    const getImageUrl = (image) => {
      if (typeof image === 'string') return image;
      if (image && typeof image === 'object' && image.url) return image.url;
      return 'assets/images/product-1.jpg'; // Fallback
    };

    const orderData = {
      shippingInfo: {
        address: data.shipping.address || 'N/A',
        city: data.shipping.city || data.shipping.emirate || 'N/A',
        phoneNo: data.customerPhone || data.contact.phone || 'N/A',
        postalCode: '00000', // Default if not provided
        country: 'UAE'
      },
      orderItems: cart.map(item => {
        // Only send the product ID if it's a valid MongoDB ObjectId (24 char hex)
        const productId = item._id || item.id;
        const isValidObjectId = typeof productId === 'string' && /^[0-9a-fA-F]{24}$/.test(productId);

        return {
          name: item.name,
          quantity: item.quantity,
          image: getImageUrl(item.image),
          price: item.price,
          product: isValidObjectId ? productId : null
        };
      }),
      itemsPrice: data.subtotal || 0,
      taxPrice: data.tax || 0,
      shippingPrice: data.shipping || 0,
      totalPrice: data.total || 0,
      paymentMethod: mappedPaymentMethod,
      paymentInfo: {
        id: this.generateOrderNumber('PAY'),
        status: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Succeeded'
      }
    };

    if (!token) {
      alert('Please log in to complete your order.');
      window.location.href = 'signup.html';
      return null;
    }

    try {
      console.log('📤 Submitting order to backend...', orderData);
      const response = await fetch(`${API_BASE_URL}/api/orders/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Order saved to MongoDB:', result.order._id);
        return result.order;
      } else {
        console.error('❌ Backend error:', result.error);
        alert('Error: ' + (result.error || 'Failed to save order'));
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to connect to backend:', error);
      alert('Connection Error: Could not connect to the server at ' + API_BASE_URL);
      return null;
    }
  }

  generateOrderNumber(prefix = 'GLW') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}${timestamp}${random}`.slice(0, 12);
  }
}

// Initialize checkout system
if (document.querySelector('.checkout-container') || document.querySelector('.checkout-main')) {
  window.checkoutSystem = new CheckoutSystem();
}

async function completeOrder(paymentMethod) {
  const checkoutSystem = new CheckoutSystem();

  try {
    // 1. Submit to Backend (MongoDB)
    const backendOrder = await checkoutSystem.submitOrderToBackend(paymentMethod);

    if (!backendOrder) {
      alert('⚠️ There was an issue saving your order to our database. Your order might not have been processed correctly. Please try again or contact support.');
      return null;
    }

    console.log('✅ Order saved to MongoDB:', backendOrder._id);
    const orderNumber = backendOrder._id.slice(-8).toUpperCase();

    // 2. Send confirmation email
    await checkoutSystem.sendOrderConfirmationEmail(orderNumber, paymentMethod);

    // 3. Clear cart and checkout data
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutData');

    // 4. Show success and redirect
    alert('🎉 Order Placed Successfully! Order ID: ' + backendOrder._id);

    setTimeout(() => {
      window.location.href = '../../index.html';
    }, 1500);

    return backendOrder._id;
  } catch (error) {
    console.error('❌ Error in completeOrder:', error);
    alert('❌ Failed to complete order. Please check your connection.');
    return null;
  }
}

// Export for use in payment pages
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CheckoutSystem, completeOrder };
}
// End of file