# TGIBT Admin Dashboard

A comprehensive admin dashboard for managing events, books, testimonials, and sales data for TGIBT (The Girl in Blue Tshirt).

## Features

- **User Authentication**
  - Role-based access control (Admin and Sales roles)
  - Secure login system

- **Events Management**
  - Create, edit, and delete events
  - Upload event images
  - Mark events as completed
  - Pagination with 5 items per page

- **Books Management**
  - Add and manage books with cover images
  - Link to Amazon product pages
  - Bulk upload via CSV
  - Pagination with 5 items per page

- **Testimonials Management**
  - Add and manage customer testimonials
  - Star rating system
  - Pagination with 5 items per page

- **Sales Management**
  - Track book sales and events
  - Excel template for bulk uploads
  - Filter sales by month, book, and author
  - Mark sales as redeemed/not redeemed
  - Pagination with 10 items per page

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: JWT (JSON Web Tokens)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tgibt-admin.git
   cd tgibt-admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add:
   ```
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=your_db_host
   DB_PORT=5432
   DB_NAME=your_db_name
   JWT_SECRET=your_jwt_secret
   ```

4. Initialize the database:
   ```bash
   npm run db:init
   ```

5. Start the server:
   ```bash
   npm start
   ```

## Usage

1. Access the admin dashboard at `http://localhost:3000/admin`
2. Log in with your credentials
3. Navigate through different sections using the navigation menu
4. Use the "Add New" buttons to create new entries
5. Use filters and pagination to manage large datasets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the TGIBT team for their support and feedback 