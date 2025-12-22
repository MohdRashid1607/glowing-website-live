const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

// Load env vars
dotenv.config();

const products = [
    {
        name: "Morning Dew Cleanser",
        description: "A gentle milky cleanser that removes impurities while keeping your skin hydrated.",
        price: 85.00,
        category: "Cleansers",
        image: {
            public_id: "seed/cleanser_1",
            url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000&auto=format&fit=crop"
        },
        images: [
            {
                public_id: "seed/cleanser_1_alt",
                url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000&auto=format&fit=crop"
            }
        ],
        stock: 50,
        ratings: 4.8
    },
    {
        name: "Midnight Recovery Serum",
        description: "An intensive night serum that repairs skin barrier and reduces fine lines.",
        price: 145.00,
        category: "Serums",
        image: {
            public_id: "seed/serum_1",
            url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop"
        },
        images: [
            {
                public_id: "seed/serum_1_alt",
                url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop"
            }
        ],
        stock: 30,
        ratings: 4.9
    },
    {
        name: "Velvet Cloud Moisturizer",
        description: "A lightweight whipped cream that provides 24-hour moisture lock.",
        price: 110.00,
        category: "Moisturizers",
        image: {
            public_id: "seed/moisturizer_1",
            url: "https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?q=80&w=1000&auto=format&fit=crop"
        },
        images: [
            {
                public_id: "seed/moisturizer_1_alt",
                url: "https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?q=80&w=1000&auto=format&fit=crop"
            }
        ],
        stock: 45,
        ratings: 4.7
    },
    {
        name: "Glow Ritual Mask",
        description: "Exfoliating enzyme mask for an instant salon-like glow.",
        price: 95.00,
        category: "Masks",
        image: {
            public_id: "seed/mask_1",
            url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop"
        },
        images: [
            {
                public_id: "seed/mask_1_alt",
                url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop"
            }
        ],
        stock: 25,
        ratings: 4.6
    },
    {
        name: "Invisible Shield SPF 50",
        description: "Ultra-lightweight sunscreen that leaves zero white cast.",
        price: 75.00,
        category: "Sunscreen",
        image: {
            public_id: "seed/sunscreen_1",
            url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1000&auto=format&fit=crop"
        },
        images: [
            {
                public_id: "seed/sunscreen_1_alt",
                url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1000&auto=format&fit=crop"
            }
        ],
        stock: 100,
        ratings: 4.9
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB for seeding...');

        // 1. Ensure an Admin user exists
        let admin = await User.findOne({ role: 'admin' });

        if (!admin) {
            console.log('No admin found, creating a default admin...');
            admin = await User.create({
                name: 'System Admin',
                email: 'admin@glowing.com',
                password: 'password123', // This will be hashed by the pre-save hook
                role: 'admin'
            });
            console.log('Admin created: admin@glowing.com / password123');
        }

        // 2. Clear existing products
        await Product.deleteMany();
        console.log('Cleared existing products.');

        // 3. Add products with admin reference
        const productsWithAdmin = products.map(p => ({
            ...p,
            user: admin._id
        }));

        await Product.insertMany(productsWithAdmin);
        console.log(`${products.length} Products added successfully!`);

        process.exit();
    } catch (error) {
        console.error('Error seeding DB:', error);
        process.exit(1);
    }
};

seedDB();
