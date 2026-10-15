-- ========================================================
-- Vakeel Saab - Supabase Database Schema & RLS Policies
-- Execute this script in your Supabase project's SQL Editor
-- ========================================================

-- 1. Create Advocate Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  bar_council_no TEXT,
  court_jurisdiction TEXT DEFAULT 'High Court of Delhi',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advocates can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Advocates can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Advocates can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Create Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  facts TEXT,
  versions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_modified TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advocates can view their own legal documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Advocates can insert their own legal documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Advocates can update their own legal documents"
  ON public.documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Advocates can delete their own legal documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster querying by user_id
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_last_modified ON public.documents(last_modified DESC);
