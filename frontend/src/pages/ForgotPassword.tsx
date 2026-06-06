import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Shield, Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type ForgotFields = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFields>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotFields) => {
    setErrorMsg(null);
    setDevResetLink(null);
    setIsSubmitting(true);
    try {
      const res = await api.post<{ message: string; reset_token?: string }>('/auth/forgot-password', {
        email: data.email,
      });

      if (res.status === 200) {
        setSuccess(true);
        if (res.data?.reset_token) {
          setDevResetLink(`/reset-password?token=${res.data.reset_token}`);
        }
      } else {
        setErrorMsg(res.error || 'Failed to request reset token. Please check connection.');
      }
    } catch {
      setErrorMsg('An unexpected connection error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
      <div className="w-full max-w-[460px] rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-lg shadow-blue-500/10 mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Forgot Password</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-[320px]">
            Provide your corporate email and we'll transmit a password recovery link
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <span className="font-semibold">Request Failed</span>
              <p className="mt-1 text-xs opacity-90">{errorMsg}</p>
            </div>
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center animate-fadeIn">
            <div className="flex justify-center text-emerald-500">
              <CheckCircle2 className="h-16 w-16" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-lg font-bold text-slate-900">Recovery Sent</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                If the email is active in our ERP database, a recovery token link was logged to the terminal console.
              </p>
            </div>

            {/* Local Developer Test Helper Link */}
            {devResetLink && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  Developer Testing Mode
                </span>
                <p className="mt-1 text-xs text-slate-600">
                  You can click below to bypass checking logs and test password reset immediately:
                </p>
                <Link
                  to={devResetLink}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  Go to password reset page &rarr;
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Login</span>
            </Link>
          </div>
        ) : (
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
                  className={`block w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#2563EB]'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-medium text-red-600">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Dispatching link...</span>
                </>
              ) : (
                <span>Request Recovery Link</span>
              )}
            </button>

            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};
export default ForgotPassword;
