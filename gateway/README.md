# Gateway mirror

This folder mirrors the non-secret gateway code that the external web depends on.

Current scope:
- `PillsStore.cs`: pill catalog and classification API backing `/api/gm-support/pills`.

Do not commit local gateway startup scripts or `.env` files here because they contain production secrets.
