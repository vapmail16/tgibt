document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu functionality
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Get DOM elements
    const eventsGrid = document.querySelector('.events-grid');
    const loadingState = document.querySelector('.loading');
    const noEventsMessage = document.querySelector('.no-events');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let allEvents = [];

    // Load events data
    async function loadEvents() {
        try {
            const response = await fetch('/data/events.json');
            if (!response.ok) throw new Error('Failed to load events');
            
            const data = await response.json();
            console.log('Loaded events data:', data); // Debug log
            
            // Check if data.events exists and is an array
            if (data && Array.isArray(data.events)) {
                allEvents = data.events;
            } else if (Array.isArray(data)) {
                allEvents = data;
            } else {
                throw new Error('Invalid events data format');
            }

            if (allEvents.length === 0) {
                noEventsMessage.style.display = 'block';
                noEventsMessage.textContent = 'No events available.';
                loadingState.style.display = 'none';
                return;
            }
            
            // Initially show upcoming events
            filterEvents('upcoming');
            loadingState.style.display = 'none';
        } catch (error) {
            console.error('Error loading events:', error);
            loadingState.style.display = 'none';
            noEventsMessage.style.display = 'block';
            noEventsMessage.textContent = 'Error loading events. Please try again later.';
        }
    }

    // Filter events based on type (upcoming or past)
    function filterEvents(type) {
        const currentDate = new Date();
        let filteredEvents;

        // Convert current date to start of day for comparison
        currentDate.setHours(0, 0, 0, 0);

        if (type === 'upcoming') {
            filteredEvents = allEvents.filter(event => {
                // Handle the structured date format
                const eventDate = new Date(event.date.fullDate);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate >= currentDate;
            });
        } else {
            filteredEvents = allEvents.filter(event => {
                // Handle the structured date format
                const eventDate = new Date(event.date.fullDate);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate < currentDate;
            });
        }

        // Sort events by date
        filteredEvents.sort((a, b) => {
            const dateA = new Date(a.date.fullDate);
            const dateB = new Date(b.date.fullDate);
            if (type === 'upcoming') {
                return dateA - dateB; // Ascending for upcoming
            } else {
                return dateB - dateA; // Descending for past
            }
        });

        displayEvents(filteredEvents, type);
    }

    // Display events in the grid
    function displayEvents(events, type) {
        if (events.length === 0) {
            eventsGrid.innerHTML = '';
            noEventsMessage.style.display = 'block';
            noEventsMessage.textContent = type === 'upcoming' ? 'No upcoming events.' : 'No past events.';
            return;
        }

        noEventsMessage.style.display = 'none';
        eventsGrid.innerHTML = events.map(event => `
            <div class="event-card">
                <div class="event-image">
                    <img src="${event.image || 'https://via.placeholder.com/300x200'}" alt="${event.title}">
                </div>
                <div class="event-content">
                    <div class="event-details">
                        <h3>${event.title}</h3>
                        <p class="date">${formatDate(event.date.fullDate)}</p>
                        <p class="location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${event.location}
                        </p>
                        <p>${event.description || ''}</p>
                    </div>
                    <a href="${event.registrationLink || '#'}" class="btn event-btn" target="_blank">
                        ${new Date(event.date.fullDate) < new Date() ? 'View Event Details' : 'Register on WhatsApp Group'}
                        ${new Date(event.date.fullDate) >= new Date() ? '<i class="fab fa-whatsapp"></i>' : ''}
                    </a>
                </div>
            </div>
        `).join('');
    }

    // Format date for display
    function formatDate(dateString) {
        try {
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
            };
            return new Date(dateString).toLocaleDateString('en-US', options);
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    }

    // Add event listeners to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterEvents(button.dataset.filter);
        });
    });

    // Initial load
    loadEvents();
}); 