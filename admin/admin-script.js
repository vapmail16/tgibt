let currentData = {
    events: [],
    books: [],
    testimonials: []
};

// Sales Management Variables
let currentPage = 1;
const itemsPerPage = 10;
let salesData = [];
let filteredSalesData = [];

// Pagination Variables for each section
let eventsCurrentPage = 1;
let booksCurrentPage = 1;
let testimonialsCurrentPage = 1;
const sectionItemsPerPage = 5;

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin/login.html';
        return;
    }

    // Set up role-based UI
    const user = JSON.parse(localStorage.getItem('adminUser'));
    document.body.setAttribute('data-role', user.role);
    
    // Update header based on role
    const header = document.querySelector('.admin-header h1');
    header.textContent = user.role === 'admin' ? 'TGIBT Admin Dashboard' : 'TGIBT Sales Dashboard';
    
    setupNavigation();
    
    // Initialize sales data and filters
    salesData = [];
    filteredSalesData = [];
    currentPage = 1;
    
    // Load sales data
    await loadSalesData();
    
    // Show initial section based on user role
    if (user.role === 'admin') {
        document.querySelector('[data-section="sales"]').classList.add('active');
        document.getElementById('sales-section').classList.add('active');
        loadAllData();
    } else {
        document.querySelector('[data-section="sales"]').classList.add('active');
        document.getElementById('sales-section').classList.add('active');
    }
});

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');
    const user = JSON.parse(localStorage.getItem('adminUser'));
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');
            
            // Only handle click if button is visible (based on role)
            if (!button.classList.contains('admin-only') || user.role === 'admin') {
                // Remove active class from all buttons and sections
                navButtons.forEach(btn => btn.classList.remove('active'));
                sections.forEach(section => section.classList.remove('active'));
                
                // Add active class to clicked button and corresponding section
                button.classList.add('active');
                document.getElementById(`${sectionId}-section`).classList.add('active');
            }
        });
    });
}

async function loadAllData() {
    try {
        const eventsResponse = await fetch('../data/events.json');
        const booksResponse = await fetch('../data/books.json');
        const testimonialsResponse = await fetch('../data/testimonials.json');

        // Initialize with empty arrays if files don't exist
        let events = [];
        let books = [];
        let testimonials = [];

        try {
            if (eventsResponse.ok) {
                const eventsData = await eventsResponse.json();
                events = eventsData.events || [];
            }
        } catch (e) {
            console.log('No events data found');
        }

        try {
            if (booksResponse.ok) {
                const booksData = await booksResponse.json();
                books = booksData.books || [];
            }
        } catch (e) {
            console.log('No books data found');
        }

        try {
            if (testimonialsResponse.ok) {
                const testimonialsData = await testimonialsResponse.json();
                testimonials = testimonialsData.testimonials || [];
            }
        } catch (e) {
            console.log('No testimonials data found');
        }

        currentData = {
            events: events,
            books: books,
            testimonials: testimonials
        };

        renderEvents();
        renderBooks();
        renderTestimonials();
    } catch (error) {
        console.error('Error loading data:', error);
        // Initialize with empty arrays if there's an error
        currentData = {
            events: [],
            books: [],
            testimonials: []
        };
        renderEvents();
        renderBooks();
        renderTestimonials();
    }
}

// Add these basic render functions
function renderEvents() {
    const eventsList = document.getElementById('events-list');
    if (!eventsList) return;

    eventsList.innerHTML = '<button onclick="addNewEvent()" class="add-btn">Add New Event</button>';

    // Sort events by date in descending order (most recent first)
    const sortedEvents = [...currentData.events].sort((a, b) => 
        new Date(b.date.fullDate) - new Date(a.date.fullDate)
    );

    // Calculate pagination
    const startIndex = (eventsCurrentPage - 1) * sectionItemsPerPage;
    const endIndex = startIndex + sectionItemsPerPage;
    const paginatedEvents = sortedEvents.slice(startIndex, endIndex);

    // Render events
    paginatedEvents.forEach(event => {
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
                    <p>Date: ${new Date(event.date.fullDate).toLocaleDateString()}</p>
                    <p>Location: ${event.location}</p>
                    <p>${event.description}</p>
                    ${event.isCompleted ? '<span class="completed-badge">Completed</span>' : ''}
                </div>
            </div>
            <div class="event-actions">
                <button onclick="editEvent('${event.id}')" class="edit-btn">Edit</button>
                <button onclick="deleteEvent('${event.id}')" class="delete-btn">Delete</button>
            </div>
        `;
        eventsList.appendChild(eventCard);
    });

    // Render pagination controls
    renderPaginationControls('events', eventsCurrentPage, sortedEvents.length);
}

function renderBooks() {
    const booksList = document.getElementById('books-list');
    if (!booksList) return;

    booksList.innerHTML = '<button onclick="addNewBook()" class="add-btn">Add New Book</button>';

    // Sort books by ID in descending order (most recent first)
    const sortedBooks = [...currentData.books].sort((a, b) => 
        b.id.localeCompare(a.id)
    );

    // Calculate pagination
    const startIndex = (booksCurrentPage - 1) * sectionItemsPerPage;
    const endIndex = startIndex + sectionItemsPerPage;
    const paginatedBooks = sortedBooks.slice(startIndex, endIndex);

    paginatedBooks.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <div class="book-content">
                <div class="book-image">
                    <img src="${book.image}" alt="${book.title}">
                </div>
                <div class="book-details">
                    <h3>${book.title}</h3>
                    <p>By ${book.author}</p>
                    <p>₹${book.price}</p>
                    <a href="${book.amazonLink}" target="_blank" class="amazon-link">View on Amazon</a>
                </div>
            </div>
            <div class="book-actions">
                <button onclick="editBook('${book.id}')" class="edit-btn">Edit</button>
                <button onclick="deleteBook('${book.id}')" class="delete-btn">Delete</button>
            </div>
        `;
        booksList.appendChild(bookCard);
    });

    // Render pagination controls
    renderPaginationControls('books', booksCurrentPage, sortedBooks.length);
}

