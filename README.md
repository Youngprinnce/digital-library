# 📚 Digital Library API

A digital library management system built with NestJS, featuring user authentication, book management, and borrowing capabilities.

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start the application
npm run start:dev

# Access the API
http://localhost:3000

# Swagger documentation
http://localhost:3000/docs
```

## 🔑 Key Features

- **Authentication**: JWT-based with role-based access (admin/user)
- **Book Management**: Create, list, borrow, and return books
- **Admin Access**: Create admin users by passing `role: "admin"` in registration

## 📖 API Endpoints

### Authentication
```bash
# Register User
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123"
}

# Register Admin
POST /auth/register
{
  "email": "admin@example.com", 
  "password": "password123",
  "role": "admin"
}

# Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Books
```bash
# Get all books
GET /books

# Create book (Admin only)
POST /books
Authorization: Bearer <token>
{
  "title": "Book Title",
  "author": "Author Name",
  "isbn": "978-0-123456-78-9"
}

# Borrow book
POST /books/:id/borrow
Authorization: Bearer <token>

# Return book  
POST /books/:id/return
Authorization: Bearer <token>

# Get my borrowed books
GET /me/borrowed-books
Authorization: Bearer <token>
```

## 🛠️ Tech Stack

- **Framework**: NestJS 11.x
- **Database**: SQLite with TypeORM
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## 🧪 Testing

```bash
# Run tests
npm test

# Test coverage
npm run test:cov
```
