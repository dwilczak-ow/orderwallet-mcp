#!/usr/bin/env node
/* eslint-disable no-console */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_BASE = (process.env.OW_API_BASE || "https://orderwallet.net").replace(/\/+$/, "");
const API_TOKEN = process.env.OW_API_TOKEN || "";

if (!API_TOKEN) {
  // Don't exit — Claude can still list tools so the user sees a useful
  // error when they invoke one. Stderr surfaces in the plugin's logs.
  console.error("[orderwallet-mcp] OW_API_TOKEN is not set; tool calls will fail with 401.");
}

async function ow(path, opts = {}) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_TOKEN}`,
    ...(opts.headers || {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} — ${text.slice(0, 400)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const TOOLS = [
  {
    name: "list_menu",
    description:
      "Fetch the current menu for an OrderWallet store, including categories, items, prices, and customization sections. Call this before editing so you know the current state.",
    inputSchema: {
      type: "object",
      properties: {
        store_id: {
          type: "string",
          description: "UUID of the store (find via the stores list endpoint or the URL on orderwallet.net).",
        },
        menu_type: {
          type: "string",
          description: "Menu variant: all_day (default), breakfast, lunch, dinner, drinks, dessert.",
          default: "all_day",
        },
      },
      required: ["store_id"],
    },
  },
  {
    name: "import_menu_bulk",
    description:
      "Bulk-import a parsed menu into a store in one shot. Use this after scraping a competitor menu (e.g. DoorDash) or when seeding a fresh store. Each category contains items with name, price, and optional description/image. Requires admin token.",
    inputSchema: {
      type: "object",
      properties: {
        store_name: {
          type: "string",
          description: "Display name for the store. If a store with this name doesn't exist it'll be created.",
        },
        store_logo: {
          type: "string",
          description: "Optional URL to the store logo image.",
        },
        categories: {
          type: "array",
          description: "Categories in display order. Each has a name and an items array.",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    price: { type: "number" },
                    description: { type: "string" },
                    image: { type: "string" },
                  },
                  required: ["name", "price"],
                },
              },
            },
            required: ["name", "items"],
          },
        },
      },
      required: ["store_name", "categories"],
    },
  },
  {
    name: "update_item",
    description:
      "Update a single menu item — change its name, price, description, or availability. Pass only the fields you want to change.",
    inputSchema: {
      type: "object",
      properties: {
        item_id: { type: "string", description: "UUID of the menu item to update." },
        name: { type: "string" },
        price: { type: "number" },
        description: { type: "string" },
        is_available: { type: "boolean", description: "false = 86'd / sold out." },
      },
      required: ["item_id"],
    },
  },
];

const server = new Server(
  { name: "orderwallet", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;
  try {
    let result;
    switch (name) {
      case "list_menu": {
        const menuType = args.menu_type || "all_day";
        result = await ow(
          `/stores/${encodeURIComponent(args.store_id)}/menu?menu_type=${encodeURIComponent(menuType)}`,
        );
        break;
      }
      case "import_menu_bulk": {
        result = await ow(`/admin/import-menu`, {
          method: "POST",
          body: JSON.stringify({
            store_name: args.store_name,
            store_logo: args.store_logo,
            categories: args.categories,
          }),
        });
        break;
      }
      case "update_item": {
        const { item_id, ...patch } = args;
        result = await ow(`/menu-items/${encodeURIComponent(item_id)}`, {
          method: "PUT",
          body: JSON.stringify(patch),
        });
        break;
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (e) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error: ${e.message}` }],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