function renderTestimonials() {
    const testimonialsList = document.getElementById('testimonials-list');
    if (!testimonialsList) return;

    testimonialsList.innerHTML = '<button onclick="addNewTestimonial()" class="add-btn">Add New Testimonial</button>';

    // Sort testimonials by ID in descending order (most recent first)
    const sortedTestimonials = [...currentData.testimonials].sort((a, b) => 
        b.id.localeCompare(a.id)
    );

    // Calculate pagination
    const startIndex = (testimonialsCurrentPage - 1) * sectionItemsPerPage;
    const endIndex = startIndex + sectionItemsPerPage;
    const paginatedTestimonials = sortedTestimonials.slice(startIndex, endIndex);

    paginatedTestimonials.forEach(testimonial => {
        const testimonialCard = document.createElement('div');
        testimonialCard.className = 'testimonial-card';
        testimonialCard.innerHTML = `
            <div class="testimonial-content">
                <div class="testimonial-details">
                    <h3>${testimonial.name}</h3>
                    <div class="rating">
                        ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5-testimonial.rating)}
                    </div>
                    <p class="content">${testimonial.content}</p>
                </div>
            </div>
            <div class="testimonial-actions">
                <button onclick="editTestimonial('${testimonial.id}')" class="edit-btn">Edit</button>
                <button onclick="deleteTestimonial('${testimonial.id}')" class="delete-btn">Delete</button>
            </div>
        `;
        testimonialsList.appendChild(testimonialCard);
    });

    // Render pagination controls
    renderPaginationControls('testimonials', testimonialsCurrentPage, sortedTestimonials.length);
}

function showAddForm(type, item = null) {
    const modal = document.getElementById('modal');
    const formContainer = document.getElementById('form-container');
    
    formContainer.innerHTML = `
        <h3>${item ? 'Edit' : 'Add'} ${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
        <form id="${type}Form" onsubmit="saveItem(event, '${type}', '${item ? item.id : ''}')">
            <div class="form-group">
                <label>${type === 'book' ? 'Book Cover Image' : 'Content'}</label>
                ${type === 'book' ? '<input type="file" name="bookImage" accept="image/*" required>' : ''}
                <textarea name="content" required rows="4">${item ? item.content : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Rating (1-5)</label>
                        <input type="number" name="rating" min="1" max="5" value="${item ? item.rating : ''}" required>
                    </div>
                    <button type="submit" class="add-btn">Save</button>
                </form>
            `;
    
    modal.style.display = 'block';
}

async function saveItem(event, type, id = null) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        let data = {};
        
        if (type === 'book') {
            const imageFile = formData.get('bookImage');
            if (imageFile && imageFile.size > 0) {
                const base64Image = await readFileAsDataURL(imageFile);
                data.image = base64Image;
            }
        }
        
        formData.forEach((value, key) => {
            if (key !== 'bookImage') {
                data[key] = value;
            }
        });

        const newItem = createItemObject(type, data, id);
        
        if (id) {
            const index = currentData[`${type}s`].findIndex(item => item.id === id);
            if (index !== -1) {
                currentData[`${type}s`][index] = newItem;
            }
        } else {
            currentData[`${type}s`].push(newItem);
        }

        await saveToJSON(type);
        
        document.getElementById('modal').style.display = 'none';
        renderSection(`${type}s`);
        
    } catch (error) {
        console.error('Error saving item:', error);
        alert('Failed to save item. Please try again.');
    }
}

