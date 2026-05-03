# See

Capture a screenshot of the running UI to a file.

Command: `agent-browser open <url>` then `agent-browser screenshot <filename.png>`
Default save dir: `~/.agent-browser/tmp/screenshots/`
To specify dir: `AGENT_BROWSER_SCREENSHOT_DIR=/tmp agent-browser screenshot <filename.png>`
Note: absolute path as first arg is parsed as CSS selector — use filename only or env var.
Availability check: `agent-browser --version`
