import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setEmailSent(true);
            toast.success('Password reset email sent!');
        } catch (error: any) {
            console.error('Password reset error:', error);
            if (error.code === 'auth/user-not-found') {
                toast.error('No account found with this email');
            } else if (error.code === 'auth/invalid-email') {
                toast.error('Invalid email address');
            } else {
                toast.error('Failed to send reset email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <Layout>
                <div className="container-app py-16">
                    <div className="max-w-md mx-auto text-center">
                        <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-success" />
                        </div>
                        <h1 className="text-2xl font-display font-bold text-foreground mb-4">
                            Check Your Email
                        </h1>
                        <p className="text-muted-foreground mb-6">
                            We've sent a password reset link to <strong>{email}</strong>.
                            Please check your inbox and follow the instructions.
                        </p>
                        <div className="space-y-3">
                            <Button
                                variant="outline"
                                onClick={() => setEmailSent(false)}
                                className="w-full"
                            >
                                Try Different Email
                            </Button>
                            <Link to="/auth">
                                <Button variant="hero" className="w-full">
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                        <p className="text-xs text-muted-foreground mt-6">
                            Didn't receive the email? Check your spam folder or try again.
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container-app py-16">
                <div className="max-w-md mx-auto">
                    {/* Back link */}
                    <Link
                        to="/auth"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                            Forgot Password?
                        </h1>
                        <p className="text-muted-foreground">
                            No worries! Enter your email and we'll send you a reset link.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="hero"
                            size="lg"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </Button>
                    </form>

                    {/* Help text */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Remember your password?{' '}
                        <Link to="/auth" className="text-primary font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default ForgotPassword;
