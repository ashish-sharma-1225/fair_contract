import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Scale, Eye, EyeOff, Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { loginSchema, type LoginFormData } from '../../lib/validation';

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'demo@clauselens.app',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = () => {
    // Navigate into the dashboard workspace
    navigate('/dashboard');
  };


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <Scale className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            ClauseLens
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Or{' '}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-500 underline"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Demo Notice Banner */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 flex items-start gap-2.5 text-xs text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Hackathon Demo Mode: </strong>
                <span>
                  Backend auth endpoints will be wired in Stage 2. You can sign in with any email or click below to enter immediately.
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@domain.com"
                leftIcon={<Mail className="w-4 h-4" />}
                {...register('email')}
                error={errors.email?.message}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                rightAction={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                {...register('password')}
                error={errors.password?.message}
              />

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    {...register('rememberMe')}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="rememberMe" className="text-slate-600">
                    Remember me
                  </label>
                </div>

                <a
                  href="#forgot"
                  onClick={e => {
                    e.preventDefault();
                    alert('Password recovery will be handled by the FastAPI auth backend.');
                  }}
                  className="font-medium text-blue-600 hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full">
                Sign In
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-semibold">
                  Or Instant Demo Access
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full bg-slate-50 hover:bg-slate-100 font-semibold"
            >
              Enter Demo Workspace Directly
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
