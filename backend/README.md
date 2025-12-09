# Backend - Item Lifecycle Hub Platform

Express.js backend API for the Item Lifecycle Hub Platform.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Set up Database**
   ```bash
   # Make sure PostgreSQL is running
   npx prisma migrate dev
   npx prisma generate
   npm run prisma:seed
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/advance` - Advance workflow
- `POST /api/projects/:id/back` - Move workflow back
- `GET /api/projects/:id/workflow` - Get workflow status

### Items
- `GET /api/items/projects/:projectId/items` - List items
- `POST /api/items/projects/:projectId/items` - Create item
- `GET /api/items/:id` - Get item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Comments
- `GET /api/comments/projects/:projectId/comments` - List comments
- `POST /api/comments/projects/:projectId/comments` - Create comment

## Database

The application uses PostgreSQL with Prisma ORM. To view the database:

```bash
npx prisma studio
```