function createItemObject(type, data, id) {
    switch(type) {
        case 'event':
            const eventDate = new Date(data.eventDate);
            return {
                id: id || `evt${Date.now()}`,
                title: data.title || '',
                date: {
                    fullDate: data.eventDate,
                    day: eventDate.getDate(),
                    month: eventDate.toLocaleString('default', { month: 'short' })
                },
                location: data.location || '',
                description: data.description || '',
                image: data.image || (id ? currentData.events.find(e => e.id === id)?.image : ''),
                isCompleted: data.isCompleted === 'on',
                link: '#'
            };
        case 'book':
            return {
                id: id || `bk${Date.now()}`,
                title: data.title,
                author: data.author,
                price: parseInt(data.price),
                amazonLink: data.amazonLink,
                image: data.image
            };
        case 'testimonial':
            return {
                id: id || `testimonial${Date.now()}`,
                name: data.name || '',
                content: data.content || '',
                rating: parseInt(data.rating)
            };
        default:
            throw new Error(`Unknown item type: ${type}`);
    }
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        // Check file size (5MB = 5 * 1024 * 1024 bytes)
        if (file.size > 5 * 1024 * 1024) {
            reject(new Error('Image size must be less than 5MB'));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

async function saveToJSON(type) {
    try {
        const response = await fetch(`/data/${type}s.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ [`${type}s`]: currentData[`${type}s`] })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        console.error('Error saving to JSON:', error);
        throw error;
    }
}

// Add functions for editing and deleting items
function editItem(id, section) {
    const item = currentData[section].find(item => item.id === id);
    if (item) {
        showAddForm(section.slice(0, -1), item);
    }
}

async function deleteItem(id, section) {
    if (confirm('Are you sure you want to delete this item?')) {
        currentData[section] = currentData[section].filter(item => item.id !== id);
        saveToJSON(section.slice(0, -1));
        renderSection(section);
    }
}

// Add some CSS to improve the delete button styling
const styles = `
    .delete-btn {
        background-color: #e74c3c;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .delete-btn:hover {
        background-color: #c0392b;
    }

    .btn-group {
        display: flex;
        gap: 10px;
    }
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Add this function to help extract ASIN
function extractASINFromURL(url) {
    const matches = url.match(/\/dp\/([A-Z0-9]{10})/);
    return matches ? matches[1] : null;
}

// Validate Amazon URL
function validateAmazonURL(url) {
    const asin = extractASINFromURL(url);
    if (!asin) {
        alert('Please enter a valid Amazon product URL (should contain /dp/XXXXXXXXXX)');
        return false;
    }
    return true;
}

// Add CSS styles for better book display
const bookStyles = `
    .book-image {
        width: 120px;
        height: 180px;
        overflow: hidden;
        border-radius: 4px;
        margin-right: 20px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .book-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .book-details {
        flex: 1;
    }

    .book-details h3 {
        margin: 0 0 10px 0;
        color: #333;
    }

    .book-details p {
        margin: 5px 0;
        color: #666;
    }

    .amazon-link {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        margin-top: 10px;
        padding: 5px 10px;
        background-color: #ff9900;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-size: 0.9em;
    }

    .amazon-link:hover {
        background-color: #e88a00;
    }

    .item-content {
        display: flex;
        padding: 15px;
        background: white;
        border-radius: 8px;
        margin-bottom: 10px;
    }

    .btn-group {
        display: flex;
        gap: 10px;
        padding: 0 15px 15px;
    }
`;

// Add the styles to the document
if (!document.getElementById('book-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'book-styles';
    styleSheet.textContent = bookStyles;
    document.head.appendChild(styleSheet);
}

// Add this function to generate and download CSV template
function downloadCSVTemplate() {
    const headers = ['title', 'author', 'price', 'amazonLink', 'imageUrl'];
    const csvContent = [
        headers.join(','),
        'Example Book,Author Name,499,https://amazon.in/dp/XXXXX,https://example.com/image.jpg'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'books_template.csv');
    a.click();
}

// Update the books section HTML to include bulk upload
function renderBooksSection() {
    const booksSection = document.getElementById('books-section');
    if (!booksSection) return;

    // Make sure the bulk upload buttons are visible
    const actionButtons = `
        <div class="section-actions">
            <button class="add-btn" onclick="showAddForm('book')">
                <i class="fas fa-plus"></i> Add New Book
            </button>
            <div class="bulk-actions">
                <button class="template-btn" onclick="downloadCSVTemplate()">
                    <i class="fas fa-download"></i> Download Template
                </button>
                <input type="file" id="bulkUpload" accept=".csv" style="display: none" 
                    onchange="handleBulkUpload(this.files)">
                <button class="upload-btn" onclick="document.getElementById('bulkUpload').click()">
                    <i class="fas fa-upload"></i> Bulk Upload
                </button>
            </div>
        </div>
    `;

    // Insert the action buttons after the h2
    const h2 = booksSection.querySelector('h2');
    if (h2) {
        h2.insertAdjacentHTML('afterend', actionButtons);
    }

    // Render the books list
    renderSection('books');
}

// Add validation function
function validateBookData(book, rowIndex) {
    const errors = [];

    if (!book.title) errors.push(`Row ${rowIndex}: Title is required`);
    if (!book.amazonLink) errors.push(`Row ${rowIndex}: Amazon link is required`);
    if (!book.price || isNaN(book.price)) errors.push(`Row ${rowIndex}: Valid price is required`);
    
    // Validate Amazon URL format
    if (book.amazonLink && !book.amazonLink.includes('amazon.in/dp/')) {
        errors.push(`Row ${rowIndex}: Invalid Amazon URL format`);
    }

    return errors;
}

// Update handleBulkUpload to include validation
async function handleBulkUpload(files) {
    if (!files || !files[0]) return;
    
    const progressBar = document.getElementById('upload-progress');
    progressBar.style.display = 'block';
    
    try {
        const file = files[0];
        const text = await file.text();
        const rows = text.split('\n').map(row => row.trim());
        
        // Process the CSV file
        // ... rest of your bulk upload logic ...
        
    } catch (error) {
        console.error('Error processing CSV:', error);
        alert('Error processing CSV file');
    } finally {
        progressBar.style.display = 'none';
    }
}

// Add these functions without modifying existing event functions

function addNewBook() {
    const modal = document.getElementById('modal');
    const formContainer = document.getElementById('form-container');
    
    formContainer.innerHTML = `
        <h3>Add New Book</h3>
        <form id="bookForm" onsubmit="saveBook(event)">
            <div class="form-group">
                <label>Title</label>
                <input type="text" name="title" required>
            </div>
            <div class="form-group">
                <label>Author</label>
                <input type="text" name="author" required>
            </div>
            <div class="form-group">
                <label>Price (₹)</label>
                <input type="number" name="price" required>
            </div>
            <div class="form-group">
                <label>Amazon Link</label>
                <input type="url" name="amazonLink" required>
            </div>
            <div class="form-group">
                <label>Book Cover Image</label>
                <input type="file" name="bookImage" accept="image/*" required>
                <div id="imagePreview" class="image-preview"></div>
            </div>
            <button type="submit" class="save-btn">Save Book</button>
        </form>
    `;

    // Add image preview functionality
    const imageInput = formContainer.querySelector('input[type="file"]');
    const imagePreview = formContainer.querySelector('#imagePreview');
    
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    modal.style.display = 'block';
}

async function saveBook(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        // Handle image
        const imageFile = formData.get('bookImage');
        let imageData = null;
        
        if (imageFile) {
            // Check file size before processing
            const fileSizeMB = imageFile.size / (1024 * 1024);
            if (fileSizeMB > 8) { // Setting limit to 8MB to account for base64 encoding
                throw new Error(`Image size (${fileSizeMB.toFixed(2)}MB) is too large. Please use an image under 8MB.`);
            }
            
            imageData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = () => reject(new Error('Failed to read image file'));
                reader.readAsDataURL(imageFile);
            });
        }

        const bookData = {
            id: 'bk_' + Date.now(),
            title: formData.get('title'),
            author: formData.get('author'),
            price: parseInt(formData.get('price')),
            amazonLink: formData.get('amazonLink'),
            image: imageData
        };

        // Add the new book to currentData
        currentData.books.push(bookData);
        
        // Save to books.json
        const response = await fetch('../data/books.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ books: currentData.books })
        });

        if (!response.ok) {
            throw new Error(`Failed to save book: ${response.status} ${response.statusText}`);
        }

        document.getElementById('modal').style.display = 'none';
        showError('Book saved successfully!');
        renderBooks();
    } catch (error) {
        console.error('Error saving book:', error);
        showError(error.message || 'Failed to save book. Please try again.');
        // Revert the changes in currentData if save failed
        if (currentData.books.length > 0) {
            currentData.books.pop();
        }
    }
}

async function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        try {
            currentData.books = currentData.books.filter(book => book.id !== id);
            await fetch('../data/books.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ books: currentData.books })
            });
            renderBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Failed to delete book. Please try again.');
        }
    }
}

