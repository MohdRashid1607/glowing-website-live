/**
 * shop.js
 * * Contains logic for:
 * 1. Quick View Modal functionality
 * 2. Shop Sidebar Filters toggle
 * 3. Shopping Cart Panel functionality (Separate from main cart in script.js)
 * 4. Interacting with the global CartSystem (defined in script.js)
 */

'use strict';

/**
 * UTILITY FUNCTIONS (Copied from script.js for local use)
 */
const addEventOnElem = function (elem, type, callback) {
    if (elem.length > 1) {
        for (let i = 0; i < elem.length; i++) {
            elem[i].addEventListener(type, callback);
        }
    } else {
        elem.addEventListener(type, callback);
    }
}

// Ensure the CartSystem instance is available
// It is expected that window.cartSystem is initialized in script.js
let cartSystem;

document.addEventListener('DOMContentLoaded', () => {
    // Wait until main script has executed and assigned cartSystem
    if (window.cartSystem) {
        cartSystem = window.cartSystem;
        setupQuickViewModal();
        setupShopSidebar();
        setupShopCartPanel();
        setupProductCards();
    } else {
        console.error('CartSystem not initialized. Check if script.js loaded correctly.');
    }
});


/*-----------------------------------*\
  #SHOP SIDEBAR FILTERS
\*-----------------------------------*/

const shopFilters = document.querySelector('[data-shop-filters]');
const filterToggler = document.querySelector('[data-filter-toggler]');

const setupShopSidebar = function () {
    if (filterToggler && shopFilters) {
        filterToggler.addEventListener('click', () => {
            shopFilters.classList.toggle('active');
        });
    }

    // Price Range Slider Logic
    const priceRangeInput = document.getElementById('priceRange');
    const currentPriceDisplay = document.getElementById('currentPrice');

    if (priceRangeInput && currentPriceDisplay) {
        currentPriceDisplay.textContent = priceRangeInput.value;
        priceRangeInput.addEventListener('input', (event) => {
            currentPriceDisplay.textContent = event.target.value;
        });
    }
}


/*-----------------------------------*\
  #QUICK VIEW MODAL
\*-----------------------------------*/

const modalContainer = document.querySelector('[data-modal-container]');
const modalOverlay = document.querySelector('[data-modal-overlay]');
const modalCloseBtn = document.querySelector('[data-modal-close-btn]');
const qvBtns = document.querySelectorAll('[data-quick-view-btn]');

const qvImage = document.querySelector('[data-qv-image]');
const qvTitle = document.querySelector('[data-qv-title]');
const qvPrice = document.querySelector('[data-qv-price]');
const qvSku = document.querySelector('[data-qv-sku]');
const qvQtyInput = document.querySelector('[data-qv-qty-input]');
const qvAddBtn = document.querySelector('[data-qv-add-to-cart]');

const qtyIncrementBtn = document.querySelector('[data-qty-increment]');
const qtyDecrementBtn = document.querySelector('[data-qty-decrement]');

let currentProduct = null;

const toggleModal = function () {
    modalContainer.classList.toggle('active');
    document.body.classList.toggle('active');
}

const setupQuickViewModal = function () {
    if (modalCloseBtn && modalOverlay) {
        addEventOnElem([modalCloseBtn, modalOverlay], 'click', toggleModal);
    }

    // Populate and open modal when QV button is clicked
    addEventOnElem(qvBtns, 'click', function () {
        const productCard = this.closest('.product-card');
        if (!productCard) return;

        // Get product data
        currentProduct = {
            id: productCard.dataset.productId,
            name: productCard.dataset.productName,
            price: parseFloat(productCard.dataset.productPrice),
            img: productCard.dataset.productImg,
        };

        // Update modal content
        qvImage.src = currentProduct.img;
        qvTitle.textContent = currentProduct.name;
        qvPrice.textContent = `AED ${currentProduct.price.toFixed(2)}`;
        qvSku.textContent = currentProduct.id;
        qvQtyInput.value = 1; // Reset quantity

        toggleModal();
    });

    // Quantity controls
    if (qtyIncrementBtn && qtyDecrementBtn) {
        qtyIncrementBtn.addEventListener('click', () => {
            qvQtyInput.value = parseInt(qvQtyInput.value) + 1;
            if (qvQtyInput.value > 99) qvQtyInput.value = 99;
        });

        qtyDecrementBtn.addEventListener('click', () => {
            qvQtyInput.value = parseInt(qvQtyInput.value) - 1;
            if (qvQtyInput.value < 1) qvQtyInput.value = 1;
        });
    }

    // Quick View Add to Cart
    if (qvAddBtn) {
        qvAddBtn.addEventListener('click', () => {
            if (currentProduct && cartSystem) {
                const quantity = parseInt(qvQtyInput.value);
                cartSystem.addItem({
                    ...currentProduct,
                    quantity: quantity
                });
                toggleModal(); // Close modal after adding
                // Open shop cart panel for immediate feedback
                shopCartPanel.classList.add('active');
                document.body.classList.add('active');
            }
        });
    }
}

