
-- Organizations (clubs)
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create an organization"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own organization"
  ON public.organizations FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

-- Teams
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  season TEXT NOT NULL DEFAULT '2025-2026',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teams in their org"
  ON public.teams FOR SELECT TO authenticated
  USING (organization_id IN (SELECT id FROM public.organizations WHERE created_by = auth.uid()));

CREATE POLICY "Users can create teams in their org"
  ON public.teams FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT id FROM public.organizations WHERE created_by = auth.uid()));

CREATE POLICY "Users can update teams in their org"
  ON public.teams FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT id FROM public.organizations WHERE created_by = auth.uid()));

-- Players
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'Milieu',
  jersey_number INT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view players in their teams"
  ON public.players FOR SELECT TO authenticated
  USING (team_id IN (
    SELECT t.id FROM public.teams t
    JOIN public.organizations o ON t.organization_id = o.id
    WHERE o.created_by = auth.uid()
  ));

CREATE POLICY "Users can add players to their teams"
  ON public.players FOR INSERT TO authenticated
  WITH CHECK (team_id IN (
    SELECT t.id FROM public.teams t
    JOIN public.organizations o ON t.organization_id = o.id
    WHERE o.created_by = auth.uid()
  ));

CREATE POLICY "Users can update players in their teams"
  ON public.players FOR UPDATE TO authenticated
  USING (team_id IN (
    SELECT t.id FROM public.teams t
    JOIN public.organizations o ON t.organization_id = o.id
    WHERE o.created_by = auth.uid()
  ));

CREATE POLICY "Users can delete players in their teams"
  ON public.players FOR DELETE TO authenticated
  USING (team_id IN (
    SELECT t.id FROM public.teams t
    JOIN public.organizations o ON t.organization_id = o.id
    WHERE o.created_by = auth.uid()
  ));

-- User profiles for onboarding tracking
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own profile"
  ON public.user_profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
