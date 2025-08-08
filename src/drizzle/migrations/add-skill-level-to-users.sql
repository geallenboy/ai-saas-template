-- Add a skillLevel field to the users table
ALTER TABLE users ADD COLUMN skill_level VARCHAR(20) DEFAULT 'beginner';

-- Set default value for existing users
UPDATE users SET skill_level = 'beginner' WHERE skill_level IS NULL;

-- Add constraint to ensure only valid values
ALTER TABLE users ADD CONSTRAINT users_skill_level_check 
CHECK (skill_level IN ('beginner', 'intermediate', 'advanced'));