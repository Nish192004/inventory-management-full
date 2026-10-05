# Inventory Management System

## Stack
- Frontend: React 19, Vite, Tailwind CSS 4, React Router, Axios
- Backend: Node.js, Express 5, Prisma 7, PostgreSQL, JWT, bcryptjs

## Backend setup
1. Create PostgreSQL database `inventory_db`.
2. Copy `backend/.env.example` to `backend/.env` and set your PostgreSQL password.
3. `cd backend`
4. `npm install`
5. `npx prisma generate`
6. `npx prisma db push`
7. Optional: `npm run seed` (admin@example.com / Admin12345)
8. `npm run dev`

Backend: http://localhost:4000

## Frontend setup
1. Copy `frontend/.env.example` to `frontend/.env`.
2. `cd frontend`
3. `npm install`
4. `npm run dev`

Frontend: http://localhost:5173

## API
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/products
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id
