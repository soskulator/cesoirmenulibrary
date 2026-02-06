import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Mail, User, AlertCircle, ArrowLeft, CheckCircle, UserPlus, Clock, XCircle } from 'lucide-react';
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

interface InvitationData {
  valid: boolean;
  email?: string;
  fullName?: string;
  role?: string;
  roleName?: string;
  invitationId?: string;
  reason?: string;
  error?: string;
}

const ROLE_LABELS: Record<string, string> = {
  server: 'Server',
  bartender: 'Bartender',
  server_assistant: 'Server Assistant',
  admin: 'Admin',
  lead_admin: 'Lead Admin',
  employee: 'Staff',
};

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');
  const invitationCode = searchParams.get('invitation');
  const hasInvite = !!(inviteToken || invitationCode);

  const [mode, setMode] = useState<AuthMode>(hasInvite ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteChecking, setInviteChecking] = useState(!!hasInvite);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check invite validity
  useEffect(() => {
    if (hasInvite) {
      checkInvite();
    }
  }, [inviteToken, invitationCode]);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const checkInvite = async () => {
    setInviteChecking(true);
    try {
      const body = invitationCode
        ? { invitationCode }
        : { token: inviteToken };

      const response = await supabase.functions.invoke('validate-invite', { body });

      if (response.error) {
        setInvitation({ valid: false, error: 'Unable to validate invitation. Please try again.' });
        return;
      }

      const data = response.data as InvitationData;
      setInvitation(data);

      if (data.valid) {
        setEmail(data.email || '');
        if (data.fullName) setFullName(data.fullName);
      }
    } catch (err) {
      console.error('Invite validation error');
      setInvitation({ valid: false, error: 'Unable to validate invitation. Please try again.' });
    } finally {
      setInviteChecking(false);
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
        // Require valid invitation for signup
        if (!hasInvite || !invitation?.valid) {
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

        const { error: signUpError } = await signUp(email, password, fullName);

        if (signUpError) {
          if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
            setError('This email is already registered. Please sign in instead.');
          } else if (signUpError.message.includes('weak') || signUpError.message.includes('password')) {
            setError('Password does not meet requirements. Please use a stronger password.');
          } else {
            setError('Unable to create account. Please try again.');
          }
          setIsLoading(false);
          return;
        }

        // On successful signup with invitation code, assign role and mark invitation accepted
        if (invitationCode && invitation?.invitationId) {
          try {
            // Get the newly created user
            const { data: { user: newUser } } = await supabase.auth.getUser();

            if (newUser) {
              // Insert user role using the service-side trigger or direct insert
              // The role assignment happens via the assign_role_from_invitation trigger for legacy,
              // but for staff_invitations we do it explicitly via edge function or direct insert
              const { error: roleError } = await supabase
                .from('user_roles')
                .insert({ user_id: newUser.id, role: invitation.role as any })
                .select()
                .single();

              if (roleError) {
                console.error('Role assignment error:', roleError);
                // Non-fatal — admin can assign role manually
              }

              // Mark invitation as accepted
              const { error: updateError } = await supabase
                .from('staff_invitations')
                .update({ status: 'accepted', accepted_at: new Date().toISOString() })
                .eq('id', invitation.invitationId);

              if (updateError) {
                console.error('Invitation update error:', updateError);
              }
            }
          } catch (postSignupErr) {
            console.error('Post-signup processing error:', postSignupErr);
          }
        }

        toast({
          title: 'Account created!',
          description: 'Welcome to Ce Soir staff training.',
        });
        navigate('/');
      } else {
        // Sign in
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
          setError(validation.error.errors[0].message);
          setIsLoading(false);
          return;
        }

        const { error: signInError } = await signIn(email, password);

        if (signInError) {
          if (signInError.message.includes('Invalid login') || signInError.message.includes('invalid') || signInError.message.includes('credentials')) {
            setError('Invalid email or password. Please try again.');
          } else if (signInError.message.includes('rate') || signInError.message.includes('limit')) {
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
              <img src={logoImage} alt="Ce Soir" className="h-16 mx-auto mb-4" />
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">Staff Portal</h1>
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
                  <p className="text-muted-foreground text-xs">The link will expire in 1 hour.</p>
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
              <img src={logoImage} alt="Ce Soir" className="h-16 mx-auto mb-4" />
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">Staff Portal</h1>
              <p className="text-muted-foreground text-sm mt-2">Reset your password</p>
            </div>

            <Card className="border-0 shadow-elevated">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-copper" />
                  Forgot Password
                </CardTitle>
                <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
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

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setError(''); }}
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

  // Invitation checking state
  if (hasInvite && inviteChecking) {
    return (
      <Layout>
        <div className="container py-16 flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper" />
          <p className="text-muted-foreground text-sm">Validating your invitation…</p>
        </div>
      </Layout>
    );
  }

  // Invalid / expired / revoked invitation screens
  if (hasInvite && invitation && !invitation.valid) {
    const isExpired = invitation.reason === 'expired';
    const isRevoked = invitation.reason === 'revoked';

    return (
      <Layout>
        <div className="container py-8 sm:py-16 max-w-md px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <img src={logoImage} alt="Ce Soir" className="h-16 mx-auto mb-4" />
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">Staff Portal</h1>
            </div>

            <Card className="border-0 shadow-elevated">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                    isExpired ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-destructive/10'
                  }`}>
                    {isExpired ? (
                      <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <XCircle className="w-8 h-8 text-destructive" />
                    )}
                  </div>
                  <h2 className="font-semibold text-lg">
                    {isExpired ? 'Invitation Expired' : 'Invalid Invitation'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {isExpired
                      ? 'This invitation has expired. Please contact your manager for a new invitation.'
                      : isRevoked
                        ? 'This invitation has been revoked. Please contact your manager.'
                        : invitation.error || 'Invalid invitation link.'}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/auth')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go to Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Main auth form
  const isInviteSignup = hasInvite && invitation?.valid;
  const emailLocked = isInviteSignup && !!invitation?.email;

  return (
    <Layout>
      <div className="container py-8 sm:py-16 max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <img src={logoImage} alt="Ce Soir" className="h-16 mx-auto mb-4" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">Staff Portal</h1>
            <p className="text-muted-foreground text-sm mt-2">
              {isInviteSignup
                ? 'Create your account'
                : mode === 'signup'
                  ? 'Create your account'
                  : 'Sign in to continue'}
            </p>
          </div>

          {/* Invitation banner */}
          {isInviteSignup && (
            <div className="mb-4 p-4 bg-copper/10 border border-copper/20 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <UserPlus className="w-4 h-4 text-copper" />
                <span className="font-medium text-sm">You've been invited!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You've been invited to join as{' '}
                <Badge variant="secondary" className="text-xs ml-1">
                  {invitation?.roleName || ROLE_LABELS[invitation?.role || ''] || invitation?.role}
                </Badge>
              </p>
            </div>
          )}

          <Card className="border-0 shadow-elevated">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-copper" />
                {isInviteSignup ? 'Create Account' : mode === 'signup' ? 'Sign Up' : 'Sign In'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Tab toggle — hidden when invite signup */}
              {!isInviteSignup && (
                <div className="flex gap-1 mb-6 p-1 bg-muted rounded-lg">
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setError(''); }}
                    className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
                      mode === 'signin'
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(''); }}
                    className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
                      mode === 'signup'
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {(mode === 'signup' || isInviteSignup) && (
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
                      className={`pl-10 ${emailLocked ? 'bg-muted cursor-not-allowed' : ''}`}
                      required
                      disabled={emailLocked}
                    />
                  </div>
                  {emailLocked && (
                    <p className="text-xs text-muted-foreground">
                      Email is pre-filled from your invitation
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === 'signin' && !isInviteSignup && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setError(''); }}
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
                  disabled={isLoading || (mode === 'signup' && !hasInvite && !invitation?.valid)}
                >
                  {isLoading
                    ? 'Please wait...'
                    : isInviteSignup || mode === 'signup'
                      ? 'Create Account'
                      : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                {isInviteSignup ? (
                  <button
                    type="button"
                    onClick={() => navigate('/auth')}
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
