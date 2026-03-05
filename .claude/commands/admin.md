# Admin Debug Skill

Use the browser MCP (chrome-devtools) to debug issues in the Tekon admin panel.

## Credentials

- **URL:** http://localhost:4321/admin (or the running dev server)
- **Email:** monleon_89@hotmail.com
- **Password:** Carretillas@Tekon

## Workflow

### 1. Add Console Logs First

Before opening the browser, identify the broken flow and **add `console.log` statements** throughout:

- Log function entry points with arguments
- Log state before and after mutations
- Log API request payloads and responses
- Log conditional branches taken
- Log any error objects in full

Example pattern:
```ts
console.log('[DEBUG] functionName called with:', { arg1, arg2 });
console.log('[DEBUG] state before:', currentState);
// ... operation ...
console.log('[DEBUG] state after:', newState);
```

### 2. Open Browser and Navigate

```
1. Use mcp__chrome-devtools__new_page or mcp__chrome-devtools__list_pages to get a page
2. Navigate to the admin login page
3. Fill credentials and log in
4. Navigate to the specific page/feature that has the issue
```

### 3. Reproduce the Issue

Interact with the UI to trigger the bug:
- Use `mcp__chrome-devtools__click`, `mcp__chrome-devtools__fill`, `mcp__chrome-devtools__press_key`
- Use `mcp__chrome-devtools__wait_for` after actions that trigger async operations

### 4. Collect Evidence

After reproducing:

```
- mcp__chrome-devtools__list_console_messages  → read all console output including your debug logs
- mcp__chrome-devtools__list_network_requests  → check API calls, status codes, payloads
- mcp__chrome-devtools__take_screenshot        → capture visual state
- mcp__chrome-devtools__evaluate_script        → inspect DOM state or run expressions
```

### 5. Analyze and Fix

- Match console log output to the code path
- Identify where the unexpected value or behavior first appears
- Fix the root cause, not just the symptom
- Remove debug `console.log` statements after fixing

## Tips

- Always check network requests for 4xx/5xx errors before assuming a frontend bug
- Use `mcp__chrome-devtools__get_console_message` to get details on specific errors
- If login fails, check that the dev server is running and Supabase auth is reachable
- After a fix, reproduce the original steps to confirm the bug is gone before removing logs
