class ModernAuthManager {
  constructor() {
    this.currentForm = 'signin';
    this.users = JSON.parse(localStorage.getItem('users')) || [];
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.setupPasswordStrength();
    this.checkAuthState();
    this.initAnimations();
  }

  bindEvents() {
    // Form submissions
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const forgotForm = document.getElementById('forgot-form');

    if (signinForm) {
      signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSignIn();
      });
    }

    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSignUp();
      });
    }

    if (forgotForm) {
      forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleForgotPassword();
      });
    }

    // Real-time validation
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });

      input.addEventListener('input', () => {
        this.clearFieldError(input);
      });
    });

    // Enhanced input animations
    inputs.forEach(input => {
      input.addEventListener('focus', (e) => {
        this.animateInputFocus(e.target);
      });

      input.addEventListener('blur', (e) => {
        this.animateInputBlur(e.target);
      });
    });
  }

  setupPasswordStrength() {
    const passwordInput = document.getElementById('signup-password');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');

    if (passwordInput && strengthFill && strengthText) {
      passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = this.calculatePasswordStrength(password);

        strengthFill.className = 'strength-fill';

        if (password.length === 0) {
          strengthText.textContent = 'Password strength';
          return;
        }

        if (strength < 30) {
          strengthFill.classList.add('weak');
          strengthText.textContent = 'Weak password';
        } else if (strength < 60) {
          strengthFill.classList.add('fair');
          strengthText.textContent = 'Fair password';
        } else if (strength < 80) {
          strengthFill.classList.add('good');
          strengthText.textContent = 'Good password';
        } else {
          strengthFill.classList.add('strong');
          strengthText.textContent = 'Strong password';
        }
      });
    }
  }

  calculatePasswordStrength(password) {
    let strength = 0;

    // Length
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;

    // Character types
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;

    return strength;
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let message = '';

    // Required field validation
    if (field.required && !value) {
      isValid = false;
      message = 'This field is required';
    }

    // Email validation
    if (fieldName === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        message = 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (fieldName === 'phone' && value) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        message = 'Please enter a valid phone number';
      }
    }

    // Password validation
    if (fieldName === 'password' && value) {
      if (value.length < 8) {
        isValid = false;
        message = 'Password must be at least 8 characters long';
      }
    }

    // Confirm password validation
    if (fieldName === 'confirmPassword' && value) {
      const password = document.getElementById('signup-password')?.value;
      if (value !== password) {
        isValid = false;
        message = 'Passwords do not match';
      }
    }

    // Show/hide error
    if (isValid) {
      this.clearFieldError(field);
    } else {
      this.showFieldError(field, message);
    }

    return isValid;
  }

  showFieldError(field, message) {
    const formGroup = field.closest('.form-group');

    if (formGroup) {
      formGroup.classList.add('error');
      const errorElement = formGroup.querySelector('.error-message');
      if (errorElement) {
        errorElement.textContent = message;
      }
    }

    // Add shake animation
    field.style.animation = 'shake 0.3s ease';
    setTimeout(() => {
      field.style.animation = '';
    }, 300);
  }

  clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
      formGroup.classList.remove('error');
    }
  }

  async handleSignIn() {
    const form = document.getElementById('signin-form');
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');

    // Validate form
    if (!this.validateForm(form)) {
      this.showNotification('Please fill in all fields correctly', 'error');
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('.auth-btn');
    if (submitBtn) {
      this.setLoadingState(submitBtn, true);
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Successful login
        this.currentUser = data.user;
        localStorage.setItem('token', data.token);

        // Get user profile to store in currentUser
        const meResponse = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });
        const meData = await meResponse.json();
        this.currentUser = meData.data;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        // Add success animation to button
        submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

        this.showSuccessModal('Welcome Back!', `Good to see you again!`);

        // Update UI
        this.updateAuthUI();
      } else {
        this.showNotification(data.error || 'Invalid email or password', 'error');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      this.showNotification('Could not connect to server. Make sure your backend is running.', 'error');
    } finally {
      if (submitBtn) {
        this.setLoadingState(submitBtn, false);
      }
    }
  }

  async handleSignUp() {
    const form = document.getElementById('signup-form');
    if (!form) return;

    const formData = new FormData(form);
    const name = formData.get('fullName');
    const email = formData.get('email');
    const password = formData.get('password');

    // Validate form
    if (!this.validateForm(form)) {
      this.showNotification('Please fill in all fields correctly', 'error');
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('.auth-btn');
    if (submitBtn) {
      this.setLoadingState(submitBtn, true);
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);

        // Get user profile
        const meResponse = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });
        const meData = await meResponse.json();
        this.currentUser = meData.data;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        // Add success animation
        submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

        this.showSuccessModal('Account Created!', 'Welcome! Your account has been created successfully and saved in MongoDB.');

        // Update UI
        this.updateAuthUI();
      } else {
        this.showNotification(data.error || 'Account creation failed', 'error');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      this.showNotification('Could not connect to server. Make sure your backend is running.', 'error');
    } finally {
      if (submitBtn) {
        this.setLoadingState(submitBtn, false);
      }
    }
  }


  async handleForgotPassword() {
    const form = document.getElementById('forgot-form');
    const formData = new FormData(form);
    const email = formData.get('email');

    if (!email) {
      this.showNotification('Please enter your email address', 'error');
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('.auth-btn');
    this.setLoadingState(submitBtn, true);

    try {
      // Simulate API call
      await this.delay(1500);

      // Check if user exists
      const user = this.users.find(u => u.email === email);

      if (user) {
        this.showSuccessModal('Reset Link Sent!', 'We\'ve sent a password reset link to your email address.');
      } else {
        // For security, don't reveal if email exists
        this.showSuccessModal('Reset Link Sent!', 'If an account with this email exists, we\'ve sent a reset link.');
      }

    } catch (error) {
      this.showNotification('Failed to send reset link. Please try again.', 'error');
    } finally {
      this.setLoadingState(submitBtn, false);
    }
  }

  validateForm(form) {
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  setLoadingState(button, loading) {
    if (loading) {
      button.classList.add('loading');
    } else {
      button.classList.remove('loading');
    }
  }

  showSuccessModal(title, message) {
    const modal = document.getElementById('success-modal');
    const titleElement = document.getElementById('modal-title');
    const messageElement = document.getElementById('modal-message');

    titleElement.textContent = title;
    messageElement.textContent = message;

    modal.classList.add('active');

    // Add confetti effect
    this.createConfetti();
  }

  closeModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('active');

    // Redirect to dashboard after successful auth
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 500);
  }

  switchToSignUp() {
    document.getElementById('signin-card').classList.add('hidden');
    document.getElementById('signup-card').classList.remove('hidden');
    document.getElementById('forgot-card').classList.add('hidden');
    this.currentForm = 'signup';
  }

  switchToSignIn() {
    document.getElementById('signin-card').classList.remove('hidden');
    document.getElementById('signup-card').classList.add('hidden');
    document.getElementById('forgot-card').classList.add('hidden');
    this.currentForm = 'signin';
  }

  switchToForgot() {
    document.getElementById('signin-card').classList.add('hidden');
    document.getElementById('signup-card').classList.add('hidden');
    document.getElementById('forgot-card').classList.remove('hidden');
    this.currentForm = 'forgot';
  }

  checkAuthState() {
    if (this.currentUser) {
      // User is already logged in, redirect to home
      // window.location.href = 'index.html';
    }
  }

  updateAuthUI() {
    // Update header user button if on other pages
    const userBtn = document.querySelector('.header-action-btn[aria-label="user"]');
    if (userBtn && this.currentUser) {
      userBtn.innerHTML = `
        <div class="user-avatar">
          <span>${this.currentUser.firstName.charAt(0)}${this.currentUser.lastName.charAt(0)}</span>
        </div>
      `;
    }
  }

  signOut() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberUser');
    window.location.href = 'signup.html';
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Style based on type
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
      ${type === 'error' ? 'background-color: #ef4444;' : 'background-color: #10b981;'}
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

  animateInputFocus(input) {
    const wrapper = input.closest('.input-wrapper');
    wrapper.style.transform = 'translateY(-2px)';
    wrapper.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
  }

  animateInputBlur(input) {
    const wrapper = input.closest('.input-wrapper');
    wrapper.style.transform = '';
    wrapper.style.boxShadow = '';
  }

  initAnimations() {
    // Add entrance animations to form elements
    const formElements = document.querySelectorAll('.form-group, .social-btn, .auth-btn');
    formElements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';

      setTimeout(() => {
        element.style.transition = 'all 0.6s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
        top: -10px;
        left: ${Math.random() * 100}vw;
        z-index: 10002;
        border-radius: 50%;
        animation: confetti-fall 3s linear forwards;
      `;

      document.body.appendChild(confetti);

      setTimeout(() => {
        document.body.removeChild(confetti);
      }, 3000);
    }
  }
}

// Global functions for social auth (placeholders for real implementation)
function signInWithGoogle() {
  // In real implementation, this would use Google OAuth
  modernAuthManager.showNotification('Google Sign-In will be implemented with Google OAuth API', 'info');
}

function signUpWithGoogle() {
  // In real implementation, this would use Google OAuth
  modernAuthManager.showNotification('Google Sign-Up will be implemented with Google OAuth API', 'info');
}

function signInWithFacebook() {
  // In real implementation, this would use Facebook SDK
  modernAuthManager.showNotification('Facebook Sign-In will be implemented with Facebook SDK', 'info');
}

function signUpWithFacebook() {
  // In real implementation, this would use Facebook SDK
  modernAuthManager.showNotification('Facebook Sign-Up will be implemented with Facebook SDK', 'info');
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const toggle = input.nextElementSibling.querySelector('ion-icon');

  if (input.type === 'password') {
    input.type = 'text';
    toggle.name = 'eye-off-outline';
  } else {
    input.type = 'password';
    toggle.name = 'eye-outline';
  }
}

function switchToSignUp() {
  modernAuthManager.switchToSignUp();
}

function switchToSignIn() {
  modernAuthManager.switchToSignIn();
}

function handleGoogleSignIn() {
  window.location.href = 'http://localhost:5000/api/auth/google';
}

function switchToForgot() {
  modernAuthManager.switchToForgot();
}

function closeModal() {
  modernAuthManager.closeModal();
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
`;
document.head.appendChild(style);

// Initialize auth manager
let modernAuthManager;
document.addEventListener('DOMContentLoaded', () => {
  modernAuthManager = new ModernAuthManager();
});