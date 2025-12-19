class OrderManager {
    constructor() {
        this.initializeOnLoad();
    }

    initializeOnLoad() {
        document.addEventListener('DOMContentLoaded', () => {
            this.debugPaymentPageLoad();
        });
    }

    /**
     * Debug function to check data availability on payment page load
     */
    debugPaymentPageLoad() {
        console.log('=== PAYMENT PAGE LOADED ===');
        
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        console.log('📦 Cart items:', cart.length);
        
        const checkoutData = JSON.parse(localStorage.getItem('checkoutData')) || {};
        console.log('💤 Checkout data:', checkoutData);
        
        if (!checkoutData.customerName || checkoutData.customerName === 'Guest User') {
            console.error('⚠️ WARNING: No customer name found!');
            console.log('Checkout data keys:', Object.keys(checkoutData));
        } else {
            console.log('✅ Customer name:', checkoutData.customerName);
        }
        
        if (cart.length === 0) {
            console.error('⚠️ WARNING: Cart is empty! Redirecting...');
            alert('Your cart is empty. Please add items first.');
            window.location.href = 'shop.html';
        }
    }

    /**
     * Main function to save order to admin panel
     * @param {string} paymentMethod - The payment method used
     * @returns {object|null} - The created order object or null if failed
     */
    saveOrder(paymentMethod) {
        console.log('💾 === SAVING ORDER ===');
        console.log('Payment method:', paymentMethod);
        
        // 1. Get cart
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        console.log('📦 Cart items:', cart.length);
        
        if (cart.length === 0) {
            console.error('❌ Cart is empty!');
            alert('Error: Cart is empty. Cannot create order.');
            return null;
        }

        // 2. Get checkout data
        const checkoutData = JSON.parse(localStorage.getItem('checkoutData')) || {};
        console.log('📋 Checkout data:', checkoutData);
        console.log('👤 Customer name:', checkoutData.customerName);
        
        // 3. Validate customer name
        if (!checkoutData.customerName || checkoutData.customerName === 'undefined undefined' || checkoutData.customerName === 'Guest User') {
            console.error('❌ No valid customer name!');
            
            // Fallback: Ask for name
            const name = prompt('Please enter your name for the order:');
            if (name && name.trim()) {
                checkoutData.customerName = name.trim();
                checkoutData.customerEmail = checkoutData.customerEmail || 'guest@example.com';
            } else {
                console.error('❌ No name provided!');
                alert('Customer name is required to complete the order.');
                return null;
            }
        }
        
        // 4. Calculate totals
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        
        const shipping = subtotal > 55 ? 0 : 15;
        const tax = subtotal * 0.05;
        const total = subtotal + shipping + tax;

        // 5. Create order object
        const order = {
            id: Date.now(),
            customerName: checkoutData.customerName,
            customerEmail: checkoutData.customerEmail || 'guest@example.com',
            customerPhone: checkoutData.customerPhone || 'N/A',
            shippingAddress: checkoutData.shippingAddress || 'N/A',
            paymentMethod: paymentMethod,
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            subtotal: subtotal,
            shipping: shipping,
            tax: tax,
            total: total,
            status: 'pending',
            date: new Date().toISOString()
        };

        console.log('📦 Order created:', order);
        console.log('👤 Final customer:', order.customerName, '/', order.customerEmail);

        // 6. Save to localStorage (BOTH keys for backwards compatibility)
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        let adminOrders = JSON.parse(localStorage.getItem('adminOrders')) || [];

        orders.push(order);
        adminOrders.push(order);

        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.setItem('adminOrders', JSON.stringify(adminOrders));

        console.log('✅ Order saved to both keys');
        console.log('📊 Total orders:', orders.length);

        // 7. Note: User already added during checkout
        console.log('ℹ️ User already added during checkout, skipping duplicate');

        console.log('✅ === ORDER SAVE COMPLETE ===');
        return order;
    }

    /**
     * Clear cart and checkout data after successful order
     */
    clearCartData() {
        localStorage.removeItem('cart');
        localStorage.removeItem('checkoutData');
        console.log('🗑️ Cart and checkout data cleared');
    }

    /**
     * Get order summary for current cart
     * @returns {object} - Object with subtotal, shipping, tax, and total
     */
    getOrderSummary() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            return null;
        }

        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });

        const shipping = subtotal > 55 ? 0 : 15;
        const tax = subtotal * 0.05;
        const total = subtotal + shipping + tax;

        return { subtotal, shipping, tax, total };
    }

    /**
     * Display order summary on payment page
     * @param {object} elementIds - Object with element IDs for subtotal, shipping, tax, total
     */
    displayOrderSummary(elementIds = {}) {
        const defaults = {
            subtotal: 'subtotal',
            shipping: 'shipping',
            tax: 'tax',
            total: 'total'
        };

        const ids = { ...defaults, ...elementIds };
        const summary = this.getOrderSummary();

        if (!summary) {
            console.error('❌ No cart items to display');
            window.location.href = 'checkout.html';
            return null;
        }

        const subtotalEl = document.getElementById(ids.subtotal);
        const shippingEl = document.getElementById(ids.shipping);
        const taxEl = document.getElementById(ids.tax);
        const totalEl = document.getElementById(ids.total);

        if (subtotalEl) subtotalEl.textContent = `AED ${summary.subtotal.toFixed(2)}`;
        if (shippingEl) shippingEl.textContent = summary.shipping === 0 ? 'FREE' : `AED ${summary.shipping.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `AED ${summary.tax.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `AED ${summary.total.toFixed(2)}`;

        return summary;
    }

    /**
     * Debug function to check user count
     */
    debugUserCount() {
        const users = JSON.parse(localStorage.getItem('adminUsers')) || [];
        console.log('🔍 DEBUG - Current users in localStorage:', users.length);
        users.forEach((u, i) => {
            console.log(`  ${i+1}. ${u.name} (${u.email})`);
        });
    }
}

// Create global instance
const orderManager = new OrderManager();

/**
 * Legacy function names for backwards compatibility
 * These call the new OrderManager methods
 */
function saveOrderToAdmin(paymentMethod) {
    return orderManager.saveOrder(paymentMethod);
}

function loadOrderSummary() {
    return orderManager.displayOrderSummary();
}

function debugUserCount() {
    orderManager.debugUserCount();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OrderManager, orderManager };
}