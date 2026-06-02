# StockHub Ltd Stock Management System

This project is organized for the National Practical Exam 2026 requirement.

## Folders

- `backend-project` - Node.js, Express.js, and MySQL API.
- `frontend-project` - React.js, Tailwind CSS, and axios frontend.
- `docs` - ERD and supporting design notes.

Rename the parent folder from `FirstName_LastName_National_Practical_Exam_2026` to your real names before submission.

## Database Setup

1. Open MySQL.
2. Run the SQL file:

```sql
SOURCE backend-project/schema.sql;
```

This creates the `SMS` database with `Product`, `Warehouse`, `StockTransaction`, and `UserAccount` tables.

Default account:

- Username: `admin`
- Password: `admin123`

## Backend Setup

```bash
cd backend-project
cp .env.example .env
npm install
npm run dev
```

The API runs on `http://localhost:5000`.

## Frontend Setup

```bash
cd frontend-project
cp .env.example .env
npm install
npm run dev
```

The React app runs on the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Implemented Requirements

- ERD for Product, Warehouse, and StockTransaction.
- MySQL database named `SMS`.
- Product insert form.
- Warehouse insert form.
- Transaction insert, retrieve, update, and delete form.
- Login/logout with a user account.
- React frontend integrated with backend using axios.
- Responsive Tailwind CSS interface.
- Daily, weekly, and monthly stock reports.
