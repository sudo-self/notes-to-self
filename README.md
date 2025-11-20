# [Notes to Self](https://notes-to-self.vercel.app)

## Powered by [Turso DB](https://turso.tech)

### Application Features

- GitHub OAuth Authentication
- Real-time Notes Management
- Search & Sort Functionality
- Responsive Design
- Secure User Sessions

  
 ### Tech Stack

- Frontend: Next.js 16, React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Database: Turso (LibSQL)
- Auth: GitHub OAuth
- Icons: Lucide React
  
<hr>
<img width="956" height="786" alt="Screenshot 2025-11-19 at 22 11 26" src="https://github.com/user-attachments/assets/3a0441bc-e412-4c0e-b3e7-dd2fd67feea1" />
<img width="956" height="786" alt="Screenshot 2025-11-19 at 22 12 08" src="https://github.com/user-attachments/assets/e1281d7e-0bbd-4aa5-9ade-d5ca95480886" />
<img width="706" height="586" alt="Screenshot 2025-11-19 at 09 06 50" src="https://github.com/user-attachments/assets/8002f1b7-efa4-411a-a512-fea7b5d60b45" />


### create an <a href="https://github.com/settings/applications/new">Oauth App</a> on Github

- set the callback url no trailing slash

- https://YOUR_DOMAIN_HERE/api/auth/github

### <a href="https://github.com/sudo-self/notes-to-self/blob/main/env.example.txt">.env example</a>

- GITHUB_CLIENT_ID=
- GITHUB_CLIENT_SECRET=
- TURSO_DB_URL=
- TURSO_TOKEN=
- NEXT_PUBLIC_BASE_URL=
- TURSO_DB_TOKEN=
- TURSO_AUTH_TOKEN=



- schema.sql

```
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);
```

- app/api/auth/debug/route.ts

```
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const redirectUri = `${baseUrl}/api/auth/github`;
  
  return NextResponse.json({
    message: "Debug GitHub OAuth",
    baseUrl,
    redirectUri,
    expected: "https://notes-to-self.vercel.app/api/auth/github",
    matches: redirectUri === "https://notes-to-self.vercel.app/api/auth/github",
    clientId: process.env.GITHUB_CLIENT_ID ? "Set" : "Missing"
  });
}
```
- Note JSON

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
```
