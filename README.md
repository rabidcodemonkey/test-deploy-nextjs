# NextJS Todo Application

A simple todo application built with Next.js 15, React, TypeScript, and PostgreSQL.

## Features

- ✅ Add, complete, and delete todos
- ✅ Real-time UI updates
- ✅ PostgreSQL database integration
- ✅ RESTful API routes
- ✅ Responsive design with Tailwind CSS

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── todos/
│   │       ├── route.ts          # GET & POST todos
│   │       └── [id]/route.ts     # PUT & DELETE specific todo
│   ├── components/
│   │   └── TodoList.tsx          # Main todo UI component
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
└── lib/
    └── db.ts                     # PostgreSQL database utilities
```

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/todo_db"
```

Replace `user`, `password`, `localhost`, `5432`, and `todo_db` with your actual PostgreSQL credentials.

### 3. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

**Note:** The database tables will be created automatically when the app starts.

### 4. Initialize Database (Optional)

If you need to manually initialize the database, you can call the init endpoint:

```bash
curl http://localhost:3000/api/init
```

This will create the `todos` table if it doesn't already exist.

## Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## API Endpoints

### GET /api/todos
Fetch all todos ordered by creation date (newest first).

**Response:**
```json
{
  "todos": [
    {
      "id": 1,
      "title": "Learn Next.js",
      "completed": false,
      "created_at": "2024-01-13T10:00:00Z",
      "updated_at": "2024-01-13T10:00:00Z"
    }
  ]
}
```

### POST /api/todos
Create a new todo.

**Request Body:**
```json
{
  "title": "Learn Next.js"
}
```

**Response:** (Status 201)
```json
{
  "todo": {
    "id": 1,
    "title": "Learn Next.js",
    "completed": false,
    "created_at": "2024-01-13T10:00:00Z",
    "updated_at": "2024-01-13T10:00:00Z"
  }
}
```

### PUT /api/todos/[id]
Toggle the completion status of a todo.

**Response:**
```json
{
  "todo": {
    "id": 1,
    "title": "Learn Next.js",
    "completed": true,
    "created_at": "2024-01-13T10:00:00Z",
    "updated_at": "2024-01-13T10:00:00Z"
  }
}
```

### DELETE /api/todos/[id]
Delete a todo.

**Response:**
```json
{
  "success": true
}
```

## Database Schema

The application creates a `todos` table with the following structure:

```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment

To deploy this application:

1. Set the `DATABASE_URL` environment variable on your hosting platform
2. Build the application: `npm run build`
3. Start the production server: `npm run start`

### Vercel Deployment

```bash
vercel
```

## Technologies Used

- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client for Node.js

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
