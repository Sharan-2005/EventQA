-- EventQA Database Setup Script
-- For Supabase PostgreSQL

-- 1. Create PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- 2. Create EVENTS table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  event_date date NOT NULL,
  event_time time NOT NULL,
  venue text NOT NULL,
  organizer text NOT NULL,
  capacity integer NOT NULL DEFAULT 50 CHECK (capacity >= 0),
  created_at timestamptz DEFAULT now()
);

-- 3. Create REGISTRATIONS table
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  registered_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_event_registration UNIQUE(user_id, event_id)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 5. Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RLS Policies for PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by owner or admin" ON public.profiles;
CREATE POLICY "Public profiles are viewable by owner or admin"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile or admin can update" ON public.profiles;
CREATE POLICY "Users can update their own profile or admin can update"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin());

-- 7. RLS Policies for EVENTS
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
CREATE POLICY "Anyone can view events"
ON public.events FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Admins can insert events"
ON public.events FOR INSERT
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events"
ON public.events FOR DELETE
USING (public.is_admin());

-- 8. RLS Policies for REGISTRATIONS
DROP POLICY IF EXISTS "Users can view their own registrations or admin can view all" ON public.registrations;
CREATE POLICY "Users can view their own registrations or admin can view all"
ON public.registrations FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert registrations" ON public.registrations;
CREATE POLICY "Users can insert registrations"
ON public.registrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own registrations or admin" ON public.registrations;
CREATE POLICY "Users can update their own registrations or admin"
ON public.registrations FOR UPDATE
USING (auth.uid() = user_id OR public.is_admin());

-- 9. Trigger to auto-create profile on auth.users sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Insert Sample Events (Section 9)
INSERT INTO public.events (name, description, category, event_date, event_time, venue, organizer, capacity)
VALUES 
(
  'Tech Innovation Summit 2026',
  'Explore emerging breakthroughs in technology, enterprise solutions, and software architectures with industry visionaries.',
  'Technology',
  '2026-10-15',
  '10:00:00',
  'Mumbai',
  'EventQA Team',
  100
),
(
  'Web Development Workshop',
  'Hands-on interactive workshop covering modern frontend stacks, full-stack state management, and cloud deployments.',
  'Workshop',
  '2026-10-20',
  '11:00:00',
  'Navi Mumbai',
  'EventQA Team',
  50
),
(
  'AI & Machine Learning Seminar',
  'Deep dive into generative models, neural architectures, and responsible AI engineering in enterprise environments.',
  'Seminar',
  '2026-10-25',
  '14:00:00',
  'Mumbai',
  'EventQA Team',
  75
)
ON CONFLICT DO NOTHING;
