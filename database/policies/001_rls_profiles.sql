-- ============================================
-- RLS FOR PROFILES
-- ============================================

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;


-- ============================================
-- USERS CAN VIEW THEIR OWN PROFILE
-- ============================================
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);


-- ============================================
-- USERS CAN INSERT THEIR OWN PROFILE
-- ============================================
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);


-- ============================================
-- USERS CAN UPDATE THEIR OWN PROFILE
-- ============================================
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
);