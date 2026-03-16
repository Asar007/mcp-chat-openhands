# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

An MCP (Model Context Protocol) server that visualizes conversations as structured hierarchical mind maps. It exposes tools over HTTP using the Streamable HTTP transport — no stdio. The LLM does all generation; the server is a lightweight prompt delivery mechanism plus API proxy.

## Commands

- **Build:** `npm run build` (runs `tsc`, outputs to `dist/`)
- **Start:** `npm start` (runs `node dist/index.js`, serves on PORT env or 3000)
- **No test/lint scripts are configured.**

## Architecture

Three source files in `src/`, compiled to ESM (`"type": "module"`):

- **`src/index.ts`** — HTTP server + MCP server setup. Creates an `McpServer` instance per request on `/mcp`. Registers four tools:
  - `visualize_chat` — returns a prompt (from `prompt.ts`) that instructs the LLM to generate mind map JSON
  - `create_public_diagram` — POSTs diagram JSON to the NavigateChat API, renders diagram inline via MCP Apps widget
  - `update_public_diagram` — PUTs updated content to an existing public diagram, renders inline via MCP Apps widget
  - `justify_content` — sends raw JSON to the API for validation/normalization
- **`src/prompt.ts`** — exports `buildMindMapPrompt(conversation)`, the system prompt template for mind map generation
- **`src/widget.html`** — MCP Apps widget that embeds the NavigateChat viewer in an iframe. Speaks the postMessage JSON-RPC protocol to receive tool results from the host and display diagrams inline in Claude.

Key details:
- External API base: `API_BASE_URL` env var, defaults to `https://api.navigatechat.com`
- CORS is wide open (`*`) — intended for browser/remote MCP clients
- Health check on `/health` and `/`
- A new `McpServer` + `StreamableHTTPServerTransport` is created per incoming `/mcp` request (stateless, no session persistence)
- Deployed via Railway (see `railway.toml`)

## Dependencies

- `@modelcontextprotocol/sdk` — MCP server framework
- `@modelcontextprotocol/ext-apps` — MCP Apps extension for inline UI rendering (`registerAppTool`, `registerAppResource`)
- `zod` (v4, imported as `zod/v4`) — input schema validation
- TypeScript targets ES2022 with NodeNext module resolution

## Changelog

### 2026-03-16
- Added MCP Apps support for inline diagram rendering in Claude
- Created `src/widget.html` — MCP Apps widget that embeds NavigateChat viewer via iframe
- Switched `create_public_diagram` and `update_public_diagram` from `server.registerTool` to `registerAppTool` with `_meta.ui.resourceUri`
- Added `registerAppResource` serving widget HTML with CSP allowing `www.navigatechat.com` iframe embedding
- Added `@modelcontextprotocol/ext-apps` dependency
- Updated build script to copy `widget.html` to `dist/`
