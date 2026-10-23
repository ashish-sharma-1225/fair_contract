import { useNavigate } from 'react-router-dom';

import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 shadow-xs">
        <FileQuestion className="w-8 h-8" />
      </div>

      <span className="font-mono text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-100/60 px-3 py-1 rounded-full">
        404 Not Found
      </span>

      <h1 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
        Page Not Found
      </h1>

      <p className="mt-2 text-sm text-slate-500 max-w-md leading-relaxed">
        The contract clause, analysis report, or configuration page you are looking for does not exist or has been relocated.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          size="md"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/dashboard')}
          leftIcon={<Home className="w-4 h-4" />}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
