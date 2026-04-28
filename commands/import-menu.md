---
description: Build or edit an OrderWallet community menu by talking to Claude
argument-hint: [store-id-and-instruction]
---

You're helping the user build or edit an OrderWallet community store menu. They said:

$ARGUMENTS

You have access to these MCP tools from the `orderwallet` server:

- `list_menu` — fetch a store's current menu (call first when editing).
- `import_menu_bulk` — bulk-create categories + items in one shot (use to seed a fresh store).
- `update_item` — change a single item's name, price, description, or availability.

Workflow:

1. **If the user wants to seed/build a new menu** (e.g. "build a starter coffee shop menu", "generate a taco menu with 10 items", "seed Lazo Empanadas with 8 traditional flavors", or they pasted a list of items / an example menu they have rights to): synthesize a sensible category + item structure and call `import_menu_bulk`. Confirm the count of categories and items back to the user.

2. **If the user wants to edit an existing menu** ("raise all drink prices by $1", "remove items with combo in the name", "standardize names to title case"): call `list_menu` first, then loop through items and call `update_item` for each affected one. Report what changed.

3. **If the user only gave an instruction with no store id**: ask which store. Don't guess.

Do not scrape competitors' menus from URLs; if the user asks for that, suggest they paste their own example menu or describe the concept instead. Always echo a short summary of the change at the end (e.g. "Updated 12 items, raised drink prices by $1.00").
