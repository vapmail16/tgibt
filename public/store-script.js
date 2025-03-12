document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu functionality
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Get DOM elements
    const booksGrid = document.querySelector('.books-grid');
    const loadingState = document.querySelector('.loading');
    const noBooksMessage = document.querySelector('.no-books');
    const searchInput = document.querySelector('#book-search');

    let allBooks = [];

    // Load books data
    async function loadBooks() {
        try {
            const response = await fetch('../data/books.json');
            if (!response.ok) throw new Error('Failed to load books');
            
            const data = await response.json();
            console.log('Loaded data:', data); // Debug log
            
            // If data is wrapped in an object, try to find the books array
            let booksArray = data;
            if (!Array.isArray(data)) {
                // Check common wrapper properties
                if (data.books) booksArray = data.books;
                else if (data.items) booksArray = data.items;
                else if (data.data) booksArray = data.data;
                else {
                    // If we still don't have an array, log the structure and throw error
                    console.error('Unexpected data structure:', data);
                    throw new Error('Invalid books data format - expected an array or object with books array');
                }
            }
            
            // Validate the array items have required properties
            if (!Array.isArray(booksArray) || !booksArray.every(book => 
                book && 
                typeof book === 'object' &&
                'title' in book &&
                'author' in book
            )) {
                console.error('Invalid book items format:', booksArray);
                throw new Error('Invalid book items format - missing required properties');
            }
            
            allBooks = booksArray;
            
            // Sort books by title if there are books
            if (allBooks.length > 0) {
                allBooks.sort((a, b) => a.title.localeCompare(b.title));
            }
            
            displayBooks(allBooks);
            loadingState.style.display = 'none';
        } catch (error) {
            console.error('Error loading books:', error);
            loadingState.style.display = 'none';
            noBooksMessage.style.display = 'block';
            noBooksMessage.textContent = 'Error loading books. Please try again later.';
        }
    }

    // Search books based on input
    function searchBooks(query) {
        query = query.toLowerCase().trim();
        
        if (!query) {
            displayBooks(allBooks);
            return;
        }

        const filteredBooks = allBooks.filter(book => 
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.description.toLowerCase().includes(query)
        );

        displayBooks(filteredBooks);
    }

    // Display books in the grid
    function displayBooks(books) {
        if (books.length === 0) {
            booksGrid.innerHTML = '';
            noBooksMessage.style.display = 'block';
            return;
        }

        noBooksMessage.style.display = 'none';
        booksGrid.innerHTML = books.map(book => `
            <div class="book-card">
                <div class="book-image">
                    <img src="${book.image}" alt="${book.title}">
                </div>
                <div class="book-details">
                    <h3>${book.title}</h3>
                    <p class="book-author">by ${book.author}</p>
                    <p class="book-description">${book.description}</p>
                    <p class="book-price">$${book.price.toFixed(2)}</p>
                    <a href="${book.amazonLink}" class="btn buy-btn" target="_blank">
                        <i class="fab fa-amazon"></i>
                        Buy on Amazon
                    </a>
                </div>
            </div>
        `).join('');
    }

    // Add event listener for search input
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchBooks(e.target.value);
        }, 300);
    });

    // Initial load
    loadBooks();
}); 