// Add these functions without modifying existing event and book functions

function addNewTestimonial() {
    const modal = document.getElementById('modal');
    const formContainer = document.getElementById('form-container');
    
    formContainer.innerHTML = `
        <h3>Add New Testimonial</h3>
        <form id="testimonialForm" onsubmit="saveTestimonial(event)">
            <div class="form-group">
                <label>Name</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>Testimonial</label>
                <textarea name="content" required rows="4"></textarea>
            </div>
            <div class="form-group">
                <label>Rating (1-5)</label>
                <input type="number" name="rating" min="1" max="5" required>
            </div>
            <button type="submit" class="save-btn">Save Testimonial</button>
        </form>
    `;
    
    modal.style.display = 'block';
}

function editEvent(id) {
    const event = currentData.events.find(e => e.id === id);
    if (!event) return;

    const modal = document.getElementById('modal');
    const formContainer = document.getElementById('form-container');
    
    formContainer.innerHTML = `
        <h3>Edit Event</h3>
        <form id="eventForm" onsubmit="updateEvent(event, '${id}')">
            <div class="form-group">
                <label>Title</label>
                <input type="text" name="title" value="${event.title}" required>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" name="eventDate" value="${event.date.fullDate}" required>
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" name="location" value="${event.location}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" required rows="4">${event.description}</textarea>
            </div>
            <div class="form-group">
                <label>Event Image</label>
                <input type="file" name="eventImage" accept="image/*">
                ${event.image ? `
                    <div class="current-image">
                        <img src="${event.image}" alt="Current Image">
                        <p>Current image will be kept if no new image is uploaded</p>
                    </div>
                ` : ''}
            </div>
            <div class="form-group">
                <label class="checkbox-group">
                    <input type="checkbox" name="isCompleted" ${event.isCompleted ? 'checked' : ''}>
                    Event Completed
                </label>
            </div>
            <button type="submit" class="save-btn">Update Event</button>
        </form>
    `;
    
    modal.style.display = 'block';
}

