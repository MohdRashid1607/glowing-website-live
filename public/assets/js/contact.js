'use strict';

/**
 * Contact Page Functionality
 */

class ContactManager {
  constructor() {
    this.emailjsInitialized = false;
    this.init();
  }

  init() {
    this.initializeEmailJS();
    this.bindEvents();
    this.initializeFAQ();
    this.updateBusinessHours();
  }

  initializeEmailJS() {
    // Initialize EmailJS with your public key
    // Replace 'YOUR_PUBLIC_KEY' with your actual EmailJS public key
    if (typeof emailjs !== 'undefined') {
      emailjs.init('0BzPUIhPRGnSUiKCv'); // Replace with your EmailJS public key
      this.emailjsInitialized = true;
    }
  }

  bindEvents() {
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmission(contactForm);
      });
    }

    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        this.formatPhoneNumber(e.target);
      });
    }

    // Form validation
    const formInputs = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    formInputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      input.addEventListener('input', () => {
        this.clearFieldError(input);
      });
    });
  }

  async handleFormSubmission(form) {
    const submitBtn = form.querySelector('.submit-btn');
    const successMessage = document.getElementById('success-message');
    
    // Validate form
    if (!this.validateForm(form)) {
      return;
    }

    // Show loading state
    this.setLoadingState(submitBtn, true);

    try {
      // Collect form data
      const formData = new FormData(form);
      const templateParams = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone') || 'Not provided',
        subject: formData.get('subject'),
        message: formData.get('message'),
        newsletter: formData.get('newsletter') ? 'Yes' : 'No',
        timestamp: new Date().toLocaleString()
      };

      // Send email using EmailJS (if configured)
      if (this.emailjsInitialized) {
        await this.sendEmail(templateParams);
      } else {
        // Simulate email sending for demo
        await this.simulateEmailSending(templateParams);
      }

      // Show success message
      this.showSuccessMessage(successMessage);
      
      // Reset form
      form.reset();
      
      // Track form submission (analytics)
      this.trackFormSubmission(templateParams);

    } catch (error) {
      console.error('Error sending email:', error);
      this.showErrorMessage('There was an error sending your message. Please try again or contact us directly.');
    } finally {
      this.setLoadingState(submitBtn, false);
    }
  }

  async sendEmail(templateParams) {
    // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your EmailJS configuration
    return emailjs.send(
      'service_oz95qc3',    // Replace with your EmailJS service ID
      'template_2azwend',   // Replace with your EmailJS template ID
      templateParams
    );
  }

  async simulateEmailSending(templateParams) {
    // Simulate API call for demo purposes
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Contact form submitted:', templateParams);
        resolve();
      }, 2000);
    });
  }

  validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    // Additional email validation
    const emailField = form.querySelector('#email');
    if (emailField && !this.isValidEmail(emailField.value)) {
      this.showFieldError(emailField, 'Please enter a valid email address');
      isValid = false;
    }

    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
      this.showFieldError(field, 'This field is required');
      return false;
    }

    if (field.type === 'email' && value && !this.isValidEmail(value)) {
      this.showFieldError(field, 'Please enter a valid email address');
      return false;
    }

    if (field.type === 'tel' && value && !this.isValidPhone(value)) {
      this.showFieldError(field, 'Please enter a valid phone number');
      return false;
    }

    this.clearFieldError(field);
    return true;
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    
    field.style.borderColor = '#e74c3c';
    
    const errorElement = document.createElement('span');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
      color: #e74c3c;
      font-size: 0.875rem;
      margin-top: 5px;
      display: block;
    `;
    
    field.parentNode.appendChild(errorElement);
  }

  clearFieldError(field) {
    field.style.borderColor = '';
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.startsWith('971')) {
      // UAE format: +971 XX XXX XXXX
      value = value.replace(/^971(\d{2})(\d{3})(\d{4})/, '+971 $1 $2 $3');
    } else if (value.length >= 10) {
      // Generic format: XXX XXX XXXX
      value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    
    input.value = value;
  }

  setLoadingState(button, loading) {
    if (loading) {
      button.disabled = true;
      button.classList.add('loading');
    } else {
      button.disabled = false;
      button.classList.remove('loading');
    }
  }

  showSuccessMessage(element) {
    element.classList.add('show');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Hide after 10 seconds
    setTimeout(() => {
      element.classList.remove('show');
    }, 10000);
  }

  showErrorMessage(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);

    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
  }

  initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all other FAQ items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
        
        // Toggle current item
        item.classList.toggle('active', !isActive);
      });
    });
  }

  updateBusinessHours() {
    const statusElement = document.querySelector('.location-status');
    if (!statusElement) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

    let isOpen = false;
    
    if (currentDay >= 1 && currentDay <= 5) {
      // Monday to Friday: 9 AM - 9 PM
      isOpen = currentHour >= 9 && currentHour < 21;
    } else if (currentDay === 6) {
      // Saturday: 10 AM - 10 PM
      isOpen = currentHour >= 10 && currentHour < 22;
    } else {
      // Sunday: 12 PM - 8 PM
      isOpen = currentHour >= 12 && currentHour < 20;
    }

    statusElement.textContent = isOpen ? 'Open Now' : 'Closed';
    statusElement.className = `location-status ${isOpen ? 'open' : 'closed'}`;
  }

  trackFormSubmission(data) {
    // Track form submission for analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submit', {
        event_category: 'Contact',
        event_label: data.subject,
        value: 1
      });
    }
    
    // You can also send to other analytics services here
    console.log('Form submission tracked:', data.subject);
  }
}

// Add notification styles
const notificationStyles = `
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: var(--white);
  border-radius: var(--radius-3);
  box-shadow: var(--shadow-1);
  z-index: 10000;
  transform: translateX(400px);
  opacity: 0;
  transition: all 0.3s ease;
  max-width: 400px;
}

.notification.show {
  transform: translateX(0);
  opacity: 1;
}

.notification-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  gap: 15px;
}

.notification-message {
  font-size: var(--fs-7);
  color: var(--black);
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--spanish-gray);
  cursor: pointer;
  transition: var(--transition-1);
}

.notification-close:hover {
  color: var(--black);
}

.notification-success {
  border-left: 4px solid var(--hoockers-green);
}

.notification-error {
  border-left: 4px solid #e74c3c;
}

.notification-info {
  border-left: 4px solid #3498db;
}
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize contact manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('contact-form')) {
    window.contactManager = new ContactManager();
  }
});

// EmailJS Configuration Instructions
console.log(`
🔧 EmailJS Setup Instructions:
1. Sign up at https://www.emailjs.com/
2. Create a service (Gmail, Outlook, etc.)
3. Create an email template
4. Replace the following in contact.js:
   - YOUR_PUBLIC_KEY with your EmailJS public key
   - YOUR_SERVICE_ID with your service ID
   - YOUR_TEMPLATE_ID with your template ID

📧 Email Template Variables:
- {{firstName}} - First name
- {{lastName}} - Last name  
- {{email}} - Email address
- {{phone}} - Phone number
- {{subject}} - Subject selection
- {{message}} - Message content
- {{newsletter}} - Newsletter subscription
- {{timestamp}} - Submission time
`);