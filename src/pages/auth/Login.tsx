/**
 * Login page with AuthContext integration.
 */
import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema } from '@/lib/validators/authSchema';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { ZodError } from 'zod';

interface LocationState {
  from?: {
    pathname: string;
  };
}

export const Login = () => {
  const { t } = useLanguage();
  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      const state = location.state as LocationState;
      const redirectTo = state?.from?.pathname ?? '/';
      navigate(redirectTo, { replace: true });
    }
  }, [user, authLoading, navigate, location.state]);

  const handleChange = useCallback((field: string, value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    
    // Clear error when field changes
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setErrors({});

      // Validate with Zod
      loginSchema.parse({ email, password });

      // Call signIn
      await signIn(email, password);

      toast.success(t('loginSuccess'));
      
      // Navigate to dashboard or previous route
      const state = location.state as LocationState;
      const redirectTo = state?.from?.pathname ?? '/';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if ((error as ZodError).errors) {
        const zodError = error as ZodError;
        const fieldErrors: Record<string, string> = {};
        zodError.errors.forEach(err => {
          const field = err.path[0]?.toString();
          if (field) {
            fieldErrors[field] = t(err.message as 'invalidEmail' | 'passwordTooShort');
          }
        });
        setErrors(fieldErrors);
      } else {
        // Auth error
        logger.error('Login.submit.failed', { error });
        toast.error(t('invalidCredentials'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, signIn, navigate, location.state, t]);

  // Don't render form if already authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Plenna VIP</CardTitle>
          <p className="text-muted-foreground mt-2">{t('loginTitle')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="h-10 bg-secondary/50 border-border"
                placeholder="seu@email.com"
                disabled={isSubmitting}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="h-10 bg-secondary/50 border-border"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('login')}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {t('noAccount')}{' '}
            <Link to="/register" className="text-primary hover:underline">
              {t('register')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
