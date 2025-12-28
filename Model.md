# Textpad Architecture & Development Guidelines

> **Last Updated:** 2025-12-28
> **Framework:** Next.js 15+ with App Router

---

## 1. Session Management (Zero-Call Navigation)

### ✅ DO
- Place `SessionProvider` **exclusively** in root `app/layout.js`
- Fetch session server-side using `auth()` and pass as prop
- Allow SessionProvider to hydrate from passed prop

### ❌ DON'T
- Put `SessionProvider` inside route group layouts (`(main)/layout.js`, `(public)/layout.js`)
- This causes auth context to unmount/remount = redundant API calls

---

## 2. Metadata & SEO (Server First)

### Page-Client Pattern
```
page.js      → Server Component (metadata, generateMetadata, data fetching)
PageClient.js → Client Component ("use client", hooks, UI logic)
```

### Rules
- **Never** export `metadata` or `generateMetadata` from `"use client"` files
- Always implement `generateMetadata` for dynamic routes `[id]`, `[slug]`
- Define `metadataBase` in root layout for correct OG images/canonicals
- Each main page should define its own `alternates: { canonical: '...' }`

---

## 3. Data Fetching & Performance

| Pattern | When to Use |
|---------|-------------|
| `React.cache()` | Same data needed for metadata + component |
| `export const dynamic = 'force-dynamic'` | Frequently updated data (public docs) |
| Server Components | Keep data fetching server-side to reduce client bundle |

---

## 4. Database (PostgreSQL / @vercel/postgres)

- **Server-only access** - All SQL in Server Components or Server Actions
- **Input validation** - UUID regex or Zod schemas before SQL queries
- **Clean models** - Return UI-ready objects, hide DB internals

### Migration Best Practices
- Use `/api/migrate` endpoint for schema changes
- **Idempotent queries**:
  ```sql
  CREATE TABLE IF NOT EXISTS ...
  -- For columns: check existence before ALTER TABLE
  ```
- Return detailed JSON feedback ("created", "skipped", "error")
- Protect with admin check or secret API key

---

## 5. Code Organization

### Absolute Paths (@ alias)
```javascript
import Component from '@/components/...'
import { utility } from '@/lib/...'
import '@/app/globals.css'
```

### File Structure
```
app/
  (main)/         # Authenticated routes
  (public)/       # Public routes
  api/            # API routes
components/
  editor/         # Editor-specific components
  layout/         # Header, Footer, etc.
  ui/             # Reusable UI components
lib/
  editor/         # Tiptap extensions
hooks/            # Custom React hooks
```

---

## 6. UI Design Standards

### Premium Aesthetics
- ✅ Harmonious HSL color palettes, dark modes
- ✅ Modern typography (Inter, Roboto via Google Fonts)
- ✅ Subtle shadows, smooth gradients, glassmorphism
- ✅ Micro-animations on hover/focus
- ❌ Raw colors (pure red, blue, green)
- ❌ Placeholder content or Lorem Ipsum

### Responsive Design
- Mobile-first approach
- Use Flexbox/Grid + responsive utility classes
- Test on actual mobile devices

### Component Guidelines
- Semantic HTML (`<header>`, `<main>`, `<footer>`)
- Lucide icons for consistency
- Smooth transitions (150-200ms)

---

## 7. Middleware & Proxy

- Use `proxy.js` instead of `middleware.js`
- Include `Vary: Accept-Encoding` header for CDN/SEO
- Handle compression correctly for audit tools

---

## 8. Pre-Commit Checklist

- [ ] Run `npm run build` to check for errors
- [ ] Verify no `"use client"` files export metadata
- [ ] Check responsive design on mobile
- [ ] Update this Model.md if architecture changes
- [ ] Clear commit message describing changes

---

## Quick Reference: Common Patterns

### Server + Client Page Pattern
```javascript
// app/(main)/example/page.js
export async function generateMetadata() {
  return { title: 'Example' }
}

export default async function Page() {
  const data = await fetchData()
  return <PageClient data={data} />
}

// app/(main)/example/PageClient.js
'use client'
export default function PageClient({ data }) {
  // hooks, state, UI here
}
```

### Protected API Route
```javascript
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... handle request
}
```
