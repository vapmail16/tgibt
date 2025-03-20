// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    // First load all dynamic data
    try {
        await Promise.all([
            loadEvents(),
            loadBooks(),
            loadTestimonials()
        ]);
    } catch (error) {
        console.error('Error loading data:', error);
    }

    // Mobile menu toggle
    setupMobileMenu();
    
    // Sticky header
    setupStickyHeader();
    
    // Form submissions
    setupFormSubmissions();
});

// Function to load and display events
async function loadEvents() {
    const eventCardsContainer = document.querySelector('.event-cards');
    if (!eventCardsContainer) return;

    try {
        eventCardsContainer.classList.add('loading');
        const response = await fetch('/data/events.json');
        const data = await response.json();
        const events = data.events || [];

        if (events.length === 0) {
            eventCardsContainer.innerHTML = '<p class="no-events">No upcoming events scheduled.</p>';
            return;
        }

        eventCardsContainer.innerHTML = '';
        events.forEach(event => {
            const eventDate = new Date(event.date.fullDate);
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.innerHTML = `
                <div class="event-content">
                    ${event.image ? `
                        <div class="event-image">
                            <img src="${event.image}" alt="${event.title}">
                        </div>
                    ` : ''}
                    <div class="event-details">
                        <h3>${event.title}</h3>
                        <p class="location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                        <p class="date"><i class="fas fa-calendar"></i> ${eventDate.toLocaleDateString()}</p>
                        <p>${event.description}</p>
                    </div>
                </div>
            `;
            eventCardsContainer.appendChild(eventCard);
        });
    } catch (error) {
        console.error('Error loading events:', error);
        eventCardsContainer.innerHTML = '<p class="error">Failed to load events. Please try again later.</p>';
    } finally {
        eventCardsContainer.classList.remove('loading');
    }
}

// Function to load and display books
async function loadBooks() {
    const booksGrid = document.querySelector('.books-grid');
    if (!booksGrid) return;

    try {
        booksGrid.classList.add('loading');
        const response = await fetch('/data/books.json');
        const data = await response.json();
        const books = data.books || [];

        if (books.length === 0) {
            booksGrid.innerHTML = '<p class="no-books">No books available at the moment.</p>';
            return;
        }

        booksGrid.innerHTML = '';
        
        // Determine if we're on the homepage (featured books) or store page
        const isHomepage = window.location.pathname === '/' || window.location.pathname === '/index.html';
        const booksToDisplay = isHomepage ? books.slice(0, 6) : books;

        booksToDisplay.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.innerHTML = `
                <div class="book-image">
                    <img src="${book.image || 'placeholder-book.jpg'}" alt="${book.title}">
                </div>
                <div class="book-details">
                    <h3>${book.title}</h3>
                    <p class="book-author">By ${book.author}</p>
                    <p class="book-price">₹${book.price}</p>
                    <a href="${book.amazonLink}" target="_blank" class="btn primary-btn buy-btn">
                        <i class="fas fa-shopping-cart"></i> Buy on Amazon
                    </a>
                </div>
            `;
            booksGrid.appendChild(bookCard);
        });
    } catch (error) {
        console.error('Error loading books:', error);
        booksGrid.innerHTML = '<p class="error">Failed to load books. Please try again later.</p>';
    } finally {
        booksGrid.classList.remove('loading');
    }
}

// Function to load and display testimonials
async function loadTestimonials() {
    const testimonialContainer = document.querySelector('.testimonial-container');
    if (!testimonialContainer) return;

    try {
        testimonialContainer.classList.add('loading');
        const response = await fetch('/data/testimonials.json');
        const data = await response.json();
        const testimonials = data.testimonials || [];

        if (testimonials.length === 0) {
            testimonialContainer.innerHTML = '<p class="no-testimonials">No testimonials available yet.</p>';
            return;
        }

        const slider = document.createElement('div');
        slider.className = 'testimonial-slider';

        testimonials.forEach((testimonial, index) => {
            const slide = document.createElement('div');
            slide.className = `testimonial-slide ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `
                <div class="testimonial-content">
                    <p>${testimonial.content}</p>
                    <div class="rating">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5-testimonial.rating)}</div>
                    <div class="testimonial-author">
                        <h4>${testimonial.name}</h4>
                    </div>
                </div>
            `;
            slider.appendChild(slide);
        });

        testimonialContainer.innerHTML = '';
        testimonialContainer.appendChild(slider);

        if (testimonials.length > 1) {
            setupTestimonialControls(testimonials.length);
        }
    } catch (error) {
        console.error('Error loading testimonials:', error);
        testimonialContainer.innerHTML = '<p class="error">Failed to load testimonials. Please try again later.</p>';
    } finally {
        testimonialContainer.classList.remove('loading');
    }
}

// Setup testimonial controls
function setupTestimonialControls(slideCount) {
    const testimonialContainer = document.querySelector('.testimonial-container');
    const controls = document.createElement('div');
    controls.className = 'testimonial-controls';
    controls.innerHTML = `
        <button class="prev-testimonial"><i class="fas fa-chevron-left"></i></button>
        <div class="testimonial-dots">
            ${Array(slideCount).fill(0).map((_, i) => `
                <div class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
            `).join('')}
        </div>
        <button class="next-testimonial"><i class="fas fa-chevron-right"></i></button>
    `;

    testimonialContainer.appendChild(controls);
    setupTestimonialNavigation();
}

// Setup testimonial navigation
function setupTestimonialNavigation() {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    const prevButton = document.querySelector('.prev-testimonial');
    const nextButton = document.querySelector('.next-testimonial');

    function showSlide(index) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            let index = currentSlide - 1;
            if (index < 0) index = slides.length - 1;
            showSlide(index);
        });

        nextButton.addEventListener('click', () => {
            let index = currentSlide + 1;
            if (index >= slides.length) index = 0;
            showSlide(index);
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });
}

// Setup mobile menu
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            body.classList.toggle('menu-open');
            hamburger.classList.toggle('active');
        });

        // Close mobile menu when clicking on a nav link
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    body.classList.remove('menu-open');
                    hamburger.classList.remove('active');
                }
            });
        });
    }
}

// Setup sticky header
function setupStickyHeader() {
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        });
    }
}

// Setup form submissions
function setupFormSubmissions() {
    const contactForm = document.querySelector('.contact-form');
    const newsletterForm = document.querySelector('.newsletter-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for subscribing to our newsletter!');
            newsletterForm.reset();
        });
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Animate elements on scroll
const animateOnScroll = function() {
    const elements = document.querySelectorAll('.event-card, .author-card, .gallery-item, .about-image');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementPosition < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Set initial styles for animation
const elementsToAnimate = document.querySelectorAll('.event-card, .author-card, .gallery-item, .about-image');
elementsToAnimate.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

// Run on scroll
window.addEventListener('scroll', animateOnScroll);
// Run once on page load
animateOnScroll(); 