const { GoogleGenerativeAI } = require('@google/generative-ai');
const Conversation = require('../models/Conversation');
const chatbotKnowledge = require('../config/chatbotKnowledge');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompt that defines the chatbot's personality and knowledge
const getSystemPrompt = () => {
    return `You are a helpful and friendly customer service assistant for "Glowing", a premium skincare e-commerce website in the UAE.

BUSINESS INFORMATION:
- Business Name: ${chatbotKnowledge.businessInfo.name}
- Tagline: ${chatbotKnowledge.businessInfo.tagline}
- Description: ${chatbotKnowledge.businessInfo.description}
- Owner: ${chatbotKnowledge.businessInfo.owner}
- Location: ${chatbotKnowledge.businessInfo.location}
- Currency: ${chatbotKnowledge.businessInfo.currency}
- Free Shipping: ${chatbotKnowledge.businessInfo.freeShipping}

PRODUCT CATEGORIES:
${chatbotKnowledge.productCategories.map(cat => `- ${cat.name}: ${cat.description} (${cat.priceRange})`).join('\n')}

FEATURED PRODUCTS:
${chatbotKnowledge.featuredProducts.map(prod => `- ${prod.name}: ${prod.price}${prod.originalPrice ? ` (was ${prod.originalPrice})` : ''} - ${prod.benefits}`).join('\n')}

COLLECTIONS:
${chatbotKnowledge.collections.map(col => `- ${col.name}: ${col.description}${col.startingPrice ? ` (Starting at ${col.startingPrice})` : ''}`).join('\n')}

KEY FEATURES:
${chatbotKnowledge.features.map(f => `- ${f}`).join('\n')}

SHIPPING & PAYMENT:
- Shipping: ${chatbotKnowledge.shippingAndPayment.shipping}
- Payment Methods: ${chatbotKnowledge.shippingAndPayment.paymentMethods.join(', ')}
- Delivery Area: ${chatbotKnowledge.shippingAndPayment.deliveryArea}

WEBSITE PAGES:
${chatbotKnowledge.pages.map(p => `- ${p.name}: ${p.description}`).join('\n')}

CUSTOMER FEATURES:
${chatbotKnowledge.customerFeatures.map(f => `- ${f}`).join('\n')}

SKINCARE TIPS:
${chatbotKnowledge.skincareTips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

PERSONALITY & GUIDELINES:
- Be warm, friendly, and professional
- Use emojis occasionally to be more engaging (✨, 🌟, 💚, 🛍️, etc.)
- Keep responses concise but informative
- If asked about products not in the knowledge base, mention similar products we have
- Always encourage users to browse the shop or contact support for specific inquiries
- If users ask about orders, direct them to their dashboard
- Promote the free shipping offer when relevant
- Emphasize our clean, non-toxic ingredients and premium quality
- Be helpful with skincare advice when appropriate

Remember: You represent Glowing, a premium skincare brand committed to clean beauty and customer satisfaction.`;
};

// @desc    Send a message to the chatbot
// @route   POST /api/chatbot/message
// @access  Public
exports.sendMessage = async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message || !sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both message and sessionId'
            });
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your_gemini')) {
            return res.status(500).json({
                success: false,
                message: 'Chatbot service is not configured correctly in .env'
            });
        }

        // Handle database connection (guest mode if DB is down)
        let conversation = null;
        try {
            conversation = await Conversation.findOne({ sessionId });
        } catch (dbError) {
            console.warn('DB not connected, running in session-only mode');
        }

        // Initialize Gemini 1.5 Flash (Modern and reliable)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Build the training context
        const systemPrompt = getSystemPrompt();

        // Create the conversation structure for Gemini 1.5
        const chat = model.startChat({
            history: conversation ? conversation.messages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            })) : [],
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            },
        });

        // Send the message
        // If it's the first message, prepending the system prompt
        const finalMessage = (!conversation || conversation.messages.length === 0)
            ? `${systemPrompt}\n\nUser Message: ${message}`
            : message;

        const result = await chat.sendMessage(finalMessage);
        const response = await result.response;
        const botReply = response.text();

        // Save history if possible
        if (conversation) {
            conversation.messages.push({ role: 'user', content: message });
            conversation.messages.push({ role: 'assistant', content: botReply });
            await conversation.save();
        }

        res.status(200).json({
            success: true,
            data: {
                message: botReply,
                sessionId: sessionId
            }
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            success: false,
            message: 'Chatbot Error: ' + (error.message || 'Something went wrong'),
        });
    }
};

// @desc    Get conversation history
// @route   GET /api/chatbot/conversation/:sessionId
// @access  Public
exports.getConversation = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const conversation = await Conversation.findOne({ sessionId });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        res.status(200).json({
            success: true,
            data: conversation
        });

    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching conversation',
            error: error.message
        });
    }
};

// @desc    Clear conversation history
// @route   DELETE /api/chatbot/conversation/:sessionId
// @access  Public
exports.clearConversation = async (req, res) => {
    try {
        const { sessionId } = req.params;

        await Conversation.findOneAndDelete({ sessionId });

        res.status(200).json({
            success: true,
            message: 'Conversation cleared successfully'
        });

    } catch (error) {
        console.error('Error clearing conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing conversation',
            error: error.message
        });
    }
};

// @desc    Get suggested questions
// @route   GET /api/chatbot/suggestions
// @access  Public
exports.getSuggestions = async (req, res) => {
    try {
        const suggestions = chatbotKnowledge.commonQuestions.map(q => q.question);

        res.status(200).json({
            success: true,
            data: suggestions
        });

    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching suggestions',
            error: error.message
        });
    }
};
