# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Quiz de Lealtad** (Brand Loyalty Quiz) application built with Next.js 16 that collects user responses about their relationship with a brand and displays results as radar charts. The application integrates with Notion as a database to store and retrieve quiz responses.

## Common Commands

```bash
# Development
pnpm dev              # Start development server on http://localhost:3000

# Production
pnpm build            # Build for production
pnpm start            # Start production server
```

Note: This project uses `pnpm` as the package manager.

## Architecture

### Tech Stack
- **Next.js 16** with App Router (using `/app` directory)
- **React 19** with Server and Client Components
- **TypeScript** (target: ES2017)
- **Tailwind CSS v4** for styling
- **Recharts** for data visualization (radar charts)
- **Notion API** (`@notionhq/client`) for data persistence

### Directory Structure

```
app/
├── page.tsx                      # Landing page (mostly placeholder content)
├── resultados/
│   └── page.tsx                  # Results page - displays user scores with radar chart
├── api/
│   ├── notion-response/route.ts  # GET endpoint - fetch individual user response by submission_id
│   └── notion-averages/route.ts  # GET endpoint - calculate averages across all responses
├── layout.tsx                    # Root layout
└── globals.css                   # Global styles

components/
└── RadarScoreChart.jsx           # Recharts radar visualization component
```

### Data Flow

1. **Quiz Submission**: Users complete a quiz (external form, not in this codebase) and receive a `submission_id`
2. **Question Structure**: Each of the 10 brand loyalty pillars has 2 questions:
   - **Question 1**: Weighted at 70% of the pillar score
   - **Question 2**: Weighted at 30% of the pillar score
3. **Answer Values**: Each question has 4 possible answers with fixed values:
   - Option 1: **0 points** (worst)
   - Option 2: **33 points** (low)
   - Option 3: **66 points** (medium-high)
   - Option 4: **100 points** (excellent)
4. **Pillar Score Calculation**:
   ```
   Pillar_Score = (Question1_Answer × 0.70) + (Question2_Answer × 0.30)
   ```
   Example: If Q1 = 66 and Q2 = 66, then Score = (66 × 0.70) + (66 × 0.30) = 66
5. **Notion Integration**: Quiz responses are stored in a Notion database with these properties:
   - `Respondent ID` (rich_text): The submission_id
   - `Nombre` (rich_text): User's name
   - `Fecha` (date): Submission date
   - Score properties (number): 10 calculated pillar scores (0-100 range)
6. **Results Display**: User visits `/resultados?submission_id=XXX` to see their personalized radar chart
7. **Score Mapping**: Notion scores are mapped to display percentages via `mapScoreToPercentage()`

### Score Dimensions

The app tracks 10 brand loyalty dimensions:
- Calidad (Quality)
- Relevancia (Relevance)
- Identidad (Identity)
- Consistencia (Consistency)
- Adopción (Adoption)
- Valores (Values)
- Conveniencia (Convenience)
- Eficiencia en la experiencia (Experience Efficiency)
- Familiaridad (Familiarity)
- Reconocimiento (Recognition)

### Environment Variables

Required in `.env`:
```
NOTION_DATABASE_ID=<database-id>  # Notion database ID (auto-formatted with hyphens)
NOTION_API_KEY=<secret-key>       # Notion integration secret
```

### Key Implementation Details

1. **Pillar Scoring System**:
   - Each pillar consists of 2 questions with weighted responses (70%/30%)
   - Question answers have fixed values: 0, 33, 66, or 100 points
   - Final pillar scores are calculated before being stored in Notion
   - Scores stored in Notion are already weighted and range from 0-100

2. **Score Display Mapping**: The `mapScoreToPercentage()` function buckets Notion scores into 4 display levels:
   ```javascript
   // Current implementation maps ranges to fixed percentages
   if (score >= 100) return 100;
   if (score >= 75) return 75;
   if (score >= 50) return 50;
   return 25;
   ```
   **Note**: With the new scoring system (0, 33, 66, 100), this mapping may need revision to:
   ```javascript
   if (score >= 100) return 100;
   if (score >= 66) return 66;
   if (score >= 33) return 33;
   return 0;
   ```

3. **Notion ID Formatting**: The `formatNotionId()` function ensures database IDs have proper UUID formatting with hyphens

4. **Client vs Server Components**:
   - `/resultados/page.tsx` uses `'use client'` and React hooks
   - API routes are server-side
   - Uses `Suspense` for loading states

5. **Demo Mode**: If no `submission_id` is provided, the results page shows demo data

6. **Path Aliases**: Uses `@/*` to reference root directory (configured in `tsconfig.json`)

### API Endpoints

**GET `/api/notion-response?submission_id=XXX`**
- Fetches a specific user's response from Notion
- Returns normalized scores and user metadata

**GET `/api/notion-averages`**
- Queries all responses from Notion database
- Calculates and returns average scores across all dimensions
- Used for comparison visualization in radar chart

## Important Notes

- The main quiz form/data collection UI is **not part of this codebase** - this app only displays results
- **Scoring Logic**: The 70%/30% weighted calculation happens in the external quiz form before data reaches Notion. This codebase only reads the final calculated scores.
- When modifying API routes, remember both use the same Notion property names and `mapScoreToPercentage()` logic
- The `mapScoreToPercentage()` function may need updating to align with the new answer values (0, 33, 66, 100) instead of the current bucketing (25, 50, 75, 100)
- The radar chart component expects exactly 10 score dimensions - adding/removing dimensions requires updates in multiple places
- TypeScript is configured in `jsx: "react-jsx"` mode, not `"preserve"`

## Example Score Calculation

For the "Calidad y eficiencia" pillar:
- **Question 1** (70% weight): "Cuando usas los productos/servicios de Apple..."
  - User selects: "funcionan bien y es rara la vez te fallan" → **66 points**
- **Question 2** (30% weight): "Cuando comparas esta marca con alternativas similares..."
  - User selects: "Mejor que muchas" → **66 points**
- **Final Score**: (66 × 0.70) + (66 × 0.30) = 46.2 + 19.8 = **66**

This 66 is what gets stored in Notion and then potentially remapped by `mapScoreToPercentage()` for display.
