#!/bin/bash

# Railway Deployment Helper Script
# This script helps you prepare your Visitour app for Railway deployment

set -e

echo "🚂 Railway Deployment Helper for Visitour"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if in correct directory
if [ ! -f "package.json" ] || [ ! -d "apps/api" ] || [ ! -d "apps/web" ]; then
    echo -e "${RED}✗ Error: Must run from Visitour root directory${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Visitour project detected${NC}"
echo ""

# Function to generate JWT secret
generate_jwt_secret() {
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
}

# Menu
while true; do
    echo "What would you like to do?"
    echo "1. Check prerequisites"
    echo "2. Generate JWT secret"
    echo "3. Create deployment guide"
    echo "4. View required environment variables"
    echo "5. Test API locally"
    echo "6. Test Web app locally"
    echo "7. Exit"
    echo ""
    read -p "Choose an option (1-7): " choice

    case $choice in
        1)
            echo ""
            echo "Checking prerequisites..."
            echo ""

            # Check Git
            if command -v git &> /dev/null; then
                echo -e "${GREEN}✓ Git installed${NC}"
                git --version
            else
                echo -e "${RED}✗ Git not found${NC}"
            fi
            echo ""

            # Check Node
            if command -v node &> /dev/null; then
                echo -e "${GREEN}✓ Node.js installed${NC}"
                node --version
            else
                echo -e "${RED}✗ Node.js not found${NC}"
            fi
            echo ""

            # Check GitHub repo
            if git remote get-url origin &> /dev/null; then
                echo -e "${GREEN}✓ GitHub remote configured${NC}"
                echo "Remote: $(git remote get-url origin)"
            else
                echo -e "${YELLOW}⚠ Not connected to GitHub${NC}"
                echo "Run: git remote add origin <your-repo-url>"
            fi
            echo ""

            # Check npm dependencies
            if [ -f "apps/api/node_modules/.package-lock.json" ]; then
                echo -e "${GREEN}✓ API dependencies installed${NC}"
            else
                echo -e "${YELLOW}⚠ API dependencies not installed${NC}"
                echo "Run: cd apps/api && npm install"
            fi
            echo ""

            # Check web dependencies
            if [ -f "apps/web/node_modules/.package-lock.json" ]; then
                echo -e "${GREEN}✓ Web dependencies installed${NC}"
            else
                echo -e "${YELLOW}⚠ Web dependencies not installed${NC}"
                echo "Run: cd apps/web && npm install"
            fi
            echo ""
            ;;

        2)
            echo ""
            echo "Generating secure JWT secret..."
            echo ""
            JWT_SECRET=$(generate_jwt_secret)
            echo -e "${GREEN}✓ New JWT secret generated:${NC}"
            echo ""
            echo "$JWT_SECRET"
            echo ""
            echo "Use this in Railway dashboard → API service → Variables"
            echo "Variable name: JWT_SECRET"
            echo ""
            ;;

        3)
            echo ""
            echo "Railway deployment guides available:"
            echo ""
            if [ -f "RAILWAY_DEPLOYMENT.md" ]; then
                echo -e "${GREEN}✓${NC} RAILWAY_DEPLOYMENT.md - Complete step-by-step guide"
            fi
            if [ -f "RAILWAY_QUICK_START.md" ]; then
                echo -e "${GREEN}✓${NC} RAILWAY_QUICK_START.md - Quick reference card"
            fi
            if [ -f "RAILWAY_CONFIG.md" ]; then
                echo -e "${GREEN}✓${NC} RAILWAY_CONFIG.md - Configuration details"
            fi
            if [ -f ".env.railway.example" ]; then
                echo -e "${GREEN}✓${NC} .env.railway.example - Environment variable template"
            fi
            echo ""
            echo "Open these files to get started!"
            echo ""
            ;;

        4)
            echo ""
            echo "Environment Variables for Railway"
            echo "=================================="
            echo ""
            echo "API Service (.env variables):"
            echo "  NODE_ENV=production"
            echo "  PORT=3000"
            echo "  DATABASE_URL=postgresql://user:password@host:port/database"
            echo "  JWT_SECRET=<64-character-hex-string>"
            echo "  CORS_ORIGIN=https://your-web-domain.railway.app"
            echo ""
            echo "Web Service (.env variables):"
            echo "  VITE_API_URL=https://your-api-domain.railway.app"
            echo "  VITE_API_SOCKET_URL=https://your-api-domain.railway.app"
            echo ""
            ;;

        5)
            echo ""
            echo "Testing API locally..."
            echo ""
            if [ ! -d "apps/api/node_modules" ]; then
                echo "Installing dependencies..."
                cd apps/api
                npm install
                cd ../../
            fi
            echo ""
            echo "Starting API server..."
            echo "Press Ctrl+C to stop"
            echo ""
            cd apps/api
            npm run dev || npm start
            ;;

        6)
            echo ""
            echo "Testing Web app locally..."
            echo ""
            if [ ! -d "apps/web/node_modules" ]; then
                echo "Installing dependencies..."
                cd apps/web
                npm install
                cd ../../
            fi
            echo ""
            echo "Starting web app..."
            echo "Press Ctrl+C to stop"
            echo ""
            cd apps/web
            npm run dev
            ;;

        7)
            echo ""
            echo "Goodbye! 👋"
            exit 0
            ;;

        *)
            echo -e "${RED}Invalid option. Please choose 1-7.${NC}"
            ;;
    esac

    echo ""
    read -p "Press Enter to continue..."
    clear
done

