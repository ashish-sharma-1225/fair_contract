import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Scale, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
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
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-3">
          <Scale className="w-5 h-5 text-blue-600" />
          <span className="text-lg font-semibold text-slate-900 tracking-tight">
            ClauseLens
          </span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Or{' '}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-700 underline"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xs border-slate-200 bg-white">
          <CardContent className="p-6 space-y-5">
            {/* Demo Notice */}
            <div className="rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-900">Interactive Demo: </span>
              Pre-filled credentials allow instant entry into the contract review workspace.
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
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="rememberMe" className="text-slate-600">
                    Remember me
                  </label>
                </div>

                <a
                  href="#forgot"
                  onClick={e => {
                    e.preventDefault();
                    alert('Password recovery is disabled in demo mode.');
                  }}
                  className="font-medium text-slate-500 hover:text-slate-700"
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
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400 font-medium">
                  Direct Access
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full bg-white font-medium"
            >
              Enter Demo Workspace Directly
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
