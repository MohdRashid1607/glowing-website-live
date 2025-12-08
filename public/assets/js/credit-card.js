// =========================================================================
// CREDIT CARD ANIMATION LOGIC (Your existing 400+ lines of code)
// =========================================================================

class CreditCardAnimation {
    constructor() {
        this.card = document.getElementById('credit-card');
        this.cardNumberInput = document.getElementById('cardNumber');
        this.expiryDateInput = document.getElementById('expiryDate');
        this.cvvInput = document.getElementById('cvv');
        this.cardNameInput = document.getElementById('cardName');
        
        // Display elements
        this.cardDisplayNumber = document.getElementById('card-display-number');
        this.cardDisplayName = document.getElementById('card-display-name');
        this.cardDisplayExpiry = document.getElementById('card-display-expiry');
        this.cardDisplayCvv = document.getElementById('card-display-cvv');
        this.cardBrand = document.getElementById('card-brand');
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.addFlipButton();
        this.addSecurityFeatures();
        // Call initial update to set default states
        this.updateCardDisplay(); 
        this.detectCardType();
    }

    // --- (Your bindEvents, formatCardNumber, formatExpiryDate, 
    // formatCvv, updateCardDisplay, detectCardType, addBrandAnimation, 
    // flipCard, focusOnCard, removeFocusEffects, addTypingAnimation, 
    // addFlipButton, addSecurityFeatures methods are here) ---
    bindEvents() { /* ... your original code ... */ }
    formatCardNumber(e) { /* ... your original code ... */ }
    formatExpiryDate(e) { /* ... your original code ... */ }
    formatCvv(e) { /* ... your original code ... */ }
    updateCardDisplay() { /* ... your original code ... */ }
    detectCardType() { /* ... your original code ... */ }
    addBrandAnimation(cardType) { /* ... your original code ... */ }
    flipCard(toBack = true) { /* ... your original code ... */ }
    focusOnCard(field) { /* ... your original code ... */ }
    removeFocusEffects() { /* ... your original code ... */ }
    addTypingAnimation(element) { /* ... your original code ... */ }
    addFlipButton() { /* ... your original code ... */ }
    addSecurityFeatures() { /* ... your original code ... */ }

    // --- VALIDATION & PAYMENT SIMULATION METHODS ---
    validateCard() { /* ... your original validation code ... */ }
    validateCardNumber() { /* ... your original code ... */ }
    validateExpiryDate() { /* ... your original code ... */ }
    validateCvv() { /* ... your original code ... */ }
    validateCardName() { /* ... your original code ... */ }
    luhnCheck(cardNumber) { /* ... your original code ... */ }
    showValidationState(state) { /* ... your original code ... */ }

    // The core method that simulates the payment process
    processPayment() {
        return new Promise((resolve, reject) => {
            this.showValidationState('processing');

            // Simulate payment processing
            setTimeout(() => {
                if (this.validateCard()) {
                    this.showValidationState('valid');
                    resolve({ success: true, message: 'Payment processed successfully' });
                } else {
                    this.showValidationState('invalid');
                    reject({ success: false, message: 'Invalid card details' });
                }
            }, 2000);
        });
    }

    reset() { /* ... your original code ... */ }
}

// =========================================================================
// GLOBAL VALIDATION WRAPPER
// Used by the payment handler to trigger the card validation
// =========================================================================

function validateCreditCardForm() {
    // This function will now rely on the globally accessible 'window.cardAnimation'
    if (window.cardAnimation && typeof window.cardAnimation.validateCard === 'function') {
        return window.cardAnimation.validateCard();
    }
    console.error('ERROR: CreditCardAnimation instance not found for validation.');
    return false;
}

// =========================================================================
// PAYMENT HANDLING LOGIC (THE FIX FOR EMAIL SENDING)
// =========================================================================

class CreditCardPaymentHandler {
    constructor() {
        this.paymentForm = document.getElementById('payment-form');
        this.submitButton = this.paymentForm?.querySelector('button[type="submit"]');

        if (this.paymentForm) {
            this.paymentForm.addEventListener('submit', this.handlePaymentSubmission.bind(this));
        }
    }
    
    showSuccessMessage(orderNum) {
        // Find the element where you want to show the message (e.g., above the form)
        const formContainer = document.querySelector('.form');
        if (!formContainer) return;

        let successEl = document.getElementById('payment-success-message');
        if (!successEl) {
            successEl = document.createElement('div');
            successEl.id = 'payment-success-message';
            successEl.style.padding = '20px';
            successEl.style.color = '#28a745';
            successEl.style.textAlign = 'center';
            successEl.style.fontSize = '1.2em';
            formContainer.parentElement.insertBefore(successEl, formContainer);
            this.paymentForm.style.display = 'none'; // Hide form on success
        }
        successEl.textContent = `Payment Successful! Your Order #${orderNum} is confirmed. Redirecting...`;
    }

    async handlePaymentSubmission(e) {
        e.preventDefault();

        // Check if the required animation instance and validation function exist
        if (!window.cardAnimation || typeof completeOrder !== 'function') {
             console.error('FATAL ERROR: Dependencies (cardAnimation or completeOrder) are missing.');
             alert('A critical error occurred. Please check the console and script loading order.');
             return;
        }

        // 1. Validate card using the wrapper function
        if (!validateCreditCardForm()) {
            alert('Please correct the payment details.');
            return;
        }

        try {
            // 2. Start the payment simulation using the Animation class method
            if (this.submitButton) {
                this.submitButton.textContent = 'Processing...';
                this.submitButton.disabled = true;
            }

            const result = await window.cardAnimation.processPayment();
            
            if (result.success) {
                // 3. THE CRITICAL STEP: FINALIZING THE ORDER AND SENDING EMAIL
                const orderNum = completeOrder('Credit Card');
                
                // Show final success message and trigger redirect
                this.showSuccessMessage(orderNum);
                console.log(`✅ Order finalization triggered for Order #${orderNum}. Email sent.`);

            }
        } catch (error) {
            console.error('Payment Simulation Failed:', error.message);
            alert(`Payment Failed: ${error.message}`);
            
            // Reset button and state
            if (this.submitButton) {
                this.submitButton.textContent = 'Pay Now';
                this.submitButton.disabled = false;
            }
            window.cardAnimation.showValidationState('invalid');
        }
    }
}


// =========================================================================
// GLOBAL INITIALIZATION BLOCK (The correct end of credit-card.js)
// =========================================================================

// Add CSS animations (Keeping your original CSS logic)
const style = document.createElement('style');
style.textContent = `
  @keyframes brand-glow {
    0% { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); }
    50% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.3); }
    100% { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); }
  }
`;
document.head.appendChild(style);


// CORRECTED INITIALIZATION
// Define the variable globally on the window object to avoid redeclaration issues.
window.cardAnimation; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize the CreditCardAnimation
    window.cardAnimation = new CreditCardAnimation();

    // 2. Initialize the Payment Handler
    new CreditCardPaymentHandler();
});