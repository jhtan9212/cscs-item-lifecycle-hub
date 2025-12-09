# Project Structure

## Directory Layout

```
cscs_poc/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── environment.ts
│   │   ├── controllers/
│   │   │   ├── projectController.ts
│   │   │   ├── itemController.ts
│   │   │   ├── workflowController.ts
│   │   │   ├── commentController.ts
│   │   │   ├── userController.ts
│   │   │   └── auditController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── validation.ts
│   │   │   └── permissions.ts
│   │   ├── models/
│   │   │   └── (Prisma generates these)
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── projects.ts
│   │   │   ├── items.ts
│   │   │   ├── workflow.ts
│   │   │   ├── comments.ts
│   │   │   ├── users.ts
│   │   │   └── audit.ts
│   │   ├── services/
│   │   │   ├── workflowEngine.ts
│   │   │   ├── projectService.ts
│   │   │   ├── itemService.ts
│   │   │   ├── permissionService.ts
│   │   │   └── notificationService.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── validators.ts
│   │   │   └── helpers.ts
│   │   ├── types/
│   │   │   ├── express.d.ts
│   │   │   └── index.ts
│   │   └── app.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   └── Card.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Layout.tsx
│   │   │   │   └── Navigation.tsx
│   │   │   ├── projects/
│   │   │   │   ├── ProjectList.tsx
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── ProjectForm.tsx
│   │   │   │   ├── ProjectDetail.tsx
│   │   │   │   └── ProjectTabs.tsx
│   │   │   ├── items/
│   │   │   │   ├── ItemList.tsx
│   │   │   │   ├── ItemCard.tsx
│   │   │   │   ├── ItemForm.tsx
│   │   │   │   ├── ItemDetail.tsx
│   │   │   │   └── FieldOwnershipLabel.tsx
│   │   │   ├── workflow/
│   │   │   │   ├── WorkflowTimeline.tsx
│   │   │   │   ├── WorkflowStep.tsx
│   │   │   │   ├── StageIndicator.tsx
│   │   │   │   ├── WorkflowControls.tsx
│   │   │   │   └── WorkflowStatus.tsx
│   │   │   ├── permissions/
│   │   │   │   ├── PermissionMatrix.tsx
│   │   │   │   ├── RoleSelector.tsx
│   │   │   │   └── PermissionBadge.tsx
│   │   │   └── comments/
│   │   │       ├── CommentList.tsx
│   │   │       ├── CommentForm.tsx
│   │   │       └── CommentItem.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── Items.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── NotFound.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── projectService.ts
│   │   │   ├── itemService.ts
│   │   │   ├── workflowService.ts
│   │   │   ├── authService.ts
│   │   │   └── commentService.ts
│   │   ├── hooks/
│   │   │   ├── useProjects.ts
│   │   │   ├── useProject.ts
│   │   │   ├── useWorkflow.ts
│   │   │   ├── useAuth.ts
│   │   │   └── useComments.ts
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ProjectContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── types/
│   │   │   ├── project.ts
│   │   │   ├── item.ts
│   │   │   ├── workflow.ts
│   │   │   ├── user.ts
│   │   │   └── api.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── variables.css
│   │   │   └── components.css
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── public/
│   │   └── favicon.ico
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── README.md
│
├── docs/
│   ├── IMPLEMENTATION_APPROACH.md
│   ├── PROJECT_STRUCTURE.md
│   ├── WORKFLOW_REFERENCE.md
│   └── API_REFERENCE.md
│
├── .gitignore
├── README.md
└── docker-compose.yml (optional)
```

## Key Files Description

### Backend

**src/app.ts**
- Express application setup
- Middleware configuration
- Route registration
- Error handling

**src/services/workflowEngine.ts**
- Core workflow logic
- Stage advancement/regression
- Validation rules
- State management

**prisma/schema.prisma**
- Database schema definition
- All models and relationships
- Enums and types

**prisma/seed.ts**
- Initial data seeding
- Roles and permissions
- Test users
- Sample projects

### Frontend

**src/App.tsx**
- Main application component
- Route definitions
- Context providers

**src/components/workflow/WorkflowTimeline.tsx**
- Visual workflow representation
- Stage status indicators
- Interactive timeline

**src/components/items/FieldOwnershipLabel.tsx**
- Field ownership display
- Role/community badges
- Visual grouping

**src/services/api.ts**
- Axios instance configuration
- Request/response interceptors
- Error handling

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cscs_poc"
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (.env)
```env
VITE_API_URL="http://localhost:3000/api"
```

