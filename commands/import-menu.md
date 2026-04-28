---
description: Import or edit an OrderWallet store menu by talking to Claude
argument-hint: [store-id-or-url-or-instruction]
---

You're helping the user manage an OrderWallet store menu. They said:

$ARGUMENTS

You have access to these MCP tools from the `orderwallet` server:

- `list_menu` — fetch a store's current menu (call first if editing).
- `import_menu_bulk` — bulk-create categories + items in one shot (use for fresh imports from a scraped source).
- `update_item` — change a single item's name, price, description, or availability.

Workflow:

1. **If the user gave a store id and a URL to scrape** (e.g. a DoorDash link): fetch the page yourself with WebFetch, parse out the categories and items, and call `import_menu_bulk`. Confirm the count of categories and items back to the user.

2. **If the user gave a store id and a natural-language change** ("raise all drink prices by $1", "remove items with combo in the name"): call `list_menu` first, then loop through items and call `update_item` for each affected one. Report what changed.

3. **If the user only gave an instruction with no store id**: ask which store. Don't guess.

Always echo a short summary of the change at the end (e.g. "Updated 12 items, raised drink prices by $1.00").