/*-----------------------------------*\
  #SHOPPING CART PANEL
\*-----------------------------------*/

const shopCartPanel = document.querySelector('[data-shop-cart-panel]');
const shopCartToggler = document.querySelector('[data-shop-cart-toggler]');
const shopCartOverlay = document.querySelector('[data-shop-cart-overlay]');
const shopCartBadge = document.querySelector('[data-shop-cart-badge]');

const cartList = document.querySelector('[data-cart-list]');
const cartSubtotal = document.querySelector('[data-cart-subtotal]');
const cartEmptyMessage = document.querySelector('[data-cart-empty-message]');
const checkoutBtn = document.querySelector('[data-checkout-btn]');

const setupShopCartPanel = function () {
    // 1. Toggler/Overlay setup
    addEventOnElem([shopCartToggler, shopCartOverlay], 'click', () => {
        shopCartPanel.classList.toggle('active');
        document.body.classList.toggle('active');
    });

    // 2. Override the cart display method in CartSystem to use shop panel
    // This allows the main cart logic (in script.js) to update this specific display
    if (cartSystem) {
        cartSystem.updateShopCartDisplay = function () {
            const cart = this.cart;
            let totalItems = 0;
            let subtotal = 0;

            cartList.innerHTML = '';

            if (cart.length === 0) {
                cartEmptyMessage.classList.add('active');
                checkoutBtn.disabled = true;
            } else {
                cartEmptyMessage.classList.remove('active');
                checkoutBtn.disabled = false;

                cart.forEach(item => {
                    totalItems += item.quantity;
                    subtotal += item.price * item.quantity;

                    const cartItemHTML = `
                        <li class="cart-item" data-item-id="${item.id}">
                            <figure class="cart-item-banner">
                                <img src="${item.img}" width="80" height="80" alt="${item.name}" class="img-cover">
                            </figure>
                            <div class="cart-item-details">
                                <h4 class="cart-item-title">${item.name}</h4>
                                <p class="cart-item-price">AED ${(item.price * item.quantity).toFixed(2)}</p>
                                <p class="cart-item-qty">Qty: <span>${item.quantity}</span></p>
                            </div>
                            <button class="cart-remove-btn" data-remove-item="${item.id}">
                                <ion-icon name="trash-outline"></ion-icon>
                            </button>
                        </li>
                    `;
                    cartList.insertAdjacentHTML('beforeend', cartItemHTML);
                });
            }

            // Update badge and subtotal
            if (shopCartBadge) shopCartBadge.textContent = totalItems;
            cartSubtotal.textContent = `AED ${subtotal.toFixed(2)}`;

            // Re-attach listeners for dynamically added remove buttons
            cartList.querySelectorAll('[data-remove-item]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemId = e.currentTarget.dataset.removeItem;
                    this.removeItem(itemId);
                });
            });
        };

        // Initial load
        cartSystem.updateShopCartDisplay();
    }
}


/*-----------------------------------*\
  #PRODUCT CARD ADD TO CART
\*-----------------------------------*/

const setupProductCards = function () {
    const addToCartBtns = document.querySelectorAll('[data-add-to-cart]');

    addEventOnElem(addToCartBtns, 'click', function () {
        const productCard = this.closest('.product-card');
        if (!productCard || !cartSystem) return;

        const product = {
            id: productCard.dataset.productId,
            name: productCard.dataset.productName,
            price: parseFloat(productCard.dataset.productPrice),
            img: productCard.dataset.productImg,
            quantity: 1 // Default to 1 when clicking "Add to Cart" button
        };

        cartSystem.addItem(product);

        // Add temporary bounce animation to the cart button
        if (shopCartToggler) {
            shopCartToggler.classList.add('bounce-animation');
            setTimeout(() => {
                shopCartToggler.classList.remove('bounce-animation');
            }, 1000); // Animation duration
        }
    });
}