import { sql } from '@vercel/postgres'

async function runMigrations() {
  try {
    const results = []

    // Execute migrations one by one
    const migrations = [
      // Enable UUID extension
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

      // Create folders table
      `CREATE TABLE IF NOT EXISTS folders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Create documents table
      `CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL DEFAULT 'Untitled',
        folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        current_snapshot_id UUID,
        content_text TEXT
      )`,

      // Create document_snapshots table
      `CREATE TABLE IF NOT EXISTS document_snapshots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        content_json JSONB NOT NULL,
        content_text TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Add foreign key for current_snapshot_id (if not exists)
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_current_snapshot'
        ) THEN
          ALTER TABLE documents 
          ADD CONSTRAINT fk_current_snapshot 
          FOREIGN KEY (current_snapshot_id) 
          REFERENCES document_snapshots(id) ON DELETE SET NULL;
        END IF;
      END $$`,

      // Create document_events table
      `CREATE TABLE IF NOT EXISTS document_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('insert', 'delete', 'format', 'meta')),
        payload JSONB NOT NULL,
        version INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Create indexes
      `CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON documents(folder_id)`,
      `CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_document_events_document_version ON document_events(document_id, version)`,
      `CREATE INDEX IF NOT EXISTS idx_document_snapshots_document_created ON document_snapshots(document_id, created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id)`,
      `CREATE INDEX IF NOT EXISTS idx_documents_content_text_search ON documents USING gin(to_tsvector('simple', COALESCE(content_text, '')))`,

      // Add user_id columns for authentication
      `ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id TEXT`,
      `ALTER TABLE folders ADD COLUMN IF NOT EXISTS user_id TEXT`,
      `CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id)`,

      // Create function to update updated_at timestamp
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'`,

      // Create triggers
      `DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
       CREATE TRIGGER update_documents_updated_at 
       BEFORE UPDATE ON documents 
       FOR EACH ROW 
       EXECUTE FUNCTION update_updated_at_column()`,

      `DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
       CREATE TRIGGER update_folders_updated_at 
       BEFORE UPDATE ON folders 
       FOR EACH ROW 
       EXECUTE FUNCTION update_updated_at_column()`,

      // Create users table for testament feature
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        birth_date DATE,
        testament_slug TEXT UNIQUE,
        testament_username TEXT UNIQUE,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Add testament_slug column if it doesn't exist
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS testament_slug TEXT UNIQUE`,

      // Add testament_username column if it doesn't exist
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS testament_username TEXT UNIQUE`,

      // Add avatar_url column if it doesn't exist
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`,

      // Create index for username
      `CREATE INDEX IF NOT EXISTS idx_users_testament_username ON users(testament_username) WHERE testament_username IS NOT NULL`,

      // Add auto_public_date to documents
      `ALTER TABLE documents ADD COLUMN IF NOT EXISTS auto_public_date DATE`,

      // Create indexes for testament feature
      `CREATE INDEX IF NOT EXISTS idx_documents_auto_public_date ON documents(auto_public_date) WHERE auto_public_date IS NOT NULL`,
      `CREATE INDEX IF NOT EXISTS idx_users_birth_date ON users(birth_date) WHERE birth_date IS NOT NULL`,
      `CREATE INDEX IF NOT EXISTS idx_users_testament_slug ON users(testament_slug) WHERE testament_slug IS NOT NULL`,

      // Add is_public column to documents
      `ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false`,

      // Add is_full_width column to documents
      `ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_full_width BOOLEAN DEFAULT false`,

      // Add is_featured and featured_at columns to documents
      `ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`,
      `ALTER TABLE documents ADD COLUMN IF NOT EXISTS featured_at TIMESTAMP WITH TIME ZONE`,

      // Add archive_id column to users - unique ID for each user's archive page
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS archive_id TEXT UNIQUE`,
      `CREATE INDEX IF NOT EXISTS idx_users_archive_id ON users(archive_id) WHERE archive_id IS NOT NULL`,

      // Add ipfs_config column to users - IPFS storage configuration
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS ipfs_config JSONB`,

      // Add is_disposable and expires_at to documents
      `ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_disposable BOOLEAN DEFAULT false`,
      `ALTER TABLE documents ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE`,
      `CREATE INDEX IF NOT EXISTS idx_documents_expires_at ON documents(expires_at) WHERE expires_at IS NOT NULL`,

      // Add keywords column to documents (array of text)
      `ALTER TABLE documents ADD COLUMN IF NOT EXISTS keywords TEXT[]`,
      `CREATE INDEX IF NOT EXISTS idx_documents_keywords ON documents USING gin(keywords) WHERE keywords IS NOT NULL`,

      // Add role column to users
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'`,
      `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`
    ]

    // Run all migrations
    for (const migration of migrations) {
      try {
        await sql.query(migration)
        results.push({ success: true, statement: migration.substring(0, 50) + '...' })
      } catch (error) {
        // Ignore "already exists" errors
        if (error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          (error.message.includes('relation') && error.message.includes('does not exist') === false)) {
          results.push({ success: true, skipped: true, message: error.message.substring(0, 100) })
        } else {
          results.push({ success: false, error: error.message.substring(0, 200) })
        }
      }
    }

    // Generate archive_id for users who don't have one (using random 8-char string for privacy)
    try {
      // Get users without archive_id
      const usersWithoutArchiveId = await sql.query(`
        SELECT id FROM users WHERE archive_id IS NULL
      `)

      let archiveIdCount = 0
      for (const user of usersWithoutArchiveId.rows) {
        // Generate random 8-char alphanumeric string
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let archiveId = ''
        for (let i = 0; i < 8; i++) {
          archiveId += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        await sql.query(
          'UPDATE users SET archive_id = $1 WHERE id = $2',
          [archiveId, user.id]
        )
        archiveIdCount++
      }
      results.push({ success: true, message: `Generated random archive_id for ${archiveIdCount} users` })
    } catch (error) {
      results.push({ success: false, error: `archive_id generation: ${error.message}` })
    }

    // Generate Dicebear avatars for users who don't have an avatar
    try {
      // Get users without avatar
      const usersWithoutAvatar = await sql.query(`
        SELECT id FROM users WHERE avatar_url IS NULL
      `)

      let avatarCount = 0
      for (const user of usersWithoutAvatar.rows) {
        const seed = user.id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)
        const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`
        await sql.query(
          'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2',
          [avatarUrl, user.id]
        )
        avatarCount++
      }
      results.push({ success: true, message: `Generated Dicebear avatars for ${avatarCount} users` })
    } catch (error) {
      results.push({ success: false, error: `avatar generation: ${error.message}` })
    }

    return Response.json({ success: true, results })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST() {
  return runMigrations()
}

export async function GET() {
  return runMigrations()
}

