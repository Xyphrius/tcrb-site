# TCRB Agent — Roadmap

> Strategic context lives in the Obsidian vault: `VAULT_INDEX.md`. This file is
> the execution checklist; that note is the "why." Keep them in sync.

## Next wiring jobs

- [ ] **Resolve Socrata dataset IDs.** Replace placeholder 4x4 IDs in
  `tasks/data-scraper.js` with the canonical `data.ny.gov` dataset identifiers
  (OCM adult-use licenses, dispensary roster, cumulative sales). Verify each
  via `https://data.ny.gov/resource/<id>.json?$limit=1` before committing.

- [ ] **Private `tcrb-coa-supabase` source.** Blocked on the COA view landing in
  Supabase. When ready: add `tasks/coa-source.js` that reads the view with a
  service-role key stored as a Fly secret (`COA_SUPABASE_URL`,
  `COA_SUPABASE_SERVICE_KEY`), and merge its output into the scraper cycle
  before `updateSite()`.

- [ ] **Register the agent in Felix's n8n workflow.** Expose a POST endpoint
  on `tcrb-agent` (e.g. `/api/trigger-cycle`) guarded by a dedicated
  `N8N_WEBHOOK_TOKEN` secret — not the dashboard basic-auth — so n8n can
  kick a cycle on demand. Add the matching HTTP Request node in n8n and
  document the payload shape here once finalized.

- [ ] **Cite ≥1 CRS review from Tier 1 data before CGRF Round 2.** Pull the
  authoritative OCM/state metrics through this pipeline, use them in the CRS
  review, and land the citation in the Vineyard deliverable. Deadline:
  **2026-05-13** (CGRF Round 2).

## Done

- [x] Fly deployment (`tcrb-agent.fly.dev`), 4h cron, review dashboard, GitHub
      push → Vercel auto-deploy. See commit history from 2026-04-19.
