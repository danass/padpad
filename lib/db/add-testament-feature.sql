-- Create users table to store birth_date
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- email from NextAuth
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add auto_public_date column to documents
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS auto_public_date DATE;

-- Create index for auto_public_date
CREATE INDEX IF NOT EXISTS idx_documents_auto_public_date ON documents(auto_public_date) WHERE auto_public_date IS NOT NULL;

-- Create index for birth_date
CREATE INDEX IF NOT EXISTS idx_users_birth_date ON users(birth_date) WHERE birth_date IS NOT NULL;


