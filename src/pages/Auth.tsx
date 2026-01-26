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
import { Lock, Mail, User, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
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

const resetSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
});

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');
  
  const [mode, setMode] = useState<AuthMode>(inviteToken ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const validation = resetSchema.safeParse({ email });
      if (!validation.success) {
        setError(validation.error.errors[0].message);
        setIsLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        // Don't reveal if email exists or not
        console.error('Reset password error:', error);
      }
      
      // Always show success to prevent email enumeration
      setResetEmailSent(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // Require valid invitation token for signup
        if (!inviteToken || !inviteValid) {
          setError('A valid invitation is required to create an account. Please contact your manager for an invitation.');
          setIsLoading(false);
          return;
        }

        const validation = signUpSchema.safeParse({ email, password, fullName });
        if (!validation.success) {
          setError(validation.error.errors[0].message);
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName);
        
        if (error) {
          if (error.message.includes('already registered') || error.message.includes('already been registered')) {
            setError('This email is already registered. Please sign in instead.');
          } else if (error.message.includes('invalid') || error.message.includes('Invalid')) {
            setError('Please check your information and try again.');
          } else if (error.message.includes('weak') || error.message.includes('password')) {
            setError('Password does not meet requirements. Please use a stronger password.');
          } else {
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
          if (error.message.includes('Invalid login') || error.message.includes('invalid') || error.message.includes('credentials')) {
            setError('Invalid email or password. Please try again.');
          } else if (error.message.includes('rate') || error.message.includes('limit')) {
            setError('Too many attempts. Please try again later.');
          } else {
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

  // Forgot Password Success Screen
  if (resetEmailSent) {
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
            </div>

            <Card className="border-0 shadow-elevated">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="font-semibold text-lg">Check your email</h2>
                  <p className="text-muted-foreground text-sm">
                    If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                  </p>
                  <p className="text-muted-foreground text-xs">
                    The link will expire in 1 hour.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setResetEmailSent(false);
                      setMode('signin');
                      setEmail('');
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Forgot Password Form
  if (mode === 'forgot') {
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
                Reset your password
              </p>
            </div>

            <Card className="border-0 shadow-elevated">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-copper" />
                  Forgot Password
                </CardTitle>
                <CardDescription>
                  Enter your email and we'll send you a reset link
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleForgotPassword} className="space-y-4">
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
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError('');
                    }}
                    className="text-sm text-copper hover:text-copper-light transition-colors flex items-center gap-1 mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
              {mode === 'signup' ? 'Create your account' : 'Sign in to continue'}
            </p>
          </div>

          <Card className="border-0 shadow-elevated">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-copper" />
                {mode === 'signup' ? 'Sign Up' : 'Sign In'}
              </CardTitle>
              {inviteToken && inviteValid === false && (
                <CardDescription className="text-destructive">
                  Invalid or expired invitation link
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError('');
                        }}
                        className="text-xs text-copper hover:text-copper-light transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
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
                  {isLoading ? 'Please wait...' : (mode === 'signup' ? 'Create Account' : 'Sign In')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                {inviteToken ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError('');
                    }}
                    className="text-sm text-copper hover:text-copper-light transition-colors"
                  >
                    Already have an account? Sign in
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Need an account? Contact your manager for an invitation.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
