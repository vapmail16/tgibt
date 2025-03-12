let currentData = {
    events: [],
    books: [],
    testimonials: []
};

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    loadAllData();
});

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Remove active class from all buttons
            navButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected section and activate button
            const sectionName = button.getAttribute('data-section');
            document.getElementById(`${sectionName}-section`).style.display = 'block';
            button.classList.add('active');
        });
    });

    // Show Events section by default
    document.getElementById('events-section').style.display = 'block';
    document.querySelector('[data-section="events"]').classList.add('active');
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

    // Render existing events
    currentData.events.forEach(event => {
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
}

function renderBooks() {
    const container = document.getElementById('books-list');
    if (!container) return;
    container.innerHTML = '<button onclick="addNewBook()" class="add-btn">Add New Book</button>';
}

function renderTestimonials() {
    const container = document.getElementById('testimonials-list');
    if (!container) return;
    container.innerHTML = '<button onclick="addNewTestimonial()" class="add-btn">Add New Testimonial</button>';
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

function renderBooks() {
    const booksList = document.getElementById('books-list');
    if (!booksList) return;

    booksList.innerHTML = '';
    currentData.books.forEach(book => {
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

function renderTestimonials() {
    const testimonialsList = document.getElementById('testimonials-list');
    if (!testimonialsList) return;

    testimonialsList.innerHTML = '';
    currentData.testimonials.forEach(testimonial => {
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
}

async function saveTestimonial(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const testimonialData = {
        id: 'tm_' + Date.now(),
        name: formData.get('name'),
        content: formData.get('content'),
        rating: parseInt(formData.get('rating'))
    };

    try {
        currentData.testimonials.push(testimonialData);
        await fetch('../data/testimonials.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ testimonials: currentData.testimonials })
        });

        document.getElementById('modal').style.display = 'none';
        renderTestimonials();
    } catch (error) {
        console.error('Error saving testimonial:', error);
        alert('Failed to save testimonial. Please try again.');
    }
}

async function deleteTestimonial(id) {
    if (confirm('Are you sure you want to delete this testimonial?')) {
        try {
            currentData.testimonials = currentData.testimonials.filter(testimonial => testimonial.id !== id);
            await fetch('../data/testimonials.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ testimonials: currentData.testimonials })
            });
            renderTestimonials();
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            alert('Failed to delete testimonial. Please try again.');
        }
    }
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

    try {
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
    } catch (error) {
        console.error('Error saving event:', error);
        alert('Failed to save event. Please try again.');
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
 