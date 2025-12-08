// Collection page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeCollectionPage();
    handleURLParams();
});

// Collection data
const collections = [
    {
        id: 1,
        name: "Summer Glow Collection",
        category: "seasonal",
        description: "Light, refreshing products perfect for summer skincare routine",
        image: "./assets/images/collection-1.jpg",
        productCount: 8,
        priceRange: "$15 - $45",
        featured: true,
        products: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    {
        id: 2,
        name: "Anti-Aging Essentials",
        category: "skincare",
        description: "Powerful formulas to reduce signs of aging and restore youthful skin",
        image: "./assets/images/collection-2.jpg",
        productCount: 6,
        priceRange: "$25 - $65",
        featured: true,
        products: [2, 5, 9, 11, 3, 6]
    },
    {
        id: 3,
        name: "Hydration Heroes",
        category: "skincare",
        description: "Deep moisturizing products for dry and dehydrated skin",
        image: "./assets/images/collection-3.jpg",
        productCount: 7,
        priceRange: "$18 - $55",
        featured: true,
        products: [1, 4, 8, 10, 2, 6, 12]
    },
    {
        id: 4,
        name: "Sensitive Skin Solutions",
        category: "skincare",
        description: "Gentle, hypoallergenic products for sensitive and reactive skin",
        image: "./assets/images/banner-1.jpg",
        productCount: 5,
        priceRange: "$20 - $40",
        featured: false,
        products: [4, 8, 10, 12, 6]
    },
    {
        id: 5,
        name: "Autumn Renewal",
        category: "seasonal",
        description: "Rich, nourishing products to prepare your skin for cooler weather",
        image: "./assets/images/banner-2.jpg",
        productCount: 6,
        priceRange: "$22 - $50",
        featured: false,
        products: [5, 9, 11, 1, 3, 7]
    },
    {
        id: 6,
        name: "Buy 1 Get 1 Special",
        category: "special",
        description: "Amazing deals on our bestselling products - limited time offer",
        image: "./assets/images/offer-banner-1.jpg",
        productCount: 4,
        priceRange: "$15 - $35",
        featured: false,
        products: [1, 5, 7, 11]
    },
    {
        id: 7,
        name: "Eye Care Essentials",
        category: "skincare",
        description: "Specialized treatments for the delicate eye area",
        image: "./assets/images/product-03.jpg",
        productCount: 3,
        priceRange: "$25 - $45",
        featured: false,
        products: [3, 11, 9]
    },
    {
        id: 8,
        name: "Daily Basics",
        category: "skincare",
        description: "Essential everyday products for a simple, effective routine",
        image: "./assets/images/product-04.jpg",
        productCount: 5,
        priceRange: "$12 - $30",
        featured: false,
        products: [4, 8, 12, 6, 2]
    }
];

let currentFilter = 'all';
let currentCollection = null;

function initializeCollectionPage() {
    loadFeaturedCollections();
    loadAllCollections();
    setupFilterTabs();
}

function loadFeaturedCollections() {
    const featuredContainer = document.getElementById('featuredCollections');
    if (!featuredContainer) return;

    const featuredCollections = collections.filter(collection => collection.featured);
    
    featuredContainer.innerHTML = featuredCollections.map(collection => `
        <div class="collection-card" onclick="viewCollection(${collection.id})">
            <img src="${collection.image}" alt="${collection.name}" class="card-image">
            <div class="card-overlay">
                <div class="card-category">${collection.category}</div>
                <h3 class="card-title">${collection.name}</h3>
                <p class="card-description">${collection.description}</p>
                <div class="card-meta">
                    <div class="product-count">
                        <ion-icon name="cube-outline"></ion-icon>
                        <span>${collection.productCount} Products</span>
                    </div>
                    <div class="price-range">${collection.priceRange}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function loadAllCollections() {
    const allContainer = document.getElementById('allCollections');
    if (!allContainer) return;

    let filteredCollections = collections;
    
    if (currentFilter !== 'all') {
        filteredCollections = collections.filter(collection => 
            collection.category === currentFilter
        );
    }

    if (filteredCollections.length === 0) {
        allContainer.innerHTML = `
            <div class="empty-state">
                <h3>No collections found</h3>
                <p>Try selecting a different category or browse all collections.</p>
                <button class="btn btn-primary" onclick="setFilter('all')">View All Collections</button>
            </div>
        `;
        return;
    }

    allContainer.innerHTML = filteredCollections.map(collection => `
        <div class="collection-item" onclick="viewCollection(${collection.id})">
            <img src="${collection.image}" alt="${collection.name}" class="item-image">
            <div class="item-content">
                <div class="item-category">${collection.category}</div>
                <h3 class="item-title">${collection.name}</h3>
                <p class="item-description">${collection.description}</p>
                <div class="item-meta">
                    <div class="item-count">
                        <ion-icon name="cube-outline"></ion-icon>
                        <span>${collection.productCount} items</span>
                    </div>
                    <div class="item-price">${collection.priceRange}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function setupFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            setFilter(filter);
        });
    });
}

