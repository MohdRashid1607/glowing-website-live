'use strict';

/**
 * Blog Page Functionality
 */

class BlogManager {
  constructor() {
    this.posts = [];
    this.filteredPosts = [];
    this.currentCategory = 'all';
    this.currentTag = '';
    this.searchQuery = '';
    this.postsPerPage = 9;
    this.currentPage = 1;

    this.init();
  }

  init() {
    this.loadPosts();
    this.bindEvents();
    this.renderPosts();
  }

  loadPosts() {
    // Get posts from DOM
    const postCards = document.querySelectorAll('.blog-card[data-category]');
    this.posts = Array.from(postCards).map(card => {
      const category = card.dataset.category;
      const tags = card.dataset.tags ? card.dataset.tags.split(',') : [];
      const title = card.querySelector('.card-title a')?.textContent || '';
      const author = card.querySelector('.author-name')?.textContent || '';
      const text = card.querySelector('.card-text')?.textContent || '';
      
      return {
        element: card,
        category: category,
        tags: tags,
        title: title.toLowerCase(),
        author: author.toLowerCase(),
        text: text.toLowerCase()
      };
    });
    this.filteredPosts = [...this.posts];
  }

  bindEvents() {
    // Category filters
    const categoryBtns = document.querySelectorAll('.filter-btn');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category;
        this.applyFilters();
      });
    });

    // Tag filters
    const tagBtns = document.querySelectorAll('.tag-btn');
    tagBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tagBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTag = btn.dataset.tag;
        this.applyFilters();
      });
    });

    // Search functionality
    const searchInput = document.getElementById('blog-search');
    const searchBtn = document.querySelector('.blog-search-btn');
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.applyFilters();
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.applyFilters();
      });
    }

    // Load more functionality
    const loadMoreBtn = document.getElementById('load-more-posts');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.loadMore();
      });
    }

    // Newsletter forms
    const newsletterForms = document.querySelectorAll('.newsletter-form, #blog-newsletter');
    newsletterForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleNewsletterSignup(form);
      });
    });

    // Category sidebar links
    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.dataset.category;
        this.filterByCategory(category);
      });
    });

    // Social share buttons
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleSocialShare(btn);
      });
    });

    // Comment form
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
      commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCommentSubmission(commentForm);
      });
    }

    // Comment replies
    const replyBtns = document.querySelectorAll('.comment-reply-btn');
    replyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleCommentReply(btn);
      });
    });

    // Load more comments
    const loadMoreComments = document.querySelector('.load-more-comments');
    if (loadMoreComments) {
      loadMoreComments.addEventListener('click', () => {
        this.loadMoreComments();
      });
    }
  }

  applyFilters() {
    this.filteredPosts = this.posts.filter(post => {
      // Category filter
      if (this.currentCategory !== 'all' && post.category !== this.currentCategory) {
        return false;
      }

      // Tag filter
      if (this.currentTag && !post.tags.includes(this.currentTag)) {
        return false;
      }

      // Search filter
      if (this.searchQuery) {
        const searchMatch = 
          post.title.includes(this.searchQuery) ||
          post.author.includes(this.searchQuery) ||
          post.text.includes(this.searchQuery) ||
          post.tags.some(tag => tag.includes(this.searchQuery));
        
        if (!searchMatch) {
          return false;
        }
      }

      return true;
    });

    this.currentPage = 1;
    this.renderPosts();
  }

  renderPosts() {
    // Hide all posts first
    this.posts.forEach(post => {
      post.element.style.display = 'none';
    });

    // Show filtered posts
    const startIndex = 0;
    const endIndex = this.currentPage * this.postsPerPage;
    const postsToShow = this.filteredPosts.slice(startIndex, endIndex);

    postsToShow.forEach((post, index) => {
      post.element.style.display = 'block';
      post.element.style.animationDelay = `${index * 0.1}s`;
    });

    // Update load more button
    const hasMore = endIndex < this.filteredPosts.length;
    this.updateLoadMoreButton(hasMore);

    // Show no results message if needed
    if (this.filteredPosts.length === 0) {
      this.showNoResultsMessage();
    } else {
      this.hideNoResultsMessage();
    }
  }

  loadMore() {
    this.currentPage++;
    this.renderPosts();
  }

  updateLoadMoreButton(hasMore) {
    const loadMoreBtn = document.getElementById('load-more-posts');
    if (!loadMoreBtn) return;

    if (hasMore) {
      loadMoreBtn.style.display = 'inline-flex';
      const remaining = this.filteredPosts.length - (this.currentPage * this.postsPerPage);
      loadMoreBtn.querySelector('.btn-text').textContent = `Load More Articles (${remaining} remaining)`;
    } else {
      loadMoreBtn.style.display = 'none';
    }
  }

  showNoResultsMessage() {
    const postsGrid = document.getElementById('blog-posts-grid');
    let noResultsMsg = document.getElementById('no-results-message');
    
    if (!noResultsMsg) {
      noResultsMsg = document.createElement('div');
      noResultsMsg.id = 'no-results-message';
      noResultsMsg.className = 'no-results-message';
      noResultsMsg.innerHTML = `
        <div class="no-results-content">
          <ion-icon name="document-text-outline"></ion-icon>
          <h3>No articles found</h3>
          <p>Try adjusting your search terms or browse different categories.</p>
          <button class="btn btn-primary" onclick="blogManager.clearAllFilters()">Clear Filters</button>
        </div>
      `;
      postsGrid.appendChild(noResultsMsg);
    }
    
    noResultsMsg.style.display = 'block';
  }

  hideNoResultsMessage() {
    const noResultsMsg = document.getElementById('no-results-message');
    if (noResultsMsg) {
      noResultsMsg.style.display = 'none';
    }
  }

  clearAllFilters() {
    // Reset filters
    this.currentCategory = 'all';
    this.currentTag = '';
    this.searchQuery = '';

    // Reset UI
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.category === 'all') {
        btn.classList.add('active');
      }
    });

    document.querySelectorAll('.tag-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    const searchInput = document.getElementById('blog-search');
    if (searchInput) {
      searchInput.value = '';
    }

    this.applyFilters();
  }

  filterByCategory(category) {
    // Update category filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.category === category) {
        btn.classList.add('active');
      }
    });

    this.currentCategory = category;
    this.applyFilters();

    // Scroll to top of posts
    document.getElementById('blog-posts-grid').scrollIntoView({ 
      behavior: 'smooth' 
    });
  }

  handleNewsletterSignup(form) {
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput.value;

    if (email) {
      // Simulate API call
      this.showNotification('Thank you for subscribing! You\'ll receive our latest beauty tips and updates.', 'success');
      emailInput.value = '';
    }
  }

  handleSocialShare(btn) {
    const url = window.location.href;
    const title = document.title;
    
    if (btn.classList.contains('facebook')) {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (btn.classList.contains('twitter')) {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    } else if (btn.classList.contains('linkedin')) {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (btn.classList.contains('copy-link')) {
      navigator.clipboard.writeText(url).then(() => {
        this.showNotification('Link copied to clipboard!', 'success');
      });
    }
  }

  handleCommentSubmission(form) {
    const formData = new FormData(form);
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const comment = form.querySelector('textarea').value;

    if (name && email && comment) {
      // Simulate comment submission
      this.addNewComment(name, comment);
      form.reset();
      this.showNotification('Your comment has been submitted and is awaiting moderation.', 'success');
    }
  }

  addNewComment(name, comment) {
    const commentsList = document.querySelector('.comments-list');
    const newComment = document.createElement('div');
    newComment.className = 'comment';
    newComment.innerHTML = `
      <div class="comment-avatar">
        <img src="./assets/images/user-default.jpg" width="50" height="50" alt="${name}" class="img-cover">
      </div>
      <div class="comment-content">
        <div class="comment-header">
          <h5 class="comment-author">${name}</h5>
          <span class="comment-date">Just now</span>
        </div>
        <p class="comment-text">${comment}</p>
        <button class="comment-reply-btn">Reply</button>
      </div>
    `;
    
    commentsList.insertBefore(newComment, commentsList.firstChild);
    
    // Update comment count
    const commentsTitle = document.querySelector('.comments-title');
    if (commentsTitle) {
      const currentCount = parseInt(commentsTitle.textContent.match(/\d+/)[0]);
      commentsTitle.textContent = `Comments (${currentCount + 1})`;
    }
  }

  handleCommentReply(btn) {
    const comment = btn.closest('.comment');
    const author = comment.querySelector('.comment-author').textContent;
    
    // Focus comment form and pre-fill with @mention
    const commentForm = document.getElementById('comment-form');
    const textarea = commentForm.querySelector('textarea');
    
    textarea.focus();
    textarea.value = `@${author} `;
    
    // Scroll to comment form
    commentForm.scrollIntoView({ behavior: 'smooth' });
  }

  loadMoreComments() {
    // Simulate loading more comments
    const loadMoreBtn = document.querySelector('.load-more-comments');
    loadMoreBtn.textContent = 'Loading...';
    
    setTimeout(() => {
      loadMoreBtn.textContent = 'Load More Comments';
      this.showNotification('No more comments to load.', 'info');
    }, 1000);
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Auto hide after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
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

.notification-info {
  border-left: 4px solid #3498db;
}

.notification-error {
  border-left: 4px solid #e74c3c;
}

.no-results-message {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background-color: var(--cultured-1);
  border-radius: var(--radius-3);
  margin: 20px 0;
}

.no-results-content {
  text-align: center;
  max-width: 400px;
  padding: 40px;
}

.no-results-content ion-icon {
  font-size: 4rem;
  color: var(--spanish-gray);
  margin-bottom: 20px;
}

.no-results-content h3 {
  color: var(--black);
  font-size: var(--fs-4);
  margin-bottom: 10px;
}

.no-results-content p {
  color: var(--gray-web);
  margin-bottom: 30px;
}
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize blog manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize on blog pages
  if (document.getElementById('blog-posts-grid') || document.querySelector('.blog-post-content')) {
    window.blogManager = new BlogManager();
  }
});