async function updateEvent(event, id) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    // Handle image
    const imageFile = formData.get('eventImage');
    let imageData = null;
    
    if (imageFile && imageFile.size > 0) {
        imageData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(imageFile);
        });
    }

    const existingEvent = currentData.events.find(e => e.id === id);
    const eventDate = new Date(formData.get('eventDate'));
    
    const updatedEventData = {
        id: id,
        title: formData.get('title'),
        date: {
            fullDate: formData.get('eventDate'),
            day: eventDate.getDate(),
            month: eventDate.toLocaleString('default', { month: 'short' })
        },
        location: formData.get('location'),
        description: formData.get('description'),
        image: imageData || existingEvent.image, // Keep existing image if no new one uploaded
        isCompleted: formData.get('isCompleted') === 'on',
        link: existingEvent.link
    };

    try {
        const index = currentData.events.findIndex(e => e.id === id);
        if (index !== -1) {
            currentData.events[index] = updatedEventData;
            await fetch('../data/events.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ events: currentData.events })
            });

            document.getElementById('modal').style.display = 'none';
            renderEvents();
        }
    } catch (error) {
        console.error('Error updating event:', error);
        alert('Failed to update event. Please try again.');
    }
}

async function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        try {
            currentData.events = currentData.events.filter(event => event.id !== id);
            await fetch('../data/events.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ events: currentData.events })
            });
            renderEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event. Please try again.');
        }
    }
}

async function saveEvent(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        // Handle image
        const imageFile = formData.get('eventImage');
        let imageData = null;
        
        if (imageFile && imageFile.size > 0) {
            imageData = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(imageFile);
            });
        }

        const eventDate = new Date(formData.get('eventDate'));
        const eventData = {
            id: 'evt_' + Date.now(),
            title: formData.get('title'),
            date: {
                fullDate: formData.get('eventDate'),
                day: eventDate.getDate(),
                month: eventDate.toLocaleString('default', { month: 'short' })
            },
            location: formData.get('location'),
            description: formData.get('description'),
            image: imageData,
            isCompleted: formData.get('isCompleted') === 'on',
            link: '#'
        };

        // Add the new event to currentData
        currentData.events.push(eventData);
        
        // Save to events.json
        const response = await fetch('../data/events.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ events: currentData.events })
        });

        if (!response.ok) {
            throw new Error('Failed to save event');
        }

        // Close modal and refresh display
        document.getElementById('modal').style.display = 'none';
        renderEvents();
        showAlert('success', 'Event added successfully!');
    } catch (error) {
        console.error('Error saving event:', error);
        showAlert('error', 'Failed to save event. Please try again.');
        // Remove the event from currentData if save failed
        if (currentData.events.length > 0) {
            currentData.events.pop();
        }
    }
}

// Add error handling helper
function showError(message, isError = true) {
    const errorDiv = document.createElement('div');
    errorDiv.className = isError ? 'error-message' : 'success-message';
    errorDiv.textContent = message;
    errorDiv.style.color = isError ? 'red' : 'green';
    errorDiv.style.marginBottom = '10px';
    errorDiv.style.padding = '10px';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.backgroundColor = isError ? '#ffe6e6' : '#e6ffe6';
    
    // Remove any existing messages
    const existingMsg = document.querySelector('.error-message, .success-message');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // Insert message at the top of the form container or books list
    const container = document.getElementById('form-container') || document.getElementById('books-list');
    if (container) {
        container.insertBefore(errorDiv, container.firstChild);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
}

// Update the image handling in addNewBook and addNewEvent functions
async function handleImageUpload(input) {
    try {
        if (!input.files || !input.files[0]) {
            throw new Error('Please select an image');
        }
        const file = input.files[0];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            throw new Error('Please upload an image file');
        }
        
        return await readFileAsDataURL(file);
    } catch (error) {
        showError(error.message);
        throw error;
    }
}

async function handleFormSubmit(type, formData) {
    try {
        // Handle image upload if present
        let imageData = null;
        const imageInput = formData.get('image');
        if (imageInput instanceof File) {
            try {
                imageData = await handleImageUpload({ files: [imageInput] });
            } catch (error) {
                showError(error.message);
                return false;
            }
        }

        // Create data object based on type
        const data = {
            id: Date.now().toString(),
            title: formData.get('title'),
            description: formData.get('description'),
            image: imageData
        };

        // Add type-specific fields
        if (type === 'books') {
            data.author = formData.get('author');
            data.price = formData.get('price');
            data.amazonLink = formData.get('amazonLink');
        } else if (type === 'events') {
            data.date = formData.get('date');
            data.location = formData.get('location');
            data.time = formData.get('time');
        }

        // Update the data
        currentData[type].push(data);
        await saveData(type);
        return true;
    } catch (error) {
        showError('Error saving data: ' + error.message);
        return false;
    }
}

