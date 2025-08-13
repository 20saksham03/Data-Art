// Animal Extinction Timeline - Interactive JavaScript
// Stage 3: Adding Dynamic Functionality

// Global variables
let timelineEvents = [];
const timeline = document.getElementById('timeline');
const modal = document.getElementById('modal');
const modalContent = modal.querySelector('.modal-content');
const closeBtn = modal.querySelector('.close-btn');
const themeToggle = document.getElementById('theme-toggle');
const filterButtons = document.querySelectorAll('.filter-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Main initialization function
async function initializeApp() {
    try {
        console.log('🚀 Initializing Animal Extinction Timeline...');
        
        // Load and display events
        await loadEvents();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize theme
        initializeTheme();
        
        console.log('✅ Timeline successfully initialized!');
        
    } catch (error) {
        console.error('❌ Error initializing timeline:', error);
        showErrorMessage('Failed to load timeline data. Please try again later.');
    }
}

// Fetch and parse events from JSON file
async function loadEvents() {
    try {
        console.log('📊 Loading event data...');
        
        const response = await fetch('./data/events.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        timelineEvents = data.events;
        
        // Sort events by year (oldest first)
        timelineEvents.sort((a, b) => a.year - b.year);
        
        console.log(`📅 Loaded ${timelineEvents.length} extinction events`);
        
        // Render the timeline
        renderTimeline();
        
    } catch (error) {
        console.error('❌ Error loading events:', error);
        throw error;
    }
}

// Render event markers into the timeline
function renderTimeline(filteredEvents = null) {
    const eventsToRender = filteredEvents || timelineEvents;
    
    // Clear existing content
    timeline.innerHTML = '';
    
    if (eventsToRender.length === 0) {
        timeline.innerHTML = `
            <div class="no-events">
                <h3>No events found</h3>
                <p>Try adjusting your filter selection.</p>
            </div>
        `;
        return;
    }
    
    // Create timeline events
    eventsToRender.forEach((event, index) => {
        const eventElement = createEventElement(event, index);
        timeline.appendChild(eventElement);
    });
    
    console.log(`🎨 Rendered ${eventsToRender.length} events to timeline`);
}

// Create individual event element
function createEventElement(event, index) {
    const article = document.createElement('article');
    article.className = 'event';
    article.dataset.eventId = event.id;
    article.dataset.category = event.category;
    
    article.innerHTML = `
        <div class="event-marker" data-year="${event.year}"></div>
        <div class="event-content">
            <h2>${event.title} <span class="year">(${event.year})</span></h2>
            <figure>
                <img src="${event.imageURL}" alt="${event.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjVmNWY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg=='">
                <figcaption>${event.location || 'Extinct species'}</figcaption>
            </figure>
            <p>${truncateText(event.description, 120)}</p>
            <div class="event-meta">
                <span class="category-tag">${event.category}</span>
                <button class="learn-more-btn" data-event-id="${event.id}">Learn More</button>
            </div>
        </div>
    `;
    
    return article;
}

// Setup all event listeners
function setupEventListeners() {
    // Timeline event clicks (using event delegation)
    timeline.addEventListener('click', handleTimelineClick);
    
    // Modal close functionality
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', handleModalBackdropClick);
    document.addEventListener('keydown', handleKeyDown);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilterClick);
    });
    
    console.log('🎯 Event listeners initialized');
}

// Handle timeline clicks (event markers and learn more buttons)
function handleTimelineClick(event) {
    const eventMarker = event.target.closest('.event-marker');
    const learnMoreBtn = event.target.closest('.learn-more-btn');
    
    if (eventMarker || learnMoreBtn) {
        const eventElement = event.target.closest('.event');
        const eventId = parseInt(eventElement.dataset.eventId);
        const eventData = timelineEvents.find(e => e.id === eventId);
        
        if (eventData) {
            openModal(eventData);
        }
    }
}

