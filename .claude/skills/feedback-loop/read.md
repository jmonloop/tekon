# Read

Tail dev server logs and query browser-side errors.

Command (server logs): `tail -n 50 /tmp/tekon-dev.log`
Command (live stream): `tail -f /tmp/tekon-dev.log`
Command (browser errors): `agent-browser eval "JSON.stringify(window.__lastErrors||[])"`
Availability check: `which tail && agent-browser --version`

Note: log file populated only when dev server started with:
`npm run dev 2>&1 | tee /tmp/tekon-dev.log &`
