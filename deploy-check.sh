#!/bin/bash

# GalaUs Production Deployment Script
# This script helps you prepare for production deployment

echo "🎉 GalaUs Production Deployment Helper"
echo "========================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  No .env.local file found!"
    echo "Creating from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo "⚠️  Please edit .env.local and add your Supabase credentials!"
    echo ""
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Run type check
echo "🔍 Running type check..."
npm run build &> /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Type check passed"
else
    echo "❌ Type check failed - please fix TypeScript errors"
    exit 1
fi

echo ""
echo "✅ Pre-deployment checks complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run SQL scripts in your Supabase SQL Editor:"
echo "   - supabase/schema.sql (if not already done)"
echo "   - supabase/production-rls.sql (REQUIRED for security!)"
echo ""
echo "2. Verify environment variables in .env.local"
echo ""
echo "3. Test locally:"
echo "   npm run dev"
echo ""
echo "4. Deploy to Vercel:"
echo "   - Push to GitHub"
echo "   - Import in Vercel dashboard"
echo "   - Add environment variables"
echo "   - Deploy!"
echo ""
echo "📖 See PRODUCTION_GUIDE.md for detailed instructions"
echo ""