// Open modal with event details
function openModal(event) {
    const modalBody = modalContent.querySelector('h2').parentNode;
    
    modalBody.innerHTML = `
        <span class="close-btn">&times;</span>
        <div class="modal-header">
            <h2>${event.title}</h2>
            <div class="modal-meta">
                <span class="year-large">${event.year}</span>
                <span class="category-tag">${event.category}</span>
            </div>
        </div>
        <div class="modal-image">
            <img src="${event.imageURL}" alt="${event.title}" onerror="this.style.display='none'">
        </div>
        <div class="modal-content-body">
            <p class="description">${event.description}</p>
            <div class="details-grid">
                <div class="detail-item">
                    <strong>Location:</strong> ${event.location}
                </div>
                <div class="detail-item">
                    <strong>Primary Cause:</strong> ${event.cause}
                </div>
                <div class="detail-item">
                    <strong>Category:</strong> ${event.category}
                </div>
            </div>
        </div>
    `;
    
    // Re-attach close button listener
    const newCloseBtn = modalBody.querySelector('.close-btn');
    newCloseBtn.addEventListener('click', closeModal);
    
    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus management for accessibility
    newCloseBtn.focus();
    
    console.log(`📖 Opened modal for: ${event.title}`);
}

// Close modal
function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    
    console.log('❌ Modal closed');
}

// Handle modal backdrop clicks
function handleModalBackdropClick(event) {
    if (event.target === modal) {
        closeModal();
    }
}

// Handle keyboard events (ESC to close modal)
function handleKeyDown(event) {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
}

// Theme toggle functionality
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    
    // Save theme preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    console.log(`🎨 Theme switched to: ${isDark ? 'dark' : 'light'}`);
}

// Initialize theme from localStorage
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
        themeToggle.setAttribute('aria-label', 'Switch to light theme');
    } else {
        themeToggle.textContent = '🌙';
        themeToggle.setAttribute('aria-label', 'Switch to dark theme');
    }
    
    console.log(`🎨 Theme initialized: ${savedTheme || 'light'}`);
}

// Handle filter button clicks
function handleFilterClick(event) {
    const clickedButton = event.target;
    const filterCategory = clickedButton.textContent;
    
    // Update active filter button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    clickedButton.classList.add('active');
    
    // Filter events
    let filteredEvents;
    if (filterCategory === 'All') {
        filteredEvents = timelineEvents;
    } else {
        filteredEvents = timelineEvents.filter(event => 
            event.category === filterCategory
        );
    }
    
    // Re-render timeline with filtered events
    renderTimeline(filteredEvents);
    
    console.log(`🔍 Filtered by: ${filterCategory} (${filteredEvents.length} events)`);
}

// Utility function to truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Show error message to user
function showErrorMessage(message) {
    timeline.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Error Loading Timeline</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="retry-btn">Try Again</button>
        </div>
    `;
}

// Additional CSS for enhanced modal and error handling
const additionalStyles = `
<style>
/* Modal enhancements */
.modal-header {
    border-bottom: 2px solid var(--border-color, #ddd);
    padding-bottom: 1rem;
    margin-bottom: 1rem;
}

.modal-meta {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-top: 0.5rem;
}

.year-large {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2f4f4f;
    background: #f0f0f0;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
}

.modal-image img {
    width: 100%;
    max-height: 250px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.details-grid {
    display: grid;
    gap: 0.8rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color, #ddd);
}

.detail-item {
    padding: 0.5rem;
    background: #f9f9f9;
    border-radius: 5px;
}

.category-tag {
    background: #2f4f4f;
    color: white;
    padding: 0.2rem 0.6rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: bold;
}

.learn-more-btn {
    background: #2f4f4f;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.3s ease;
}

.learn-more-btn:hover {
    background: #1a3a3a;
}

.event-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
}

.filter-btn.active {
    background: #2f4f4f;
    color: white;
}

.no-events, .error-message {
    text-align: center;
    padding: 3rem;
    color: #666;
}

.retry-btn {
    background: #2f4f4f;
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 1rem;
}

body.dark-theme .year-large {
    color: #f0f0f0;
    background: #444;
}

body.dark-theme .detail-item {
    background: #444;
    color: #f0f0f0;
}

@media (max-width: 767px) {
    .modal-content {
        margin: 1rem;
        max-height: 90vh;
    }
    
    .details-grid {
        grid-template-columns: 1fr;
    }
    
    .event-meta {
        flex-direction: column;
        gap: 0.5rem;
        align-items: stretch;
    }
}
</style>
`;

// Inject additional styles
document.head.insertAdjacentHTML('beforeend', additionalStyles);

console.log('🦕 Animal Extinction Timeline Script Loaded Successfully!');
