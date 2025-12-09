# Item Lifecycle Hub Platform

A comprehensive project management platform for managing item lifecycles with role-based access control, workflow management, and audit logging.

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library
- **React Router v7** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
cscs_poc/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── lib/            # Library configs
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── routes/        # Route definitions
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── config/        # Configuration
│   │   └── utils/         # Utility functions
│   ├── prisma/            # Database schema & migrations
│   └── package.json
└── CODING_STANDARDS.md    # Coding standards documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cscs_poc
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   
   # Run database migrations
   npx prisma migrate dev
   
   # Seed the database
   npm run prisma:seed
   
   # Start development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your API URL
   
   # Start development server
   npm run dev
   ```

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 🛠️ Development

### Code Quality

**Frontend:**
```bash
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint errors
npm run format        # Format with Prettier
npm run type-check    # TypeScript type checking
```

**Backend:**
```bash
npm run build         # Compile TypeScript
npm run lint          # Run ESLint (if configured)
```

### Database Management

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run prisma:seed
```

## 📚 Documentation

- [Coding Standards](./CODING_STANDARDS.md) - Comprehensive coding standards and best practices
- [API Documentation](./docs/API.md) - API endpoint documentation (if available)
- [Testing Guide](./docs/TESTING.md) - Testing guidelines (if available)

## 🔒 Security

This project follows OWASP security best practices:

- Input validation on all endpoints
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF protection
- Secure password hashing (bcrypt)
- JWT authentication
- Role-based access control (RBAC)
- Security headers middleware
- Rate limiting

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Building for Production

**Backend:**
```bash
npm run build
npm start
```

**Frontend:**
```bash
npm run build
npm run preview
```

## 🤝 Contributing

1. Follow the [Coding Standards](./CODING_STANDARDS.md)
2. Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
3. Ensure all tests pass
4. Run linter and formatter before committing

## 📄 License

[Your License Here]

## 👥 Authors

[Your Team/Name Here]

---

For detailed coding standards and best practices, see [CODING_STANDARDS.md](./CODING_STANDARDS.md).
