-- Add ad fields to profiles table
ALTER TABLE public.profiles ADD COLUMN is_ad BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN ad_images TEXT[] DEFAULT '{}';
