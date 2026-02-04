/**
 * Register page with AuthContext integration.
 */
import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { registerSchema } from '@/lib/validators/authSchema';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { ZodError } from 'zod';

export const Register = () => {
  const { t } = useLanguage();
  const { signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleChange = useCallback((field: string, value: string) => {
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }
    
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
      registerSchema.parse({ name, email, password, confirmPassword });

      // Call signUp
      // Note: The trigger handle_new_user() in Supabase will create user_profile
      await signUp(email, password);

      toast.success(t('registerSuccess'));
      
      // Navigate to login
      navigate('/login', { replace: true });
    } catch (error) {
      if ((error as ZodError).errors) {
        const zodError = error as ZodError;
        const fieldErrors: Record<string, string> = {};
        zodError.errors.forEach(err => {
          const field = err.path[0]?.toString();
          if (field) {
            fieldErrors[field] = t(err.message as 'nameTooShort' | 'invalidEmail' | 'passwordTooShort' | 'passwordsDoNotMatch');
          }
        });
        setErrors(fieldErrors);
      } else {
        // Auth error
        logger.error('Register.submit.failed', { error });
        const authError = error as { message?: string };
        if (authError.message?.includes('already registered')) {
          toast.error(t('emailInUse'));
        } else {
          toast.error(t('registerError'));
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [name, email, password, confirmPassword, signUp, navigate, t]);

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
          <p className="text-muted-foreground mt-2">{t('registerTitle')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="h-10 bg-secondary/50 border-border"
                placeholder={t('yourName')}
                disabled={isSubmitting}
                autoComplete="name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
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
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="h-10 bg-secondary/50 border-border"
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('register')}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {t('hasAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline">
              {t('login')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
