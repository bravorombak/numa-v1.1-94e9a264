import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import numaLogo from '@/assets/numa-logo.png';
import authHeroImage from '@/assets/auth-hero.jpg';
import authFooterLogo from '@/assets/auth-footer-logo.png';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsSubmitting(false);
        return;
      }

      // Success - navigation will happen via useEffect
      navigate('/', { replace: true });
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left: Login Form */}
      <div className="flex-1 md:w-1/2 flex items-center justify-center px-6 sm:px-10 lg:px-16">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <img src={numaLogo} alt="Numa" className="h-8 w-auto" />

          {/* Heading + subtitle */}
          <div>
            <h1 className="text-2xl font-header font-extrabold text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your account to continue.
            </p>
          </div>

          {/* Form - UNCHANGED logic */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>

      {/* Right: Hero Banner (hidden on mobile) */}
      <div className="hidden md:block md:w-1/2 relative">
        {/* Background image */}
        <img
          src={authHeroImage}
          alt="Numa hero"
          className="h-full w-full object-cover"
        />

        {/* Centered text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          <h2 className="text-3xl lg:text-4xl font-header font-extrabold text-[#fffdf9]">
            Be superhuman.
          </h2>
          <p className="mt-3 max-w-md text-sm lg:text-base text-[#fffdf9]/90">
            Numa is the ContentOS that helps you run every creative process 10x faster,
            powered by the industry&apos;s latest AI technology.
          </p>
        </div>

        {/* Footer: Copyright + logo - bottom center */}
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center space-y-2 text-[11px] text-[#fffdf9]/80">
          <span>© Hak Cipta 2025. Rombak Media Group. All Rights Reserved.</span>
          <img
            src={authFooterLogo}
            alt="Footer logo placeholder"
            className="h-6 w-auto opacity-90"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
