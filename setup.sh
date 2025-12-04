#!/bin/bash

echo "🚀 Starting Database Setup..."

echo "📦 Installing dependencies..."
npm install

echo "🗄️ Setting up Prisma..."
npx prisma generate

echo "🔨 Creating database schema..."
npx prisma db push --skip-generate

echo "🌱 Seeding database with test users..."
npx ts-node prisma/seed.ts

echo "✅ Database setup complete!"
echo ""
echo "📝 Default Users Created:"
echo "   Admin: admin@example.com / Admin123!"
echo "   Staff: staff@example.com / Staff123!"
echo "   Op Director: op.director@example.com / OpDir123!"
echo ""
echo "🚀 Start dev server with: npm run dev"
