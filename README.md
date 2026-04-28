# orderwallet-mcp

MCP server for OrderWallet community menus. Connect [Claude Code](https://claude.com/product/claude-code) (or any other [Model Context Protocol](https://modelcontextprotocol.io) client) to your OrderWallet account and edit community store menus by talking.

> **Scope:** currently community menu operations only. Restaurant Manager and Store Manager have separate, dedicated products.

## Tools

| Tool | What it does |
|---|---|
| `list_menu` | Fetch a store's current menu — categories, items, prices, customizations. |
| `import_menu_bulk` | Bulk-create categories + items in one shot. Best for seeding a fresh store from a parsed competitor URL. |
| `update_item` | Change a single item's name, price, description, or availability. |

## Install in Claude Code

```bash
git clone https://github.com/dwilczak-ow/orderwallet-mcp.git
cd orderwallet-mcp/mcp && npm install
cd ..
OW_API_TOKEN="paste-your-token-here" claude --plugin-dir .
```

Once Claude is running, try `/import-menu raise all drink prices by $1 in store <id>`.

## Install in any other MCP client

Drop this into your client's MCP config:

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

## Auth token

Sign in at [community.orderwallet.net](https://community.orderwallet.net), then visit [community.orderwallet.net/mcp](https://community.orderwallet.net/mcp) — your current `OW_API_TOKEN` is shown there with a Copy button. Tokens expire ~1 hour after sign-in.

## Full docs

[community.orderwallet.net/mcp](https://community.orderwallet.net/mcp) has the canonical install guide with config-file paths for Claude Desktop, Cursor, Zed, and Continue.
