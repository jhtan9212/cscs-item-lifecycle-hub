# Item Lifecycle Hub Platform - POC

A proof of concept web application for managing item lifecycle workflows in a multi-partner supply chain network.

## 📋 Overview

This POC demonstrates a centralized platform for managing items through their lifecycle phases:
- **New Items**: Items entering the system for the first time
- **Transitioning Items**: Items changing specification and being replaced
- **Deleting Items**: Items being discontinued or removed from distribution

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: CSS (can be extended with Tailwind or styled-components)

### Architecture Pattern
- **Frontend**: Component-based React application with service layer
- **Backend**: RESTful API with Express.js
- **Database**: Relational database with Prisma ORM
- **Workflow Engine**: Centralized workflow state management

## 📁 Project Structure

```
cscs_poc/
├── backend/          # Express.js API server
├── frontend/         # React application
├── docs/            # Documentation
└── README.md        # This file
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed structure.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Setup Instructions

**For detailed setup instructions, see [SETUP.md](./SETUP.md)**

Quick setup:

1. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb cscs_poc
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npx prisma migrate dev
   npm run prisma:seed
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Prisma Studio: `npx prisma studio` (in backend directory)

See [SETUP.md](./SETUP.md) for detailed setup instructions and [QUICK_START.md](./QUICK_START.md) for development checklist.

## 📚 Documentation

- **[IMPLEMENTATION_APPROACH.md](./IMPLEMENTATION_APPROACH.md)**: Comprehensive implementation guide
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**: Detailed project structure
- **[WORKFLOW_REFERENCE.md](./WORKFLOW_REFERENCE.md)**: Workflow stages and rules
- **[QUICK_START.md](./QUICK_START.md)**: Step-by-step implementation checklist

## ✨ Features

### Part 1: Core Features (Required)
- ✅ Project creation and management
- ✅ Item CRUD operations
- ✅ Workflow stage management
- ✅ Advance/regress workflow stages
- ✅ Field ownership labeling
- ✅ Clean, intuitive UI

### Part 2: Advanced Features (Optional)
- 🔄 Full lifecycle modeling (New, Transitioning, Deleting)
- 🔐 Complete RBAC implementation
- ⚡ Asynchronous workflows
- 📊 Enhanced data model
- 🚀 Deployment ready
- 📈 Scalability considerations

## 🔄 Workflow Stages

### New Item Lifecycle
1. Draft → 2. Freight Strategy → 3. Supplier Pricing → 4. KINEXO Pricing → 
5. CM Approval → 6. SSM Approval → 7. In Transition → 8. Completed

See [WORKFLOW_REFERENCE.md](./WORKFLOW_REFERENCE.md) for complete workflow details.

## 👥 Roles & Permissions

### Internal CSCS Roles
- **Admin**: All permissions
- **Category Manager**: Project creation, item management, approvals
- **Strategic Supply Manager**: Supply chain coordination, approvals
- **Pricing Specialist**: Pricing management and approvals
- **Logistics**: Freight strategy and logistics coordination

### External Roles (Part 2)
- **Supplier**: Item specifications, pricing submission
- **DC Operator**: Distribution center operations

## 🗄️ Database Schema

### Core Models
- **User**: System users
- **Role**: User roles
- **Permission**: System permissions
- **Project**: Item lifecycle projects
- **Item**: Individual items within projects
- **WorkflowStep**: Workflow stage tracking
- **Comment**: Collaboration comments
- **AuditLog**: Activity audit trail

See [IMPLEMENTATION_APPROACH.md](./IMPLEMENTATION_APPROACH.md) for complete schema.

## 🔌 API Endpoints

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/advance` - Advance workflow
- `POST /api/projects/:id/back` - Move workflow back

### Items
- `GET /api/projects/:projectId/items` - List items
- `POST /api/projects/:projectId/items` - Create item
- `GET /api/items/:id` - Get item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Workflow
- `GET /api/projects/:id/workflow` - Get workflow status

See [IMPLEMENTATION_APPROACH.md](./IMPLEMENTATION_APPROACH.md) for complete API documentation.

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create project
- [ ] Add items to project
- [ ] Advance workflow stages
- [ ] Move workflow back
- [ ] View field ownership
- [ ] Update item fields
- [ ] View project details

## 🚀 Deployment

### Development
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Production
See [IMPLEMENTATION_APPROACH.md](./IMPLEMENTATION_APPROACH.md) for deployment strategies.

## 📝 Development Notes

### Key Design Decisions
1. **Workflow Engine**: Centralized workflow management for consistency
2. **Field Ownership**: Labeling system for Part 1, full RBAC for Part 2
3. **Type Safety**: TypeScript throughout for better developer experience
4. **Modular Structure**: Separation of concerns for maintainability

### What Would Be Improved With More Time
1. **Testing**: Comprehensive unit and integration tests
2. **UI/UX**: Enhanced visual design and animations
3. **Performance**: Caching, pagination, optimization
4. **Security**: Full authentication, input sanitization
5. **Documentation**: API documentation (Swagger), component docs
6. **Accessibility**: WCAG compliance, keyboard navigation
7. **Real-time**: WebSocket for live updates
8. **Mobile**: Responsive design optimization

## ⏱️ Time Spent

- **Planning & Design**: ___ hours
- **Backend Development**: ___ hours
- **Frontend Development**: ___ hours
- **Integration & Testing**: ___ hours
- **Documentation**: ___ hours
- **Part 2 Features**: ___ hours
- **Total**: ___ hours

## 📞 Contact

For questions or presentation scheduling:
- Email: james.hennahane@cscscoop.com

## 📄 License

This is a proof of concept project for evaluation purposes.

---

## 🎯 Next Steps

1. Review implementation approach
2. Set up development environment
3. Follow quick start checklist
4. Implement Part 1 features
5. Optionally implement Part 2 features
6. Prepare presentation

For detailed implementation guidance, see [IMPLEMENTATION_APPROACH.md](./IMPLEMENTATION_APPROACH.md).

