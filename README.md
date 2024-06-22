# Next.js eCommerce Website with Stripe Integration

This repository contains the source code for a modern eCommerce website built using Next.js, with a fully integrated Stripe payment gateway.

# Features

+ Product Listing: Browse a variety of digital products with detailed descriptions and prices.
+ Checkout Process: Secure checkout with Stripe integration.
+ Admin Authentication: Admin authentication for new product listing.
+ Order Management: View order history and order details.
+ Responsive Design: Optimized for both desktop and mobile devices.

# Tech Stack

+ Frontend: Next.js
+ Payment Gateway: Stripe
+ Styling: Tailwind CSS
+ Database: PostgreSQL
+ ORM: Prisma
+ Deployment: Vercel

# Getting Started

## Prerequisites

Ensure you have the following installed on your machine:

Node.js (>= 14.x)
npm (>= 6.x) or yarn (>= 1.x)

# Installation

1. Clone the repository:

```
git clone https://github.com/your-username/nextjs-ecommerce.git
cd nextjs-ecommerce
```

2. Install dependencies:

```npm install
# or
yarn install
```

3. Set up environment variables:

Create a **.env.local** file in the root directory and add the following environment variables:

```
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:

```
npm run dev
# or
yarn dev
```

Open http://localhost:3000 with your browser to see the result.
