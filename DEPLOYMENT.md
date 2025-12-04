# Local Deployment (XAMPP / MySQL)

This project can run completely locally using XAMPP (or any local MySQL/MariaDB) for development. The repository previously contained instructions for deploying to Vercel — those workflows and files remain available, but the steps below focus on running locally.

## Prerequisites

- Install Node.js (v18+ or v20 recommended)
- Install XAMPP and start **Apache** and **MySQL** services
- Optional: `npm` and `npx` are available via Node.js

## Setup local MySQL (XAMPP)

1. Start XAMPP Control Panel and start **MySQL** (and Apache if you plan to use phpMyAdmin).
2. Open `http://localhost/phpmyadmin` and create a database, e.g. `document_approval_db`.

## Configure environment

Edit (or create) `.env.local` in the project root and set the following variables:

```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/document_approval_db"
NEXTAUTH_SECRET="min-32-characters-secret-key-change-in-prod"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"
UPLOAD_DIR="./public/uploads"
```

Adjust the `root` user password if your local MySQL uses a password, e.g. `mysql://root:yourpass@127.0.0.1:3306/document_approval_db`.

## Apply Prisma schema and seed data

Run these commands from the project root:

```powershell
# generate client
npx prisma generate

# create and apply migration (creates prisma/migrations)
npx prisma migrate dev --name init

# seed database (if seed script exists)
node prisma/seed.js
```

If you have issues with `migrate dev` (for example switching providers), you can use `npx prisma db push` to push schema changes directly.

## Run the app locally

Start the Next.js dev server (with `.env.local` present):

```powershell
npm run dev

# or set env directly in PowerShell for the session:
$env:DATABASE_URL = "mysql://root:@127.0.0.1:3306/document_approval_db" 
$env:NEXTAUTH_URL = "http://localhost:3000"
```

Open `http://localhost:3000` in your browser. The app will redirect to `/login` and use the local MySQL database for authentication and data storage.

## Notes

- The repository still contains a GitHub Actions workflow for Vercel deployment (`.github/workflows/deploy-vercel.yml`) if you later want automatic deployments — this is optional and can be removed.
- For production deployment, replace XAMPP with a managed database (Postgres/MySQL) and set secure secrets in your deployment environment.

