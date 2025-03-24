# BikeMounts Ecommerce Application

This is an ecommerce application for selling share bike phone mounts, built with Next.js, ShadCN, TailwindCSS, Prisma ORM, and Supabase.

## Technologies Used

- **Next.js**: React framework for building the frontend
- **ShadCN**: UI component library 
- **TailwindCSS**: Utility-first CSS framework
- **Prisma ORM**: Database ORM for TypeScript
- **Supabase**: Backend as a service (BaaS) for auth, database, and storage

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- PostgreSQL database (local or via Supabase)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd econ-v2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file and update with your credentials:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your Supabase URL and anon key, and PostgreSQL database URL.

5. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Database Schema

The application uses the following database schema:

- **Product**: Information about individual products
- **Category**: Product categories
- **User**: User information for authentication
- **Order**: Order details
- **OrderItem**: Individual items within an order

## Features

- Browse and search products
- Product categories
- Shopping cart functionality
- User authentication
- Order processing
- Admin dashboard (coming soon)

## Development

To add new components from ShadCN:

```bash
npx shadcn add [component-name]
```

To update the database schema:

1. Modify the schema in `prisma/schema.prisma`
2. Run `npx prisma migrate dev` to generate and apply migrations
3. Run `npx prisma generate` to update the Prisma client

## Learn More