// Excel Template Download Function
function downloadTemplate() {
    const template = [
        ['Month', 'Book', 'Author', 'Event', 'Quantity', 'Sales Amount (₹)'],
        ['2024-03', 'Sample Book', 'Sample Author', 'Sample Event', '5', '50.00']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Template');
    XLSX.writeFile(wb, 'sales_data_template.xlsx');
}

// Excel Upload Handler
async function handleExcelUpload() {
    const fileInput = document.getElementById('excelFile');
    const statusDiv = document.getElementById('uploadStatus');
    
    if (!fileInput.files.length) {
        showUploadStatus('Please select a file', 'error');
        return;
    }

    try {
        const file = fileInput.files[0];
        const data = await readExcelFile(file);
        
        if (!data || !data.length) {
            showUploadStatus('No data found in the file', 'error');
            return;
        }

        // Validate headers
        const headers = data[0].map(h => h.trim());
        const requiredHeaders = ['Month', 'Book', 'Author', 'Event', 'Quantity', 'Sales Amount (₹)'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length) {
            showUploadStatus(`Missing required columns: ${missingHeaders.join(', ')}`, 'error');
            return;
        }

        // Process data rows (skip header)
        const processedData = [];
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row.some(cell => cell)) continue; // Skip empty rows

            const month = String(row[0] || '').trim();
            const book = String(row[1] || '').trim();
            const author = String(row[2] || '').trim();
            const event = String(row[3] || '').trim();
            const quantity = parseInt(String(row[4] || '0').trim());
            const salesAmount = parseFloat(String(row[5] || '0').trim());

            // Validate row data
            if (!month || !book || !author) {
                showUploadStatus(`Row ${i + 1}: Missing required fields (Month, Book, Author)`, 'error');
                return;
            }

            if (isNaN(quantity) || quantity <= 0) {
                showUploadStatus(`Row ${i + 1}: Invalid quantity. Must be a positive number`, 'error');
                return;
            }

            if (isNaN(salesAmount) || salesAmount < 0) {
                showUploadStatus(`Row ${i + 1}: Invalid sales amount. Must be a non-negative number`, 'error');
                return;
            }

            processedData.push({
                month,
                book_name: book,
                author,
                event_name: event,
                quantity,
                sales_amount: salesAmount
            });
        }

        if (processedData.length === 0) {
            showUploadStatus('No valid data rows found in the file', 'error');
            return;
        }

        // Send data to server
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/sales/bulk-upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sales: processedData })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to upload sales data');
        }

        showUploadStatus(`Successfully uploaded ${processedData.length} sales records`, 'success');
        fileInput.value = '';
        
        // Refresh the sales table
        await loadSalesData();
        
    } catch (error) {
        console.error('Upload error:', error);
        showUploadStatus(error.message || 'Failed to process Excel file', 'error');
    }
}

// Helper function to read Excel file
function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                resolve(jsonData);
            } catch (error) {
                reject(new Error('Failed to read Excel file'));
            }
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
}

