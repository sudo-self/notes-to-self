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
#### JSON

```

[
  {
    id: "0acaed84-0c90-4c76-b2ce-50f98b2d011d",
    user_id: "119XXX",
    title: "Test #005",
    content: "005 005 005",
    created_at: "2025-11-20T01:59:37.088Z",
    updated_at: "2025-11-20T01:59:37.088Z",
  },
  {
    id: "61e75e04-e5b6-4973-87ed-97eb11164169",
    user_id: "119XXX",
    title: "Test #004",
    content: "004 004 004",
    created_at: "2025-11-20T01:39:37.123Z",
    updated_at: "2025-11-20T01:39:37.123Z",
  },
  {
    id: "67bda0f2-8033-470e-b751-d4808d2aec92",
    user_id: "119XXX",
    title: "Test #001",
    content: "001 001 001",
    created_at: "2025-11-19T16:04:26.582Z",
    updated_at: "2025-11-19T16:04:26.582Z",
  },
  {
    id: "776fd32e-feb2-4b8c-89ce-bc8d206f92ad",
    user_id: "119XXX",
    title: "Test #002",
    content: "002 002 002",
    created_at: "2025-11-19T16:04:50.670Z",
    updated_at: "2025-11-19T16:04:50.670Z",
  },
  {
    id: "a75b9788-93bc-43b2-9cd3-36a81db8c43a",
    user_id: "119XXX",
    title: "Test #003",
    content: "003 003 003",
    created_at: "2025-11-19T16:05:19.225Z",
    updated_at: "2025-11-19T16:05:19.225Z",
  },
  {
    id: "fa43127d-81ec-44ea-b9a2-8194ca8e7f1f",
    user_id: "119XXX",
    title: "Test #006",
    content: "006 006 006",
    created_at: "2025-11-20T04:32:34.968Z",
    updated_at: "2025-11-20T04:32:34.968Z",
  },
];

```
