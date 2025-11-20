# [Notes to Self](https://notes-to-self.vercel.app)

## Powered by [Turso DB](https://turso.tech)


## Application Features

- GitHub OAuth Authentication
- Real-time Notes Management
- Search & Sort Functionality
- Responsive Design
- Secure User Sessions

  
 ## Tech Stack

- Frontend: Next.js 16, React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Database: Turso (LibSQL)
- Auth: GitHub OAuth
- Icons: Lucide React
<hr>
<img width="1427" height="809" alt="Screenshot 2025-11-19 at 08 22 33" src="https://github.com/user-attachments/assets/8611c496-b01c-4932-8e6e-c8ee4b6b5753" />
<img width="1512" height="673" alt="Screenshot 2025-11-19 at 18 39 55" src="https://github.com/user-attachments/assets/950602ef-6146-4471-8d64-7002613f2ea7" />
<img width="706" height="586" alt="Screenshot 2025-11-19 at 09 06 50" src="https://github.com/user-attachments/assets/8002f1b7-efa4-411a-a512-fea7b5d60b45" />

#### TABLE

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
#### INDEX 

```
turso db shell notes-db-v2 "CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);"

```
#### CLIENT

```
pnpm install @libsql/client

```
#### NODE

```

import { createClient } from "@libsql/client";

export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

```
