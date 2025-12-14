-- Add user_id column to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add user_id column to folders table
ALTER TABLE folders 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Create index for user_id on documents
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);

-- Create index for user_id on folders
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