// Helper function to show upload status
function showUploadStatus(message, type = 'error') {
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.textContent = message;
    statusDiv.className = `upload-status ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

function applySalesFilters() {
    const selectedMonth = document.getElementById('monthFilter').value;
    const selectedBook = document.getElementById('bookFilter').value;
    const selectedAuthor = document.getElementById('authorFilter').value;

    console.log('Applying filters:', { selectedMonth, selectedBook, selectedAuthor });
    console.log('Total records before filtering:', salesData.length);

    filteredSalesData = salesData.filter(sale => {
        let matches = true;
        
        if (selectedMonth) {
            matches = matches && sale.month === selectedMonth;
        }
        if (selectedBook) {
            matches = matches && sale.book_name === selectedBook;
        }
        if (selectedAuthor) {
            matches = matches && sale.book_author === selectedAuthor;
        }

        return matches;
    });

    console.log('Filtered records:', filteredSalesData.length);
    currentPage = 1; // Reset to first page when filtering
    renderSalesTable();
}

function renderSalesTable() {
    const tableBody = document.querySelector('#salesTable tbody');
    if (!tableBody) return;

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredSalesData.slice(startIndex, endIndex);

    if (!paginatedData || paginatedData.length === 0) {
        const colspan = isAdmin() ? 9 : 8;
        tableBody.innerHTML = `<tr><td colspan="${colspan}" class="no-data">No sales records found</td></tr>`;
        updatePagination();
        return;
    }

    let html = '';
    paginatedData.forEach(sale => {
        const salesAmount = parseFloat(sale.sales_amount);
        const totalAmount = salesAmount * sale.quantity;
        
        html += `
            <tr>
                <td>${formatMonthDisplay(sale.month) || '-'}</td>
                <td>${sale.book_name || '-'}</td>
                <td>${sale.book_author || '-'}</td>
                <td>${sale.event_name || '-'}</td>
                <td>${sale.quantity || 0}</td>
                <td>₹${salesAmount.toFixed(2)}</td>
                <td>₹${totalAmount.toFixed(2)}</td>
                <td>
                    <div class="redeemed-status ${sale.redeemed ? 'redeemed' : ''}">
                        ${sale.redeemed ? 'Redeemed' : 'Not Redeemed'}
                    </div>
                </td>
                ${isAdmin() ? `
                    <td>
                        <button onclick="toggleRedeemed('${sale.id}')" class="action-btn">
                            ${sale.redeemed ? 'Mark Not Redeemed' : 'Mark Redeemed'}
                        </button>
                    </td>
                ` : ''}
            </tr>
        `;
    });

    tableBody.innerHTML = html;
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredSalesData.length / itemsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevButton = document.querySelector('.page-btn:first-child');
    const nextButton = document.querySelector('.page-btn:last-child');
    
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    }
    
    if (prevButton) {
        prevButton.disabled = currentPage === 1;
    }
    
    if (nextButton) {
        nextButton.disabled = currentPage === totalPages || totalPages === 0;
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderSalesTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredSalesData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderSalesTable();
    }
}

// Helper function to format month for display
function formatMonthDisplay(monthStr) {
    if (!monthStr) return '-';
    try {
        const [year, month] = monthStr.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } catch (error) {
        console.error('Error formatting month:', error);
        return monthStr;
    }
}

// Load filter options
function loadFilterOptions() {
    if (!salesData || !salesData.length) return;

    // Get unique values for each filter
    const months = [...new Set(salesData.map(s => s.month))].filter(Boolean).sort().reverse();
    const books = [...new Set(salesData.map(s => s.book_name))].filter(Boolean).sort();
    const authors = [...new Set(salesData.map(s => s.book_author))].filter(Boolean).sort();

    // Populate filter dropdowns
    populateSelect('monthFilter', months);
    populateSelect('bookFilter', books);
    populateSelect('authorFilter', authors);
}

// Helper function to populate select elements
function populateSelect(id, options) {
    const select = document.getElementById(id);
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">All</option>';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option === option.month ? formatMonthDisplay(option) : option;
        select.appendChild(opt);
    });
    select.value = currentValue;
}

function renderSalesData(sales) {
    const tableBody = document.getElementById('salesTableBody');
    tableBody.innerHTML = '';

    if (!sales || sales.length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `<td colspan="8" class="no-data">No sales data available</td>`;
        tableBody.appendChild(noDataRow);
        return;
    }

    sales.forEach(sale => {
        // Calculate total amount based on quantity and fixed sales_amount
        const salesAmount = 50.00; // Fixed sales amount
        const totalAmount = salesAmount * sale.quantity;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.month}</td>
            <td>${sale.book_name}</td>
            <td class="admin-only">${sale.book_author}</td>
            <td>${sale.event_name}</td>
            <td>${sale.quantity}</td>
            <td>₹${salesAmount.toFixed(2)}</td>
            <td>₹${totalAmount.toFixed(2)}</td>
            <td>
                <button class="action-btn ${sale.redeemed ? 'redeemed' : ''}" 
                        onclick="toggleRedeemed('${sale.id}')">
                    ${sale.redeemed ? 'Mark Not Redeemed' : 'Mark Redeemed'}
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function toggleRedeemed(saleId) {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/sales/${saleId}/toggle-redeemed`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to update redeemed status');
        }

        // Update local data
        const saleIndex = salesData.findIndex(s => s.id === saleId);
        if (saleIndex !== -1) {
            salesData[saleIndex].redeemed = !salesData[saleIndex].redeemed;
            filteredSalesData = filteredSalesData.map(s => 
                s.id === saleId ? { ...s, redeemed: !s.redeemed } : s
            );
            renderSalesTable();
        }
    } catch (error) {
        console.error('Error toggling redeemed status:', error);
        showAlert('error', 'Failed to update redeemed status');
    }
}

// Update the checkAuth function to be more robust
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    const user = JSON.parse(localStorage.getItem('adminUser'));
    
    if (!token || !user) {
        window.location.href = '/admin/login.html';
        return;
    }

    // Update page title based on role
    document.title = user.role === 'admin' ? 'TGIBT Admin Dashboard' : 'TGIBT Sales Dashboard';
    
    // Update header text based on role
    const headerTitle = document.querySelector('.admin-header h1');
    if (headerTitle) {
        headerTitle.textContent = user.role === 'admin' ? 'TGIBT Admin Dashboard' : 'TGIBT Sales Dashboard';
    }
}

