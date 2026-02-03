import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const Register = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration
  };

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
                onChange={(e) => setName(e.target.value)}
                className="h-10 bg-secondary/50 border-border"
                placeholder={t('yourName')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 bg-secondary/50 border-border"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 bg-secondary/50 border-border"
                required
              />
            </div>
            <Button type="submit" className="w-full">
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
