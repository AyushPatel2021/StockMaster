# StockMaster - Inventory Management System

StockMaster is a modern and lightweight inventory management solution. This repository contains the initial milestone focusing on the authentication and user account system.

## Features

- **User Authentication**: Signup, Login, Logout.
- **Security**: JWT-based authentication, bcrypt password hashing.
- **Password Recovery**: Email-based OTP flow for password resets.
- **Dashboard**: Protected user dashboard (dummy).
- **Tech Stack**: React (Vite), Node.js (Express), PostgreSQL, Knex.js.

## Prerequisites

- Node.js (v16+)
- PostgreSQL (v12+)

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database named `stockmaster_db` (or your preferred name).

```sql
CREATE DATABASE stockmaster_db;
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

**Update the `.env` file with your credentials:**

- `DB_USER`, `DB_PASS`, `DB_NAME`: Your PostgreSQL credentials.
- `EMAIL_USER`, `EMAIL_PASS`: Your email credentials for sending OTPs (e.g., Gmail App Password).
- `JWT_SECRET`: Set a secure random string.

Run database migrations:

```bash
npm run migrate
```

Start the backend server:

```bash
npm start
```
The server will run on `http://localhost:5000`.

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## API Endpoints

- `POST /api/auth/signup`: Register a new user.
- `POST /api/auth/login`: Login and receive JWT.
- `POST /api/auth/request-otp`: Request password reset OTP.
- `POST /api/auth/verify-otp`: Verify OTP code.
- `POST /api/auth/reset-password`: Reset password with token.
- `GET /api/auth/me`: Get current user profile (Protected).

## Project Structure

```
/backend
  /src
    /controllers   # Route logic
    /db           # Database config & migrations
    /middleware   # Auth middleware
    /routes       # API routes
    /services     # Email service
  server.js       # Entry point

/frontend
  /src
    /api          # Axios setup
    /pages        # React pages
    App.jsx       # Routing
```