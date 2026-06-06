import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../context/AuthContext';
import { getDashboardRedirect } from '../components/ProtectedRoute';
import api from '../services/api';
import { Shield, ArrowRight, ArrowLeft, Loader2, Check, User, Phone, Lock, Briefcase } from 'lucide-react';

const signupSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().min(6, 'Please enter a valid contact phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  role_id: z.string().min(1, 'Role assignment is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupFields = z.infer<typeof signupSchema>;

export const Signup: React.FC = () => {
  const { signup, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && user.role) {
      navigate(getDashboardRedirect(user.role.name), { replace: true });
    }
  }, [user, navigate]);

  // Fetch roles from the backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get<Role[]>('/roles');
        if (res.data) {
          setRoles(res.data);
        }
      } catch (err) {
        console.error('Failed to load roles', err);
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<SignupFields>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role_id: '',
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof SignupFields)[] = [];
    if (step === 1) {
      fieldsToValidate = ['first_name', 'last_name'];
    } else if (step === 2) {
      fieldsToValidate = ['email', 'phone'];
    } else if (step === 3) {
      fieldsToValidate = ['password', 'confirmPassword'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data: SignupFields) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      // Exclude confirmPassword when payload is dispatched to backend
      const { confirmPassword, ...signupPayload } = data;
      const res = await signup(signupPayload);
      
      if (res.success) {
        // Find role name to redirect
        const selectedRoleName = roles.find((r) => r.id === data.role_id)?.name || '';
        navigate(getDashboardRedirect(selectedRoleName), { replace: true });
      } else {
        setErrorMsg(res.error || 'Failed to complete registration.');
      }
    } catch (err: any) {
      setErrorMsg('An unexpected connection error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsHeader = [
    { label: 'Personal', icon: User },
    { label: 'Contact', icon: Phone },
    { label: 'Account', icon: Lock },
    { label: 'Role', icon: Briefcase },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      {/* Top Header */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 md:px-12 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB]">
            <Shield className="h-5.5 w-5.5 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-slate-900">
            VendorBridge
          </span>
        </div>
        <div className="text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#2563EB] hover:underline hover:text-blue-700">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[600px] rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          
          {/* Step Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between items-center relative">
              {/* Connecting Bar */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 -z-10"></div>
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-[#2563EB] -translate-y-1/2 -z-10 transition-all duration-300"
                style={{ width: `${((step - 1) / (stepsHeader.length - 1)) * 100}%` }}
              ></div>

              {stepsHeader.map((s, idx) => {
                const stepNum = idx + 1;
                const StepIcon = s.icon;
                const isCompleted = step > stepNum;
                const isActive = step === stepNum;

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 ${
                        isCompleted
                          ? 'border-[#2563EB] bg-[#2563EB] text-white'
                          : isActive
                          ? 'border-[#2563EB] bg-white text-[#2563EB] shadow-md shadow-blue-500/10 scale-110'
                          : 'border-slate-200 bg-white text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-4 w-4" />}
                    </div>
                    <span
                      className={`mt-2 text-xs font-semibold uppercase tracking-wider hidden sm:block ${
                        isActive ? 'text-[#2563EB]' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Create Enterprise Account
            </h2>
            <p className="text-sm text-slate-500">
              Step {step} of 4: Fill in your {stepsHeader[step - 1].label.toLowerCase()} details.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm animate-shake">
              <span className="font-semibold">Registration Error</span>
              <p className="mt-1 text-xs opacity-90">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="first_name" className="text-xs font-semibold text-slate-700 uppercase">
                      First Name
                    </label>
                    <input
                      id="first_name"
                      type="text"
                      placeholder="Jane"
                      className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none ${
                        errors.first_name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#2563EB]'
                      }`}
                      {...register('first_name')}
                    />
                    {errors.first_name && (
                      <p className="text-xs font-medium text-red-600">{errors.first_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="last_name" className="text-xs font-semibold text-slate-700 uppercase">
                      Last Name
                    </label>
                    <input
                      id="last_name"
                      type="text"
                      placeholder="Doe"
                      className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none ${
                        errors.last_name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#2563EB]'
                      }`}
                      {...register('last_name')}
                    />
                    {errors.last_name && (
                      <p className="text-xs font-medium text-red-600">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-semibold text-slate-700 uppercase">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="jane.doe@company.com"
                    className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none ${
                      errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#2563EB]'
                    }`}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs font-medium text-red-600">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="phone" className="text-xs font-semibold text-slate-700 uppercase">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none ${
                      errors.phone ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#2563EB]'
                    }`}
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-xs font-medium text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Account Security */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-700 uppercase">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none ${
                      errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#2563EB]'
                    }`}
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="text-xs font-medium text-red-600">{errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700 uppercase">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none ${
                      errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#2563EB]'
                    }`}
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs font-medium text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Role Assignment */}
            {step === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label htmlFor="role_id" className="text-xs font-semibold text-slate-700 uppercase">
                    Select Your Corporate Role
                  </label>
                  {loadingRoles ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
                      <span>Loading roles...</span>
                    </div>
                  ) : (
                    <select
                      id="role_id"
                      className={`block w-full rounded-lg border bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none cursor-pointer ${
                        errors.role_id ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#2563EB]'
                      }`}
                      {...register('role_id')}
                    >
                      <option value="">-- Choose Corporate Role --</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} - {r.description}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.role_id && (
                    <p className="text-xs font-medium text-red-600">{errors.role_id.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer focus:outline-none"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div></div>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/15 hover:bg-blue-700 cursor-pointer focus:outline-none"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 cursor-pointer focus:outline-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

        </div>
      </main>
    </div>
  );
};
export default Signup;
