// Chatbot Widget Class
class ChatbotWidget {
    constructor() {
        this.apiUrl = 'http://localhost:5000/api/chatbot';
        this.sessionId = this.getOrCreateSessionId();
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;

        this.init();
    }

    // Initialize the chatbot
    init() {
        this.createWidget();
        this.attachEventListeners();
        this.loadSuggestions();

        // Load conversation history if exists
        this.loadConversationHistory();
    }

    // Generate or retrieve session ID
    getOrCreateSessionId() {
        let sessionId = localStorage.getItem('chatbot_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chatbot_session_id', sessionId);
        }
        return sessionId;
    }

    // Create widget HTML
    createWidget() {
        const widgetHTML = `
      <div class="chatbot-widget">
        <button class="chatbot-toggle" id="chatbot-toggle" aria-label="Toggle chatbot">
          <ion-icon name="chatbubbles-outline"></ion-icon>
          <ion-icon name="close-outline"></ion-icon>
        </button>

        <div class="chatbot-container" id="chatbot-container">
          <div class="chatbot-header">
            <div class="chatbot-header-content">
              <div class="chatbot-avatar">
                ✨
              </div>
              <div class="chatbot-header-text">
                <h3>Glowing Assistant</h3>
                <p>Always here to help</p>
              </div>
            </div>
            <button class="chatbot-close" id="chatbot-close" aria-label="Close chatbot">
              <ion-icon name="close-outline"></ion-icon>
            </button>
          </div>

          <div class="chatbot-messages" id="chatbot-messages">
            <div class="welcome-message">
              <ion-icon name="sparkles-outline"></ion-icon>
              <h4>Welcome to Glowing! ✨</h4>
              <p>I'm here to help you find the perfect skincare products and answer any questions you may have.</p>
            </div>
          </div>

          <div class="chatbot-suggestions" id="chatbot-suggestions">
            <!-- Suggestions will be loaded here -->
          </div>

          <div class="chatbot-input-area">
            <input 
              type="text" 
              class="chatbot-input" 
              id="chatbot-input" 
              placeholder="Type your message..."
              autocomplete="off"
            />
            <button class="chatbot-send" id="chatbot-send" aria-label="Send message">
              <ion-icon name="send-outline"></ion-icon>
            </button>
          </div>
        </div>
      </div>
    `;

        document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }

    // Attach event listeners
    attachEventListeners() {
        const toggle = document.getElementById('chatbot-toggle');
        const close = document.getElementById('chatbot-close');
        const send = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');

        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.closeChat());
        send.addEventListener('click', () => this.sendMessage());

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    // Toggle chat window
    toggleChat() {
        this.isOpen = !this.isOpen;
        const container = document.getElementById('chatbot-container');
        const toggle = document.getElementById('chatbot-toggle');

        if (this.isOpen) {
            container.classList.add('active');
            toggle.classList.add('active');
            document.getElementById('chatbot-input').focus();
        } else {
            container.classList.remove('active');
            toggle.classList.remove('active');
        }
    }

    // Close chat window
    closeChat() {
        this.isOpen = false;
        document.getElementById('chatbot-container').classList.remove('active');
        document.getElementById('chatbot-toggle').classList.remove('active');
    }

    // Load suggested questions
    async loadSuggestions() {
        try {
            const response = await fetch(`${this.apiUrl}/suggestions`);
            const data = await response.json();

            if (data.success) {
                const suggestionsContainer = document.getElementById('chatbot-suggestions');
                const suggestions = data.data.slice(0, 3); // Show first 3 suggestions

                suggestionsContainer.innerHTML = suggestions.map(suggestion =>
                    `<button class="suggestion-chip" onclick="chatbot.sendSuggestion('${suggestion.replace(/'/g, "\\'")}')">${suggestion}</button>`
                ).join('');
            }
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    }

    // Send a suggested question
    sendSuggestion(suggestion) {
        document.getElementById('chatbot-input').value = suggestion;
        this.sendMessage();
    }

    // Send message
    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();

        if (!message || this.isTyping) return;

        // Clear input
        input.value = '';

        // Add user message to UI
        this.addMessage('user', message);

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await fetch(`${this.apiUrl}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    sessionId: this.sessionId
                })
            });

            const data = await response.json();

            // Remove typing indicator
            this.hideTypingIndicator();

            if (data.success) {
                // Add bot response to UI
                this.addMessage('bot', data.data.message);
            } else {
                this.showError(data.message || 'Sorry, something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.showError('Unable to connect to the chatbot. Please check your connection.');
        }
    }

    // Add message to UI
    addMessage(role, content) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const messageHTML = `
      <div class="chatbot-message ${role}">
        <div class="message-avatar ${role}">
          ${role === 'bot' ? '✨' : '👤'}
        </div>
        <div class="message-wrapper">
          <div class="message-content">${this.formatMessage(content)}</div>
          <div class="message-time">${time}</div>
        </div>
      </div>
    `;

        // Remove welcome message if it exists
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();

        // Store message
        this.messages.push({ role, content, time });
    }

    // Format message content (convert line breaks, etc.)
    formatMessage(content) {
        // First escape HTML to prevent XSS and text display issues
        const escapeHtml = (text) => {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        };

        const escaped = escapeHtml(content);

        // Then apply formatting
        return escaped
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code style="background:#f4f4f4;padding:2px 4px;border-radius:3px;">$1</code>');
    }

    // Show typing indicator
    showTypingIndicator() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chatbot-messages');

        const typingHTML = `
      <div class="chatbot-message bot typing-message">
        <div class="message-avatar bot">✨</div>
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;

        messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
        this.scrollToBottom();
    }

    // Hide typing indicator
    hideTypingIndicator() {
        this.isTyping = false;
        const typingMessage = document.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    // Show error message
    showError(message) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const errorHTML = `<div class="error-message">${message}</div>`;
        messagesContainer.insertAdjacentHTML('beforeend', errorHTML);
        this.scrollToBottom();

        // Remove error after 5 seconds
        setTimeout(() => {
            const errorElement = messagesContainer.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }
        }, 5000);
    }

    // Scroll to bottom of messages
    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Load conversation history
    async loadConversationHistory() {
        try {
            const response = await fetch(`${this.apiUrl}/conversation/${this.sessionId}`);
            const data = await response.json();

            if (data.success && data.data.messages.length > 0) {
                const messagesContainer = document.getElementById('chatbot-messages');
                const welcomeMessage = messagesContainer.querySelector('.welcome-message');
                if (welcomeMessage) {
                    welcomeMessage.remove();
                }

                data.data.messages.forEach(msg => {
                    this.addMessage(msg.role === 'assistant' ? 'bot' : 'user', msg.content);
                });
            }
        } catch (error) {
            // No history found or error - that's okay, start fresh
            console.log('No conversation history found');
        }
    }

    // Clear conversation
    async clearConversation() {
        try {
            await fetch(`${this.apiUrl}/conversation/${this.sessionId}`, {
                method: 'DELETE'
            });

            // Clear UI
            const messagesContainer = document.getElementById('chatbot-messages');
            messagesContainer.innerHTML = `
        <div class="welcome-message">
          <ion-icon name="sparkles-outline"></ion-icon>
          <h4>Welcome to Glowing! ✨</h4>
          <p>I'm here to help you find the perfect skincare products and answer any questions you may have.</p>
        </div>
      `;

            this.messages = [];

            // Generate new session ID
            localStorage.removeItem('chatbot_session_id');
            this.sessionId = this.getOrCreateSessionId();

        } catch (error) {
            console.error('Error clearing conversation:', error);
        }
    }
}

// Initialize chatbot when DOM is loaded
let chatbot;
document.addEventListener('DOMContentLoaded', () => {
    chatbot = new ChatbotWidget();
});
