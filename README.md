# orderwallet-mcp

MCP server for OrderWallet community menus. Connect [Claude Code](https://claude.com/product/claude-code) (or any other [Model Context Protocol](https://modelcontextprotocol.io) client) to your OrderWallet account and edit community store menus by talking.

> **Scope:** currently community menu operations only. Restaurant Manager and Store Manager have separate, dedicated products.

## Tools

| Tool | What it does |
|---|---|
| `list_menu` | Fetch a store's current menu — categories, items, prices, customizations. |
| `import_menu_bulk` | Bulk-create categories + items in one shot. Best for seeding a fresh store from a list of items, an example menu, or a description. |
| `update_item` | Change a single item's name, price, description, or availability. |

## Install in Claude Code

```bash
git clone https://github.com/dwilczak-ow/orderwallet-mcp.git
cd orderwallet-mcp/mcp && npm install
cd ..
OW_API_TOKEN="paste-your-token-here" claude --plugin-dir .
```

Once Claude is running, try `/import-menu raise all drink prices by $1 in store <id>`.

## Install in any other local MCP client

Desktop AI tools (Claude Desktop, Cursor, Zed, Continue, …) launch the server as a local subprocess. Clone this repo, then drop this into the client's MCP config:

```json
{
  "mcpServers": {
    "orderwallet": {
      "command": "node",
      "args": ["/path/to/orderwallet-mcp/mcp/server.js"],
      "env": {
        "OW_API_TOKEN": "paste-your-token-here",
        "OW_API_BASE": "https://orderwallet.net"
      }
    }
  }
}
```

## Use the hosted endpoint (cloud clients)

ChatGPT custom connectors and Snowflake Cortex Agents run the AI in the cloud — they can't spawn a process on your laptop, so they need a remote MCP endpoint. There's a hosted version of this server at:

```
https://community.orderwallet.net/api/mcp
```

Configure the connector to send `Authorization: Bearer <your-token>` on every request (token-paste flow same as the local install — copy from [community.orderwallet.net/mcp](https://community.orderwallet.net/mcp) while signed in). No clone, no `npm install`.

## Auth token

Sign in at [community.orderwallet.net](https://community.orderwallet.net), then visit [community.orderwallet.net/mcp](https://community.orderwallet.net/mcp) — your current `OW_API_TOKEN` is shown there with a Copy button. Tokens expire ~1 hour after sign-in.

## Full docs

[community.orderwallet.net/mcp](https://community.orderwallet.net/mcp) has the canonical install guide with config-file paths for Claude Desktop, Cursor, Zed, and Continue.
