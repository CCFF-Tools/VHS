# VHS Ops Flow (Next.js + Airtable)

Beautiful internal analytics and production workflow UI for VHS tape digitization.

## Stack
- Next.js App Router + TypeScript
- TailwindCSS + shadcn-style UI components
- Recharts for data visualization
- Airtable REST SDK (server-side only)

## 1) Airtable Setup
Use your provided Airtable reference:
- Provided: `appNC0OJj3yACMbMv/tbl0EMS57gyoYJ4Bf/viwuFWz6WxjoAXnzi`
- Base ID to use in env: `appNC0OJj3yACMbMv`
- Table Name: `Titled Table`

You only need Base ID + API key + table name for this scaffold.

## 2) Environment Variables
Copy `.env.example` to `.env.local` and set values:

```bash
cp .env.example .env.local
```

Required:
- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE_NAME`
- `INTERNAL_APP_PASSWORD` (for optional write actions)

Notes:
- `AIRTABLE_API_KEY` must be the full token value copied exactly.
- `AIRTABLE_BASE_ID` can be either just `app...` or a combined reference like `app.../tbl.../viw...` (the app will parse this automatically).

Optional mapping overrides are listed in `.env.example`.

## 3) Run Locally
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 4) Deploy to Vercel
1. Push this repo to GitHub.
2. Import to Vercel as a Next.js project.
3. Add the same env vars in Vercel Project Settings.
4. Deploy.

## Routes
- `/` Dashboard
- `/board` Production Board
- `/analytics` Deep Analytics
- `/tapes/[id]` Tape Detail

## API Routes
- `GET /api/ops/summary`
- `GET /api/tapes`
- `GET /api/tapes/:id`
- `POST /api/actions/status` (internal password required)
- `POST /api/actions/notes` (internal password required)

## Notes
- This implementation treats your single table as the source of truth.
- Stage is inferred from existing fields; if your process differs, edit `lib/data.ts` stage inference.
- If note writes fail, set `AIRTABLE_INTERNAL_NOTES_FIELD` to an existing writable text field.
