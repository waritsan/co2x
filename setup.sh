#!/bin/bash
# Quick Start Script for CO2X Backend OAuth Development

set -e

echo "🚀 CO2X LINE OAuth Backend - Quick Start"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Check Node.js version
echo -e "${YELLOW}📋 Checking Node.js version...${NC}"
NODE_VERSION=$(node --version)
echo "Node.js: $NODE_VERSION"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd src/api
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Step 3: Build API
echo -e "${YELLOW}🔨 Building API...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ API built successfully${NC}"
else
    echo -e "${RED}❌ API build failed${NC}"
    exit 1
fi
echo ""

# Step 4: Check environment file
echo -e "${YELLOW}⚙️  Checking environment configuration...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${RED}⚠️  .env.local not found in src/api/${NC}"
    echo "Please create .env.local with the following:"
    echo ""
    echo "LINE_CHANNEL_ID=2008743203"
    echo "LINE_CHANNEL_SECRET=your_secret_here"
    echo "LINE_REDIRECT_URI=http://localhost:7071/api/lineCallback"
    echo "ALLOWED_ORIGINS=http://localhost:3000"
    exit 1
else
    echo -e "${GREEN}✅ .env.local found${NC}"
    echo "Configuration:"
    grep "LINE_CHANNEL_ID\|ALLOWED_ORIGINS" .env.local || true
fi
echo ""

# Step 5: Check frontend environment
echo -e "${YELLOW}⚙️  Checking frontend configuration...${NC}"
cd ../web
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Creating .env.local in src/web/${NC}"
    cat > .env.local << EOF
# LINE Login Configuration
NEXT_PUBLIC_LINE_CHANNEL_ID=2008743203
NEXT_PUBLIC_LINE_BACKEND_URL=http://localhost:7071
EOF
    echo -e "${GREEN}✅ Frontend .env.local created${NC}"
else
    echo -e "${GREEN}✅ .env.local found${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "To start the development environment:"
echo ""
echo -e "${YELLOW}Terminal 1 (Backend API):${NC}"
echo "  cd src/api"
echo "  npm start"
echo ""
echo -e "${YELLOW}Terminal 2 (Frontend):${NC}"
echo "  cd src/web"
echo "  pnpm dev"
echo ""
echo "Then open: http://localhost:3000/games"
echo ""
echo "📖 For detailed setup, see: LINE_OAUTH_SETUP.md"
echo ""
