import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Mail, User, AlertCircle } from 'lucide-react';
import logoImage from '@/assets/cesoir-logo.png';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters'),
});

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');
  
  const [isSignUp, setIsSignUp] = useState(!!inviteToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check invite validity
  useEffect(() => {
    if (inviteToken) {
      checkInvite();
    }
  }, [inviteToken]);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const checkInvite = async () => {
    if (!inviteToken) return;
    
    try {
      const response = await supabase.functions.invoke('validate-invite', {
        body: { token: inviteToken }
      });
      
      if (response.error) {
        setInviteValid(false);
        setError('Unable to validate invitation. Please try again.');
        return;
      }
      
      const data = response.data;
      
      if (!data.valid) {
        setInviteValid(false);
        setError(data.error || 'This invitation link is invalid or has expired.');
      } else {
        setInviteValid(true);
        setEmail(data.email);
      }
    } catch (err) {
      console.error('Invite validation error');
      setInviteValid(false);
      setError('Unable to validate invitation. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        const validation = signUpSchema.safeParse({ email, password, fullName });
        if (!validation.success) {
          setError(validation.error.errors[0].message);
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName);
        
        if (error) {
          // Map errors to generic user-friendly messages
          if (error.message.includes('already registered') || error.message.includes('already been registered')) {
            setError('This email is already registered. Please sign in instead.');
          } else if (error.message.includes('invalid') || error.message.includes('Invalid')) {
            setError('Please check your information and try again.');
          } else if (error.message.includes('weak') || error.message.includes('password')) {
            setError('Password does not meet requirements. Please use a stronger password.');
          } else {
            // Generic fallback - don't expose raw error details
            setError('Unable to create account. Please try again.');
          }
        } else {
          toast({
            title: 'Account created!',
            description: 'Welcome to Ce Soir staff training.',
          });
          navigate('/');
        }
      } else {
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
          setError(validation.error.errors[0].message);
          setIsLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        
        if (error) {
          // Map all auth errors to generic message - don't reveal if email exists
          if (error.message.includes('Invalid login') || error.message.includes('invalid') || error.message.includes('credentials')) {
            setError('Invalid email or password. Please try again.');
          } else if (error.message.includes('rate') || error.message.includes('limit')) {
            setError('Too many attempts. Please try again later.');
          } else {
            // Generic fallback - don't expose raw error details
            setError('Unable to sign in. Please try again.');
          }
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You are now signed in.',
          });
          navigate('/');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 sm:py-16 max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <img 
              src={logoImage} 
              alt="Ce Soir" 
              className="h-16 mx-auto mb-4"
            />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              Staff Portal
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              {isSignUp ? 'Create your account' : 'Sign in to continue'}
            </p>
          </div>

          <Card className="border-0 shadow-elevated">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-copper" />
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </CardTitle>
              {inviteToken && inviteValid === false && (
                <CardDescription className="text-destructive">
                  Invalid or expired invitation link
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={!!inviteToken && inviteValid === true}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || (inviteToken && !inviteValid)}
                >
                  {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
                </Button>
              </form>

              {!inviteToken && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                    }}
                    className="text-sm text-copper hover:text-copper-light transition-colors"
                  >
                    {isSignUp 
                      ? 'Already have an account? Sign in' 
                      : 'Need an invitation? Contact your manager'}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
