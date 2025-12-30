-- Add IPFS columns to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS ipfs_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ipfs_cid TEXT;

-- Create index for ipfs_cid
CREATE INDEX IF NOT EXISTS idx_documents_ipfs_cid ON documents(ipfs_cid);
