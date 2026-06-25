
-- Create profiles table for admin-added profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  height TEXT,
  body_type TEXT,
  complexion TEXT,
  location TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  instagram TEXT,
  short_bio TEXT,
  description TEXT,
  services TEXT[] DEFAULT '{}',
  profile_image TEXT,
  images TEXT[] DEFAULT '{}',
  rating NUMERIC DEFAULT 4.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public read access (profiles are shown to all visitors)
CREATE POLICY "Profiles are publicly readable"
ON public.profiles FOR SELECT
USING (true);

-- Allow all inserts/updates/deletes (admin auth is handled in app code)
-- Using anon key since there's no user auth system
CREATE POLICY "Allow insert for anon"
ON public.profiles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update for anon"
ON public.profiles FOR UPDATE
USING (true);

CREATE POLICY "Allow delete for anon"
ON public.profiles FOR DELETE
USING (true);

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);

-- Storage policies for profile images
CREATE POLICY "Profile images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Anyone can upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "Anyone can update profile images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-images');

CREATE POLICY "Anyone can delete profile images"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-images');

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
