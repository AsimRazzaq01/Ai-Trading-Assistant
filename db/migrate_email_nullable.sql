-- Migration script to make email column nullable
-- Run this script on your database to allow username-only registration

-- For PostgreSQL:
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Verify the change:
-- SELECT column_name, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'email';
-- Should show is_nullable = 'YES'

