import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

type AuthMode = 'signin' | 'signup' | 'phone';
type UserRole = 'customer' | 'shopkeeper';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  const { user, refreshProfile } = useAuth(); // Destructure refreshProfile
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate, location]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          // handlePhoneLogin();
        }
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Google!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Google Sign-in failed");
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || formData.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setupRecaptcha();

    // Format phone number (assuming +91 for India if not provided)
    const phoneNumber = formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}`;

    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success(`OTP sent to ${phoneNumber}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to send OTP");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (confirmationResult) {
        const result = await confirmationResult.confirm(otp);
        // If name was provided, update profile immediately
        if (formData.name) {
          await updateProfile(result.user, {
            displayName: formData.name
          });
          // Trigger backend sync again to ensure name is saved in Firestore
          await refreshProfile();
        }
        toast.success("Phone verified successfully!");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Allow username login by appending domain if missing
    let emailToUse = formData.email;
    if (!emailToUse.includes('@')) {
      emailToUse = `${emailToUse}@gmail.com`; // Defaulting to gmail as it's most likely for this user
    }

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, emailToUse, formData.password);
        await updateProfile(userCredential.user, {
          displayName: formData.name,
        });
        toast.success("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, emailToUse, formData.password);
        toast.success("Welcome back!");
      }
    } catch (error: any) {
      console.error(error);
      let msg = "An error occurred";
      if (error.code === 'auth/email-already-in-use') msg = "Email already in use";
      if (error.code === 'auth/wrong-password') msg = "Invalid password";
      if (error.code === 'auth/wrong-password') msg = "Invalid password";
      if (error.code === 'auth/user-not-found') msg = "User not found";
      if (error.code === 'auth/invalid-credential') msg = "Invalid credentials";
      toast.error(`${msg} (${error.code})`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setFormData({ email: '', password: '', name: '', phone: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-8 animate-fade-in relative z-10">

        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center">
          <img
            src="/logo.png"
            alt="Shreerang Saree"
            className="h-20 w-20 rounded-2xl object-cover mb-6 shadow-lg"
          />
          <h2 className="text-2xl font-bold text-gray-900 font-display">
            {mode === 'phone' ? 'Phone Login' : (mode === 'signin' ? 'Welcome Back' : 'Create Account')}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {mode === 'phone' ? 'Enter your mobile number to get OTP' : (mode === 'signin' ? 'Sign in to continue to Shreerang Saree' : 'Join Shreerang Saree today')}
          </p>
        </div>

        {/* Role Toggle Removed - Public signup is Customer only */}

        {/* Hidden recaptcha */}
        <div id="recaptcha-container"></div>

        {mode === 'phone' ? (
          <form className="space-y-5" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
            {!otpSent ? (
              <>
                {/* Optional Name field for new users */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#8B1A3B] transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B1A3B] focus:ring-1 focus:ring-[#8B1A3B] transition-all bg-white"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-[#8B1A3B] transition-colors" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Mobile Number (e.g. 9876543210)"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B1A3B] focus:ring-1 focus:ring-[#8B1A3B] transition-all bg-white"
                    required
                    pattern="[0-9]{10}"
                  />
                </div>
              </>
            ) : (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#8B1A3B] transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B1A3B] focus:ring-1 focus:ring-[#8B1A3B] transition-all bg-white"
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B1A3B] hover:bg-[#6B1530] text-white font-bold py-6 rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                otpSent ? 'Verify OTP' : 'Send OTP'
              )}
            </Button>
            <button type="button" onClick={() => setMode('signin')} className="w-full text-sm text-gray-500 hover:text-primary">
              Back to Email Login
            </button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#8B1A3B] transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B1A3B] focus:ring-1 focus:ring-[#8B1A3B] transition-all bg-white"
                    required
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-[#8B1A3B] transition-colors" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone Number (Optional - saved in profile)"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B1A3B] focus:ring-1 focus:ring-[#8B1A3B] transition-all bg-white"
                    pattern="[0-9]{10}"
                  />
                </div>
              </>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#8B1A3B] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B1A3B] focus:ring-1 focus:ring-[#8B1A3B] transition-all bg-white"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#8B1A3B] transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="block w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B1A3B] focus:ring-1 focus:ring-[#8B1A3B] transition-all bg-white"
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
                <Link to="/forgot-password" className="text-sm font-medium text-[#8B1A3B] hover:text-[#6B1530]">
                  Forgot password?
                </Link>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B1A3B] hover:bg-[#6B1530] text-white font-bold py-6 rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
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
        )}

        {mode !== 'phone' && (
          <>
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
                className="flex items-center justify-center px-4 py-3 border border-[#8B1A3B] rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
                onClick={() => { setMode('phone'); setOtpSent(false); }}
                className="flex items-center justify-center px-4 py-3 border border-[#8B1A3B] rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Phone className="h-5 w-5 mr-3 text-green-600" />
                Phone
              </button>
            </div>

            <div className="flex items-center justify-center space-x-1 text-sm">
              <span className="text-gray-500">
                {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
              </span>
              <button
                onClick={toggleMode}
                className="font-medium text-[#8B1A3B] hover:text-[#6B1530]"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign In'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Auth;
