import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

type AuthMode = 'signin' | 'signup';
type UserRole = 'customer' | 'shopkeeper';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const { user, isAdmin, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for error in URL params
    const params = new URLSearchParams(location.search);
    if (params.get('error')) {
      toast.error("Authentication failed. Please try again.");
      navigate('/auth', { replace: true });
    }

    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate, location]);

  const handleGoogleLogin = () => {
    window.location.href = "/auth/google";
  };

  const handleFacebookLogin = () => {
    window.location.href = "/auth/facebook";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = mode === 'signin'
        ? '/auth/login'
        : '/auth/register';

      const body = mode === 'signin'
        ? formData
        : { ...formData, role };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error("Failed to parse JSON response:", text);
        throw new Error(`Server Error: ${res.status} ${res.statusText}`);
      }

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      toast.success(mode === 'signin' ? "Welcome back!" : "Account created successfully!");
      // Force a refresh or rely on AuthContext to check session on mount
      window.location.href = '/';

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-8 animate-fade-in relative z-10">

        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-[#F97316] rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 hover:rotate-6 transition-transform">
            <span className="text-white text-3xl font-bold font-display">T</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {mode === 'signin'
              ? 'Sign in to continue to T-Mart'
              : 'Join T-Mart today'}
          </p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`
              flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
              ${role === 'customer'
                ? 'border-[#F97316] bg-[#FFF7ED] text-[#F97316]'
                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}
            `}
          >
            <User className={`h-6 w-6 mb-2 ${role === 'customer' ? 'text-[#F97316]' : 'text-gray-400'}`} />
            <span className="font-medium text-sm">Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('shopkeeper')}
            className={`
              flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
              ${role === 'shopkeeper'
                ? 'border-[#F97316] bg-[#FFF7ED] text-[#F97316]'
                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}
            `}
          >
            <div className={`h-6 w-6 mb-2 ${role === 'shopkeeper' ? 'text-[#F97316]' : 'text-gray-400'}`}>
              {/* Store Icon SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" /></svg>
            </div>
            <span className="font-medium text-sm">Shopkeeper</span>
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#F97316] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all bg-white"
                required
              />
            </div>
          )}

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#F97316] transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Email or User ID"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all bg-white"
              required
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#F97316] transition-colors" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="block w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all bg-white"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>

          {mode === 'signin' && (
            <div className="flex justify-end">
              <button type="button" className="text-sm font-medium text-[#F97316] hover:text-[#EA580C]">
                Forgot password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-6 rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
              mode === 'signin' ? 'Sign In' : 'Sign Up'
            )}
            {!loading && (
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400 uppercase tracking-wider text-xs">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center px-4 py-3 border border-[#F97316] rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={handleFacebookLogin}
            className="flex items-center justify-center px-4 py-3 border border-[#F97316] rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-5 w-5 mr-3 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>

        <div className="flex items-center justify-center space-x-1 text-sm">
          <span className="text-gray-500">
            {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button
            onClick={toggleMode}
            className="font-medium text-[#F97316] hover:text-[#EA580C]"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign In'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Auth;
