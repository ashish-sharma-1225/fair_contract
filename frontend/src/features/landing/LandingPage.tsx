import { Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  ShieldCheck,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';


export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                ClauseLens
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded-sm">
                  Beta
                </span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Contract Risk Intelligence
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors px-2 py-1"
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
              className="text-xs font-semibold"
            >
              Analyze a Contract
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-6 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Evidence-Backed Contract Risk Flagger for Freelancers & SMBs</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
              Review contract terms <br className="hidden sm:inline" />
              against <span className="text-blue-600">your business rules</span>.
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
              Don’t get locked into Net-90 payment terms, automatic multi-year renewals, or uncapped indemnities. ClauseLens flags risky terms with exact page citations and verified quotes.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/contracts/new')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="font-bold shadow-md shadow-blue-500/10"
              >
                Analyze a Contract
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/analyses/anl_apex_001')}
                className="bg-white hover:bg-slate-50 font-semibold"
              >
                View Sample Analysis (Apex MSA)
              </Button>
            </div>

            {/* Micro Trust Indicators */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Exact PDF Source Quotations
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Custom Net-30 & Liability Rules
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified Statutory Alignment
              </span>
            </div>

            {/* Interactive Evidence Preview Card */}
            <div className="mt-16 mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl text-left">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="text-xs font-bold text-slate-900">
                    High Risk Detected: Asymmetric Payment Terms
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  <FileSpreadsheet className="w-3 h-3 text-slate-400" />
                  Page 2, Section 4.2
                </span>
              </div>

              <div className="mt-4 rounded-xl border border-red-200 bg-red-50/40 p-4 font-mono text-xs text-slate-800 leading-relaxed border-l-4 border-l-red-600">
                "Client shall remit payment for undisputed invoices within ninety (90) calendar days from receipt of Client’s internal executive steering committee approval."
              </div>

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Source verified against Apex_Enterprises_MSA.pdf
                </span>
                <span className="font-semibold text-blue-600">
                  Breaches User Policy: Maximum Net-30 Window
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step Explanation Section */}
        <section className="border-t border-slate-200 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                How ClauseLens Protects Your Work
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                A simple three-step verification workflow designed for non-lawyers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Upload Contract PDF
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Drop your contract into the browser. The system validates file integrity via SHA-256 and extracts clean text without sending private files to open web scrapers.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm">
                  2
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Compare Rules & Policies
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluate clauses against verified regulatory rules (like the UK Late Payment Act) alongside your own business rules regarding payment terms and liability caps.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Review Verifiable Evidence
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Never guess if an AI hallucinated. Every flagged term includes the exact quote, page number, plain-English risk explanation, and suggested counter-proposals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-16 sm:py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Built for Independent Professionals
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Key capabilities designed to level the playing field against enterprise legal boilerplate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2.5 shadow-2xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-2">
                  <FileSearch className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Asymmetric Payment Detection
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instantly flags Net-60, Net-90, and pay-when-paid conditions that put your small business cash flow at risk.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2.5 shadow-2xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Automatic Renewal Traps
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Uncovers hidden 90-day cancellation notice periods that bind you to extended annual service commitments.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2.5 shadow-2xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Uncapped Liability Warnings
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Highlights indemnity clauses where your personal or company liability is not capped at the contract fees collected.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-slate-900 text-sm">ClauseLens</span>
              <span className="text-xs text-slate-400">© 2026</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <Link to="/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
              <Link to="/policies" className="hover:text-blue-600">
                Policies
              </Link>
              <Link to="/regulatory-rules" className="hover:text-blue-600">
                Rule Library
              </Link>
              <Link to="/settings" className="hover:text-blue-600">
                Privacy
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Legal Disclaimer: ClauseLens is an AI-powered contract analysis assistance tool and does not provide legal representation or binding legal opinions. Unflagged terms are not guaranteed to be legally enforceable or risk-free. Always consult a licensed attorney for critical contract negotiations.
          </p>
        </div>
      </footer>
    </div>
  );
}
