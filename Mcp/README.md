# NexviaTech Pipeline MCP Server

This local MCP server lets Gemini CLI call your pipeline tools against the current repo layout.

## Expected Repo Layout

- Repo root: `P:\Creative-client-`
- Backend root: `P:\Creative-client-\Leads\backend`
- MCP server: `P:\Creative-client-\Mcp`

The server auto-detects `Leads/backend`. Set `NEXVIA_ROOT` to the repo root, not the backend folder.

## Setup

### 1. Install Python dependencies

```powershell
cd P:\Creative-client-\Mcp
python -m pip install -r requirements.txt
```

### 2. Configure environment

```powershell
Copy-Item .env.example .env
```

Set:

```env
NEXVIA_ROOT=P:\Creative-client-
```

### 3. Register the server in Gemini CLI

Add this to `C:\Users\Laptop\.gemini\settings.json`:

```json
{
  "mcpServers": {
    "nexviatech": {
      "command": "python",
      "args": ["P:\\Creative-client-\\Mcp\\server.py"],
      "env": {
        "NEXVIA_ROOT": "P:\\Creative-client-"
      }
    }
  }
}
```

If your `settings.json` already has other keys, merge only the `mcpServers` section.

### 4. Start Gemini CLI

```powershell
gemini
```

## Tools

- `run_pipeline`
- `run_scraper`
- `get_leads`
- `get_analytics`
- `build_websites`
- `send_emails`
- `take_screenshots`
- `check_whatsapp`
- `pipeline_status`
- `list_cities`

## Notes

- `run_pipeline` uses the repo-root wrapper `run_pipeline.py`.
- `build_websites` runs `node src/index.js run` inside `Leads/backend/website-builder`.
- `send_emails` runs `email_sender/agent.py --require-approved-review`.
- `check_whatsapp` calls the current helper implementation in `Leads/backend/whatsappcheck/checker.py`.

## Troubleshooting

- If import fails with `No module named 'mcp'`, install dependencies from `requirements.txt`.
- If tools report missing paths, confirm `NEXVIA_ROOT` is `P:\Creative-client-`.
- If Gemini does not show the server, re-check `C:\Users\Laptop\.gemini\settings.json`.
