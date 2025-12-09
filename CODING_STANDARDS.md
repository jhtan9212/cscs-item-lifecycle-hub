# Coding Standards & Best Practices

This document outlines the coding standards and best practices followed in this project, based on industry-standard references used by U.S. tech companies.

## 📚 Reference Standards

### Frontend
- **React**: [Official React Docs](https://react.dev/learn) + [Airbnb React Style Guide](https://github.com/airbnb/javascript/tree/master/react)
- **TypeScript**: [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- **TailwindCSS**: [Official TailwindCSS Docs](https://tailwindcss.com/docs)
- **shadcn/ui**: [Official Documentation](https://ui.shadcn.com/)

### Backend
- **Node.js**: [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- **Express.js**: [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- **Prisma**: [Prisma Documentation](https://www.prisma.io/docs)
- **PostgreSQL**: [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Cross-Stack
- **API Design**: [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- **Security**: [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- **Git**: [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🎯 Frontend Standards

### React Component Structure

```typescript
// 1. Imports (grouped and ordered)
import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

// External libraries
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Internal modules
import { projectService } from '@/services/projectService';
import type { Project } from '@/types/project';

// 2. Types/Interfaces
interface ComponentProps {
  projectId: string;
  onUpdate?: () => void;
}

// 3. Component
export const ComponentName: FC<ComponentProps> = ({ projectId, onUpdate }) => {
  // Hooks (in order: state, effects, callbacks, derived state)
  const [data, setData] = useState<Project | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Effect logic
  }, [projectId]);

  // Event handlers
  const handleSubmit = async () => {
    // Handler logic
  };

  // Render
  return (
    <Card>
      {/* JSX */}
    </Card>
  );
};
```

### Naming Conventions

- **Components**: PascalCase (`ProjectDetail.tsx`)
- **Hooks**: camelCase with `use` prefix (`usePermissions.ts`)
- **Utilities**: camelCase (`formatters.ts`)
- **Types**: PascalCase (`Project`, `Item`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ITEMS`)

### File Organization

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── shared/          # Reusable components
│   └── feature/         # Feature-specific components
├── pages/               # Route components
├── hooks/               # Custom hooks
├── services/            # API services
├── types/               # TypeScript types
├── utils/               # Utility functions
└── lib/                 # Library configurations
```

### Code Quality Rules

1. **TypeScript**: Always use types, avoid `any` when possible
2. **Hooks**: Follow Rules of Hooks, use exhaustive-deps
3. **Performance**: Use `React.memo`, `useMemo`, `useCallback` appropriately
4. **Accessibility**: Use semantic HTML, ARIA attributes
5. **Error Handling**: Use toast notifications, never `alert()`

---

## 🎯 Backend Standards

### Controller Structure

```typescript
import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { sendSuccess, sendError } from '@/utils/response';
import { NotFoundError } from '@/utils/errors';

export const getResource = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundError('Resource');
    }

    return sendSuccess(res, resource);
  }
);
```

### Error Handling

- Use custom error classes (`AppError`, `NotFoundError`, etc.)
- Always use `asyncHandler` wrapper for async controllers
- Return consistent error responses via `sendError` utility

### API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 10, "total": 100 }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

### Security Best Practices

1. **Environment Variables**: Always validate required env vars
2. **Input Validation**: Use `express-validator` for all inputs
3. **Authentication**: JWT tokens, secure cookie handling
4. **Authorization**: Role-based access control (RBAC)
5. **Rate Limiting**: Implement rate limiting on all endpoints
6. **Security Headers**: X-Frame-Options, CSP, HSTS, etc.

### Database Best Practices

1. **Prisma**: Use transactions for multi-step operations
2. **Queries**: Always include error handling
3. **Indexes**: Add indexes for frequently queried fields
4. **Migrations**: Never edit migration files after running

---

## 🔧 Development Tools

### ESLint Configuration

- React Hooks rules enforced
- TypeScript strict mode
- Airbnb-style guidelines
- No console.log in production code

### Prettier Configuration

- Single quotes for JavaScript/TypeScript
- Double quotes for JSX
- 2-space indentation
- 100 character line width
- Trailing commas (ES5)

### Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication
fix: resolve workflow authorization issue
docs: update API documentation
style: format code with prettier
refactor: improve error handling
test: add unit tests for auth service
chore: update dependencies
```

---

## 📝 Code Review Checklist

- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Security best practices are followed
- [ ] API responses follow standard format
- [ ] Code is formatted with Prettier
- [ ] ESLint passes without errors
- [ ] No console.log statements
- [ ] Environment variables are validated
- [ ] Input validation is present
- [ ] Proper logging is implemented

---

## 🚀 Getting Started

1. **Install dependencies**: `npm install`
2. **Run linter**: `npm run lint`
3. **Format code**: `npm run format`
4. **Type check**: `npm run type-check`
5. **Start development**: `npm run dev`

---

For questions or clarifications, refer to the official documentation links provided above.

