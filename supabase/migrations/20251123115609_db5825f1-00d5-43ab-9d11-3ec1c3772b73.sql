DO $$
DECLARE
  admin_count int;
  target_user_id uuid;
BEGIN
  -- Check if there is already an admin
  SELECT count(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin'::app_role;

  -- If no admin exists, bootstrap the earliest-created user
  IF admin_count = 0 THEN
    RAISE NOTICE 'No admin found in user_roles. Bootstrapping first admin...';

    SELECT id INTO target_user_id
    FROM public.profiles
    ORDER BY created_at ASC NULLS LAST
    LIMIT 1;

    IF target_user_id IS NOT NULL THEN
      -- Insert admin role if not exists (unique constraint is on user_id + role)
      INSERT INTO public.user_roles (user_id, role)
      VALUES (target_user_id, 'admin'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;

      -- Sync profiles.role for display consistency
      UPDATE public.profiles
      SET role = 'admin'
      WHERE id = target_user_id;

      RAISE NOTICE 'Bootstrapped admin: %', target_user_id;
    ELSE
      RAISE WARNING 'No profiles found to promote.';
    END IF;
  ELSE
    RAISE NOTICE 'Admin already exists in user_roles (count=%). Skipping bootstrap.', admin_count;
  END IF;
END;
$$;