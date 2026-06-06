import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardRedirect } from '../components/ProtectedRoute';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFields = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect away
  React.useEffect(() => {
    if (user && user.role) {
      const redirectPath = getDashboardRedirect(user.role.name);
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFields) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await login(data.email, data.password);
      if (res.success) {
        // Redirect back to intended page or default dashboard
        const from = (location.state as any)?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else {
          // Fetch current local storage role since we set it inside login context
          const role = localStorage.getItem('user_role') || '';
          navigate(getDashboardRedirect(role), { replace: true });
        }
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMsg('An unexpected connection error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#F8FAFC]">
      {/* Left side: Premium illustration and logo */}
      <div className="relative hidden w-full lg:flex lg:w-1/2 flex-col justify-between bg-[#0F172A] p-12 text-white overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[130px]"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB] shadow-lg shadow-blue-500/30">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            VendorBridge
          </span>
        </div>

        <div className="relative z-10 my-auto flex flex-col items-center">
          <div className="w-full max-w-[500px] rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md shadow-2xl">
            <img
              src="/illustration.png"
              alt="Global Supply Chain Networks"
              className="w-full rounded-lg object-cover shadow-inner"
            />
          </div>
          <div className="mt-8 text-center max-w-[480px]">
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-white">
              Procurement &amp; Supply Chain Intelligence
            </h2>
            <p className="mt-3 text-slate-400 text-sm leading-relaxed">
              Connect vendors, track purchase orders, analyze RFQs, and streamline your entire enterprise procurement cycle in one unified platform.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex justify-between text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} VendorBridge ERP. All rights reserved.</span>
          <span className="hover:text-slate-400 cursor-pointer">Security &amp; Compliance</span>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[460px] space-y-8">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            {/* Small screen logo */}
            <div className="flex items-center gap-2 lg:hidden justify-center mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2563EB] text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold text-slate-900">VendorBridge</span>
            </div>
            
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
              Sign in to platform
            </h1>
            <p className="text-sm text-slate-500">
              Enter your enterprise credentials to access your portal
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm animate-shake">
              <div className="flex items-center gap-2 font-semibold">
                <span>Access Denied</span>
              </div>
              <p className="mt-1 text-xs opacity-90">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Corporate Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className={`block w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#2563EB]'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-medium text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#2563EB] hover:underline hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className={`block w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 ${
                    errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#2563EB]'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-[#2563EB] hover:underline hover:text-blue-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
