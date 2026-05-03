# Act

Send input to the running UI (open URL, click, fill, type, press, wait).

Command: `agent-browser open|click|fill|type|press|wait <args>`
Examples:
  `agent-browser open http://localhost:4321`
  `agent-browser click 'button[type=submit]'`
  `agent-browser fill 'input[name=email]' "user@example.com"`
  `agent-browser press Enter`
  `agent-browser wait 500`
Availability check: `agent-browser --version`

## Admin login

```bash
EMAIL=$(jq -r .supabase.email .claude/feedback-creds.local.json)
PASS=$(jq -r .supabase.password .claude/feedback-creds.local.json)
agent-browser open http://localhost:4321/admin/login
agent-browser fill 'input[type=email]' "$EMAIL"
agent-browser fill 'input[type=password]' "$PASS"
agent-browser click 'button[type=submit]'
```
