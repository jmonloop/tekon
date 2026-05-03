---
name: feedback-loop
description: Use when finishing an implementation that changes UI / app behavior / rendered output — validates the change end-to-end. Skip for pure refactors, comments, or test-only changes.
---

Validate UI and behavior changes end-to-end using the capabilities below.

## Runtime context

- Base URL: `http://localhost:4321`
- Dev server start: `npm run dev 2>&1 | tee /tmp/tekon-dev.log &`
- Readiness check: `curl -sf http://localhost:4321 >/dev/null` (poll until 200)
- Login steps: navigate to `/admin/login`, fill email + password from creds file, submit
- Credentials: stored in `.claude/feedback-creds.local.json` (git-ignored). Fields: `supabase.email`, `supabase.password`. Read the file at runtime; never inline values here.

## Admin login recipe

```bash
EMAIL=$(jq -r .supabase.email .claude/feedback-creds.local.json)
PASS=$(jq -r .supabase.password .claude/feedback-creds.local.json)
agent-browser open http://localhost:4321/admin/login
agent-browser fill 'input[type=email]' "$EMAIL"
agent-browser fill 'input[type=password]' "$PASS"
agent-browser click 'button[type=submit]'
```

## Capabilities

Read only the sub-file(s) matching the capability you need.

- Need a screenshot of current UI state? Read `see.md`.
- Need to send input (click/type/navigate)? Read `act.md`.
- Need to tail logs? Read `read.md`.
- Need to query DOM / computed state? Read `inspect.md`.
