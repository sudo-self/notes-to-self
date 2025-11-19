### Run the CREATE TABLE command

```
turso db shell notes-db-v2 "CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);"
```


### Run the CREATE INDEX command  

```
turso db shell notes-db-v2 "CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);"

```

#### install lib client

```
pnpm install @libsql/client

```

#### initial NODE.js


```

import { createClient } from "@libsql/client";

export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});


```
