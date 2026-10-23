import { Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  ShieldCheck,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';


export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            <span className="text-base font-semibold text-slate-900 tracking-tight">
              ClauseLens
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors px-2 py-1"
            >
              Sign In
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-xs hidden sm:inline-flex"
            >
              Explore Demo
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/contracts/new')}
              className="text-xs font-medium"
            >
              Analyze a Contract
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Tagline */}
            <div className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 mb-6">
              <span>Contract Risk Review & Clause Verification</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
              Review contract terms against <span className="text-blue-600">your business rules</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 max-w-2xl mx-auto text-sm text-slate-600 leading-relaxed">
              Identify non-standard payment windows, automatic renewal traps, and uncapped indemnities before signing. Every finding includes the exact contract quotation and page reference.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/contracts/new')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="font-medium"
              >
                Analyze a Contract
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/analyses/anl_apex_001')}
                className="bg-white font-medium"
              >
                View Sample Analysis (Apex MSA)
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                Exact PDF source quotations
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                Custom policy comparisons
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                Statutory rule checks
              </span>
            </div>

            {/* Evidence Preview */}
            <div className="mt-12 mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-5 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <span className="text-xs font-semibold text-slate-900">
                    High Risk: Asymmetric Payment Terms
                  </span>
                  <span className="text-slate-400 text-xs">·</span>
                  <span className="text-xs text-slate-500">Payment Terms</span>
                </div>
                <span className="font-mono text-xs text-slate-500">
                  Page 2, Section 4.2
                </span>
              </div>

              <div className="mt-3.5 pl-3 border-l-2 border-slate-300 font-serif text-xs text-slate-800 leading-relaxed italic bg-slate-50/50 py-2 rounded-r">
                "Client shall remit payment for undisputed invoices within ninety (90) calendar days from receipt of Client’s internal executive steering committee approval."
              </div>

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Source verified against Apex_Enterprises_MSA.pdf
                </span>
                <span className="text-slate-600">
                  Breaches User Policy: Maximum Net-30 Window
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step Process */}
        <section className="border-t border-slate-200 bg-white py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                How ClauseLens Evaluates Contracts
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                A structured, evidence-backed workflow for contract review.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
                <div className="text-xs font-mono font-medium text-slate-400">
                  01
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Upload Contract PDF
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Extracts clean text and computes SHA-256 integrity checksums directly in your browser.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
                <div className="text-xs font-mono font-medium text-slate-400">
                  02
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Compare Policies & Rules
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Evaluates extracted clauses against statutory regulations and your custom business policies.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
                <div className="text-xs font-mono font-medium text-slate-400">
                  03
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Inspect Verifiable Evidence
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Review findings with exact page numbers, verified quotes, risk rationale, and suggested counter-proposals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Focus Areas */}
        <section className="py-14 sm:py-16 bg-slate-50 border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Key Risk Focus Areas
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                Core clause types evaluated across enterprise agreements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
                <FileSearch className="w-4 h-4 text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-900">
                  Asymmetric Payment Terms
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Detects Net-60, Net-90, and pay-when-paid conditions that delay payment receipt.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
                <AlertTriangle className="w-4 h-4 text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-900">
                  Automatic Renewal Traps
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Identifies extended notice windows and auto-renewal clauses requiring advance termination notice.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-900">
                  Uncapped Liability & Indemnity
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Highlights broad indemnities and uncapped damage provisions that exceed total contract value.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-slate-900 text-xs">ClauseLens</span>
              <span className="text-xs text-slate-400">© 2026</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600">
              <Link to="/dashboard" className="hover:text-slate-900">
                Dashboard
              </Link>
              <Link to="/policies" className="hover:text-slate-900">
                Policies
              </Link>
              <Link to="/regulatory-rules" className="hover:text-slate-900">
                Rule Library
              </Link>
              <Link to="/settings" className="hover:text-slate-900">
                Settings
              </Link>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Review assistance only. Findings are potential issues for human review, not legal advice. Always consult qualified legal counsel for binding negotiations.
          </p>
        </div>
      </footer>
    </div>
  );
}
