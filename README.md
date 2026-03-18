# E-commerce Platform LinkHabi

A modern e-commerce platform built with Next.js, TypeScript, and Tailwind CSS.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/ivans-projects-754c9c55/v0-e-commerce-platform-link-habi)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/mFVff5IdzY1)

## 🚀 Live Demo

**[https://e-com-86a6.vercel.app](https://e-com-86a6.vercel.app)**

## 📋 Features

- **Multi-role Authentication**: Admin, Customer, Logistics, Rider
- **Product Management**: Custom products with variants, pricing, and inventory
- **Order Management**: Complete order lifecycle with tracking
- **Sales Analytics**: Comprehensive sales reports and metrics
- **Delivery System**: Rider assignment and delivery tracking
- **Responsive Design**: Mobile-first design with modern UI

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **UI Components**: shadcn/ui, Lucide Icons
- **Date Handling**: date-fns, react-day-picker
- **Deployment**: Vercel

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Clone and Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aybs12819/v0-e-commerce-platform-link-habi.git
   cd v0-e-commerce-platform-link-habi
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Database Setup**
   
   - Create a new Supabase project
   - Run the SQL scripts in the `scripts/` directory in order:
     - `00-create-custom-products-table.sql`
     - `01-initial-schema.sql`
     - `02-auth-triggers.sql`
     - And all other numbered scripts

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Admin Credentials

Use these credentials to access the admin dashboard:

- **Email**: `fernandezivan140@gmail.com`
- **Password**: `admin123`

### Accessing Admin Panel

1. Go to the homepage
2. Click on "Sign In"
3. Enter admin credentials above
4. You'll be redirected to the admin dashboard at `/admin`

## 📁 Project Structure

```
├── app/                    # Next.js app router
│   ├── admin/              # Admin dashboard
│   ├── auth/               # Authentication pages
│   ├── cart/               # Shopping cart
│   ├── customer/           # Customer dashboard
│   ├── logistics/          # Logistics management
│   └── rider/              # Rider interface
├── components/             # Reusable components
│   ├── admin/              # Admin-specific components
│   ├── customer/           # Customer components
│   ├── logistics/          # Logistics components
│   ├── rider/              # Rider components
│   ├── sales/              # Sales-related components
│   └── ui/                 # Base UI components
├── lib/                    # Utility functions and types
├── scripts/                # Database migration scripts
└── public/                 # Static assets
```

## 🎯 Key Features by Role

### Admin
- Product management with variants
- Order management and fulfillment
- Sales reports and analytics
- User management
- Logistics oversight

### Customer
- Browse products and categories
- Shopping cart functionality
- Order tracking
- Account management
- Product reviews

### Logistics
- Rider assignment and management
- Delivery tracking
- Route optimization
- Delivery status updates

### Rider
- View assigned deliveries
- Update delivery status
- Navigation support
- Earnings tracking

## 🚀 Deployment

### Deploy to Vercel

1. **Connect your GitHub repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/Aybs12819/v0-e-commerce-platform-link-habi/issues) page
2. Create a new issue with detailed description
3. Include screenshots if applicable

## 🔄 Updates

This project is actively maintained and updated. Regular updates include:
- Security patches
- Performance improvements
- New features based on user feedback
- Bug fixes

---

**Built with ❤️ using Next.js and modern web technologies**
