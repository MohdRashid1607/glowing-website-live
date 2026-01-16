// Knowledge base for the Glowing Skincare chatbot
// This contains information about the website, products, and services

const chatbotKnowledge = {
  businessInfo: {
    name: "Glowing",
    tagline: "Reveal The Beauty of Skin",
    description: "Premium skincare e-commerce platform offering clean, non-toxic skincare products designed for everyone.",
    owner: "Muhammad Abdul Rashid",
    location: "UAE",
    currency: "AED",
    freeShipping: "Free shipping on all UAE orders AED 50+"
  },

  productCategories: [
    {
      name: "Facial Cleansers",
      description: "Gentle cleansers that remove impurities while maintaining skin's natural moisture balance",
      priceRange: "AED 29.00 - AED 39.00"
    },
    {
      name: "Serums",
      description: "Concentrated formulas with active ingredients for targeted skin concerns",
      featured: "Bio-shroom Rejuvenating Serum",
      priceRange: "AED 29.00+"
    },
    {
      name: "Eye Creams",
      description: "Specialized treatments for the delicate eye area",
      featured: "Coffee Bean Caffeine Eye Cream",
      priceRange: "AED 29.00 - AED 39.00"
    },
    {
      name: "Moisturizers",
      description: "Hydrating formulas to lock in moisture and protect skin",
      priceRange: "AED 29.00+"
    }
  ],

  collections: [
    {
      name: "Summer Collection",
      description: "Lightweight, refreshing skincare perfect for warm weather",
      startingPrice: "AED 17.99"
    },
    {
      name: "What's New",
      description: "Latest arrivals and trending products to get the glow",
      tagline: "Get the glow"
    },
    {
      name: "Buy 1 Get 1",
      description: "Special promotional offers on selected products",
      startingPrice: "AED 7.99"
    }
  ],

  featuredProducts: [
    {
      name: "Facial Cleanser",
      price: "AED 29.00",
      originalPrice: "AED 39.00",
      discount: "20% off",
      rating: 5,
      reviews: 5170,
      benefits: "Deep cleansing, gentle formula, suitable for all skin types"
    },
    {
      name: "Bio-shroom Rejuvenating Serum",
      price: "AED 29.00",
      rating: 5,
      reviews: 5170,
      benefits: "Anti-aging, rejuvenating, mushroom-based formula, boosts skin radiance"
    },
    {
      name: "Coffee Bean Caffeine Eye Cream",
      price: "AED 29.00",
      originalPrice: "AED 39.00",
      discount: "20% off",
      rating: 5,
      reviews: 5170,
      benefits: "Reduces dark circles, de-puffs, energizes tired eyes, caffeine-infused"
    }
  ],

  priceRanges: {
    budget: "Under AED 25",
    midRange: "AED 25 - AED 50",
    premium: "AED 50+",
    startingPrice: "Starting at AED 7.99"
  },

  features: [
    "Clean, non-toxic ingredients",
    "Products designed for everyone",
    "Free shipping on orders AED 50+",
    "Highly rated products (5-star reviews)",
    "Premium skincare collection",
    "Natural beauty solutions",
    "Organic and sustainable products",
    "Cruelty-free formulations"
  ],

  pages: [
    {
      name: "Home",
      description: "Main landing page with hero banners, featured collections, and bestsellers"
    },
    {
      name: "Shop",
      description: "Browse all available skincare products with filtering options"
    },
    {
      name: "Collection",
      description: "Curated product collections including Summer Collection and promotional offers"
    },
    {
      name: "About",
      description: "Learn about Glowing's mission and commitment to clean skincare"
    },
    {
      name: "Blog",
      description: "Skincare tips, tutorials, and beauty advice"
    },
    {
      name: "Contact",
      description: "Get in touch with customer support"
    }
  ],

  customerFeatures: [
    "User authentication (Email/Password and Google OAuth)",
    "Personal dashboard to manage profile and orders",
    "Wishlist functionality to save favorite products",
    "Shopping cart with real-time updates",
    "Secure checkout process",
    "Order tracking and history",
    "Recently viewed products"
  ],

  shippingAndPayment: {
    shipping: "Free shipping on all UAE orders AED 50+",
    paymentMethods: ["Cash on Delivery (COD)", "PayPal"],
    deliveryArea: "UAE"
  },

  commonQuestions: [
    {
      question: "What makes Glowing products special?",
      answer: "Our products are made using clean, non-toxic ingredients and are designed for everyone. We focus on premium quality, natural ingredients, and sustainable practices."
    },
    {
      question: "Do you offer free shipping?",
      answer: "Yes! We offer free shipping on all UAE orders over AED 50."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Cash on Delivery (COD) and PayPal for your convenience."
    },
    {
      question: "How can I track my order?",
      answer: "Once logged in, you can view your order history and track your orders from your personal dashboard."
    },
    {
      question: "Can I save products for later?",
      answer: "Absolutely! Use our wishlist feature to save your favorite products for future purchase."
    },
    {
      question: "What's your return policy?",
      answer: "We want you to be completely satisfied with your purchase. Please contact our customer support for return and exchange inquiries."
    },
    {
      question: "Are your products cruelty-free?",
      answer: "Yes, all our products are cruelty-free and made with ethical, sustainable practices."
    }
  ],

  skincareTips: [
    "Always cleanse your face before applying serums or moisturizers",
    "Use eye cream by gently patting around the eye area, never rubbing",
    "Apply products from thinnest to thickest consistency",
    "Don't forget to apply sunscreen during the day",
    "Stay hydrated for healthy, glowing skin",
    "Be consistent with your skincare routine for best results"
  ]
};

module.exports = chatbotKnowledge;
