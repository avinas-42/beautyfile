# Beauty File — OAuth scopes (Marketplace / consent alignment)

Google requires the **exact same scopes** everywhere. Use **only** these two (no extras):

```
https://www.googleapis.com/auth/documents.currentonly
https://www.googleapis.com/auth/script.locale
```

## Checklist (verify each screen)

| Emplacement | Action |
|-------------|--------|
| **Repo manifest** | [`src/appsscript.json`](src/appsscript.json) → `oauthScopes` |
| **Apps Script** | Project → ⚙️ **Project Settings** → **OAuth scopes** (after `clasp push`, should mirror manifest) |
| **GCP — OAuth consent screen** | APIs & Services → OAuth consent screen → **Scopes**: only the two URIs above |
| **Marketplace SDK** | Google Workspace Marketplace SDK → **Permissions** (or equivalent) → match the same list |

Remove any stray scopes (`drive`, `spreadsheets`, `gmail`, old `documents` scope, etc.), then save. If you change scopes, OAuth re-verification may be required—keep the list minimal and identical everywhere.