function setFilter(filter) {
    currentFilter = filter;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-filter') === filter) {
            tab.classList.add('active');
        }
    });
    
    // Reload collections
    loadAllCollections();
}

function viewCollection(collectionId) {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    currentCollection = collection;
    
    // Hide collections sections
    document.querySelector('.featured-collections').style.display = 'none';
    document.querySelector('.all-collections').style.display = 'none';
    
    // Show collection products section
    const productsSection = document.getElementById('collectionProducts');
    productsSection.style.display = 'block';
    
    // Update collection header
    document.getElementById('collectionTitle').textContent = collection.name;
    document.getElementById('collectionDescription').textContent = collection.description;
    
    // Load collection products
    loadCollectionProducts(collection);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('collection', collectionId);
    window.history.pushState({}, '', url);
}

function loadCollectionProducts(collection) {
    const productsGrid = document.getElementById('collectionProductsGrid');
    if (!productsGrid) return;

    // Show loading state
    productsGrid.innerHTML = '<div class="loading">Loading products...</div>';

    // Simulate loading delay
    setTimeout(() => {
        const collectionProducts = products.filter(product => 
            collection.products.includes(product.id)
        );

        if (collectionProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <h3>No products found</h3>
                    <p>This collection is currently empty or products are being updated.</p>
                    <button class="btn btn-primary" onclick="goBackToCollections()">Browse Other Collections</button>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = collectionProducts.map(product => `
            <div class="shop-card">
                <div class="card-banner img-holder" style="--width: 540; --height: 720;">
                    <img src="${product.image}" width="540" height="720" loading="lazy" alt="${product.name}" class="img-cover">
                    
                    ${product.originalPrice ? `<span class="badge" aria-label="discount">-${Math.round((1 - product.price / product.originalPrice) * 100)}%</span>` : ''}
                    
                    <div class="card-actions">
                        <button class="action-btn" aria-label="add to cart" onclick="addToCart(${product.id})">
                            <ion-icon name="bag-handle-outline" aria-hidden="true"></ion-icon>
                        </button>
                        
                        <button class="action-btn" aria-label="add to wishlist" onclick="addToWishlist(${product.id})">
                            <ion-icon name="star-outline" aria-hidden="true"></ion-icon>
                        </button>
                        
                        <button class="action-btn" aria-label="compare">
                            <ion-icon name="repeat-outline" aria-hidden="true"></ion-icon>
                        </button>
                    </div>
                </div>
                
                <div class="card-content">
                    <div class="price">
                        ${product.originalPrice ? `<del class="del">$${product.originalPrice.toFixed(2)}</del>` : ''}
                        <span class="span">$${product.price.toFixed(2)}</span>
                    </div>
                    
                    <h3>
                        <a href="product.html?id=${product.id}" class="card-title">${product.name}</a>
                    </h3>
                    
                    <div class="card-rating">
                        <div class="rating-wrapper" aria-label="${product.rating} star rating">
                            ${generateStars(product.rating)}
                        </div>
                        <p class="rating-text">${product.reviews} reviews</p>
                    </div>
                </div>
            </div>
        `).join('');
    }, 500);
}

function goBackToCollections() {
    // Show collections sections
    document.querySelector('.featured-collections').style.display = 'block';
    document.querySelector('.all-collections').style.display = 'block';
    
    // Hide collection products section
    document.getElementById('collectionProducts').style.display = 'none';
    
    currentCollection = null;
    
    // Update URL
    const url = new URL(window.location);
    url.searchParams.delete('collection');
    window.history.pushState({}, '', url);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const collectionId = urlParams.get('collection');
    const category = urlParams.get('category');
    
    if (collectionId) {
        // View specific collection
        setTimeout(() => {
            viewCollection(parseInt(collectionId));
        }, 100);
    } else if (category) {
        // Filter by category
        setFilter(category);
    }
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<ion-icon name="star" aria-hidden="true"></ion-icon>';
    }
    
    if (hasHalfStar) {
        starsHTML += '<ion-icon name="star-half" aria-hidden="true"></ion-icon>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<ion-icon name="star-outline" aria-hidden="true"></ion-icon>';
    }
    
    return starsHTML;
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
    handleURLParams();
});