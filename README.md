# 📝 PadPad

> A modern, collaborative text editor built for the web. Create, organize, and share beautiful documents with rich media support.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ Features

### 🎨 Rich Text Editing
- **Powerful Editor**: Built with TipTap and ProseMirror for a smooth writing experience
- **Markdown Support**: Paste markdown and it automatically converts to rich text
- **Formatting Tools**: Bold, italic, underline, strikethrough, code, and more
- **Multiple Fonts**: Choose from various font families and sizes
- **Text Styling**: Custom colors, highlights, alignment, line height

### 📁 Document Management
- **Smart Organization**: Create folders and organize your documents
- **Full-Text Search**: Quickly find any document with powerful search (⌘K)
- **Document Tabs**: Work on multiple documents simultaneously
- **Auto-Save**: Never lose your work with intelligent debounced saving
- **Version History**: Track changes and restore previous versions
- **Document Starring**: Mark important documents as favorites

### 🎬 Rich Media
- **Images**: Drag and drop images with resizing support
- **Videos**: Embed and play videos directly in documents
- **Audio**: Add audio files with built-in player
- **YouTube**: Embed YouTube videos
- **Drawings**: Create and edit drawings inline
- **Link Previews**: Automatic rich previews for pasted URLs
- **Chat Visualizations**: Import and visualize chat conversations (Instagram, Messages)

### 🌐 Sharing & Publishing
- **Public Links**: Share documents with anyone via public URLs
- **Testament Mode**: Create permanent, immutable documents
- **Temporary Pads**: Share documents that expire after a set time
- **Export Options**: Download as Markdown, HTML, TXT, or JSON
- **Bulk Export**: Download all your documents at once

### 🔐 Authentication & Security
- **Multiple Auth Options**: Email/password, Google OAuth
- **Secure Sessions**: JWT-based authentication with NextAuth
- **User Profiles**: Customizable avatars and settings
- **Admin Panel**: Comprehensive admin dashboard for moderation

### 🌍 Internationalization
- **Multi-Language**: Support for English, French, and Swedish
- **Auto-Detection**: Automatically detects user's preferred language
- **Localized UI**: Fully translated interface and messages

### ⚡ Developer Experience
- **Modern Stack**: Next.js 15 App Router, React 19, TypeScript
- **Serverless**: Fully serverless architecture on Vercel
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Intelligent caching with Redis
- **Analytics**: PostHog integration for insights
- **File Storage**: AWS S3 and IPFS support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon, Supabase, or local)
- (Optional) AWS S3 or IPFS for file storage

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/padpad.git
   cd padpad
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file with the following:
   ```env
   # Database
   DATABASE_URL=your_postgres_connection_string
   POSTGRES_URL=your_postgres_connection_string
   
   # Authentication
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # AWS S3 (optional)
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=your_region
   AWS_S3_BUCKET=your_bucket_name
   
   # IPFS (optional)
   IPFS_API_URL=your_ipfs_api_url
   IPFS_GATEWAY_URL=your_ipfs_gateway_url
   
   # Analytics (optional)
   NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

4. **Run database migrations**
   ```bash
   # Option 1: Via API endpoint
   npm run dev
   # Then POST to http://localhost:3000/api/migrate
   
   # Option 2: Via web interface
   # Visit http://localhost:3000/migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Usage

### Creating a Document
1. Sign in or create an account
2. Click the "+" button in the header
3. Start typing - your document auto-saves!

### Organizing Documents
- Create folders from the Drive page
- Drag documents into folders
- Use the search (⌘K) to find anything

### Rich Media
- **Images**: Drag and drop into the editor
- **Videos**: Paste video URLs or upload files
- **Drawings**: Use the drawing tool in the toolbar
- **Links**: Paste any URL for automatic preview

### Sharing
- Click the share button on any document
- Choose public link, testament, or temporary pad
- Copy the link and share!

### Importing/Exporting
- **Import**: Drag .md or .txt files onto the Drive page
- **Export**: Use the export button to download in various formats

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TipTap, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless Functions)
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Auth**: NextAuth.js with multiple providers
- **Storage**: AWS S3 + IPFS for distributed storage
- **Caching**: Upstash Redis
- **Analytics**: PostHog
- **Deployment**: Vercel

### Database Schema

```
users
├── id (uuid, primary key)
├── email (unique)
├── name
├── avatar_url
├── is_admin
└── created_at

documents
├── id (uuid, primary key)
├── user_id (foreign key)
├── folder_id (foreign key, nullable)
├── title
├── content (jsonb)
├── content_text (for search)
├── is_public
├── is_starred
├── created_at
└── updated_at

folders
├── id (uuid, primary key)
├── user_id (foreign key)
├── name
├── parent_id (self-referencing, nullable)
├── created_at
└── updated_at

document_snapshots
├── id (uuid, primary key)
├── document_id (foreign key)
├── content (jsonb)
├── content_text
└── created_at

document_events
├── id (uuid, primary key)
├── document_id (foreign key)
├── event_type
├── event_data (jsonb)
└── created_at

public_documents
├── id (uuid, primary key)
├── slug (unique)
├── document_id (foreign key)
├── created_at
└── views

testament_documents
├── id (uuid, primary key)
├── slug (unique)
├── document_id (foreign key)
├── is_locked
└── created_at

temporary_pads
├── id (uuid, primary key)
├── content (jsonb)
├── expires_at
└── created_at
```

### Event-Sourced Architecture
PadPad uses an event-sourced architecture for document management:
- All changes are logged as immutable events
- Snapshots are created periodically for performance
- Full document history is preserved
- Easy rollback and auditing

## 🛠️ Development

### Project Structure
```
padpad/
├── app/                    # Next.js App Router pages
│   ├── (main)/            # Authenticated routes
│   ├── (public)/          # Public routes
│   ├── api/               # API endpoints
│   └── layout.js          # Root layout
├── components/            # React components
│   ├── editor/           # Editor components
│   ├── layout/           # Layout components
│   └── drive/            # Drive page components
├── lib/                   # Utilities and helpers
│   ├── editor/           # TipTap extensions
│   ├── db/               # Database utilities
│   └── auth/             # Authentication helpers
├── public/               # Static assets
└── styles/               # Global styles
```

### Key Commands
```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier

# Database
npm run migrate      # Run database migrations
```

### Adding New Features
1. Create TipTap extension in `lib/editor/`
2. Add to extensions config in `lib/editor/extensions-config.js`
3. Create React component if needed in `components/editor/`
4. Add toolbar controls in `components/editor/GoogleDocsToolbar.js`

## 🚢 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms
PadPad is a standard Next.js app and can be deployed to:
- Netlify
- AWS Amplify
- Cloudflare Pages
- Railway
- Self-hosted with Docker

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TipTap](https://tiptap.dev/) - Headless editor framework
- [Next.js](https://nextjs.org/) - React framework
- [Vercel](https://vercel.com/) - Hosting platform
- [Neon](https://neon.tech/) - Serverless Postgres

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Made with ❤️ by the PadPad Team
