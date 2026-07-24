-- =====================================================================
-- 2_admin_approval.sql
-- İki adımlı admin girişi / onay akışı.
-- Ana (süper) admin: epusula.akademi@gmail.com
-- Bu dosya "1" migration'ından SONRA çalıştırılır. Additive (mevcut veriyi bozmaz).
-- =====================================================================

-- 1) Profiles'a onay alanları
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS admin_status TEXT NOT NULL DEFAULT 'approved'
        CHECK (admin_status IN ('pending', 'approved', 'rejected')),
    ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- Süper admin e-postası tek yerde tanımlı olsun
CREATE OR REPLACE FUNCTION public.super_admin_email()
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
    SELECT 'epusula.akademi@gmail.com'::text;
$$;

-- 2) Trigger'ı onay mantığıyla güncelle (CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_name TEXT;
    user_class_id TEXT;
    user_student_no TEXT;
    v_admin_status TEXT;
    v_is_super BOOLEAN := false;
BEGIN
    user_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
    user_name := COALESCE(new.raw_user_meta_data->>'name', 'İsimsiz Kullanıcı');
    user_class_id := new.raw_user_meta_data->>'classId';

    -- Güvenlik: yalnızca bilinen roller
    IF user_role NOT IN ('student', 'teacher', 'admin') THEN
        user_role := 'student';
    END IF;

    IF user_role = 'student' THEN
        user_student_no := FLOOR(100000 + RANDOM() * 900000)::TEXT;
    ELSE
        user_student_no := NULL;
    END IF;

    -- Onay durumu:
    --  * Süper admin e-postası -> admin + approved + is_super_admin
    --  * Diğer admin kayıtları -> pending (ana admin onaylayana kadar giremez)
    --  * Öğrenci/öğretmen        -> approved
    IF new.email = public.super_admin_email() THEN
        user_role := 'admin';
        v_admin_status := 'approved';
        v_is_super := true;
    ELSIF user_role = 'admin' THEN
        v_admin_status := 'pending';
    ELSE
        v_admin_status := 'approved';
    END IF;

    INSERT INTO public.profiles (id, name, email, role, class_id, student_no, admin_status, is_super_admin)
    VALUES (
        new.id,
        user_name,
        new.email,
        user_role,
        user_class_id,
        user_student_no,
        v_admin_status,
        v_is_super
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) Süper admin kontrolü (RLS özyinelemesini önlemek için SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT COALESCE(
        (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()),
        false
    );
$$;

-- 4) Süper admin, diğer profilleri (admin onayı için) güncelleyebilsin
--    (Mevcut "kendi profilini güncelle" politikasıyla OR'lanır.)
DROP POLICY IF EXISTS "Super admin can update any profile" ON public.profiles;
CREATE POLICY "Super admin can update any profile"
    ON public.profiles FOR UPDATE TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());