async function loadSalesData() {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = '/admin/login.html';
            return;
        }

        const response = await fetch('/api/sales', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                window.location.href = '/admin/login.html';
                return;
            }
            throw new Error(`Failed to fetch sales data: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success || !Array.isArray(data.sales)) {
            throw new Error('Invalid response format');
        }

        salesData = data.sales;
        filteredSalesData = [...salesData];

        // Load filter options
        loadFilterOptions();
        
        // Render the table
        renderSalesTable();
        
    } catch (error) {
        console.error('Error loading sales data:', error);
        const tableBody = document.querySelector('#salesTable tbody');
        if (tableBody) {
            const colspan = isAdmin() ? 9 : 8;
            tableBody.innerHTML = `
                <tr>
                    <td colspan="${colspan}" class="no-data">
                        Failed to load sales data. ${error.message}
                        <br>
                        <button onclick="loadSalesData()" class="retry-btn">Retry</button>
                    </td>
                </tr>
            `;
        }
    }
}

// Helper function to check if user is admin
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('adminUser'));
    return user && user.role === 'admin';
}

function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Initialize sales management
async function initializeSalesManagement() {
    try {
        const response = await fetch('/api/sales/all', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch sales data');
        }

        salesData = await response.json();
        filteredSalesData = [...salesData]; // Initialize filtered data with all records
        
        console.log('Loaded sales data:', salesData.length, 'records');
        
        // Load filter options first
        loadFilterOptions();
        
        // Then render the table
        renderSalesTable();
        
    } catch (error) {
        console.error('Error initializing sales management:', error);
        showAlert('error', 'Failed to load sales data');
    }
}

// Add these functions for pagination controls
function renderPaginationControls(section, currentPage, totalItems) {
    const totalPages = Math.ceil(totalItems / sectionItemsPerPage);
    const container = document.getElementById(`${section}-pagination`);
    if (!container) {
        // Create pagination container if it doesn't exist
        const sectionDiv = document.getElementById(`${section}-list`);
        const paginationDiv = document.createElement('div');
        paginationDiv.id = `${section}-pagination`;
        paginationDiv.className = 'pagination-controls';
        sectionDiv.appendChild(paginationDiv);
    }

    const paginationContainer = document.getElementById(`${section}-pagination`);
    paginationContainer.innerHTML = `
        <button onclick="changePage('${section}', 'prev')" class="page-btn" ${currentPage === 1 ? 'disabled' : ''}>
            Previous
        </button>
        <span class="page-info">Page ${currentPage} of ${totalPages || 1}</span>
        <button onclick="changePage('${section}', 'next')" class="page-btn" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}>
            Next
        </button>
    `;
}

function changePage(section, direction) {
    switch(section) {
        case 'events':
            if (direction === 'prev' && eventsCurrentPage > 1) eventsCurrentPage--;
            else if (direction === 'next' && eventsCurrentPage < Math.ceil(currentData.events.length / sectionItemsPerPage)) eventsCurrentPage++;
            renderEvents();
            break;
        case 'books':
            if (direction === 'prev' && booksCurrentPage > 1) booksCurrentPage--;
            else if (direction === 'next' && booksCurrentPage < Math.ceil(currentData.books.length / sectionItemsPerPage)) booksCurrentPage++;
            renderBooks();
            break;
        case 'testimonials':
            if (direction === 'prev' && testimonialsCurrentPage > 1) testimonialsCurrentPage--;
            else if (direction === 'next' && testimonialsCurrentPage < Math.ceil(currentData.testimonials.length / sectionItemsPerPage)) testimonialsCurrentPage++;
            renderTestimonials();
            break;
    }
}

// Add pagination styles
const paginationStyles = `
    .pagination-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 1.5rem;
        padding: 1rem;
    }

    .page-btn {
        padding: 0.5rem 1rem;
        border: 1px solid #ddd;
        background-color: #fff;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .page-btn:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
        opacity: 0.7;
    }

    .page-btn:not(:disabled):hover {
        background-color: #f0f0f0;
    }

    .page-info {
        font-size: 0.9rem;
        color: #666;
    }
`;

// Add the pagination styles to the document
if (!document.getElementById('pagination-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'pagination-styles';
    styleSheet.textContent = paginationStyles;
    document.head.appendChild(styleSheet);
}

function addNewEvent() {
    const modal = document.getElementById('modal');
    const formContainer = document.getElementById('form-container');
    
    formContainer.innerHTML = `
        <h3>Add New Event</h3>
        <form id="eventForm" onsubmit="saveEvent(event)">
            <div class="form-group">
                <label>Title</label>
                <input type="text" name="title" required>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" name="eventDate" required>
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" name="location" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" required rows="4"></textarea>
            </div>
            <div class="form-group">
                <label>Event Image</label>
                <input type="file" name="eventImage" accept="image/*">
            </div>
            <div class="form-group">
                <label class="checkbox-group">
                    <input type="checkbox" name="isCompleted">
                    Event Completed
                </label>
            </div>
            <button type="submit" class="save-btn">Save Event</button>
        </form>
    `;
    
    modal.style.display = 'block';
}