# PadPad - Vercel-Native Text Editor

A modern, serverless text editor built with Next.js 15, TipTap, and Postgres. Features include:

- Rich text editing with TipTap
- Automatic saving with debouncing
- Document history and versioning
- Folder organization
- Full-text search
- Export to multiple formats (MD, TXT, HTML, JSON)
- File import (.md, .txt)
- 100% Vercel-compatible

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```
DATABASE_URL=your_postgres_connection_string
POSTGRES_URL=your_postgres_connection_string
```

3. Run database migrations:
   - Visit `/migrate` in your browser and click "Run Migration"
   - Or make a POST request to `/api/migrate`
   - This creates all necessary tables, indexes, and functions

4. Run the development server:
```bash
npm run dev
```

## Features

### Editor
- Rich text editing with formatting (bold, italic, headings, lists, etc.)
- Auto-save with 500ms debounce
- Keyboard shortcuts:
  - `Cmd/Ctrl + S`: Save
  - `Cmd/Ctrl + E`: Export
  - `Cmd/Ctrl + H`: Toggle history

### Document Management
- Create, edit, and delete documents
- Organize documents in folders
- Search across all documents
- View document history and restore previous versions

### Export
- Markdown (.md)
- Plain text (.txt)
- HTML (.html)
- JSON (.json)

### Import
- Drag and drop .md or .txt files
- Automatic document creation with initial snapshot

## Architecture

- **Frontend**: Next.js 15 (App Router), React 19, TipTap, Zustand
- **Backend**: Vercel Serverless Functions
- **Database**: Neon Postgres
- **Storage**: Event-sourced architecture with snapshots

## Database Schema

- `documents`: Document metadata
- `document_snapshots`: Full document snapshots
- `document_events`: Append-only event log
- `folders`: Folder hierarchy

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

The app is fully compatible with Vercel's free tier.

