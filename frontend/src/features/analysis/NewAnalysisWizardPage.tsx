import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Play,
  ArrowRight,
  ArrowLeft,
  Shield,
  Scale,
  Sparkles,
  Info,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { FileDropzone } from '../../components/forms/FileDropzone';
import { RuleTypeBadge } from '../../components/ui/StatusBadge';
import { demoStore } from '../../mocks/demo-store';
import { mockSampleContractText } from '../../mocks/demo-data';
import { formatBytes, truncateHash } from '../../lib/utils';
import type { Contract, Policy, RegulatoryRule } from '../../types';

export function NewAnalysisWizardPage() {
  const navigate = useNavigate();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSha256, setFileSha256] = useState<string>('');

  // Policies and Regulatory Rules selection
  const [policies] = useState<Policy[]>(() =>
    demoStore.getPolicies()
  );
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>(() =>
    demoStore.getPolicies().filter(p => p.is_enabled).map(p => p.id)
  );

  const [regulatoryRules] = useState<RegulatoryRule[]>(() =>
    demoStore.getRegulatoryRules()
  );
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>(() =>
    demoStore.getRegulatoryRules().filter(r => r.is_selected).map(r => r.id)
  );


  // Analysis simulation state
  const [analyzingStage, setAnalyzingStage] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Extracted preview page index
  const [previewPageIndex, setPreviewPageIndex] = useState<number>(0);

  const handleFileSelect = (file: File, sha256: string) => {
    setSelectedFile(file);
    setFileSha256(sha256);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileSha256('');
  };


  const togglePolicy = (id: string) => {
    setSelectedPolicyIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleRule = (id: string) => {
    setSelectedRuleIds(prev =>
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  // Run the realistic analysis simulation
  const startAnalysis = () => {
    if (!selectedFile) return;

    setCurrentStep(5); // Go to progress screen
    setAnalyzingStage(1);
    setProgressPercent(15);

    // Step 1: Validating integrity
    setTimeout(() => {
      setAnalyzingStage(2);
      setProgressPercent(35);

      // Step 2: Extraction
      setTimeout(() => {
        setAnalyzingStage(3);
        setProgressPercent(60);

        // Step 3: Rules matching
        setTimeout(() => {
          setAnalyzingStage(4);
          setProgressPercent(85);

          // Step 4: AI Analysis & Quote Verification
          setTimeout(() => {
            setAnalyzingStage(5);
            setProgressPercent(100);

            // Create contract entity
            const contractId = `ctr_uploaded_${Date.now()}`;
            const contractRecord: Contract = {
              id: contractId,
              owner_id: 'usr_demo_8829',
              filename_original: selectedFile.name,
              storage_key: `private_uploads/${contractId}.pdf`,
              sha256:
                fileSha256 ||
                'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              mime_type: 'application/pdf',
              size_bytes: selectedFile.size,
              page_count: mockSampleContractText.page_count,
              status: 'analyzing',
              uploaded_at: new Date().toISOString(),
              deleted_at: null,
            };

            const completedAnalysis = demoStore.createSimulatedAnalysis(
              contractRecord,
              selectedPolicyIds,
              selectedRuleIds
            );

            // Redirect to results after brief completion pause
            setTimeout(() => {
              navigate(`/analyses/${completedAnalysis.id}`);
            }, 800);
          }, 1200);
        }, 1000);
      }, 1000);
    }, 900);
  };

  const steps = [
    { number: 1, title: 'Upload PDF' },
    { number: 2, title: 'Text Preview' },
    { number: 3, title: 'Select Rules' },
    { number: 4, title: 'Review & Confirm' },
    { number: 5, title: 'Analysis' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Analyze Contract"
        description="Run automated clause extraction, regulatory rule alignment, and custom business policy checks."
        backTo="/dashboard"
        backLabel="Return to Dashboard"
      />

      {/* Stepper Navigation */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      isCurrent
                        ? 'text-slate-900 font-bold'
                        : isCompleted
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 sm:mx-4 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step 1: Upload */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Upload Contract PDF</CardTitle>
            <p className="text-xs text-slate-500">
              Select or drop your PDF contract for automated extraction and risk scanning.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <FileDropzone
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              fileSha256={fileSha256}
              onClearFile={handleClearFile}
            />

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                {selectedFile ? 'PDF ready for text extraction' : 'Select a contract or demo preset to continue'}
              </span>

              <Button
                variant="primary"
                size="md"
                disabled={!selectedFile}
                onClick={() => setCurrentStep(2)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Text Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Extraction Preview */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle>Step 2: Extracted Text Preview</CardTitle>
                <p className="text-xs text-slate-500">
                  Verify extracted text integrity prior to AI analysis.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                <Info className="w-3.5 h-3.5" />
                <span>Simulated PyMuPDF Extraction Preview</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Extracted Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Filename</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {selectedFile?.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Total Pages</span>
                <span className="font-semibold text-slate-800">
                  {mockSampleContractText.page_count} pages
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Clauses Detected</span>
                <span className="font-semibold text-slate-800">
                  18 structured clauses
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">SHA-256 Hash</span>
                <span className="font-mono text-slate-700 block truncate">
                  {truncateHash(fileSha256 || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b')}
                </span>
              </div>
            </div>

            {/* Page navigation pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-slate-500 mr-1">
                Pages:
              </span>
              {mockSampleContractText.pages.map((p, idx) => (
                <button
                  key={p.page_number}
                  type="button"
                  onClick={() => setPreviewPageIndex(idx)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    previewPageIndex === idx
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Page {p.page_number}
                </button>
              ))}
            </div>

            {/* Text Preview Window */}
            <div className="rounded-xl border border-slate-300 bg-slate-900 text-slate-100 p-4 font-mono text-xs leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap select-text">
              {mockSampleContractText.pages[previewPageIndex]?.text}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Upload
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => setCurrentStep(3)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Select Rules
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Select Rules & Policies */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Select Regulatory Rules & Business Policies</CardTitle>
            <p className="text-xs text-slate-500">
              Choose the regulatory legal frameworks and personal business policies to evaluate against this document.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Regulatory Rules Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Verified Regulatory Rule Library
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Statutory protections and official guidance for commercial vendor contracts.
              </p>

              <div className="space-y-2.5">
                {regulatoryRules.map(rule => {
                  const isChecked = selectedRuleIds.includes(rule.id);
                  return (
                    <div
                      key={rule.id}
                      onClick={() => toggleRule(rule.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'border-indigo-300 bg-indigo-50/40'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRule(rule.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded">
                            {rule.rule_code}
                          </span>
                          <RuleTypeBadge type={rule.binding_type} />
                          <span className="text-xs text-slate-500">
                            {rule.source?.jurisdiction}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 font-medium mt-1.5">
                          {rule.rule_text}
                        </p>
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Official Source: {rule.source?.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* User Policies Section */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  User-Defined Business Policies
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Your personal rules regarding payment limits, automatic renewal terms, and liability caps.
              </p>

              <div className="space-y-2.5">
                {policies.map(policy => {
                  const isChecked = selectedPolicyIds.includes(policy.id);
                  return (
                    <div
                      key={policy.id}
                      onClick={() => togglePolicy(policy.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'border-blue-300 bg-blue-50/40'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePolicy(policy.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">
                            {policy.name}
                          </h4>
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            {policy.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1">
                          {policy.rule_text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(2)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Preview
              </Button>

              <Button
                variant="primary"
                size="md"
                disabled={selectedRuleIds.length === 0 && selectedPolicyIds.length === 0}
                onClick={() => setCurrentStep(4)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Review Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review Configuration */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Confirm Analysis Configuration</CardTitle>
            <p className="text-xs text-slate-500">
              Review your document parameters and rules before beginning clause extraction.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Selected File</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedFile?.name}
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    {formatBytes(selectedFile?.size || 0)} • {mockSampleContractText.page_count} pages
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">File Integrity</span>
                  <span className="font-mono text-slate-800 text-xs block">
                    {truncateHash(fileSha256 || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b')}
                  </span>
                  <span className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Valid SHA-256 Calculated
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 flex flex-wrap gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Regulatory Rules</span>
                  <span className="font-bold text-indigo-700">
                    {selectedRuleIds.length} rule frameworks selected
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Business Policies</span>
                  <span className="font-bold text-blue-700">
                    {selectedPolicyIds.length} custom policies active
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">AI Model</span>
                  <span className="font-medium text-slate-700">
                    Gemini 2.5 Flash (FastAPI Orchestrated)
                  </span>
                </div>
              </div>
            </div>

            {/* Disclaimer Alert */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <span className="font-bold">Important Notice: </span>
                This analysis is an informational review aid designed to flag potential negotiation points. It is not legal counsel. All flagged citations will be verified against original document text.
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(3)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Rules
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={startAnalysis}
                leftIcon={<Play className="w-4 h-4 fill-white" />}
                className="bg-blue-600 hover:bg-blue-700 font-bold"
              >
                Start Contract Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Realistic Progress UI */}
      {currentStep === 5 && (
        <Card className="p-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm animate-pulse">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Analyzing Contract Clauses...
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Executing staged document validation, rule alignment, and source quote verification.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{progressPercent}% Complete</span>
              <span>Local Demo Simulation</span>
            </div>
          </div>

          {/* Stepped Checklist */}
          <div className="max-w-md mx-auto text-left space-y-2.5 pt-2">
            <div
              className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                analyzingStage >= 1
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              {analyzingStage > 1 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : analyzingStage === 1 ? (
                <Clock className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300" />
              )}
              <span>1. Validating document integrity & SHA-256 hash</span>
            </div>

            <div
              className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                analyzingStage >= 2
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              {analyzingStage > 2 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : analyzingStage === 2 ? (
                <Clock className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300" />
              )}
              <span>2. PyMuPDF page-aware text extraction</span>
            </div>

            <div
              className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                analyzingStage >= 3
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              {analyzingStage > 3 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : analyzingStage === 3 ? (
                <Clock className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300" />
              )}
              <span>3. Matching regulatory constraints & business policies</span>
            </div>

            <div
              className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                analyzingStage >= 4
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              {analyzingStage > 4 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : analyzingStage === 4 ? (
                <Clock className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300" />
              )}
              <span>4. Gemini API clause identification & context analysis</span>
            </div>

            <div
              className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                analyzingStage >= 5
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              {analyzingStage >= 5 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300" />
              )}
              <span>5. Cross-verifying exact quotations against source text</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
