# CO2X Carbon Credit Exchange Platform - AI Agent Instructions

## Architecture Overview
- **Frontend**: Next.js 16 static site (output: 'export') deployed on Azure Static Web Apps
- **Backend**: None - client-side only with localStorage persistence
- **Infrastructure**: Azure resources defined in Bicep (`infra/`), deployed via Azure Developer CLI (`azd`)
- **Purpose**: Thailand Voluntary Emission Reduction (T-VER) carbon credit marketplace with gacha-style game

## Key Components
- **Market Page** (`src/web/src/app/page.tsx`): Trading interface with mock Thai market data
- **Game Page** (`src/web/src/app/game/page.tsx`): Credit earning via card pull mechanics with QR token system
- **Infra Modules** (`infra/core/`): Reusable Bicep templates for Azure resources (CosmosDB, AKS, App Service, etc.)

## Development Workflow
- **Local Dev**: `cd src/web && pnpm dev` (serves on localhost:3000)
- **Build**: `cd src/web && pnpm build` (exports to `out/` directory)
- **Lint**: `cd src/web && pnpm lint` (ESLint with Next.js rules)
- **Deploy**: `azd provision` (infra) + `azd deploy` (app) - CI in `.github/workflows/azure-dev.yml`

## Code Patterns & Conventions
- **Path Aliases**: `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- **Styling**: Tailwind CSS v4 with inline `@theme` in `globals.css`, custom animations for card flips
- **State Management**: React hooks (`useState`, `useEffect`) + localStorage for persistence
- **Data**: Mock arrays in components (e.g., `marketData`, `sellers`) - no API calls
- **Language**: Thai text for market data, English for code/comments
- **Components**: Client-side only (`'use client'` directive)

## Infrastructure Patterns
- **Naming**: Abbreviated prefixes from `infra/abbreviations.json` (e.g., `cosmos-` for CosmosDB)
- **Modules**: Modular Bicep files in `infra/core/` subdirectories by resource type
- **Deployment**: `azure.yaml` defines services; main.bicep orchestrates resources
- **Outputs**: Environment variables auto-generated in `.env` via `azd env get-values`

## Common Tasks
- **Add Market Item**: Update `marketData` array in `page.tsx` with Thai project names
- **Modify Game Prizes**: Edit `prizes` array in `game/page.tsx` with tCO2e values
- **Generate QR Code**: Open `qr-generator.html` in browser to create playable QR codes
- **Add Azure Resource**: Create Bicep module in `infra/core/`, reference in `main.bicep`
- **Update Styling**: Use Tailwind classes; add custom CSS in `globals.css` with Safari-compatible transforms

## Avoid
- Server-side rendering or API routes (static export incompatible)
- External data fetching (no backend)
- Changing `output: 'export'` in `next.config.ts`
- Modifying abbreviations without checking Azure naming limits</content>
<parameter name="filePath">/Users/waritsan/Developer/co2x/.github/copilot-instructions.md