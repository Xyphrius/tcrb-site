# TCRB Agent — cron + review dashboard

The autonomous operations system for **The Cannabis Review Board**. Runs
on a 4-hour cron, scrapes NY OCM market data, updates the site, stages
generated content (social / fundraising / merch) for human review, and
pushes accepted changes to GitHub so Vercel auto-deploys.

**Live:** https://tcrb-agent.fly.dev (basic-auth review dashboard)

## Stack

- Node 20 + `node-cron`, plain Node — no LLM sub-agent framework here
- Native `canvas` for image generation
- Persistent volume on Fly mounted at `/data`
- Cycle entrypoint: `index.js → runFullCycle()`
- Production entry: `server.js` (HTTP dashboard + cron)
- Dashboard: `review-server.js` with HTTP basic auth
- Container boot: `start.sh` (clones tcrb-site into `/data`, runs `node server.js`)

## Local dev

```bash
npm install
cp .env.example .env  # fill in GITHUB_TOKEN, ANTHROPIC_API_KEY (optional)
npm run cycle         # run one cycle, exit
npm run review        # local dashboard at http://localhost:8080
```

## Deploy

```bash
fly deploy            # uses fly.toml in this dir
```

Secrets: `GITHUB_TOKEN`, `REVIEW_USERNAME`, `REVIEW_PASSWORD`, `ANTHROPIC_API_KEY` (optional).

## What's next

See [`ROADMAP.md`](./ROADMAP.md) for the wiring jobs after deploy
(Socrata IDs, Supabase COA source, n8n registration, CGRF Round 2 citation).

## Not to be confused with…

The **Felix** sub-agent runtime lives in a **different** repo:
[`Xyphrius/tcrb-agent-Felix`](https://github.com/Xyphrius/tcrb-agent-Felix).
That's the `thepopebot`-based system that runs LLM-driven sub-agents
(funding-scan, policy-watch, dispensary-watch) with the `browser-use`
and `playwright-cli` skills. This repo doesn't host any of that.

| | This agent (`tcrb-site/agent/`) | Felix (`tcrb-agent-Felix`) |
|---|---|---|
| Purpose | Data cron + review dashboard | LLM sub-agent runtime |
| Framework | plain Node + node-cron | thepopebot |
| Deploy | Fly.io | local Docker compose |
| Browser tools | none | browser-use, playwright-cli |
