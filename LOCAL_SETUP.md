# Local Setup with XAMPP (MySQL)

Follow these steps to run the project locally using XAMPP's MySQL server.

1. Install XAMPP and start the control panel.
2. Start **MySQL** (and Apache if you want phpMyAdmin).
3. Open `http://localhost/phpmyadmin` and create a database, e.g. `document_approval_db`.

4. In the project root create or edit `.env.local` and set:

```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/document_approval_db"
NEXTAUTH_SECRET="min-32-characters-secret-key-change-in-prod"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"
UPLOAD_DIR="./public/uploads"
```

Adjust the `root` password if applicable: `mysql://root:yourpass@127.0.0.1:3306/document_approval_db`.

5. From project root run:

```powershell
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
```

6. Start the dev server:

```powershell
npm run dev
```

7. Open `http://localhost:3000` and test the app. The root now redirects to `/login`.

Notes

- If you prefer not to create migrations, you can use `npx prisma db push` to push the schema.
- The repository still contains optional Vercel deployment workflows; these can be removed if you do not want automatic deployments.
