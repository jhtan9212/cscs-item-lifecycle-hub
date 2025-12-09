# Frontend - Item Lifecycle Hub Platform

React + TypeScript frontend for the Item Lifecycle Hub Platform.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL (default: http://localhost:3000/api)
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
npm run preview
```

## Features

- Project management (create, view, update, delete)
- Item management with field ownership labels
- Workflow timeline visualization
- Workflow stage advancement/regression
- Clean, responsive UI with Tailwind CSS
