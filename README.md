
<img width="1427" height="809" alt="Screenshot 2025-11-19 at 08 22 33" src="https://github.com/user-attachments/assets/8611c496-b01c-4932-8e6e-c8ee4b6b5753" />

#### CREATE TABLE

<img width="1512" height="982" alt="Screenshot 2025-11-19 at 08 05 43" src="https://github.com/user-attachments/assets/caa5ed17-a4a8-4d54-a354-a03a7895f2c8" />

```
turso db shell notes "CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);"

```


#### CREATE INDEX 

```
turso db shell notes-db-v2 "CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);"

```

#### LIB CLIENT

```
pnpm install @libsql/client

```

#### NODE.js


```

import { createClient } from "@libsql/client";

export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});


```
