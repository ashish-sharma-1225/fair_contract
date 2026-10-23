import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Scale, Eye, EyeOff, Lock, Mail, User, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { registerSchema, type RegisterFormData } from '../../lib/validation';

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
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
          Create your account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-500 underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 flex items-start gap-2.5 text-xs text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Demo Registration: </strong>
                <span>
                  Completing this form will initialize a local session in your browser. Real account isolation will be connected when the PostgreSQL backend is deployed.
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Alex Morgan"
                leftIcon={<User className="w-4 h-4" />}
                {...register('name')}
                error={errors.name?.message}
              />

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

              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />

              <div className="pt-2">
                <Button type="submit" variant="primary" size="md" className="w-full">
                  Create Account & Start Demo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
