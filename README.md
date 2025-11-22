# StockMaster - Inventory Management System

StockMaster is a comprehensive, modern, and lightweight inventory management solution designed to streamline operations for businesses. It features a robust backend, a premium frontend UI, and a complete workflow for managing products, stock, and internal movements.

## Features

-   **User Authentication**: Secure Signup, Login, and Logout with JWT and bcrypt.
-   **Role-Based Access Control (RBAC)**:
    -   **Admin**: Full access to all modules (Settings, Users, Products, Operations).
    -   **Inventory Manager**: Access to Operations, Stock, and Settings (Warehouses/Locations).
    -   **Staff**: Access to Operations and Stock view.
-   **Product Management**: Create and manage categories and products with location-specific reorder points.
-   **Inventory Operations**:
    -   **Receipts (Incoming)**: 3-stage workflow (Draft -> Ready -> Done) for receiving goods.
    -   **Deliveries (Outgoing)**: 3-stage workflow for shipping goods to customers.
    -   **Internal Transfers**: Move stock between warehouses or locations.
-   **Stock Management**: Real-time view of "On Hand" and "Free to Use" stock across all locations.
-   **Dashboard**: Premium overview with key metrics (Low Stock, Pending Orders) and recent activity.
-   **History**: Unified timeline of all stock movements.

## Tech Stack

-   **Frontend**: React (Vite), Material UI (MUI), Axios.
-   **Backend**: Node.js (Express), PostgreSQL, Knex.js.
-   **Database**: PostgreSQL.

## Prerequisites

-   Node.js (v16+)
-   PostgreSQL (v12+)

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database named `stockmaster_db`:

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

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

**Update `.env` with your credentials:**

-   `DB_USER`, `DB_PASS`, `DB_NAME`: Your PostgreSQL credentials.
-   `JWT_SECRET`: Set a secure random string.
-   `EMAIL_USER`, `EMAIL_PASS`: (Optional) For OTP emails.

Run database migrations to set up the schema:

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

## Application Flow & Usage

### 1. Initial Login
-   **Default Admin Credentials**:
    -   **Username**: `admin`
    -   **Password**: `admin`
-   Log in to access the dashboard.

### 2. Setup (Admin/Manager)
1.  **Warehouses & Locations**: Go to **Settings** (in the user menu) to define your physical storage hierarchy (e.g., "Main Warehouse", "Shelf A").
2.  **Categories**: Go to **Products** -> **Category Manager** to define product categories.
3.  **Products**: Go to **Products** to add items to your inventory. Set "Min Quantity" per location to trigger low stock alerts.

### 3. Operations (Daily Workflow)
-   **Receiving Goods**:
    1.  Go to **Operations** -> **Receipts**.
    2.  Create a new Receipt (Status: **Draft**).
    3.  Click **Mark as Ready** when the vendor confirms shipment (Increases "Free to Use" stock).
    4.  Click **Validate** when goods physically arrive (Increases "On Hand" stock).
-   **Shipping Goods**:
    1.  Go to **Operations** -> **Deliveries**.
    2.  Create a new Delivery.
    3.  Click **Check Availability** to reserve stock (Decreases "Free to Use").
    4.  Click **Validate** to ship (Decreases "On Hand").
-   **Moving Stock**:
    1.  Go to **Operations** -> **Transfers**.
    2.  Select Source and Destination locations.
    3.  Follow the same **Check Availability** -> **Validate** flow to move stock.

### 4. Monitoring
-   **Dashboard**: Check for "Low Stock" alerts and "Pending" orders.
-   **Stock**: View detailed stock levels per location.
-   **History**: Audit all past movements.

## Project Structure

```
/backend
  /src
    /db           # Migrations & Seeds
    /routes       # API Endpoints (Auth, Products, Operations, etc.)
    /middleware   # Auth & Role checks
  server.js       # Entry point

/frontend
  /src
    /pages        # UI Pages (Dashboard, Forms, Lists)
    /components   # Reusable UI components (Navbar, ProtectedRoute)
    /api          # Axios configuration
  App.jsx         # Routing
```