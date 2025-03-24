# BikeMounts E-commerce

A modern e-commerce platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Modern, responsive design
- Server-side rendering with Next.js
- Type-safe development with TypeScript
- Secure authentication system
- Shopping cart functionality
- Stripe payment integration
- PostHog analytics integration
- AWS Amplify deployment

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your environment variables:
   ```bash
   cp .env.example .env
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Make sure to set up the following environment variables:

- `DATABASE_URL`: Your PostgreSQL database URL
- `JWT_SECRET`: Secret key for JWT authentication
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
- `NEXT_PUBLIC_POSTHOG_KEY`: Your PostHog project API key
- `NEXT_PUBLIC_POSTHOG_HOST`: PostHog host URL (default: https://app.posthog.com)

## Analytics Setup

This project uses PostHog for analytics. To set up:

1. Create a PostHog account at [https://posthog.com](https://posthog.com)
2. Create a new project and get your API key
3. Add your PostHog API key to the environment variables
4. Analytics will automatically track page views and can be extended for custom events

## Deployment

### AWS Amplify Deployment

1. Fork this repository to your GitHub account
2. Set up an AWS account if you haven't already
3. Install and configure the AWS Amplify CLI
4. Create a new Amplify app:
   - Go to AWS Amplify Console
   - Click "New App" > "Host Web App"
   - Connect to your GitHub repository
   - Configure build settings (amplify.yml is already included)
   - Add environment variables in the Amplify Console
5. Deploy your application

### Environment Variables in Amplify

Add the following environment variables in the AWS Amplify Console:

- All variables from your `.env` file
- Make sure to mark sensitive variables as secret

### Production Considerations

1. Set up proper error monitoring (e.g., Sentry)
2. Configure proper caching strategies
3. Set up CI/CD pipelines
4. Monitor performance metrics
5. Regular security audits
6. Database backups
7. SSL certificate configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

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
